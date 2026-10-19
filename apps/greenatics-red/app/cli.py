from __future__ import annotations

import argparse
import getpass
import sys
import zipfile

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select

from .backups import create_drive_backup, download_drive_backup as download_registered_backup, restore_backup_archive, verify_backup_archive
from .config import settings
from .db import SessionLocal
from .initial_projects import BELLO_PROJECTS
from .models import Backup, Project, User
from .security import MAX_PASSWORD_CHARACTERS, hash_password, purge_expired_login_throttles, verify_password


def bootstrap_admin(email: str, name: str) -> int:
    normalized = email.strip().lower()
    password = getpass.getpass("Contraseña inicial (mínimo 12 caracteres): ")
    confirmation = getpass.getpass("Repite la contraseña: ")
    if len(password) < 12 or len(password) > MAX_PASSWORD_CHARACTERS or password != confirmation:
        print("La contraseña debe tener entre 12 y 1.024 caracteres y coincidir.", file=sys.stderr)
        return 2
    with SessionLocal() as session:
        user = session.scalar(select(User).where(User.email == normalized))
        if user:
            if user.is_platform_admin:
                print("La cuenta ya tiene rol de administración RED.", file=sys.stderr)
                return 2
            print("El correo ya existe. Usa una invitación de proyecto para asignarle acceso.", file=sys.stderr)
            return 2
        user = User(email=normalized, full_name=name.strip()[:200], password_hash=hash_password(password), is_platform_admin=True)
        session.add(user)
        session.commit()
    print(f"Administrador GREENATICS RED creado: {normalized}")
    print("Guarda la contraseña en el gestor seguro de la organización.")
    return 0


def seed_bello_projects() -> int:
    """Create the four declared Bello workspaces without overwriting existing data."""
    with SessionLocal() as session:
        slugs = [slug for slug, _name in BELLO_PROJECTS]
        existing = list(session.scalars(select(Project).where(Project.slug.in_(slugs))))
        by_slug = {project.slug: project for project in existing}

        conflicts = [
            f"{slug}: nombre existente «{by_slug[slug].name}» (esperado «{name}»)"
            for slug, name in BELLO_PROJECTS
            if slug in by_slug and by_slug[slug].name != name
        ]
        names = [name for _slug, name in BELLO_PROJECTS]
        name_matches = list(session.scalars(select(Project).where(Project.name.in_(names))))
        conflicts.extend(
            f"«{project.name}»: ya existe con identificador {project.slug}"
            for project in name_matches
            if project.slug not in slugs
        )
        if conflicts:
            print("No se crearon expedientes por conflictos existentes:", file=sys.stderr)
            for conflict in conflicts:
                print(f"- {conflict}", file=sys.stderr)
            return 2

        created = []
        for slug, name in BELLO_PROJECTS:
            if slug in by_slug:
                continue
            project = Project(
                slug=slug,
                name=name,
                municipality="Bello",
                department="Antioquia",
                status="preparacion",
                origin="instruccion_usuario",
                origin_note=(
                    "Nombre suministrado por el usuario; pendiente de validar con la copropiedad. "
                    "Expediente inicial vacío, sin datos operativos precargados."
                ),
            )
            session.add(project)
            created.append(project)
        session.commit()
        print(f"Expedientes GREENATICS RED creados: {len(created)}; ya existentes: {len(BELLO_PROJECTS) - len(created)}.")
        for slug, name in BELLO_PROJECTS:
            state = "creado" if slug not in by_slug else "ya existía"
            print(f"- {name} [{slug}]: {state}")
        print("Los expedientes quedan vacíos, listos para completar con autorización y datos verificados.")
    return 0


def create_backup(actor_email: str) -> int:
    if not getattr(settings, "drive_external_actions_enabled", False):
        print("No se creó el respaldo: Drive solo se habilita desde staging/producción persistentes con los gates aprobados.", file=sys.stderr)
        return 2
    normalized = actor_email.strip().lower()
    with SessionLocal() as session:
        actor = session.scalar(select(User).where(User.email == normalized, User.active.is_(True), User.is_platform_admin.is_(True)))
        if not actor:
            print("No se encontró una cuenta activa de administración RED para registrar el respaldo.", file=sys.stderr)
            return 2
        try:
            backup = create_drive_backup(session, actor.id)
        except Exception as exc:
            print(f"No se completó el respaldo GREENATICS RED: {exc}", file=sys.stderr)
            return 2
        print(f"Respaldo GREENATICS RED completado: {backup.drive_file_name}")
        print(f"SHA-256: {backup.sha256}")
        print(f"Bytes: {backup.bytes_total}")
        return 0


def download_backup_from_drive(actor_email: str, output_path: str, backup_id: str = "") -> int:
    normalized = actor_email.strip().lower()
    password = getpass.getpass("Confirma la contraseña de tu cuenta administradora RED: ")
    with SessionLocal() as session:
        actor = session.scalar(select(User).where(
            User.email == normalized,
            User.active.is_(True),
            User.is_platform_admin.is_(True),
        ))
        if not actor or not verify_password(password, actor.password_hash):
            print("No se pudo autenticar una cuenta activa de administración RED.", file=sys.stderr)
            return 2
        if backup_id:
            backup = session.get(Backup, backup_id)
        else:
            backup = session.scalar(select(Backup).where(
                Backup.status == "completado",
                Backup.drive_file_id != "",
            ).order_by(Backup.created_at.desc()).limit(1))
        if not backup:
            print("No se encontró un respaldo GREENATICS RED registrado para descargar.", file=sys.stderr)
            return 2
        try:
            result = download_registered_backup(session, backup, actor.id, output_path)
        except Exception as exc:
            print(f"No se descargó el respaldo GREENATICS RED: {exc}", file=sys.stderr)
            return 2
        print("Respaldo GREENATICS RED descargado y verificado.")
        print(f"Archivo: {result['path']}")
        print(f"SHA-256: {result['sha256']}")
        print(f"Bytes: {result['bytes_total']}")
        print(f"Contenido: {result['manifest'].get('counts', {})}")
        legacy_signatures = result["manifest"].get("legacy_unverifiable_form_signatures", 0)
        print(f"Constancias de formulario históricas sin captura verificable: {legacy_signatures}")
        print("La descarga quedó registrada en la auditoría RED. Usa restore-backup solo contra una base vacía.")
        return 0


def restore_backup(path: str, admin_email: str, admin_name: str) -> int:
    password = getpass.getpass("Contraseña nueva para la cuenta administradora de recuperación (mínimo 12 caracteres): ")
    confirmation = getpass.getpass("Repite la contraseña: ")
    if len(password) < 12 or len(password) > MAX_PASSWORD_CHARACTERS or password != confirmation:
        print("La contraseña debe tener entre 12 y 1.024 caracteres y coincidir.", file=sys.stderr)
        return 2
    try:
        result = restore_backup_archive(
            path, admin_email=admin_email, admin_name=admin_name, admin_password=password,
        )
    except (OSError, ValueError, KeyError, zipfile.BadZipFile, SQLAlchemyError) as exc:
        print(f"No se pudo restaurar GREENATICS RED: {exc}", file=sys.stderr)
        return 2
    print("Respaldo GREENATICS RED restaurado en el destino vacío.")
    print(f"Cuenta administradora habilitada: {result['admin_email']}")
    print(f"Contenido: {result['counts']}")
    print(
        "Constancias de formulario históricas sin captura verificable: "
        f"{result['legacy_unverifiable_form_signatures']}"
    )
    print(f"Invitaciones pendientes marcadas como expiradas: {result['expired_pending_invitations']}")
    print("Las otras cuentas quedan desactivadas y deben reactivarse/restablecerse desde Usuarios.")
    print("Drive no se restaura; vuelve a conectarlo desde RED. Verifica los datos antes de operar.")
    return 0


def cleanup_login_throttles() -> int:
    with SessionLocal() as session:
        removed = purge_expired_login_throttles(session)
    print(f"Registros de intentos de acceso expirados eliminados: {removed}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(prog="greenatics-red")
    subparsers = parser.add_subparsers(dest="command", required=True)
    admin_parser = subparsers.add_parser("bootstrap-admin", help="crear el administrador inicial")
    admin_parser.add_argument("--email", required=True)
    admin_parser.add_argument("--name", required=True)
    subparsers.add_parser("seed-bello-projects", help="crear los cuatro expedientes iniciales vacíos de Bello")
    verify_parser = subparsers.add_parser("verify-backup", help="verificar el manifiesto y SHA-256 de un respaldo")
    verify_parser.add_argument("path")
    backup_parser = subparsers.add_parser("backup-to-drive", help="crear y subir un respaldo al Drive conectado")
    backup_parser.add_argument("--actor-email", required=True, help="cuenta administradora para la bitácora")
    download_parser = subparsers.add_parser("download-drive-backup", help="descargar y verificar un respaldo RED del Drive conectado")
    download_parser.add_argument("--actor-email", required=True, help="cuenta administradora que solicita la descarga")
    download_parser.add_argument("--backup-id", default="", help="ID del respaldo RED; si se omite, usa el último completado")
    download_parser.add_argument("--output", required=True, help="ruta local nueva donde guardar el ZIP; no sobrescribe archivos")
    restore_parser = subparsers.add_parser("restore-backup", help="restaurar un respaldo verificado en una base RED vacía")
    restore_parser.add_argument("path", help="archivo ZIP local previamente descargado del Drive")
    restore_parser.add_argument("--admin-email", required=True, help="cuenta que quedará como administradora de recuperación")
    restore_parser.add_argument("--admin-name", required=True, help="nombre de la cuenta administradora de recuperación")
    subparsers.add_parser(
        "cleanup-login-throttles",
        help="eliminar intentos de acceso seudonimizados con más de 24 horas",
    )
    args = parser.parse_args()
    if args.command == "bootstrap-admin":
        return bootstrap_admin(args.email, args.name)
    if args.command == "seed-bello-projects":
        return seed_bello_projects()
    if args.command == "verify-backup":
        try:
            manifest = verify_backup_archive(args.path)
        except (OSError, ValueError, KeyError) as exc:
            print(f"Respaldo no válido: {exc}", file=sys.stderr)
            return 2
        print("Respaldo íntegro")
        print(f"Creado: {manifest['created_at']}")
        print(f"Contenido: {manifest.get('counts', {})}")
        return 0
    if args.command == "backup-to-drive":
        return create_backup(args.actor_email)
    if args.command == "download-drive-backup":
        return download_backup_from_drive(args.actor_email, args.output, args.backup_id)
    if args.command == "restore-backup":
        return restore_backup(args.path, args.admin_email, args.admin_name)
    if args.command == "cleanup-login-throttles":
        return cleanup_login_throttles()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

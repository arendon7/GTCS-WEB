from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]


def test_container_runs_non_root_and_only_marks_runtime_data_paths_writable():
    dockerfile = (APP_DIR / "Dockerfile").read_text(encoding="utf-8")
    lines = dockerfile.splitlines()
    user_line = next(index for index, line in enumerate(lines) if line.startswith("USER "))
    ownership_line = next(index for index, line in enumerate(lines) if "chown -R 10001:10001" in line)

    assert lines[user_line] == "USER 10001:10001"
    assert ownership_line < user_line
    assert "/app/instance" in lines[ownership_line]
    assert "/var/data/red/private" in lines[ownership_line]
    assert "mkdir -p /app/instance /var/data/red/private/evidence" in lines[ownership_line - 1]
    assert not any(line.strip() == "USER root" for line in lines)
    assert lines[-1] == 'CMD ["./start.sh"]'

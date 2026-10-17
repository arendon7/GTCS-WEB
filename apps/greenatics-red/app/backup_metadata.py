"""Read supported ZIP metadata with a budget on actual decompressed bytes."""
import struct
import zipfile
import zlib


def read_metadata(archive: zipfile.ZipFile, name: str, budget: int) -> bytes:
    info = archive.getinfo(name)
    if info.compress_type not in {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED} or info.flag_bits & 1:
        raise ValueError("La compresión o cifrado del respaldo no está permitido.")
    if not 0 <= info.file_size <= budget:
        raise ValueError("Los metadatos del respaldo exceden el tamaño máximo permitido.")
    # Keep ZipFile's header-name, overlap and unsupported-flag validation.
    with archive.open(info):
        pass
    source = archive.fp
    source.seek(info.header_offset)
    header = source.read(30)
    if len(header) != 30 or header[:4] != b"PK\x03\x04":
        raise ValueError("La cabecera del respaldo no es válida.")
    flags, method = struct.unpack_from("<HH", header, 6)
    if flags != info.flag_bits or method != info.compress_type:
        raise ValueError("La cabecera y el directorio de compresión no coinciden.")
    name_length, extra_length = struct.unpack_from("<HH", header, 26)
    source.seek(info.header_offset + 30 + name_length + extra_length)
    remaining = info.compress_size
    output = bytearray()
    checksum = 0
    decoder = zlib.decompressobj(-15) if method == zipfile.ZIP_DEFLATED else None
    while remaining:
        chunk = source.read(min(64 * 1024, remaining))
        if not chunk:
            raise ValueError("El miembro del respaldo está incompleto.")
        remaining -= len(chunk)
        pending = chunk
        while pending or (decoder and not decoder.eof):
            limit = min(info.file_size, budget) - len(output)
            if decoder:
                block = decoder.decompress(pending, min(64 * 1024, limit + 1))
                pending = decoder.unconsumed_tail
                if decoder.unused_data:
                    raise ValueError("El miembro del respaldo contiene datos comprimidos sobrantes.")
            else:
                length = min(64 * 1024, limit + 1)
                block, pending = pending[:length], pending[length:]
            if len(block) > limit:
                raise ValueError("El tamaño real de los metadatos no coincide con el anunciado.")
            output.extend(block)
            checksum = zlib.crc32(block, checksum)
            if decoder and not pending and not block:
                # Drain internally buffered output, then await more compressed input.
                break
    if decoder and not decoder.eof:
        raise ValueError("El flujo comprimido de metadatos está incompleto.")
    if len(output) != info.file_size or checksum & 0xFFFFFFFF != info.CRC:
        raise ValueError("El tamaño o CRC real de los metadatos no coincide con el respaldo.")
    return bytes(output)

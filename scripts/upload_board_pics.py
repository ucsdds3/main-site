#!/usr/bin/env python3
"""
One-off migration: upload board photos from public/Board/ into Supabase Storage and
set Members.profile_picture to a long-lived signed URL (matching useUploadPFP.ts).

Dependencies:
  pip install supabase

Environment (required; dry-run still queries Members):
  SUPABASE_URL or VITE_SUPABASE_URL  — project URL
  SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SECRET_API_KEY — service role (bypasses RLS).
    Do not reference VITE_SUPABASE_SECRET_API_KEY in frontend code or it can be bundled publicly.
  VITE_SUPABASE_ANON_KEY — optional; only for --dry-run if your RLS allows reading Members

Repo-root .env / .env.local are loaded automatically (UTF-8 with BOM ok; optional `export ` prefix;
fills missing or empty variables without overriding non-empty shell exports).

Usage:
  python scripts/upload_board_pics.py --dry-run
  python scripts/upload_board_pics.py
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

from supabase import Client, create_client

REPO_ROOT = Path(__file__).resolve().parent.parent
BOARD_DIR = REPO_ROOT / "public" / "Board"
BUCKET = "Profile Pictures"
# Match useUploadPFP.ts / useEditCard.ts
SIGNED_URL_TTL_SEC = 100 * 365 * 24 * 60 * 60

MIME_BY_SUFFIX = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}


def load_env_files() -> None:
    """Populate os.environ from .env / .env.local when a key is missing or empty."""
    for name in (".env.local", ".env"):
        path = REPO_ROOT / name
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8-sig")
        except OSError:
            continue
        for raw in text.splitlines():
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if line.lower().startswith("export "):
                line = line[7:].strip()
            if "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if not key:
                continue
            if key in os.environ and (os.environ.get(key) or "").strip():
                continue
            os.environ[key] = val


def supabase_url() -> str:
    return (os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or "").strip()


def supabase_api_key() -> tuple[str, bool]:
    """Returns (api_key, is_service_role). Live uploads require service role (RLS bypass)."""
    for env_name in ("SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_SECRET_API_KEY"):
        sr = (os.environ.get(env_name) or "").strip()
        if sr:
            return sr, True
    for env_name in ("VITE_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"):
        v = (os.environ.get(env_name) or "").strip()
        if v:
            return v, False
    return "", False


def sanitize_email(email: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]", "_", email.strip())


def candidate_name_stems(full_name: str) -> list[str]:
    parts = [p for p in full_name.strip().split() if p]
    if not parts:
        return []
    stems: list[str] = [
        "-".join(parts),
    ]
    if len(parts) >= 2:
        stems.append(f"{parts[0]}-{parts[-1]}")
    stems.append("_".join(parts))
    if len(parts) >= 2:
        stems.append(f"{parts[0]}_{parts[-1]}")
    seen: set[str] = set()
    out: list[str] = []
    for s in stems:
        k = s.lower()
        if k not in seen:
            seen.add(k)
            out.append(s)
    return out


def build_board_stem_index(board_dir: Path) -> dict[str, list[Path]]:
    index: dict[str, list[Path]] = {}
    if not board_dir.is_dir():
        return index
    for p in board_dir.iterdir():
        if not p.is_file():
            continue
        suf = p.suffix.lower()
        if suf not in MIME_BY_SUFFIX:
            continue
        index.setdefault(p.stem.lower(), []).append(p)
    return index


def resolve_board_image(board_dir: Path, stem_index: dict[str, list[Path]], full_name: str) -> Path | None:
    def sort_key(pa: Path) -> tuple[int, str]:
        order = {".webp": 0, ".png": 1, ".jpg": 2, ".jpeg": 2}
        return (order.get(pa.suffix.lower(), 9), pa.suffix.lower())

    for stem in candidate_name_stems(full_name):
        paths = stem_index.get(stem.lower())
        if not paths:
            continue
        return sorted(paths, key=sort_key)[0]
    return None


def image_url_for_path(client: Client, storage_path: str) -> str:
    bucket = client.storage.from_(BUCKET)
    try:
        signed = bucket.create_signed_url(storage_path, SIGNED_URL_TTL_SEC)
        url = signed.get("signedUrl") or signed.get("signedURL")
        if url:
            return url
    except Exception:
        pass
    return bucket.get_public_url(storage_path)


def main() -> int:
    load_env_files()
    parser = argparse.ArgumentParser(description="Upload public/Board images to Supabase for members missing profile_picture.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions only; do not upload or update the database.",
    )
    args = parser.parse_args()

    url = supabase_url()
    key, using_service_role = supabase_api_key()
    if not url or not key:
        print(
            "Missing Supabase credentials. In repo-root .env set:\n"
            "  VITE_SUPABASE_URL (or SUPABASE_URL)\n"
            "  SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SECRET_API_KEY (real uploads; Dashboard → service_role)\n"
            "  VITE_SUPABASE_ANON_KEY — optional, for --dry-run only if RLS allows selecting Members.",
            file=sys.stderr,
        )
        return 1
    if not using_service_role:
        if not args.dry_run:
            print(
                "This script cannot upload or update rows with the anon key (RLS blocks Storage and/or Members).\n"
                "Add SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SECRET_API_KEY (service_role) to repo-root .env.\n"
                "Never commit that key; do not use VITE_* for the secret if any client code reads it.\n"
                "Use --dry-run with the anon key if you only need to list matches.",
                file=sys.stderr,
            )
            return 1
        print(
            "Warning: using anon key for --dry-run only; Member list may still fail depending on RLS.",
            file=sys.stderr,
        )
    client = create_client(url, key)

    stem_index = build_board_stem_index(BOARD_DIR)
    if not stem_index and BOARD_DIR.is_dir():
        print(f"Warning: no recognized images under {BOARD_DIR}", file=sys.stderr)

    q = (
        client.table("Members")
        .select("full_name,email,profile_picture,teams,deleted")
        .not_.is_("teams", None)
        .or_("deleted.is.null,deleted.eq.false")
        .is_("profile_picture", None)
    )
    resp = q.execute()
    rows = list(resp.data or [])

    processed = uploaded = skipped = errors = 0

    for row in rows:
        processed += 1
        full_name = (row.get("full_name") or "").strip() or "?"
        email = (row.get("email") or "").strip()
        if not email:
            print(f"skip: no email — {full_name!r}")
            skipped += 1
            continue

        local_path = resolve_board_image(BOARD_DIR, stem_index, full_name)
        if not local_path:
            print(f"skip: no Board file for {full_name!r} ({email})")
            skipped += 1
            continue

        ext = local_path.suffix.lower() or ".webp"
        content_type = MIME_BY_SUFFIX.get(ext, "application/octet-stream")
        storage_name = f"{sanitize_email(email)}{ext}"
        if args.dry_run:
            print(f"dry-run: would upload {local_path} -> {BUCKET}/{storage_name}; update {email}")
            uploaded += 1
            continue

        assert client is not None
        try:
            file_body = local_path.read_bytes()
            client.storage.from_(BUCKET).upload(
                storage_name,
                file_body,
                file_options={
                    "content-type": content_type,
                    "cache-control": "3600",
                    "upsert": "true",
                },
            )
            image_url = image_url_for_path(client, storage_name)
            client.table("Members").update({"profile_picture": image_url}).eq("email", email).execute()
            print(f"ok: {full_name} <{email}> -> {storage_name}")
            uploaded += 1
        except Exception as exc:
            print(f"error: {full_name} <{email}>: {exc}", file=sys.stderr)
            errors += 1

    print(f"Summary: processed={processed} uploaded_or_dry={uploaded} skipped={skipped} errors={errors}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())

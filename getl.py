#!/usr/bin/env python3
"""Fetch the current Canva invitation and safely update Supabase.

Extraction flow intentionally follows the supplied canva.py script:
1. Fetch the Bingotingo start page.
2. Find the Biozium public bio-link profile URL.
3. Fetch that profile page.
4. Extract the Canva /brand/join invitation URL.

Required environment: SUPABASE_URL, SUPABASE_SERVICE_KEY
"""
import os
import re
import sys
from urllib.parse import urlparse

import requests

START = "https://bingotingo.com/best-social-media-platforms/"
UA = (
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36"
)
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": UA,
    "Accept-Language": "en-US,en;q=0.9",
})

PROFILE_RE = re.compile(
    r'https://biozium\.com/public/bio-links/[^"\'<>\s]+' , re.I
)
CANVA_RE = re.compile(
    r'https?://(?:www\.)?canva\.com/brand/join\?[^"\'<>\s]+', re.I
)


def is_canva_invite(value: str) -> bool:
    try:
        parsed = urlparse(value.strip())
        host = (parsed.hostname or "").lower().rstrip(".")
        return (
            parsed.scheme == "https"
            and (host == "canva.com" or host == "www.canva.com")
            and parsed.path == "/brand/join"
            and bool(parsed.query)
            and not parsed.username
            and not parsed.password
            and parsed.port in (None, 443)
        )
    except ValueError:
        return False


def extract_invite(start_url: str = START) -> str:
    print("[1] Fetching Bingotingo page...")
    response = SESSION.get(start_url, timeout=20)
    response.raise_for_status()

    match = PROFILE_RE.search(response.text)
    if not match:
        raise RuntimeError("Biozium profile not found; keeping existing Canva link")

    profile = match.group(0).rstrip("/") + "/"
    print("Profile:", profile)

    print("[2] Fetching Biozium profile page...")
    page = SESSION.get(profile, timeout=20)
    page.raise_for_status()

    match = CANVA_RE.search(page.text)
    if not match:
        raise RuntimeError("Canva invitation not found; keeping existing Canva link")

    invite = match.group(0).rstrip(".,);")
    if not is_canva_invite(invite):
        raise RuntimeError("Rejected invitation URL; expected HTTPS Canva brand invite")
    return invite


def save_invite(invite: str) -> None:
    base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_KEY", "")

    if not base or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY are required; refusing to report success"
        )

    response = SESSION.post(
        f"{base}/rest/v1/rpc/update_canva_link_automatically",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        json={"p_url": invite},
        timeout=20,
    )
    response.raise_for_status()
    result = response.json() if response.content else None
    if result is False:
        print("Manual Admin override is active; automatic update skipped")
    else:
        print("Canva invitation updated successfully")


if __name__ == "__main__":
    try:
        invite_url = extract_invite(sys.argv[1] if len(sys.argv) > 1 else START)
        print("\nSUCCESS - CANVA INVITATION")
        print(invite_url)
        save_invite(invite_url)
    except requests.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else "unknown"
        sys.exit(f"HTTP error ({status}); existing link was not changed: {exc}")
    except requests.RequestException as exc:
        sys.exit(f"Network error; existing link was not changed: {exc}")
    except RuntimeError as exc:
        sys.exit(str(exc))


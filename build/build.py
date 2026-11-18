"""Build the EWB Purdue Winter 2026 member directory.

Usage: python3 -I build.py <members.csv> <assets_out_dir> <out_dir>

members.csv columns: name, team, url
Every url must be https://support.ewb-usa.org/fundraiser/<digits>. The build stops on any bad row.
"""
import base64
import csv
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE_URL = "https://ewb-purdue.github.io/winter-crowdfunding-26/"
TEAM_URL = "https://support.ewb-usa.org/team/866091"
LINK_RE = re.compile(r"^https://support\.ewb-usa\.org/fundraiser/[0-9]{1,12}$")
TEAM_ORDER = [
    "Leadership", "Fundraising",
    "Rwanda", "Rwanda Water", "Rwanda Structures", "Rwanda Operations",
    "Louisiana", "Louisiana Long-Term", "Louisiana Short-Term",
    "Health", "Grants", "Corporate Outreach and Stewardship",
    "Alumni and Individual Outreach", "Marketing",
]


def fail(msg):
    sys.exit(f"BUILD STOPPED: {msg}")


def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def sha256(text):
    return "sha256-" + base64.b64encode(hashlib.sha256(text.encode()).digest()).decode()


def load_members(path):
    members, seen_urls, seen_names = [], {}, set()
    with open(path, newline="", encoding="utf-8-sig") as f:
        for n, row in enumerate(csv.DictReader(f), start=2):
            name = " ".join((row.get("name") or "").split())
            team = " ".join((row.get("team") or "").split())
            url = (row.get("url") or "").strip()
            if not name:
                fail(f"row {n}: missing name")
            if team not in TEAM_ORDER:
                fail(f"row {n} ({name}): unknown team '{team}'")
            if not LINK_RE.match(url):
                fail(f"row {n} ({name}): link is not an EWB-USA fundraiser page: {url!r}")
            if url in seen_urls:
                fail(f"row {n} ({name}): same link as {seen_urls[url]}")
            if name.lower() in seen_names:
                fail(f"row {n}: {name} is listed twice")
            seen_urls[url] = name
            seen_names.add(name.lower())
            members.append({"name": name, "team": team, "url": url})
    if not members:
        fail("no members")
    return members


def main():
    csv_path, assets, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    members = load_members(csv_path)

    style = (HERE / "style.css").read_text()
    members_js = json.dumps(members, ensure_ascii=False).replace("</", "<\\/")
    script = (HERE / "app.js").read_text()
    script = script.replace("__MEMBERS__", members_js).replace("__TEAM_ORDER__", json.dumps(TEAM_ORDER))

    html = (HERE / "template.html").read_text()
    replacements = {
        "__STYLE_HASH__": sha256(style),
        "__SCRIPT_HASH__": sha256(script),
        "__SITE_URL__": SITE_URL,
        "__TEAM_URL__": TEAM_URL,
        "__LOGO__": data_uri(assets / "logo_h.png", "image/png"),
        "__ICON_64__": data_uri(assets / "icon_64.png", "image/png"),
        "__ICON_180__": data_uri(assets / "icon_180.png", "image/png"),
    }
    for k, v in replacements.items():
        html = html.replace(k, v)
    # Style and script go in last so their placeholders can't be touched by other replacements.
    html = html.replace("__STYLE__", style).replace("__SCRIPT__", script)
    if re.search(r"__[A-Z0-9_]+__", html.replace(script, "").replace(style, "")):
        fail("unfilled placeholder in template")

    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(html, encoding="utf-8")
    shutil.copy(assets / "preview.png", out / "preview.png")
    teams = sorted({m["team"] for m in members}, key=TEAM_ORDER.index)
    print(f"Built {out / 'index.html'} ({len(html) // 1024} KB) with {len(members)} members across {len(teams)} teams")


if __name__ == "__main__":
    main()

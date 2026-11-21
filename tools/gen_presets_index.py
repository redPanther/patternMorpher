#!/usr/bin/env python3
"""Erzeugt presets/index.json aus allen presets/*.json (ausser index.json).

Der Anzeigename kommt aus dem Feld "name" im Preset, sonst aus dem Dateinamen.
Lokal ausfuehren, wenn ein neues Preset dazukommt; der GitHub-Pages-Workflow
macht das beim Deploy ebenfalls.
"""
import json
from pathlib import Path

presets = Path(__file__).resolve().parent.parent / "presets"
entries = []
for f in sorted(presets.glob("*.json")):
    if f.name == "index.json":
        continue
    try:
        name = json.loads(f.read_text(encoding="utf-8")).get("name") or ""
    except (ValueError, AttributeError):
        print(f"uebersprungen (kein gueltiges JSON): {f.name}")
        continue
    entries.append({"file": f.name, "name": name.strip() or f.stem.replace("-", " ")})

(presets / "index.json").write_text(json.dumps(entries, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"{len(entries)} Presets in index.json")

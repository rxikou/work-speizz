#!/usr/bin/env bash
# Sets up Claude Code on this machine from work-speizz (macOS / Linux / WSL).
#   1. Backs up ~/.claude/settings.json, then merges setup/settings.json into it
#      (objects merge, lists are combined, your other keys are kept). Needs python3.
#   2. Adds this repo as a plugin marketplace and installs every mod in it.
#   3. Installs the linked third-party plugins in setup/settings.json (ECC,
#      Prismantis) from their own marketplaces.
#
# Usage:  bash scripts/install.sh [--skip-settings] [--skip-mods]
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$HOME/.claude/settings.json"
SKIP_SETTINGS=0
SKIP_MODS=0
for arg in "$@"; do
  case "$arg" in
    --skip-settings) SKIP_SETTINGS=1 ;;
    --skip-mods) SKIP_MODS=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ "$SKIP_SETTINGS" -eq 0 ]; then
  command -v python3 >/dev/null || { echo "python3 is needed to merge settings." >&2; exit 1; }
  mkdir -p "$HOME/.claude"
  if [ -f "$TARGET" ]; then
    BACKUP="$TARGET.bak-$(date +%Y%m%d-%H%M%S)"
    cp "$TARGET" "$BACKUP"
    echo "Backed up settings to $BACKUP"
  fi
  python3 -I - "$TARGET" "$REPO/setup/settings.json" <<'PY'
import json, os, sys

target, incoming = sys.argv[1], sys.argv[2]

def merge(base, over):
    if isinstance(base, dict) and isinstance(over, dict):
        for k, v in over.items():
            base[k] = merge(base[k], v) if k in base else v
        return base
    if isinstance(base, list) and isinstance(over, list):
        return base + [x for x in over if x not in base]
    return over

current = json.load(open(target)) if os.path.exists(target) else {}
merged = merge(current, json.load(open(incoming)))
with open(target, "w") as f:
    json.dump(merged, f, indent=2)
    f.write("\n")
PY
  echo "Settings merged into $TARGET"
fi

if [ "$SKIP_MODS" -eq 0 ]; then
  command -v claude >/dev/null || { echo "Install Claude Code first, then rerun with --skip-settings." >&2; exit 1; }
  claude plugin marketplace add rxikou/work-speizz
  python3 -I -c 'import json,sys; [print(p["name"]) for p in json.load(open(sys.argv[1]))["plugins"]]' \
    "$REPO/.claude-plugin/marketplace.json" | while read -r mod; do
      echo "Installing $mod..."
      claude plugin install "$mod@work-speizz"
    done

  # Linked third-party plugins (see Credits in the README): add each one's own
  # marketplace and install it from there, straight from its author's repo.
  python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1]))
for m in s.get("extraKnownMarketplaces", {}).values():
    print(m["source"].get("repo") or m["source"]["url"])' "$REPO/setup/settings.json" | while read -r src; do
      echo "Adding marketplace $src..."
      claude plugin marketplace add "$src"
    done
  python3 -I -c 'import json,sys
for k, on in json.load(open(sys.argv[1])).get("enabledPlugins", {}).items():
    if on and not k.endswith("@work-speizz"): print(k)' "$REPO/setup/settings.json" | while read -r plugin; do
      echo "Installing $plugin..."
      claude plugin install "$plugin"
    done
fi

echo "Done. Restart Claude Code to pick everything up."

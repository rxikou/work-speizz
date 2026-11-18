#!/usr/bin/env bash
# Installs the work-speizz mods into Claude Code (macOS / Linux / WSL).
#   1. Adds this repo as a plugin marketplace and installs every mod in it.
#   2. Installs the linked third-party mods in linked-mods.json from their
#      authors' own marketplaces.
# Your ~/.claude/settings.json is not touched beyond what `claude plugin` does.
#
# Usage:  bash scripts/install.sh [--skip-linked]
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SKIP_LINKED=0
for arg in "$@"; do
  case "$arg" in
    --skip-linked) SKIP_LINKED=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

command -v claude >/dev/null || { echo "Install Claude Code first." >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 is needed to read the mod lists." >&2; exit 1; }

claude plugin marketplace add rxikou/work-speizz
python3 -I -c 'import json,sys; [print(p["name"]) for p in json.load(open(sys.argv[1]))["plugins"]]' \
  "$REPO/.claude-plugin/marketplace.json" | while read -r mod; do
    echo "Installing $mod..."
    claude plugin install "$mod@work-speizz"
  done

if [ "$SKIP_LINKED" -eq 0 ]; then
  # Linked third-party mods (see Credits in the README), straight from their authors' repos.
  python3 -I -c 'import json,sys
for m in json.load(open(sys.argv[1]))["mods"]: print(m["marketplace"], m["plugin"])' \
    "$REPO/linked-mods.json" | while read -r market plugin; do
      echo "Installing $plugin from $market..."
      claude plugin marketplace add "$market"
      claude plugin install "$plugin"
    done
fi

echo "Done. Restart Claude Code to pick everything up."

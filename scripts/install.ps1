# Installs the work-speizz mods into Claude Code (Windows / PowerShell).
#   1. Adds this repo as a plugin marketplace and installs every mod in it.
#   2. Installs the linked third-party mods in linked-mods.json from their
#      authors' own marketplaces.
# Your ~/.claude/settings.json is not touched beyond what `claude plugin` does.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\install.ps1 [-SkipLinked]

param([switch]$SkipLinked)
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Warning 'The claude CLI is not on PATH; install Claude Code first.'
    exit 1
}

claude plugin marketplace add rxikou/work-speizz
$market = Get-Content (Join-Path $repo '.claude-plugin\marketplace.json') -Raw | ConvertFrom-Json
foreach ($mod in $market.plugins) {
    Write-Host "Installing $($mod.name)..."
    claude plugin install "$($mod.name)@work-speizz"
}

if (-not $SkipLinked) {
    # Linked third-party mods (see Credits in the README), straight from their authors' repos.
    $linked = Get-Content (Join-Path $repo 'linked-mods.json') -Raw | ConvertFrom-Json
    foreach ($m in $linked.mods) {
        Write-Host "Installing $($m.plugin) from $($m.marketplace)..."
        claude plugin marketplace add $m.marketplace
        claude plugin install $m.plugin
    }
}

Write-Host 'Done. Restart Claude Code to pick everything up.'

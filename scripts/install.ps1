# Sets up Claude Code on this machine from work-speizz (Windows / PowerShell).
#   1. Backs up ~/.claude/settings.json, then merges setup/settings.json into it
#      (objects merge, lists are combined, your other keys are kept).
#   2. Adds this repo as a plugin marketplace and installs every mod in it.
#   3. Installs the linked third-party plugins in setup/settings.json (ECC,
#      Prismantis) from their own marketplaces.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\install.ps1 [-SkipSettings] [-SkipMods]

param([switch]$SkipSettings, [switch]$SkipMods)
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$claudeDir = Join-Path $HOME '.claude'
$target = Join-Path $claudeDir 'settings.json'

function Merge-Json($base, $over) {
    if ($base -is [System.Management.Automation.PSCustomObject] -and $over -is [System.Management.Automation.PSCustomObject]) {
        foreach ($p in $over.PSObject.Properties) {
            $existing = $base.PSObject.Properties[$p.Name]
            if ($existing) { $existing.Value = Merge-Json $existing.Value $p.Value }
            else { $base | Add-Member -NotePropertyName $p.Name -NotePropertyValue $p.Value }
        }
        return $base
    }
    if ($base -is [array] -and $over -is [array]) {
        return @($base + ($over | Where-Object { $base -notcontains $_ }))
    }
    return $over
}

if (-not $SkipSettings) {
    New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null
    $incoming = Get-Content (Join-Path $repo 'setup\settings.json') -Raw | ConvertFrom-Json
    if (Test-Path $target) {
        $backup = "$target.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $target $backup
        Write-Host "Backed up settings to $backup"
        $current = Get-Content $target -Raw | ConvertFrom-Json
        $merged = Merge-Json $current $incoming
    } else {
        $merged = $incoming
    }
    # Write UTF-8 without a BOM (Windows PowerShell 5's -Encoding utf8 adds one).
    [System.IO.File]::WriteAllText($target, ($merged | ConvertTo-Json -Depth 32), (New-Object System.Text.UTF8Encoding $false))
    Write-Host "Settings merged into $target"
}

if (-not $SkipMods) {
    if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
        Write-Warning 'The claude CLI is not on PATH; install Claude Code, then rerun with -SkipSettings.'
        exit 1
    }
    claude plugin marketplace add rxikou/work-speizz
    $market = Get-Content (Join-Path $repo '.claude-plugin\marketplace.json') -Raw | ConvertFrom-Json
    foreach ($mod in $market.plugins) {
        Write-Host "Installing $($mod.name)..."
        claude plugin install "$($mod.name)@work-speizz"
    }

    # Linked third-party plugins (see Credits in the README): add each one's own
    # marketplace and install it from there, straight from its author's repo.
    $settings = Get-Content (Join-Path $repo 'setup\settings.json') -Raw | ConvertFrom-Json
    foreach ($m in $settings.extraKnownMarketplaces.PSObject.Properties) {
        $src = $m.Value.source
        $from = if ($src.repo) { $src.repo } else { $src.url }
        Write-Host "Adding marketplace $($m.Name)..."
        claude plugin marketplace add $from
    }
    foreach ($p in $settings.enabledPlugins.PSObject.Properties) {
        if ($p.Value -and -not $p.Name.EndsWith('@work-speizz')) {
            Write-Host "Installing $($p.Name)..."
            claude plugin install $p.Name
        }
    }
}

Write-Host 'Done. Restart Claude Code to pick everything up.'

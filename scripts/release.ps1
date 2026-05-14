#!/usr/bin/env pwsh
# release.ps1 - Interactive release CLI for fdm-monster-client-next

param(
    [Parameter(Position = 0)]
    [ValidateSet("patch", "minor", "major", "")]
    [string]$BumpType = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --- Output helpers -----------------------------------------------------------
function Write-Header  { param([string]$msg) Write-Host "`n  [$msg]" -ForegroundColor Cyan }
function Write-Step    { param([string]$msg) Write-Host "  > $msg"   -ForegroundColor White }
function Write-Success { param([string]$msg) Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Warn    { param([string]$msg) Write-Host "  !! $msg"  -ForegroundColor Yellow }
function Write-Err     { param([string]$msg) Write-Host "  ERR $msg" -ForegroundColor Red }

function Confirm-Prompt {
    param([string]$Question)
    $ans = Read-Host "  $Question [Y/n]"
    return ($ans -eq "" -or $ans -eq "y" -or $ans -eq "Y")
}

# --- Preflight checks --------------------------------------------------------
Write-Header "Preflight checks"

# git available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "git is not installed or not on PATH."
    exit 1
}
Write-Success "git found"

# git has an identity / is authenticated (proxy: can read user config)
$gitUser = & git config --global user.name 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitUser)) {
    Write-Err "git user.name is not configured. Run: git config --global user.name 'Your Name'"
    exit 1
}
Write-Success "git identity: $gitUser"

# gh cli + auth
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Err "GitHub CLI (gh) is not installed or not on PATH. See https://cli.github.com"
    exit 1
}
Write-Success "gh found"

$ghAuth = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "GitHub CLI is not authenticated. Run: gh auth login"
    exit 1
}
Write-Success "gh authenticated"

$null = & gh repo set-default --view 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warn "No default GitHub remote set for this repo."
    Write-Host "  Available remotes:" -ForegroundColor DarkCyan
    & git remote -v 2>$null | Select-Object -Unique | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    Write-Host ""
    $remoteInput = Read-Host "  Enter the repo to use as default (e.g. owner/repo)"
    $null = & gh repo set-default $remoteInput
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to set default repo. Aborting."
        exit 1
    }
    Write-Success "Default repo set: $remoteInput"
} else {
    $defaultRepo = & gh repo set-default --view 2>$null
    Write-Success "gh default repo: $defaultRepo"
}

# --- Guard: must be on main ---------------------------------------------------
Write-Header "Checking current branch"
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Not inside a git repository."
    exit 1
}
if ($branch -ne "main") {
    Write-Err "You are on branch '$branch'. Releases must be started from 'main'."
    exit 1
}
Write-Success "On branch: main"

# --- Guard: warn on dirty working tree ----------------------------------------
Write-Header "Checking working tree"
$status = git status --porcelain 2>&1
if ($status) {
    Write-Warn "Uncommitted changes detected:"
    $status -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    if (-not (Confirm-Prompt "Continue anyway?")) {
        Write-Err "Aborted."
        exit 1
    }
} else {
    Write-Success "Working tree is clean"
}

# --- Resolve repo root (script lives in scripts/, root is one level up) -------
$repoRoot = Split-Path $PSScriptRoot -Parent

# --- Resolve package.json -----------------------------------------------------
$pkgPath = Join-Path $repoRoot "package.json"
if (-not (Test-Path $pkgPath)) {
    Write-Err "package.json not found at: $pkgPath"
    exit 1
}
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json

# --- Determine bump type ------------------------------------------------------
if (-not $BumpType) {
    Write-Header "Select version bump type"
    Write-Host "  Current version: $($pkg.version)" -ForegroundColor DarkCyan
    Write-Host ""
    Write-Host "  [1] patch  - bug-fixes, hotfixes"
    Write-Host "  [2] minor  - new features (backwards-compatible)"
    Write-Host "  [3] major  - breaking changes"
    Write-Host ""
    $choice = Read-Host "  Choose (1/2/3) [default: 1]"
    if ($choice -eq "") { $choice = "1" }
    $BumpType = switch ($choice) {
        "1" { "patch" }
        "2" { "minor" }
        "3" { "major" }
        default {
            Write-Err "Invalid choice '$choice'. Aborting."
            exit 1
        }
    }
}

# --- Bump version -------------------------------------------------------------
Write-Header "Bumping $BumpType version"
$parts = @($pkg.version -split "\.")
if ($parts.Count -ne 3) {
    Write-Err "Unexpected version format: $($pkg.version)"
    exit 1
}
[int]$verMajor = $parts[0]
[int]$verMinor = $parts[1]
[int]$verPatch = $parts[2]

switch ($BumpType) {
    "major" { $verMajor++; $verMinor = 0; $verPatch = 0 }
    "minor" { $verMinor++;                $verPatch = 0 }
    "patch" {                             $verPatch++   }
}
$newVersion = "$verMajor.$verMinor.$verPatch"
Write-Step "$($pkg.version) -> $newVersion"

# --- RELEASE_NOTES.md entry ---------------------------------------------------
Write-Header "Creating RELEASE_NOTES.md entry for v$newVersion"

$rnPath = Join-Path $repoRoot "RELEASE_NOTES.md"
if (-not (Test-Path $rnPath)) {
    Write-Warn "RELEASE_NOTES.md not found - creating it."
    Set-Content -Path $rnPath -Value "# fdm-monster-client-next release notes`n"
}

# Show recent merge commits (excluding fdm-monster/renovate/* branches)
Write-Host ""
Write-Host "  Recent merges (for reference):" -ForegroundColor DarkCyan
# %s = subject, %b = body (commit description); use a delimiter to split them safely
$mergeLog = & git log --merges --format="%ad|%an|%s|%b<END>" --date=short -n 50 2>$null
$recentMerges = $mergeLog -join "`n" -split "<END>" |
    ForEach-Object {
        $entry = $_.Trim()
        if ($entry -eq "") { return }
        $parts = @($entry -split "\|", 4)
        if ($parts.Count -lt 3) { return }
        $date    = $parts[0].Trim()
        $author  = $parts[1].Trim()
        $subject = $parts[2].Trim()
        $body    = if ($parts.Count -eq 4) { $parts[3] -replace "`r?`n", " " -replace "\s+", " " } else { "" }
        $body    = $body.Trim()
        # Filter out renovate branches
        if ($subject -match "fdm-monster/renovate/") { return }
        $desc = if ($body -ne "") {
            $short = if ($body.Length -gt 72) { $body.Substring(0, 72) + "..." } else { $body }
            $short
        } else { "" }
        [PSCustomObject]@{ Date=$date; Author=$author; Subject=$subject; Desc=$desc }
    } |
    Where-Object { $_ -ne $null } |
    Select-Object -First 10

$recentMerges | ForEach-Object {
    Write-Host "    $($_.Date)  $($_.Author)  $($_.Subject)" -ForegroundColor Gray
    if ($_.Desc -ne "") {
        Write-Host "         -- $($_.Desc)" -ForegroundColor DarkGray
    }
}
Write-Host ""

# Collect subsections
$sections = [ordered]@{
    Features = [System.Collections.Generic.List[string]]::new()
    Fixes    = [System.Collections.Generic.List[string]]::new()
    Chores   = [System.Collections.Generic.List[string]]::new()
    Hotfixes = [System.Collections.Generic.List[string]]::new()
    Docs     = [System.Collections.Generic.List[string]]::new()
}
$sectionNames = @("Features", "Fixes", "Chores", "Hotfixes", "Docs")

Write-Host "  Enter release note entries. Leave blank and press Enter to skip a section." -ForegroundColor DarkCyan
Write-Host ""

foreach ($section in $sectionNames) {
    Write-Host "  -- $section --" -ForegroundColor Magenta
    while ($true) {
        $entry = Read-Host "    Add entry (or press Enter to skip/finish)"
        if ([string]::IsNullOrWhiteSpace($entry)) { break }
        $sections[$section].Add("- $entry")
    }
}

# Build the new section block - skip entirely if no entries were provided
$hasContent = @($sectionNames | Where-Object { $sections[$_].Count -gt 0 }).Count -gt 0

if ($hasContent) {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("## Client $newVersion")
    $lines.Add("")

    foreach ($section in $sectionNames) {
        if ($sections[$section].Count -gt 0) {
            $lines.Add($section)
            $lines.Add("")
            foreach ($entry in $sections[$section]) {
                $lines.Add($entry)
            }
            $lines.Add("")
        }
    }

    $newBlock = $lines -join "`n"

    # Insert after the H1 heading
    $rnContent = Get-Content $rnPath -Raw
    $heading = "# fdm-monster-client-next release notes"
    if ($rnContent -notmatch [regex]::Escape($heading)) {
        Write-Warn "H1 heading not found in RELEASE_NOTES.md - prepending it."
        $rnContent = "$heading`n`n$rnContent"
    }
    $rnContent = $rnContent -replace ([regex]::Escape($heading)), "$heading`n`n$newBlock"
    Set-Content -Path $rnPath -Value $rnContent -NoNewline
    Write-Success "RELEASE_NOTES.md updated"
} else {
    Write-Warn "No release note entries provided - skipping RELEASE_NOTES.md update."
}

# --- Update package.json and yarn.lock ----------------------------------------
Write-Header "Updating package.json and yarn.lock"
$pkgRaw = Get-Content $pkgPath -Raw
$pkgRaw = $pkgRaw -replace '"version"\s*:\s*"[^"]+"', "`"version`": `"$newVersion`""
Set-Content -Path $pkgPath -Value $pkgRaw -NoNewline
Write-Success "package.json updated"

yarn install 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Err "yarn install failed. Rolling back package.json."
    git checkout -- package.json
    exit 1
}
Write-Success "yarn.lock updated"

# --- Checkout release branch --------------------------------------------------
$releaseBranch = "release/$newVersion"
Write-Header "Creating branch $releaseBranch"
$null = & git checkout -q -b $releaseBranch
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to create branch $releaseBranch (does it already exist?)"
    exit 1
}
Write-Success "Checked out $releaseBranch"

# --- Commit -------------------------------------------------------------------
Write-Header "Committing release files"
if ($hasContent) {
    $null = & git add package.json yarn.lock RELEASE_NOTES.md
} else {
    $null = & git add package.json yarn.lock
}
$null = & git commit -m "chore: release v$newVersion"
if ($LASTEXITCODE -ne 0) {
    Write-Err "git commit failed."
    exit 1
}
Write-Success "Committed: chore: release v$newVersion"

# --- Push branch --------------------------------------------------------------
Write-Header "Pushing $releaseBranch to origin"
$null = & git push -u origin $releaseBranch
if ($LASTEXITCODE -ne 0) {
    Write-Err "git push failed."
    exit 1
}
Write-Success "Branch pushed"

# --- Create GitHub PR ---------------------------------------------------------
Write-Header "Creating GitHub Pull Request"

$prBodyLines = [System.Collections.Generic.List[string]]::new()
$prBodyLines.Add("## Release v$newVersion")
$prBodyLines.Add("")

# Section 1: release notes (if any)
if ($hasContent) {
    $prBodyLines.Add("### Release Notes")
    $prBodyLines.Add("")
    foreach ($section in $sectionNames) {
        if ($sections[$section].Count -gt 0) {
            $prBodyLines.Add("#### $section")
            $prBodyLines.Add("")
            foreach ($entry in $sections[$section]) {
                $prBodyLines.Add($entry)
            }
            $prBodyLines.Add("")
        }
    }
}

# Section 2: recent merges
$prBodyLines.Add("### Recent Merges")
$prBodyLines.Add("")
$recentMerges | ForEach-Object {
    $line = "- $($_.Date)  $($_.Author)  $($_.Subject)"
    if ($_.Desc -ne "") { $line += " -- $($_.Desc)" }
    $prBodyLines.Add($line)
}
$prBodyLines.Add("")

$prBody = $prBodyLines -join "`n"

# --- Create GitHub PR ---------------------------------------------------------
Write-Header "Creating GitHub Pull Request"
$prTitle = "Release v$newVersion"
$prUrl = & gh pr create --base main --head $releaseBranch --title $prTitle --body $prBody
if ($LASTEXITCODE -ne 0) {
    Write-Err "gh pr create failed. Is the GitHub CLI authenticated and is a default remote set?"
    Write-Err "Run: gh repo set-default"
    exit 1
}
Write-Success "Pull request created"

# --- Done ---------------------------------------------------------------------
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   Release v$newVersion ready for review!" -ForegroundColor Green
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open the pull request (Ctrl+click):" -ForegroundColor DarkCyan
Write-Host "  $prUrl" -ForegroundColor White
Write-Host ""
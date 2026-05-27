# One-time structural cleanup for the standalone pages in Strapi.
#
# After today's schema flap, the generic-page collection ended up with:
# - duplicate Privacy entries (slugs 'privacy' AND 'privacy-policy', both empty)
# - duplicate Terms entries (slugs 'terms' AND 'terms-and-conditions', both empty)
# - a Mission entry with slug 'mission' but the footer links to '/our-mission'
# - a footer "Privacy" legal link with no leading slash ('privacy-policy')
#
# This script:
#   1. Deletes the short-slug duplicates (privacy, terms)
#   2. Renames the Mission slug from 'mission' to 'our-mission'
#   3. Fixes the footer Privacy link to have a leading slash
#
# Idempotent — safe to re-run. Checks before each action.
#
# After this completes, run upload-pages.ps1 to push the .md content
# from Docs/page-content/ into the surviving entries.
#
# Usage:
#   $env:STRAPI_URL = 'https://cms.annalouwellness.com'
#   $env:STRAPI_TOKEN = '<full-access-token>'
#   ./fix-standalone-pages.ps1

$ErrorActionPreference = 'Stop'

if (-not $env:STRAPI_URL) { Write-Error "Set `$env:STRAPI_URL first" }
if (-not $env:STRAPI_TOKEN) { Write-Error "Set `$env:STRAPI_TOKEN first" }

$baseUrl = $env:STRAPI_URL.TrimEnd('/')
$headers = @{
  Authorization  = "Bearer $($env:STRAPI_TOKEN)"
  'Content-Type' = 'application/json; charset=utf-8'
}

Add-Type -AssemblyName System.Web.Extensions
$jsonSerializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer

function Get-GenericPageDocId {
  param([string]$Slug)
  $url = ('{0}/api/generic-pages?filters[slug][$eq]={1}&pagination[pageSize]=1' -f $baseUrl, $Slug)
  try {
    $r = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    if ($r.data -and $r.data.Count -gt 0) {
      return @{
        documentId = $r.data[0].documentId
        id = $r.data[0].id
        intro = $r.data[0].intro
      }
    }
  } catch {
    Write-Output ("  ERROR fetching '{0}': {1}" -f $Slug, $_.Exception.Message)
  }
  return $null
}

# ──────────────────────────────────────────────────────────────────────
# 1. Delete duplicate short-slug entries (privacy, terms)
# ──────────────────────────────────────────────────────────────────────
Write-Output ""
Write-Output "Step 1 — deleting duplicate entries..."

foreach ($dupSlug in @('privacy', 'terms')) {
  $entry = Get-GenericPageDocId -Slug $dupSlug
  if (-not $entry) {
    Write-Output ("  SKIP: no entry with slug '{0}' (already gone)" -f $dupSlug)
    continue
  }
  $hasContent = $entry.intro -and ($entry.intro.ToString().Length -gt 50)
  if ($hasContent) {
    Write-Output ("  WARN: '{0}' has content ({1} chars) — NOT deleting. Manual review required." -f $dupSlug, $entry.intro.ToString().Length)
    continue
  }
  try {
    Invoke-RestMethod -Uri ('{0}/api/generic-pages/{1}' -f $baseUrl, $entry.documentId) -Headers $headers -Method Delete | Out-Null
    Write-Output ("  DELETED '{0}' (documentId={1})" -f $dupSlug, $entry.documentId)
  } catch {
    Write-Output ("  FAILED delete '{0}': {1}" -f $dupSlug, $_.Exception.Message)
  }
}

# ──────────────────────────────────────────────────────────────────────
# 2. Rename Mission slug: mission -> our-mission
# ──────────────────────────────────────────────────────────────────────
Write-Output ""
Write-Output "Step 2 — renaming Mission slug..."

$missionOld = Get-GenericPageDocId -Slug 'mission'
$missionNew = Get-GenericPageDocId -Slug 'our-mission'
if ($missionNew) {
  Write-Output "  SKIP: 'our-mission' already exists. If 'mission' also exists, delete it manually in Strapi admin."
} elseif (-not $missionOld) {
  Write-Output "  SKIP: no 'mission' entry found (already renamed or never created)"
} else {
  $payload = $jsonSerializer.Serialize(@{
    data = @{ slug = 'our-mission' }
  })
  $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  try {
    Invoke-RestMethod -Uri ('{0}/api/generic-pages/{1}' -f $baseUrl, $missionOld.documentId) -Headers $headers -Method Put -Body $payloadBytes | Out-Null
    Write-Output ("  RENAMED 'mission' -> 'our-mission' (documentId={0})" -f $missionOld.documentId)
  } catch {
    $errBody = ''
    if ($_.Exception.Response) {
      try { $errBody = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch { }
    }
    Write-Output ("  FAILED rename: {0}" -f ($errBody -or $_.Exception.Message))
  }
}

# ──────────────────────────────────────────────────────────────────────
# 3. Fix the footer's Privacy link to have a leading slash
# ──────────────────────────────────────────────────────────────────────
Write-Output ""
Write-Output "Step 3 — fixing footer Privacy link..."

try {
  $footer = Invoke-RestMethod -Uri ('{0}/api/footer?populate=*' -f $baseUrl) -Headers $headers -Method Get
  $footerDocId = $footer.data.documentId
  $legal = @($footer.data.legal_links)
  $needsFix = $false
  $newLegal = @()
  foreach ($link in $legal) {
    $href = [string]$link.href
    $label = [string]$link.label
    if ($href -and -not $href.StartsWith('/') -and -not $href.StartsWith('http')) {
      $href = '/' + $href
      $needsFix = $true
      Write-Output ("  -> fixing '{0}' link: '{1}' -> '{2}'" -f $label, $link.href, $href)
    }
    $newLegal += @{ label = $label; href = $href }
  }
  if (-not $needsFix) {
    Write-Output "  SKIP: all legal links already have correct format"
  } else {
    $payload = $jsonSerializer.Serialize(@{ data = @{ legal_links = $newLegal } })
    $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    Invoke-RestMethod -Uri ('{0}/api/footer' -f $baseUrl) -Headers $headers -Method Put -Body $payloadBytes | Out-Null
    Write-Output "  UPDATED footer legal_links"
  }
} catch {
  $errBody = ''
  if ($_.Exception.Response) {
    try { $errBody = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch { }
  }
  Write-Output ("  FAILED footer fix: {0}" -f ($errBody -or $_.Exception.Message))
}

Write-Output ""
Write-Output "=========================================="
Write-Output "Cleanup complete."
Write-Output ""
Write-Output "Next: run ./upload-pages.ps1 to push the .md content into:"
Write-Output "  - privacy-policy.md      -> /privacy-policy"
Write-Output "  - terms-and-conditions.md -> /terms-and-conditions"
Write-Output "  - our-mission.md          -> /our-mission"

# Upload the 23 ALW HTML email templates to Mailchimp.
#
# Reads each pre-designed HTML file from
#   Docs/final docs/ALW Mailchimp HTML Templates/ALW_Mailchimp_Templates/
# and POSTs to Mailchimp /3.0/templates with a descriptive name.
#
# Idempotent: deletes existing templates with the "ALW · " prefix first so
# re-running is safe and names stay clean.
#
# Usage:
#   $env:MAILCHIMP_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us8'
#   # Optional: pre-substitute the 9 URLs (otherwise placeholders stay
#   # in the upload and Anna replaces them per-email in Mailchimp).
#   # $env:INTAKE_URL    = 'https://...'
#   # $env:BOOKING_URL   = 'https://...'
#   # $env:SCOPING_URL   = 'https://...'
#   # $env:CALENDAR_URL  = 'https://...'
#   # $env:REPLAY_URL    = 'https://...'
#   # $env:COMPANION_URL = 'https://...'
#   # $env:DONATION_URL  = 'https://...'
#   # $env:GROUP_URL     = 'https://...'
#   # $env:SNAPSHOT_URL  = 'https://...'
#   ./mailchimp-upload-html-templates.ps1

$ErrorActionPreference = 'Stop'

if (-not $env:MAILCHIMP_API_KEY) {
  Write-Error "Set MAILCHIMP_API_KEY env var first (e.g. `$env:MAILCHIMP_API_KEY = 'xxxxxxxx-us8')"
}
$apiKey = $env:MAILCHIMP_API_KEY
$dc = $apiKey.Split('-')[-1]
if ([string]::IsNullOrEmpty($dc) -or $dc -eq $apiKey) {
  Write-Error "MAILCHIMP_API_KEY malformed — should end with '-usX' (datacenter suffix)"
}
$baseUrl = "https://$dc.api.mailchimp.com/3.0"
$auth = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('any:' + $apiKey))
$headers = @{ Authorization = $auth }

# Filename → display name (from Docs/final docs/.../index.html table of contents)
$templates = [ordered]@{
  'email_1.html'    = 'ALW · 1 — Newsletter welcome (Reset Letters free)'
  'email_2_1.html'  = 'ALW · 2.1 — Decoder delivery'
  'email_2_2.html'  = 'ALW · 2.2 — Decoder follow-up (3 days)'
  'email_3_1.html'  = 'ALW · 3.1 — Workshop confirmation'
  'email_3_2.html'  = 'ALW · 3.2 — Post-workshop (24h after)'
  'email_4.html'    = 'ALW · 4 — Discovery call booked'
  'email_5.html'    = 'ALW · 5 — Returning Circle RSVP'
  'email_6_1.html'  = 'ALW · 6.1 — Reset Room welcome (£25/mo)'
  'email_6_2.html'  = 'ALW · 6.2 — Reset Room — where to start (3 days)'
  'email_6_3.html'  = 'ALW · 6.3 — Reset Room — first week check-in (7 days)'
  'email_7_1.html'  = 'ALW · 7.1 — The Reset welcome (6 weeks)'
  'email_7_2.html'  = 'ALW · 7.2 — The Reset — day before first session'
  'email_8_1.html'  = 'ALW · 8.1 — Signal welcome (12 weeks)'
  'email_8_2.html'  = 'ALW · 8.2 — Signal — day before first session'
  'email_9_1.html'  = 'ALW · 9.1 — Signal & Build welcome (Founders)'
  'email_9_2.html'  = 'ALW · 9.2 — Signal & Build — day before'
  'email_10_1.html' = 'ALW · 10.1 — One Day confirmed'
  'email_10_2.html' = 'ALW · 10.2 — One Day — day before'
  'email_10_3.html' = 'ALW · 10.3 — One Day — integration (3 days after)'
  'email_11_1.html' = 'ALW · 11.1 — Signal Collective welcome (Mastermind)'
  'email_11_2.html' = 'ALW · 11.2 — Signal Collective — meet the room (7 days)'
  'email_12_1.html' = 'ALW · 12.1 — Reset Session booked (90-min single)'
  'email_12_2.html' = 'ALW · 12.2 — Reset Session — after the session'
}

# Path to the HTML files (relative to this script's location)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlDir = Join-Path $scriptDir 'final docs\ALW Mailchimp HTML Templates\ALW_Mailchimp_Templates'

if (-not (Test-Path $htmlDir)) {
  Write-Error "HTML templates directory not found at: $htmlDir"
}

# 9 URL placeholders. If the env var is set, substitute. Otherwise leave
# the [PLACEHOLDER] for Anna to fill in Mailchimp's editor per email.
$urlMap = @{
  '[INTAKE_URL]'    = $env:INTAKE_URL
  '[BOOKING_URL]'   = $env:BOOKING_URL
  '[SCOPING_URL]'   = $env:SCOPING_URL
  '[CALENDAR_URL]'  = $env:CALENDAR_URL
  '[REPLAY_URL]'    = $env:REPLAY_URL
  '[COMPANION_URL]' = $env:COMPANION_URL
  '[DONATION_URL]'  = $env:DONATION_URL
  '[GROUP_URL]'     = $env:GROUP_URL
  '[SNAPSHOT_URL]'  = $env:SNAPSHOT_URL
}

# Step 1: Fetch existing templates and delete any with the "ALW · " prefix
# so re-running keeps names clean. Pagination loops until all pages seen.
Write-Output ""
Write-Output "Checking for existing ALW templates to clean up..."
$deletedCount = 0
$offset = 0
$pageSize = 100
do {
  $listUrl = "$baseUrl/templates?count=$pageSize&offset=$offset&type=user"
  $page = Invoke-RestMethod -Uri $listUrl -Headers $headers -Method Get
  $existing = $page.templates | Where-Object { $_.name -like 'ALW * - *' -or $_.name -like 'ALW * — *' -or $_.name -like 'ALW * - *' -or $_.name -like 'ALW · *' }
  foreach ($t in $existing) {
    try {
      Invoke-RestMethod -Uri "$baseUrl/templates/$($t.id)" -Headers $headers -Method Delete | Out-Null
      Write-Output "  Deleted existing: $($t.name)"
      $deletedCount++
    } catch {
      Write-Output "  Could not delete '$($t.name)': $($_.Exception.Message)"
    }
  }
  $offset += $pageSize
} while ($page.templates.Count -eq $pageSize)
Write-Output "Cleanup complete. Removed $deletedCount old template(s)."

# Step 2: Upload each HTML file as a fresh template
Write-Output ""
Write-Output "Uploading $($templates.Count) templates..."
$uploaded = 0
$failed = @()
foreach ($entry in $templates.GetEnumerator()) {
  $filename = $entry.Key
  $name = $entry.Value
  $path = Join-Path $htmlDir $filename
  if (-not (Test-Path $path)) {
    Write-Output "  SKIP (file missing): $filename"
    $failed += $filename
    continue
  }
  $html = Get-Content -LiteralPath $path -Raw -Encoding UTF8

  # Substitute any URL placeholders where env vars are set
  foreach ($placeholder in $urlMap.Keys) {
    $value = $urlMap[$placeholder]
    if (-not [string]::IsNullOrEmpty($value)) {
      $html = $html.Replace($placeholder, $value)
    }
  }

  $body = @{
    name = $name
    html = $html
  } | ConvertTo-Json -Depth 3 -Compress

  try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/templates" -Headers $headers -Method Post -ContentType 'application/json' -Body $body
    Write-Output "  Uploaded: $name (id=$($resp.id))"
    $uploaded++
  } catch {
    Write-Output "  FAILED: $name — $($_.Exception.Message)"
    $failed += $filename
  }
}

Write-Output ""
Write-Output "=========================================="
Write-Output "Upload complete."
Write-Output "  Uploaded:  $uploaded / $($templates.Count)"
if ($failed.Count -gt 0) {
  Write-Output "  Failed:    $($failed.Count) ($($failed -join ', '))"
}
$placeholdersFilled = ($urlMap.Values | Where-Object { -not [string]::IsNullOrEmpty($_) }).Count
Write-Output "  URLs substituted: $placeholdersFilled / 9 (rest stay as [PLACEHOLDER] for Anna to fill in editor)"
Write-Output ""
Write-Output "Verify in Mailchimp: Email templates → Saved templates"
Write-Output "Next: open each journey draft in Automations, swap the email template to its matching ALW · entry, fill placeholders + visual content, activate."

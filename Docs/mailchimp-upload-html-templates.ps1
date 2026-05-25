# Upload the 23 ALW HTML email templates to Mailchimp.
#
# Reads each pre-designed HTML file from
#   Docs/final docs/ALW Mailchimp HTML Templates/ALW_Mailchimp_Templates/
# and POSTs to Mailchimp /3.0/templates with a descriptive name.
#
# Idempotent: deletes existing templates with the "ALW - " prefix first so
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
  Write-Error "MAILCHIMP_API_KEY malformed - should end with '-usX' (datacenter suffix)"
}
$baseUrl = "https://$dc.api.mailchimp.com/3.0"
$auth = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('any:' + $apiKey))
$headers = @{ Authorization = $auth }

# Filename -> display name (from Docs/final docs/.../index.html table of contents)
# Names use plain ASCII (no middle-dots, em-dashes, ampersands) so the script
# parses correctly under Windows PowerShell 5.1's default encoding.
$templates = [ordered]@{
  'email_1.html'    = 'ALW - 01 - Newsletter welcome (Reset Letters free)'
  'email_2_1.html'  = 'ALW - 02.1 - Decoder delivery'
  'email_2_2.html'  = 'ALW - 02.2 - Decoder follow-up (3 days)'
  'email_3_1.html'  = 'ALW - 03.1 - Workshop confirmation'
  'email_3_2.html'  = 'ALW - 03.2 - Post-workshop (24h after)'
  'email_4.html'    = 'ALW - 04 - Discovery call booked'
  'email_5.html'    = 'ALW - 05 - Returning Circle RSVP'
  'email_6_1.html'  = 'ALW - 06.1 - Reset Room welcome (25 per month)'
  'email_6_2.html'  = 'ALW - 06.2 - Reset Room - where to start (3 days)'
  'email_6_3.html'  = 'ALW - 06.3 - Reset Room week 1 (7 days)'
  'email_7_1.html'  = 'ALW - 07.1 - The Reset welcome (6 weeks)'
  'email_7_2.html'  = 'ALW - 07.2 - The Reset - day before first session'
  'email_8_1.html'  = 'ALW - 08.1 - Signal welcome (12 weeks)'
  'email_8_2.html'  = 'ALW - 08.2 - Signal - day before first session'
  'email_9_1.html'  = 'ALW - 09.1 - Signal and Build welcome (Founders)'
  'email_9_2.html'  = 'ALW - 09.2 - Signal and Build - day before'
  'email_10_1.html' = 'ALW - 10.1 - One Day confirmed'
  'email_10_2.html' = 'ALW - 10.2 - One Day - day before'
  'email_10_3.html' = 'ALW - 10.3 - One Day - integration (3 days after)'
  'email_11_1.html' = 'ALW - 11.1 - Collective welcome (Mastermind)'
  'email_11_2.html' = 'ALW - 11.2 - Collective meet the room (7 days)'
  'email_12_1.html' = 'ALW - 12.1 - Reset Session booked (90-min single)'
  'email_12_2.html' = 'ALW - 12.2 - Reset Session - after the session'
}

# Path to the HTML files (relative to this script's location)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlDir = Join-Path $scriptDir 'final docs\ALW Mailchimp HTML Templates\ALW_Mailchimp_Templates'

if (-not (Test-Path $htmlDir)) {
  Write-Error "HTML templates directory not found at: $htmlDir"
}

# Load .NET's JavaScriptSerializer for reliable JSON encoding.
# PowerShell 5.1's ConvertTo-Json has multiple known issues with HTML
# strings (wraps in {value: ...}, mis-escapes control chars). The
# JavaScriptSerializer from System.Web.Extensions handles HTML cleanly.
Add-Type -AssemblyName System.Web.Extensions
$jsonSerializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$jsonSerializer.MaxJsonLength = 100MB

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

# Step 1: Fetch existing templates and delete any with the "ALW - " prefix
# so re-running keeps names clean. Pagination loops until all pages seen.
Write-Output ""
Write-Output "Checking for existing ALW templates to clean up..."
$deletedCount = 0
$offset = 0
$pageSize = 100
do {
  $listUrl = '{0}/templates?count={1}{2}offset={3}{2}type=user' -f $baseUrl, $pageSize, '&', $offset
  $page = Invoke-RestMethod -Uri $listUrl -Headers $headers -Method Get
  $existing = $page.templates | Where-Object { $_.name -like 'ALW *' }
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
  # Read file as raw bytes -> UTF8 string. Force cast to [string] so
  # ConvertTo-Json treats it as a primitive (plain string) not as an
  # object with .value property. Without the cast, PowerShell wraps it
  # as {"html":{"value":"..."}} which Mailchimp rejects with a JSON
  # parse error.
  $html = [string](Get-Content -LiteralPath $path -Raw -Encoding UTF8)

  # Substitute any URL placeholders where env vars are set
  foreach ($placeholder in $urlMap.Keys) {
    $value = $urlMap[$placeholder]
    if (-not [string]::IsNullOrEmpty($value)) {
      $html = $html.Replace($placeholder, $value)
    }
  }

  # Serialize via JavaScriptSerializer — handles all JSON escaping
  # (control chars, unicode, quotes, backslashes) correctly.
  $payload = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
  $payload.Add('name', $name)
  $payload.Add('html', $html)
  $body = $jsonSerializer.Serialize($payload)

  try {
    # Send body as raw UTF-8 bytes so non-ASCII chars in the HTML survive
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $resp = Invoke-RestMethod -Uri "$baseUrl/templates" -Headers $headers -Method Post -ContentType 'application/json; charset=utf-8' -Body $bodyBytes
    Write-Output "  Uploaded: $name (id=$($resp.id))"
    $uploaded++
  } catch {
    # Capture Mailchimp's response body — the default exception only shows
    # the HTTP status, not the actual {title, detail, errors[]} from Mailchimp.
    $errBody = ''
    if ($_.Exception.Response) {
      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        $reader.Close()
      } catch { }
    }
    if ([string]::IsNullOrEmpty($errBody)) { $errBody = $_.Exception.Message }
    Write-Output ('  FAILED: {0}' -f $name)
    Write-Output ('    Response: {0}' -f $errBody)
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
Write-Output "Verify in Mailchimp: Email templates -> Saved templates"
Write-Output "Next: open each journey draft in Automations, swap the email template to its matching ALW - entry, fill placeholders + visual content, activate."

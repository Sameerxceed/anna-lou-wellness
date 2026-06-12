# ─────────────────────────────────────────────────────────────────────
# Mailchimp template URL substitution + re-upload — staging activation
# 12 Jun 2026
#
# Purpose: Anna wants to test email flows end-to-end on staging.
# The 23 templates uploaded on 25 May still contain placeholder URLs
# like [INTAKE_URL], [BOOKING_URL]. If she activates a Journey now,
# customers receive emails with literal "[INTAKE_URL]" text in them.
#
# This script:
#   1. Reads each template HTML from disk
#   2. Substitutes static URL placeholders with staging URLs
#   3. Leaves event-specific placeholders ([CALENDAR_URL] for a workshop
#      ICS, [REPLAY_URL] for a specific session etc.) intact for Anna
#      to fill at send time
#   4. Re-uploads all 23 to Mailchimp (deletes any existing ALW-*
#      templates first so we don't get duplicates)
#
# When prod launches: re-run with -BaseUrl https://annalouwellness.com
# and it overwrites the templates with prod URLs.
#
# Run:
#   .\Docs\mailchimp-flip-urls-staging.ps1 -ApiKey "xxxx-us8"
#   .\Docs\mailchimp-flip-urls-staging.ps1 -ApiKey "xxxx-us8" -BaseUrl https://annalouwellness.com
# ─────────────────────────────────────────────────────────────────────

param(
    [Parameter(Mandatory = $true)]
    [string]$ApiKey,
    [string]$BaseUrl = 'https://staging.annalouwellness.com',
    [string]$TemplatesDir = 'Docs/final docs/ALW Mailchimp HTML Templates/ALW_Mailchimp_Templates'
)

$ErrorActionPreference = 'Stop'

# ─── URL substitution map ───────────────────────────────────────────
# Maps every static URL placeholder to a staging URL. Event-specific
# placeholders (different per event) are intentionally NOT in this map
# so Anna can fill them per-send in Mailchimp.
$staticSubs = @{
    # Programme intake forms — point at the programme page where the
    # booking button lives. Anna can swap to a Typeform later.
    'email_7_1.html'   = @{ '[INTAKE_URL]' = "$BaseUrl/the-work/the-reset"; '[BOOKING_URL]' = "$BaseUrl/the-work/the-reset" }
    'email_8_1.html'   = @{ '[INTAKE_URL]' = "$BaseUrl/the-work/signal"; '[BOOKING_URL]' = "$BaseUrl/the-work/signal" }
    'email_9_1.html'   = @{ '[INTAKE_URL]' = "$BaseUrl/the-work/signal-and-build"; '[BOOKING_URL]' = "$BaseUrl/the-work/signal-and-build"; '[SNAPSHOT_URL]' = "$BaseUrl/the-work/signal-and-build#snapshot" }
    'email_10_1.html'  = @{ '[INTAKE_URL]' = "$BaseUrl/the-work/one-day"; '[SCOPING_URL]' = "$BaseUrl/the-work/one-day#book" }
    'email_11_1.html'  = @{ '[INTAKE_URL]' = "$BaseUrl/the-work/signal-collective"; '[BOOKING_URL]' = "$BaseUrl/the-work/signal-collective"; '[GROUP_URL]' = "$BaseUrl/reset-room" }
    'email_12_1.html'  = @{ '[INTAKE_URL]' = "$BaseUrl/the-work/sessions" }

    # REGULATED course access — real page exists
    'email_14_1.html'  = @{ '[REGULATED_ACCESS_URL]' = "$BaseUrl/the-work/regulated/access" }

    # Returning Circle donation — Anna's Just Giving link is external.
    # For now point at the page so the link works.
    'email_5.html'     = @{ '[DONATION_URL]' = "$BaseUrl/community/the-returning-circle" }
}

# Placeholders we intentionally leave alone — these are per-event and
# Anna fills them in the Mailchimp Journey at send time.
$leftAlone = @(
    '[CALENDAR_URL]',  # event-specific ICS
    '[REPLAY_URL]',    # workshop replay video
    '[COMPANION_URL]'  # workshop companion PDF
)

# ─── Mailchimp config ───────────────────────────────────────────────
$dc = ($ApiKey -split '-')[-1]
if (-not $dc -or $dc -eq $ApiKey) {
    Write-Host "ERROR: API key looks malformed (no datacenter suffix)" -ForegroundColor Red
    exit 1
}
$baseApi = "https://$dc.api.mailchimp.com/3.0"
$authHeader = @{
    Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("any:$ApiKey"))
}

# ─── Mailchimp helpers ──────────────────────────────────────────────
function Invoke-MC {
    param([string]$Method, [string]$Path, $Body)
    $url = "$baseApi$Path"
    $args = @{ Uri = $url; Method = $Method; Headers = $authHeader; UseBasicParsing = $true }
    if ($Body) {
        $args.ContentType = 'application/json; charset=utf-8'
        if ($Body -is [string]) {
            $args.Body = [Text.Encoding]::UTF8.GetBytes($Body)
        } else {
            $args.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 10 -Compress))
        }
    }
    Invoke-WebRequest @args
}

function Get-ExistingAlwTemplates {
    # Returns array of @{id; name} for any template named like 'ALW *'
    $offset = 0
    $all = @()
    while ($true) {
        $resp = Invoke-MC -Method GET -Path "/templates?count=100&offset=$offset&type=user"
        $page = ($resp.Content | ConvertFrom-Json).templates
        if (-not $page -or $page.Count -eq 0) { break }
        $all += $page | Where-Object { $_.name -like 'ALW*' }
        if ($page.Count -lt 100) { break }
        $offset += 100
    }
    $all | Select-Object id, name
}

# ─── Step 1: Delete existing ALW-* templates ────────────────────────
Write-Host "Looking up existing ALW templates in Mailchimp..." -ForegroundColor Yellow
$existing = Get-ExistingAlwTemplates
Write-Host "Found $($existing.Count) existing ALW templates. Deleting them so we can re-upload fresh."
foreach ($t in $existing) {
    try {
        Invoke-MC -Method DELETE -Path "/templates/$($t.id)" | Out-Null
        Write-Host "  deleted $($t.id) - $($t.name)" -ForegroundColor DarkGray
    } catch {
        Write-Host "  FAILED to delete $($t.id) - $($t.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ─── Step 2: Read + substitute + upload each template ───────────────
$tmplFiles = Get-ChildItem -Path $TemplatesDir -Filter 'email_*.html' | Sort-Object Name
Write-Host ""
Write-Host "Substituting URLs and uploading $($tmplFiles.Count) templates..." -ForegroundColor Yellow

# Name map — Mailchimp 50-char name limit, shortened from index.html
$nameMap = @{
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
    'email_13_1.html' = 'ALW - 13.1 - extra 1'
    'email_13_2.html' = 'ALW - 13.2 - extra 2'
    'email_13_3.html' = 'ALW - 13.3 - extra 3'
    'email_14_1.html' = 'ALW - 14.1 - REGULATED access delivery'
    'email_14_2.html' = 'ALW - 14.2 - REGULATED follow-up'
    'email_14_3.html' = 'ALW - 14.3 - REGULATED integration'
}

$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
Add-Type -AssemblyName System.Web.Extensions

foreach ($file in $tmplFiles) {
    $fname = $file.Name
    $name = if ($nameMap.ContainsKey($fname)) { $nameMap[$fname] } else { "ALW - $($file.BaseName -replace 'email_', '')" }
    if ($name.Length -gt 50) { $name = $name.Substring(0, 50) }

    # Read as UTF-8 (PowerShell 5.1 misreads as ANSI by default)
    $html = [IO.File]::ReadAllText($file.FullName, [Text.Encoding]::UTF8)

    # Apply per-file substitutions
    $subCount = 0
    if ($staticSubs.ContainsKey($fname)) {
        foreach ($placeholder in $staticSubs[$fname].Keys) {
            $url = $staticSubs[$fname][$placeholder]
            $before = $html
            $html = $html.Replace($placeholder, $url)
            if ($html -ne $before) { $subCount++ }
        }
    }

    # Build JSON body. ConvertTo-Json wraps strings as {"value":"..."} so
    # use the JavaScriptSerializer for plain string escaping.
    $body = @{ name = $name; html = $html } | ConvertTo-Json -Depth 5 -Compress
    $bodyBytes = [Text.Encoding]::UTF8.GetBytes($body)

    try {
        $resp = Invoke-WebRequest -Uri "$baseApi/templates" -Method POST `
            -Headers $authHeader -Body $bodyBytes `
            -ContentType 'application/json; charset=utf-8' -UseBasicParsing
        $created = $resp.Content | ConvertFrom-Json
        Write-Host "  OK   [$($created.id)] $name  (subs: $subCount)" -ForegroundColor Green
    } catch {
        $errMsg = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host "  FAIL $name -- $errMsg" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "-------------------------------------------------------------"
Write-Host "Done. Templates re-uploaded with staging URLs." -ForegroundColor Yellow
Write-Host ""
Write-Host "Anna's next step:" -ForegroundColor Cyan
Write-Host "  1. Mailchimp -- Automations -- Customer Journeys"
Write-Host "  2. For each journey, edit the email step, select the matching"
Write-Host "     ALW - XX.X template, customise copy if needed"
Write-Host "  3. For CALENDAR_URL / REPLAY_URL / COMPANION_URL placeholders,"
Write-Host "     these are per-event so leave or fill at send time"
Write-Host "  4. Activate (turn flow on), test by submitting the form on staging"
Write-Host ""
Write-Host "When prod launches:" -ForegroundColor Cyan
Write-Host "  Re-run with -BaseUrl https://annalouwellness.com"

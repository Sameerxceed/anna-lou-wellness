# Create 12 Mailchimp email templates (one per Customer Journey).
# One-time setup script. Idempotent - re-running deletes existing
# ALW-prefixed templates first so the names stay clean.
#
# Usage:
#   $env:MAILCHIMP_API_KEY = 'xxxxxxxx-us8'
#   ./mailchimp-create-templates.ps1

$ErrorActionPreference = 'Stop'

if (-not $env:MAILCHIMP_API_KEY) {
  Write-Error "Set MAILCHIMP_API_KEY env var first (e.g. \$env:MAILCHIMP_API_KEY = 'xxxxxxxx-us8')"
}
$apiKey = $env:MAILCHIMP_API_KEY
$dc = $apiKey.Split('-')[-1]
$baseUrl = "https://$dc.api.mailchimp.com/3.0"
$auth = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('any:' + $apiKey))
$headers = @{ Authorization = $auth }

# ─── Branded HTML wrapper. Anna edits BODY between markers. ───
function Build-Html {
  param([string]$preheader, [string]$bodyHtml, [string]$ctaLabel, [string]$ctaUrl)
  $cta = ''
  if ($ctaLabel -and $ctaUrl) {
    $cta = @"
      <tr><td align="center" style="padding:8px 32px 24px;">
        <a href="$ctaUrl" style="display:inline-block;background:#6E3A5A;color:#ffffff;font-family:Mulish,Arial,sans-serif;font-weight:500;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:4px;">$ctaLabel</a>
      </td></tr>
"@
  }
  @"
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Anna Lou Wellness</title></head>
<body style="margin:0;padding:0;background:#F1EAE0;font-family:Georgia,'EB Garamond',serif;">
  <span style="display:none;font-size:1px;color:#F1EAE0;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">$preheader</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1EAE0;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:600px;width:100%;box-shadow:0 4px 18px rgba(0,0,0,0.04);">
        <tr><td align="center" style="padding:36px 32px 16px;">
          <p style="font-family:Mulish,Arial,sans-serif;font-weight:500;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#6E3A5A;margin:0;">Anna Lou Wellness</p>
          <p style="font-family:Mulish,Arial,sans-serif;font-weight:400;font-size:9px;letter-spacing:0.35em;color:#A67C3A;margin:6px 0 0;">BEAUTIFULLY WHOLE</p>
        </td></tr>
        <tr><td style="padding:8px 32px 16px;font-family:Georgia,'EB Garamond',serif;font-size:16px;line-height:1.75;color:#231F20;">
          <p style="margin:0 0 16px;">Hello *|FNAME|*,</p>
          $bodyHtml
          <p style="margin:24px 0 4px;font-family:Georgia,'EB Garamond',serif;font-style:italic;font-size:18px;">Still Sparkling,</p>
          <p style="margin:0;font-family:Mulish,Arial,sans-serif;font-weight:500;font-size:14px;">Anna Lou x</p>
        </td></tr>
        $cta
        <tr><td align="center" style="padding:16px 32px 32px;border-top:1px solid rgba(0,0,0,0.06);">
          <p style="font-family:Mulish,Arial,sans-serif;font-size:11px;color:#888;margin:0;">&copy; *|CURRENT_YEAR|* Anna Lou Wellness &middot; <a href="https://annalouwellness.com" style="color:#6E3A5A;text-decoration:none;">annalouwellness.com</a></p>
          <p style="font-family:Mulish,Arial,sans-serif;font-size:10px;color:#aaa;margin:8px 0 0;">*|UNSUB|*</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"@
}

# ─── 12 templates, one per Customer Journey ───
$templates = @(
  @{ name = 'ALW J1A — Reset Letters Founding'; preheader = "You're in. Forever. No charge, ever."; body = '<p style="margin:0 0 16px;"><em>Edit this paragraph with the founding welcome copy — first edition lands 22 June 2026, founding tier is forever free, what to do in the meantime.</em></p>'; ctaLabel = 'Follow on Instagram'; ctaUrl = 'https://www.instagram.com/annalouwellness' }
  @{ name = 'ALW J1B — Reset Letters Standard'; preheader = "A short letter, a quiet welcome, and where to start."; body = '<p style="margin:0 0 16px;"><em>Edit this paragraph with the standard subscriber welcome copy — what to expect, when editions land, how to engage.</em></p>'; ctaLabel = 'Read on Substack'; ctaUrl = 'https://annalouwellness.substack.com' }
  @{ name = 'ALW J2 — Decoder Delivery'; preheader = "Seven questions. A quiet half hour. The signal coming back online."; body = '<p style="margin:0 0 16px;"><em>Replace with intro to the Nervous System Decoder. Include the PDF download link below.</em></p><p style="margin:0 0 16px;"><strong>Download:</strong> [insert PDF link]</p>'; ctaLabel = 'Download the Decoder'; ctaUrl = '#' }
  @{ name = 'ALW J3 — Workshops Confirmation'; preheader = "Date, link, and what to expect on the day."; body = '<p style="margin:0 0 16px;"><em>Edit with workshop confirmation copy — workshop name, date, Zoom/location link, what to bring.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J4 — Discovery Call Booked'; preheader = "What to expect and a few words before we meet."; body = '<p style="margin:0 0 16px;"><em>Edit with discovery call confirmation — how the call runs, what Anna will and will not do, how to prepare.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J5 — Returning Circle RSVP'; preheader = "Link, time, and one small thing to bring."; body = '<p style="margin:0 0 16px;"><em>Edit with Returning Circle confirmation — Wednesday evening, Zoom link, what to bring.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J6 — Reset Room Member'; preheader = "Welcome to The Reset Room. Where to start."; body = '<p style="margin:0 0 16px;"><em>Edit with Reset Room welcome — login link, where to start, the live calls schedule.</em></p>'; ctaLabel = 'Open the Reset Room'; ctaUrl = 'https://staging.annalouwellness.com/community/reset-room/dashboard' }
  @{ name = 'ALW J7 — The Reset (6-week)'; preheader = "Welcome to The Reset. Before we begin."; body = '<p style="margin:0 0 16px;"><em>Edit with The Reset welcome — confirmation of booking, what week one looks like, intake form link.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J8 — Signal (12-week)'; preheader = "Welcome to Signal. The deeper container."; body = '<p style="margin:0 0 16px;"><em>Edit with Signal welcome — 12 weeks of work, what to expect, intake form link.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J9 — Signal & Build'; preheader = "Welcome to Signal & Build. The inner work and the business."; body = '<p style="margin:0 0 16px;"><em>Edit with Signal & Build welcome — inner work + strategy track, intake form link.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J10 — One Day Intensive'; preheader = "Your One Day is confirmed."; body = '<p style="margin:0 0 16px;"><em>Edit with One Day confirmation — date, location (houseboat or Zoom), pre-day intake call link.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J11 — Signal Collective'; preheader = "Welcome to the Collective."; body = '<p style="margin:0 0 16px;"><em>Edit with Signal Collective welcome — meet the room, monthly schedule, application confirmation.</em></p>'; ctaLabel = ''; ctaUrl = '' }
  @{ name = 'ALW J12 — Reset Session 90-min'; preheader = "Your Reset Session is booked."; body = '<p style="margin:0 0 16px;"><em>Edit with 90-min session confirmation — date, Zoom link, what to prepare, the three variants (founder/dating/NS).</em></p>'; ctaLabel = ''; ctaUrl = '' }
)

# ─── Clean up any existing ALW-prefixed templates ───
Write-Output "Listing existing templates..."
$existing = Invoke-RestMethod -Uri "$baseUrl/templates?count=100" -Headers $headers
$alwOld = @($existing.templates | Where-Object { $_.name -like 'ALW J*' -or $_.name -like 'ALW Journey *' })
if ($alwOld.Count -gt 0) {
  Write-Output "Removing $($alwOld.Count) existing ALW templates..."
  foreach ($t in $alwOld) {
    Invoke-RestMethod -Uri "$baseUrl/templates/$($t.id)" -Method DELETE -Headers $headers | Out-Null
    Write-Output "  - deleted: $($t.name)"
  }
}

# ─── Create the 12 ───
$created = @()
foreach ($t in $templates) {
  $html = Build-Html -preheader $t.preheader -bodyHtml $t.body -ctaLabel $t.ctaLabel -ctaUrl $t.ctaUrl
  $payload = @{ name = $t.name; html = $html } | ConvertTo-Json -Depth 5
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $r = Invoke-RestMethod -Uri "$baseUrl/templates" -Method POST -Headers $headers -ContentType 'application/json; charset=utf-8' -Body $bytes
    Write-Output ("  + " + $r.name + "  (id " + $r.id + ")")
    $created += $r
  } catch {
    Write-Output ("  ! FAILED: " + $t.name + "  -- " + $_.Exception.Message)
    if ($_.ErrorDetails) { Write-Output ("    " + $_.ErrorDetails.Message) }
  }
}

Write-Output ""
Write-Output ("Created " + $created.Count + " of " + $templates.Count + " templates.")
Write-Output "Anna will see these in Mailchimp -> Templates."

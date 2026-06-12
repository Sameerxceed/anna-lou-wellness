# ---------------------------------------------------------------------
# Mailchimp trigger test script - 12 Jun 2026
#
# Hits every Mailchimp-tagging endpoint on the site with a test email
# so Anna can verify in Mailchimp:
#   1. Which tags applied (Audience > Tags)
#   2. Which Customer Journeys fired the welcome email
#
# Default: anna@annalouoflondon.com (Anna tests in her own inbox).
# Each trigger uses anna+mailtest-<type>@annalouoflondon.com so they
# stay distinct subscribers in Mailchimp IF her mail server supports
# Gmail-style + aliasing. If not, all hit her main inbox and the
# subscriber dedupes in Mailchimp -- still useful but each Journey
# only fires once per real subscriber.
#
# What this tests (10 endpoints):
#   - Reset Letters founding (will get 400 - Turnstile blocks API)
#   - Decoder Subscriber + 3 result tags (Clear / Scrambled / Faint)
#   - 6 enquiry forms (Returning Circle, Signal Collective, Recovery,
#     One Day, Speaking, Corporate Wellbeing)
#
# What this CANNOT test (need a real Stripe checkout):
#   - Shop Customers tag
#   - purchasable.mailchimpTag for Programme / Experience / Coaching
#
# Run:
#   .\Docs\test-mailchimp-triggers.ps1
#   .\Docs\test-mailchimp-triggers.ps1 -BaseUrl https://annalouwellness.com
#   .\Docs\test-mailchimp-triggers.ps1 -EmailBase someone-else
# ---------------------------------------------------------------------

param(
    [string]$BaseUrl = 'https://staging.annalouwellness.com',
    [string]$EmailBase = 'anna+mailtest',
    [string]$EmailDomain = 'annalouoflondon.com'
)

$ErrorActionPreference = 'Continue'

function Invoke-Trigger {
    param(
        [string]$Label,
        [string]$Path,
        [hashtable]$Body
    )

    $url = "$BaseUrl$Path"
    $json = $Body | ConvertTo-Json -Depth 5 -Compress
    Write-Host ""
    Write-Host "[$Label]" -ForegroundColor Cyan
    Write-Host "  POST $url"
    Write-Host ("  email: " + $Body.email)

    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $resp = Invoke-WebRequest -Uri $url -Method POST -Body $bytes `
            -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30
        $snippet = $resp.Content.Substring(0, [Math]::Min(120, $resp.Content.Length))
        Write-Host ("  -> " + $resp.StatusCode + " -- " + $snippet) -ForegroundColor Green
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { 'ERR' }
        $msg = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host ("  -> " + $status + " -- " + $msg) -ForegroundColor Red
    }
}

Write-Host ("Hitting " + $BaseUrl + " with test emails. All land in " + $EmailBase + "@" + $EmailDomain + " inbox.") -ForegroundColor Yellow
Write-Host ""

# --- Reset Letters --------------------------------------------------
# Tag: Founding Members (until 22 Jun) or Standard Subscribers (after)
# Endpoint requires Turnstile token. Will get 400 here. Test via the
# form on /reset-letters for the honest end-to-end path.
Invoke-Trigger -Label "Reset Letters (Founding / Standard)" `
    -Path "/api/subscribe-reset-letters" `
    -Body @{
        email     = "$EmailBase-resetletters@$EmailDomain"
        firstName = "MailTest"
    }

# --- Decoder Subscriber + 3 result tags -----------------------------
# Tags: Decoder Subscriber + Decoder . Signal Clear/Scrambled/Faint
foreach ($result in @('clear', 'scrambled', 'faint')) {
    Invoke-Trigger -Label "Decoder ($result)" `
        -Path "/api/lead/decoder" `
        -Body @{
            email     = "$EmailBase-decoder-$result@$EmailDomain"
            firstName = "MailTest"
            result    = $result
        }
}

# --- 6 Enquiry forms ------------------------------------------------
$enquiries = @(
    'returning-circle',
    'signal-collective',
    'recovery',
    'one-day',
    'speaking',
    'corporate'
)
foreach ($type in $enquiries) {
    Invoke-Trigger -Label "Enquiry: $type" `
        -Path "/api/lead/$type" `
        -Body @{
            email      = "$EmailBase-$type@$EmailDomain"
            first_name = "MailTest"
            message    = "Test submission from test-mailchimp-triggers.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
}

Write-Host ""
Write-Host "-------------------------------------------------------------"
Write-Host "Done. Now verify in Mailchimp:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Audience > All contacts, search mailtest, should show 10 entries"
Write-Host "2. Click any contact, confirm correct tag(s) on profile"
Write-Host "3. Automations > each Journey, check Activity tab for sent emails"
Write-Host ""
Write-Host "What is NOT tested by this script (do manually):"
Write-Host "  - Reset Letters Turnstile blocks API. Test via form on /reset-letters"
Write-Host "  - Shop Customers tag. Buy something on /shop with Stripe test card"
Write-Host "  - Per-programme mailchimpTag. Buy a Programme or Experience"

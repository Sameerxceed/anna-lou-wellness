# Bulk-upload Anna's FAQ content to Strapi.
#
# Reads Docs/anna-faqs.json and for every page with a non-empty array:
#   1. Deletes all existing FAQs for that page slug
#   2. Creates fresh entries in order
#
# Pages with empty arrays are SKIPPED — existing Strapi entries stay untouched.
# So you can fill in just the pages Anna has sent you, run, then come back
# later for more pages without disturbing the populated ones.
#
# Lifecycle hooks fire on every create/delete, so each affected page auto-
# revalidates on the live site within 1-2 seconds of the script finishing.
#
# Usage:
#   $env:STRAPI_URL = 'https://cms.annalouwellness.com'   # or staging URL
#   $env:STRAPI_TOKEN = '<full-access-token>'             # from Strapi admin > Settings > API Tokens
#   ./upload-faqs.ps1
#
# To create the token: Strapi admin > Settings > API Tokens > Create new
#   Name: "FAQ Bulk Upload"
#   Token type: Full access
#   Duration: 7 days (just for the upload session)

$ErrorActionPreference = 'Stop'

if (-not $env:STRAPI_URL) {
  Write-Error "Set `$env:STRAPI_URL first (e.g. 'https://cms.annalouwellness.com')"
}
if (-not $env:STRAPI_TOKEN) {
  Write-Error "Set `$env:STRAPI_TOKEN first (Strapi admin > Settings > API Tokens > Create new, Full access)"
}

$baseUrl = $env:STRAPI_URL.TrimEnd('/')
$headers = @{
  Authorization = "Bearer $($env:STRAPI_TOKEN)"
  'Content-Type' = 'application/json; charset=utf-8'
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptDir 'anna-faqs.json'

if (-not (Test-Path $jsonPath)) {
  Write-Error "anna-faqs.json not found at: $jsonPath"
}

# Load .NET's JavaScriptSerializer for reliable round-tripping
Add-Type -AssemblyName System.Web.Extensions
$jsonSerializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$jsonSerializer.MaxJsonLength = 100MB

# Read the JSON file as raw UTF-8 and deserialize
$raw = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
$data = $jsonSerializer.DeserializeObject($raw)

# Strip the README key — it's just for humans
$pages = @{}
foreach ($key in $data.Keys) {
  if ($key -eq '_README') { continue }
  $pages[$key] = $data[$key]
}

Write-Output ""
Write-Output "=========================================="
Write-Output "Strapi:  $baseUrl"
Write-Output "Pages:   $($pages.Count) total in anna-faqs.json"
Write-Output "=========================================="

$pagesUpdated = 0
$pagesSkipped = 0
$totalDeleted = 0
$totalCreated = 0
$failures = @()

foreach ($pageKey in $pages.Keys) {
  $entries = @($pages[$pageKey])
  if ($entries.Count -eq 0) {
    Write-Output ("  SKIP (empty): {0}" -f $pageKey)
    $pagesSkipped++
    continue
  }

  Write-Output ""
  Write-Output ("PAGE: {0} ({1} entries)" -f $pageKey, $entries.Count)

  # Step 1 — Fetch existing FAQs for this page (paginated)
  $existingIds = @()
  $page = 1
  do {
    $listUrl = ('{0}/api/faqs?filters[page][$eq]={1}&pagination[page]={2}&pagination[pageSize]=100' -f $baseUrl, $pageKey, $page)
    try {
      $resp = Invoke-RestMethod -Uri $listUrl -Headers $headers -Method Get
    } catch {
      Write-Output ("  ERROR fetching existing: {0}" -f $_.Exception.Message)
      $failures += $pageKey
      $resp = $null
      break
    }
    foreach ($item in $resp.data) {
      # Strapi 5 returns `id` and `documentId` at the top of each entry
      if ($item.documentId) {
        $existingIds += $item.documentId
      } elseif ($item.id) {
        $existingIds += $item.id
      }
    }
    $hasMore = $resp.meta.pagination.pageCount -gt $page
    $page++
  } while ($hasMore)

  if ($null -eq $resp) { continue }

  # Step 2 — Delete each existing entry
  foreach ($id in $existingIds) {
    try {
      Invoke-RestMethod -Uri ('{0}/api/faqs/{1}' -f $baseUrl, $id) -Headers $headers -Method Delete | Out-Null
      $totalDeleted++
    } catch {
      Write-Output ("  WARN deleting {0}: {1}" -f $id, $_.Exception.Message)
    }
  }
  if ($existingIds.Count -gt 0) {
    Write-Output ("  Deleted {0} existing entries" -f $existingIds.Count)
  }

  # Step 3 — Create new entries in order
  for ($i = 0; $i -lt $entries.Count; $i++) {
    $entry = $entries[$i]
    $payloadObj = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
    $dataObj = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
    $dataObj.Add('question', [string]$entry['q'])
    $dataObj.Add('answer', [string]$entry['a'])
    $dataObj.Add('page', $pageKey)
    $dataObj.Add('sort_order', ($i + 1) * 10)
    $dataObj.Add('is_active', $true)
    $payloadObj.Add('data', $dataObj)
    $body = $jsonSerializer.Serialize($payloadObj)
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

    try {
      Invoke-RestMethod -Uri ('{0}/api/faqs' -f $baseUrl) -Headers $headers -Method Post -Body $bodyBytes | Out-Null
      $totalCreated++
    } catch {
      $errBody = ''
      if ($_.Exception.Response) {
        try {
          $stream = $_.Exception.Response.GetResponseStream()
          $reader = New-Object System.IO.StreamReader($stream)
          $errBody = $reader.ReadToEnd()
          $reader.Close()
        } catch { }
      }
      Write-Output ("  FAILED entry {0}: {1}" -f ($i + 1), ($errBody -or $_.Exception.Message))
      $failures += "$pageKey#$($i+1)"
    }
  }
  Write-Output ("  Created {0} new entries" -f $entries.Count)
  $pagesUpdated++
}

Write-Output ""
Write-Output "=========================================="
Write-Output "Done."
Write-Output ("  Pages updated:  {0}" -f $pagesUpdated)
Write-Output ("  Pages skipped:  {0}  (had empty arrays)" -f $pagesSkipped)
Write-Output ("  Total deleted:  {0}" -f $totalDeleted)
Write-Output ("  Total created:  {0}" -f $totalCreated)
if ($failures.Count -gt 0) {
  Write-Output ("  Failures:       {0}" -f ($failures -join ', '))
}
Write-Output ""
Write-Output "Lifecycle revalidation fires per entry — live site refreshes automatically."

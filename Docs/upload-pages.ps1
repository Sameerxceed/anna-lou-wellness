# Bulk-update standalone-page bodies in Strapi from local .md files.
#
# Reads every .md file in Docs/page-content/ and PATCHes the matching
# generic-page entry's `intro` field. Because `intro` is a Strapi 5 blocks
# field, the markdown is converted to blocks JSON before upload.
#
# The filename (without extension) is the page slug. e.g.
#   Docs/page-content/mission.md   ->   slug "mission"
#   Docs/page-content/privacy.md   ->   slug "privacy"
#
# Only the `intro` field is touched. Title, kicker, tagline, hero image
# etc. stay as Anna left them in Strapi. To change those, edit in the
# Strapi admin UI directly.
#
# Lifecycle hook fires on update -> live site revalidates in 1-2 seconds.
#
# Usage:
#   $env:STRAPI_URL = 'https://cms.annalouwellness.com'
#   $env:STRAPI_TOKEN = '<full-access-token from Strapi admin > Settings > API Tokens>'
#   ./upload-pages.ps1
#
# Safe to re-run. Edit any .md file and re-run to push just that page's
# updated body.

$ErrorActionPreference = 'Stop'

if (-not $env:STRAPI_URL) { Write-Error "Set `$env:STRAPI_URL first" }
if (-not $env:STRAPI_TOKEN) { Write-Error "Set `$env:STRAPI_TOKEN first" }

$baseUrl = $env:STRAPI_URL.TrimEnd('/')
$headers = @{
  Authorization  = "Bearer $($env:STRAPI_TOKEN)"
  'Content-Type' = 'application/json; charset=utf-8'
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$contentDir = Join-Path $scriptDir 'page-content'

if (-not (Test-Path $contentDir)) {
  Write-Error "Content directory not found: $contentDir"
}

Add-Type -AssemblyName System.Web.Extensions
$jsonSerializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$jsonSerializer.MaxJsonLength = 100MB

# ========================================================================
# Markdown -> Strapi 5 blocks JSON converter.
# Handles: # ## ### headings, **bold**, *italic*, [text](url) links,
# - / * bullet lists, N. ordered lists, > blockquotes, and paragraphs.
# ========================================================================

function New-TextLeaf {
  param([string]$Text, [bool]$Bold, [bool]$Italic)
  $leaf = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
  $leaf['type'] = 'text'
  $leaf['text'] = $Text
  if ($Bold) { $leaf['bold'] = $true }
  if ($Italic) { $leaf['italic'] = $true }
  return $leaf
}

function ConvertTo-InlineLeaves {
  param([string]$Text, [bool]$Bold = $false, [bool]$Italic = $false)
  # Tokenize for **bold** and *italic*, recurse into matches so nesting works.
  $leaves = @()
  $remaining = $Text
  while ($remaining.Length -gt 0) {
    # Bold first (avoids '*' eating into '**')
    $bMatch = [regex]::Match($remaining, '\*\*(.+?)\*\*')
    $iMatch = [regex]::Match($remaining, '(?<![\*\w])\*([^\*\n]+?)\*(?![\*\w])')

    $nextIdx = -1
    $kind = ''
    if ($bMatch.Success -and (-not $iMatch.Success -or $bMatch.Index -le $iMatch.Index)) {
      $nextIdx = $bMatch.Index; $kind = 'bold'; $m = $bMatch
    } elseif ($iMatch.Success) {
      $nextIdx = $iMatch.Index; $kind = 'italic'; $m = $iMatch
    }

    if ($nextIdx -lt 0) {
      if ($remaining.Length -gt 0) {
        $leaves += (New-TextLeaf -Text $remaining -Bold $Bold -Italic $Italic)
      }
      break
    }

    if ($nextIdx -gt 0) {
      $before = $remaining.Substring(0, $nextIdx)
      $leaves += (New-TextLeaf -Text $before -Bold $Bold -Italic $Italic)
    }

    $inner = $m.Groups[1].Value
    if ($kind -eq 'bold') {
      $leaves += (ConvertTo-InlineLeaves -Text $inner -Bold $true -Italic $Italic)
    } else {
      $leaves += (ConvertTo-InlineLeaves -Text $inner -Bold $Bold -Italic $true)
    }

    $remaining = $remaining.Substring($nextIdx + $m.Length)
  }
  return ,$leaves
}

function ConvertTo-InlineChildren {
  param([string]$Text)
  # Split into link + non-link runs, then send each to InlineLeaves.
  $children = @()
  $linkPattern = '\[([^\]]+)\]\s*\(([^)]+)\)'
  $regex = [regex]::new($linkPattern)
  $matches = $regex.Matches($Text)
  if ($matches.Count -eq 0) {
    return ,(ConvertTo-InlineLeaves -Text $Text)
  }
  $pos = 0
  foreach ($m in $matches) {
    if ($m.Index -gt $pos) {
      $children += (ConvertTo-InlineLeaves -Text $Text.Substring($pos, $m.Index - $pos))
    }
    $link = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
    $link['type'] = 'link'
    $link['url'] = $m.Groups[2].Value
    $link['children'] = (ConvertTo-InlineLeaves -Text $m.Groups[1].Value)
    $children += $link
    $pos = $m.Index + $m.Length
  }
  if ($pos -lt $Text.Length) {
    $children += (ConvertTo-InlineLeaves -Text $Text.Substring($pos))
  }
  return ,$children
}

function ConvertTo-StrapiBlocks {
  param([string]$Markdown)
  $blocks = @()
  $raw = $Markdown -replace "`r`n", "`n"
  $rawBlocks = $raw -split "`n\s*`n"
  foreach ($blockText in $rawBlocks) {
    $blockText = $blockText.Trim()
    if (-not $blockText) { continue }
    $lines = $blockText -split "`n"

    # Heading
    if ($lines.Count -eq 1 -and $lines[0] -match '^(#{1,6})\s+(.+)$') {
      $level = $matches[1].Length
      $text = $matches[2]
      $node = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
      $node['type'] = 'heading'
      $node['level'] = $level
      $node['children'] = (ConvertTo-InlineChildren -Text $text)
      $blocks += $node
      continue
    }

    # Blockquote
    $isQuote = $true
    foreach ($l in $lines) { if ($l -notmatch '^>\s?') { $isQuote = $false; break } }
    if ($isQuote) {
      $stripped = ($lines | ForEach-Object { $_ -replace '^>\s?', '' }) -join ' '
      $node = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
      $node['type'] = 'quote'
      $node['children'] = (ConvertTo-InlineChildren -Text $stripped)
      $blocks += $node
      continue
    }

    # Unordered list
    $isUL = $true
    foreach ($l in $lines) { if ($l -notmatch '^[-\*]\s+') { $isUL = $false; break } }
    if ($isUL) {
      $items = @()
      foreach ($l in $lines) {
        $itemText = $l -replace '^[-\*]\s+', ''
        $item = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
        $item['type'] = 'list-item'
        $item['children'] = (ConvertTo-InlineChildren -Text $itemText)
        $items += $item
      }
      $node = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
      $node['type'] = 'list'
      $node['format'] = 'unordered'
      $node['children'] = $items
      $blocks += $node
      continue
    }

    # Ordered list
    $isOL = $true
    foreach ($l in $lines) { if ($l -notmatch '^\d+\.\s+') { $isOL = $false; break } }
    if ($isOL) {
      $items = @()
      foreach ($l in $lines) {
        $itemText = $l -replace '^\d+\.\s+', ''
        $item = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
        $item['type'] = 'list-item'
        $item['children'] = (ConvertTo-InlineChildren -Text $itemText)
        $items += $item
      }
      $node = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
      $node['type'] = 'list'
      $node['format'] = 'ordered'
      $node['children'] = $items
      $blocks += $node
      continue
    }

    # Default: paragraph, multi-line joined with space
    $joined = ($lines -join ' ').Trim()
    $node = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
    $node['type'] = 'paragraph'
    $node['children'] = (ConvertTo-InlineChildren -Text $joined)
    $blocks += $node
  }
  return ,$blocks
}

# ========================================================================
# Main upload loop.
# ========================================================================

$files = Get-ChildItem -Path $contentDir -Filter '*.md'

Write-Output ""
Write-Output "=========================================="
Write-Output "Strapi:  $baseUrl"
Write-Output "Files:   $($files.Count) .md files in page-content/"
Write-Output "=========================================="

$updated = 0
$skipped = 0
$failures = @()

foreach ($file in $files) {
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $body = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8).TrimEnd()
  $blocks = ConvertTo-StrapiBlocks -Markdown $body

  Write-Output ""
  Write-Output ("PAGE: {0} ({1} blocks from {2} bytes of markdown)" -f $slug, $blocks.Count, $body.Length)

  # Step 1 -- fetch the existing entry to get its documentId
  $listUrl = ('{0}/api/generic-pages?filters[slug][$eq]={1}&pagination[pageSize]=1' -f $baseUrl, $slug)
  try {
    $resp = Invoke-RestMethod -Uri $listUrl -Headers $headers -Method Get
  } catch {
    Write-Output ("  ERROR fetching entry: {0}" -f $_.Exception.Message)
    $failures += $slug
    continue
  }

  if (-not $resp.data -or $resp.data.Count -eq 0) {
    Write-Output ("  SKIP: no entry exists for slug '{0}' in Strapi" -f $slug)
    Write-Output ("        (create one in Strapi admin first, then re-run)")
    $skipped++
    continue
  }

  $entry = $resp.data[0]
  $docId = $entry.documentId
  if (-not $docId) { $docId = $entry.id }

  # Step 2 -- PUT the entry, updating only the intro field
  $payloadObj = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
  $dataObj = New-Object 'System.Collections.Generic.Dictionary[String,Object]'
  $dataObj.Add('intro', $blocks)
  $payloadObj.Add('data', $dataObj)
  $payload = $jsonSerializer.Serialize($payloadObj)
  $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

  try {
    Invoke-RestMethod -Uri ('{0}/api/generic-pages/{1}' -f $baseUrl, $docId) -Headers $headers -Method Put -Body $payloadBytes | Out-Null
    Write-Output ("  UPDATED entry (documentId={0})" -f $docId)
    $updated++
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
    Write-Output ("  FAILED: {0}" -f ($errBody -or $_.Exception.Message))
    $failures += $slug
  }
}

Write-Output ""
Write-Output "=========================================="
Write-Output ("Done.  Updated: {0}  Skipped: {1}  Failed: {2}" -f $updated, $skipped, $failures.Count)
if ($failures.Count -gt 0) {
  Write-Output ("  Failures: {0}" -f ($failures -join ', '))
}
Write-Output ""
Write-Output "Lifecycle hook fires per update -> live site refreshes automatically."

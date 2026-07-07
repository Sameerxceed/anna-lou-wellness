<#
.SYNOPSIS
  Smoke crawler for staging.annalouwellness.com. Hits every URL in the
  sitemap plus a hand-curated list of known routes, records status +
  timing + basic SEO fields, and writes a CSV.
#>

param(
    [string]$BaseUrl = 'https://staging.annalouwellness.com',
    [string]$OutFile = ''
)

$ErrorActionPreference = 'Stop'

$KnownRoutes = @(
    '/', '/about', '/anna-story', '/practitioners', '/contact', '/testimonials', '/press',
    '/the-work', '/the-work/sessions', '/the-work/the-reset', '/the-work/signal',
    '/the-work/signal-and-build', '/the-work/one-day', '/the-work/signal-collective',
    '/the-work/recovery', '/the-work/founder-reset', '/the-work/dating-reset',
    '/the-work/nervous-system-reset', '/the-work/regulated',
    '/experiences', '/experiences/retreats', '/experiences/workshops',
    '/experiences/corporate-wellbeing', '/experiences/speaking',
    '/community', '/community/reset-room', '/community/the-returning-circle',
    '/community/membership', '/community/events',
    '/reset-stories', '/reset-stories/holding-everything', '/reset-stories/the-strong-one',
    '/reset-stories/signal-vs-noise',
    '/life', '/life/rituals-and-energy', '/life/home-and-space', '/life/style-and-beauty',
    '/life/food-and-nourishment', '/life/weekend-finds',
    '/love-and-relationships', '/love-and-relationships/dating-and-patterns',
    '/love-and-relationships/breakups-and-reset', '/love-and-relationships/friendship',
    '/love-and-relationships/motherhood', '/love-and-relationships/self-worth-and-identity',
    '/work-and-money', '/work-and-money/founder-reset',
    '/work-and-money/burnout-and-nervous-system', '/work-and-money/signal-method',
    '/work-and-money/career-and-direction', '/work-and-money/money-and-worth',
    '/shop', '/reset-letters', '/free/nervous-system-decoder',
    '/free/nervous-system-decoder/quiz',
    '/ask-anna', '/cart', '/checkout', '/login', '/wishlist',
    '/campaigns/anna-lou-x-toni-nagy'
)

# Regex patterns kept as variables so the parser doesn't choke on quote
# soup inline. Character classes use \x22 for double-quote to avoid mixing.
$TitlePattern = '<title>(.*?)</title>'
$MetaDescPattern = [regex]::new('<meta[^>]*name=[\x22\x27]description[\x22\x27][^>]*content=[\x22\x27]([^\x22\x27]*)[\x22\x27]', 'IgnoreCase')
$ImgTagPattern = [regex]::new('<img\b[^>]*>', 'IgnoreCase')
$AltAttrPattern = [regex]::new('alt\s*=', 'IgnoreCase')

function Get-SitemapUrls {
    param([string]$Base)
    $urls = New-Object System.Collections.Generic.List[string]
    try {
        $r = Invoke-WebRequest -Uri "$Base/sitemap.xml" -UseBasicParsing -TimeoutSec 15
        $xml = [xml]$r.Content
        foreach ($u in $xml.urlset.url) {
            $loc = "$($u.loc)".Trim()
            if ($loc) {
                $path = $loc -replace [regex]::Escape($Base), '' -replace 'https://staging.annalouwellness.com', '' -replace 'https://annalouwellness.com', ''
                if (-not $path) { $path = '/' }
                $urls.Add($path) | Out-Null
            }
        }
        Write-Host "[audit] sitemap.xml -> $($urls.Count) URLs" -ForegroundColor Cyan
    } catch {
        Write-Host "[audit] sitemap.xml unreachable ($($_.Exception.Message)) -- falling back to curated list" -ForegroundColor Yellow
    }
    return ,$urls
}

function Test-Url {
    param([string]$Base, [string]$Path)
    $full = "$Base$Path"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $row = [ordered]@{
        url = $Path
        status = 0
        ms = 0
        redirect_to = ''
        title = ''
        title_len = 0
        meta_desc_len = 0
        has_h1 = $false
        has_nav = $false
        has_footer = $false
        images_missing_alt = 0
        page_kb = 0
        notes = ''
    }
    $r = $null
    try {
        $r = Invoke-WebRequest -Uri $full -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        $row.status = [int]$r.StatusCode
    } catch {
        $er = $_.Exception.Response
        if ($er) {
            $row.status = [int]$er.StatusCode
            $loc = $er.Headers['Location']
            if ($loc) { $row.redirect_to = "$loc" }
        } else {
            $row.status = 0
            $msg = "$($_.Exception.Message)"
            $row.notes = $msg.Substring(0, [Math]::Min(120, $msg.Length))
            $sw.Stop()
            $row.ms = [int]$sw.ElapsedMilliseconds
            return [PSCustomObject]$row
        }
    }
    $sw.Stop()
    $row.ms = [int]$sw.ElapsedMilliseconds

    if ($row.status -ge 300 -and $row.status -lt 400 -and $row.redirect_to) {
        try {
            $r = Invoke-WebRequest -Uri $row.redirect_to -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
            $row.status = 200
            $row.notes = "followed redirect -> $($row.redirect_to)"
        } catch {
            return [PSCustomObject]$row
        }
    }

    if (-not $r) { return [PSCustomObject]$row }
    $body = "$($r.Content)"
    $row.page_kb = [int]($body.Length / 1024)

    $titleMatch = [regex]::Match($body, $TitlePattern, 'IgnoreCase, Singleline')
    if ($titleMatch.Success) {
        $row.title = ($titleMatch.Groups[1].Value.Trim() -replace '\s+', ' ')
        $row.title_len = $row.title.Length
    }
    $descMatch = $MetaDescPattern.Match($body)
    if ($descMatch.Success) {
        $row.meta_desc_len = $descMatch.Groups[1].Value.Trim().Length
    }

    $row.has_h1 = $body.IndexOf('<h1', [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    $row.has_nav = $body.IndexOf('<nav', [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    $row.has_footer = $body.IndexOf('<footer', [System.StringComparison]::OrdinalIgnoreCase) -ge 0

    $imgTags = $ImgTagPattern.Matches($body)
    $missingAlt = 0
    foreach ($m in $imgTags) {
        if (-not $AltAttrPattern.IsMatch($m.Value)) { $missingAlt++ }
    }
    $row.images_missing_alt = $missingAlt

    return [PSCustomObject]$row
}

if (-not $OutFile) {
    $stamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
    $OutFile = Join-Path $PSScriptRoot "audit-$stamp.csv"
}

Write-Host "[audit] Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "[audit] Output:   $OutFile" -ForegroundColor Cyan

$sitemapUrls = Get-SitemapUrls -Base $BaseUrl
$allUrls = New-Object System.Collections.Generic.HashSet[string]
foreach ($u in $sitemapUrls) { $allUrls.Add($u) | Out-Null }
foreach ($u in $KnownRoutes) { $allUrls.Add($u) | Out-Null }
$sorted = @($allUrls) | Sort-Object

Write-Host "[audit] $($sorted.Count) unique URLs to check" -ForegroundColor Cyan

$results = New-Object System.Collections.Generic.List[object]
$i = 0
foreach ($url in $sorted) {
    $i++
    Write-Progress -Activity 'Auditing site' -Status "$i / $($sorted.Count) - $url" -PercentComplete (($i / $sorted.Count) * 100)
    $row = Test-Url -Base $BaseUrl -Path $url
    $results.Add($row) | Out-Null
    Start-Sleep -Milliseconds 50
}
Write-Progress -Activity 'Auditing site' -Completed

$results | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8

$broken = @($results | Where-Object { $_.status -ge 400 -or $_.status -eq 0 })
$noTitle = @($results | Where-Object { $_.status -eq 200 -and (-not $_.title -or $_.title_len -lt 20) })
$badTitleLen = @($results | Where-Object { $_.status -eq 200 -and $_.title_len -gt 65 })
$noDesc = @($results | Where-Object { $_.status -eq 200 -and $_.meta_desc_len -lt 100 })
$noH1 = @($results | Where-Object { $_.status -eq 200 -and -not $_.has_h1 })
$missingAlt = @($results | Where-Object { $_.images_missing_alt -gt 0 })
$slow = @($results | Where-Object { $_.ms -gt 3000 })

Write-Host ''
Write-Host '============================================' -ForegroundColor Green
Write-Host " AUDIT SUMMARY - $($sorted.Count) URLs checked" -ForegroundColor Green
Write-Host '============================================' -ForegroundColor Green
Write-Host " Broken (4xx/5xx/0):        $($broken.Count)"
Write-Host " Missing / short title:     $($noTitle.Count)"
Write-Host (" Title too long (over 65 char): {0}" -f $badTitleLen.Count)
Write-Host (" Missing / short meta desc:     {0}" -f $noDesc.Count)
Write-Host (" Missing H1 tag:                {0}" -f $noH1.Count)
Write-Host (" Images missing alt text:       {0} pages" -f $missingAlt.Count)
Write-Host (" Slow pages (over 3s):          {0}" -f $slow.Count)
Write-Host ''
Write-Host "Full report: $OutFile" -ForegroundColor Cyan
Write-Host ''

if ($broken.Count -gt 0) {
    Write-Host 'BROKEN URLS:' -ForegroundColor Red
    $broken | Select-Object status, url, notes, redirect_to | Format-Table -AutoSize
}
if ($noTitle.Count -gt 0) {
    Write-Host 'MISSING/SHORT TITLE:' -ForegroundColor Yellow
    $noTitle | Select-Object url, title_len, title | Format-Table -AutoSize
}
if ($noDesc.Count -gt 0) {
    Write-Host 'MISSING/SHORT META DESCRIPTION:' -ForegroundColor Yellow
    $noDesc | Select-Object url, meta_desc_len | Format-Table -AutoSize
}

param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)

# Convert a markdown file to a .docx via Word COM automation.
# Handles: H1/H2/H3, bold, italic, bullets, numbered lists, tables, hr, paragraphs.

$ErrorActionPreference = 'Stop'
$inFull  = (Resolve-Path $InputPath).Path
$outFull = [System.IO.Path]::GetFullPath($OutputPath)

$lines = Get-Content -LiteralPath $inFull -Encoding UTF8

Write-Output "Opening Word..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$selection = $word.Selection

# wdStyle constants
$wdStyleHeading1 = -2
$wdStyleHeading2 = -3
$wdStyleHeading3 = -4
$wdStyleNormal   = -1
$wdAlignParagraphLeft = 0

function Write-Inline {
  param([string]$text)
  # Handles **bold** and *italic* inside a line.
  # Split by markers, alternate formatting flags.
  $remaining = $text
  while ($remaining.Length -gt 0) {
    # Find earliest formatting marker
    $boldIdx   = $remaining.IndexOf('**')
    $italicIdx = -1
    # avoid matching ** as italic
    for ($i = 0; $i -lt $remaining.Length; $i++) {
      if ($remaining[$i] -eq '*' -and ($i -eq 0 -or $remaining[$i-1] -ne '*') -and ($i -eq $remaining.Length - 1 -or $remaining[$i+1] -ne '*')) {
        $italicIdx = $i; break
      }
    }
    $codeIdx = $remaining.IndexOf('`')

    $idx = -1
    $marker = ''
    foreach ($candidate in @(@($boldIdx,'**'),@($italicIdx,'*'),@($codeIdx,'`'))) {
      $cIdx = $candidate[0]
      if ($cIdx -ge 0 -and ($idx -lt 0 -or $cIdx -lt $idx)) {
        $idx = $cIdx; $marker = $candidate[1]
      }
    }

    if ($idx -lt 0) {
      $selection.TypeText($remaining)
      break
    }

    if ($idx -gt 0) {
      $selection.TypeText($remaining.Substring(0,$idx))
    }
    $afterMarker = $remaining.Substring($idx + $marker.Length)
    $endIdx = $afterMarker.IndexOf($marker)
    if ($endIdx -lt 0) {
      # unmatched marker, treat as literal
      $selection.TypeText($marker)
      $remaining = $afterMarker
      continue
    }
    $inner = $afterMarker.Substring(0,$endIdx)
    if ($marker -eq '**') {
      $selection.Font.Bold = $true
      $selection.TypeText($inner)
      $selection.Font.Bold = $false
    } elseif ($marker -eq '*') {
      $selection.Font.Italic = $true
      $selection.TypeText($inner)
      $selection.Font.Italic = $false
    } elseif ($marker -eq '`') {
      $selection.Font.Name = 'Consolas'
      $selection.TypeText($inner)
      $selection.Font.Name = 'Calibri'
    }
    $remaining = $afterMarker.Substring($endIdx + $marker.Length)
  }
}

function Add-Paragraph {
  param([string]$text, [int]$styleId = $wdStyleNormal)
  $selection.Style = $doc.Styles.Item($styleId)
  Write-Inline -text $text
  $selection.TypeParagraph()
}

function Add-Table {
  param([string[]]$rows)
  # rows is an array of "| col | col |" strings; second row is the separator (|---|---|)
  if ($rows.Count -lt 2) { return }
  $header = $rows[0]
  $body = @($rows | Select-Object -Skip 2)
  $cols = ($header -split '\|' | Where-Object { $_.Trim().Length -gt 0 }).Count
  $rowCount = 1 + $body.Count

  $range = $selection.Range
  $table = $doc.Tables.Add($range, $rowCount, $cols)
  $table.Borders.Enable = $true

  # header
  $headerCells = $header -split '\|' | Where-Object { $_.Trim().Length -gt 0 } | ForEach-Object { $_.Trim() }
  for ($c = 0; $c -lt $cols; $c++) {
    $cell = $table.Cell(1, $c + 1)
    $cell.Range.Font.Bold = $true
    $cell.Range.Text = $headerCells[$c]
  }
  # body
  for ($r = 0; $r -lt $body.Count; $r++) {
    $bodyCells = $body[$r] -split '\|' | Where-Object { $_.Trim().Length -gt 0 } | ForEach-Object { $_.Trim() }
    for ($c = 0; $c -lt $cols; $c++) {
      if ($c -lt $bodyCells.Count) {
        $table.Cell($r + 2, $c + 1).Range.Text = $bodyCells[$c]
      }
    }
  }
  # move cursor after the table
  $selection.EndKey(6) | Out-Null   # wdStory
  $selection.TypeParagraph()
}

# Parse line-by-line
$i = 0
while ($i -lt $lines.Count) {
  $line = $lines[$i]
  $trim = $line.Trim()

  if ($trim -match '^---+$') {
    # horizontal rule -> blank paragraph with bottom border or just a blank line
    $selection.TypeParagraph()
    $i++; continue
  }
  if ($trim -match '^# (.+)$') {
    Add-Paragraph -text $Matches[1] -styleId $wdStyleHeading1
    $i++; continue
  }
  if ($trim -match '^## (.+)$') {
    Add-Paragraph -text $Matches[1] -styleId $wdStyleHeading2
    $i++; continue
  }
  if ($trim -match '^### (.+)$') {
    Add-Paragraph -text $Matches[1] -styleId $wdStyleHeading3
    $i++; continue
  }
  if ($trim -match '^[-*] (.+)$') {
    # bullet block — collect consecutive bullets
    $bulletStyle = $doc.Styles.Item("List Bullet")
    while ($i -lt $lines.Count -and $lines[$i].Trim() -match '^[-*] (.+)$') {
      $selection.Style = $bulletStyle
      Write-Inline -text $Matches[1]
      $selection.TypeParagraph()
      $i++
    }
    $selection.Style = $doc.Styles.Item($wdStyleNormal)
    continue
  }
  if ($trim -match '^\d+\. (.+)$') {
    $numStyle = $doc.Styles.Item("List Number")
    while ($i -lt $lines.Count -and $lines[$i].Trim() -match '^\d+\. (.+)$') {
      $selection.Style = $numStyle
      Write-Inline -text $Matches[1]
      $selection.TypeParagraph()
      $i++
    }
    $selection.Style = $doc.Styles.Item($wdStyleNormal)
    continue
  }
  if ($trim.StartsWith('|') -and $trim.EndsWith('|')) {
    # table block — collect rows
    $tableRows = @()
    while ($i -lt $lines.Count -and $lines[$i].Trim().StartsWith('|')) {
      $tableRows += $lines[$i].Trim()
      $i++
    }
    Add-Table -rows $tableRows
    continue
  }
  if ($trim.Length -eq 0) {
    $i++; continue
  }
  # normal paragraph (may span multiple non-blank lines, but we treat each as its own)
  Add-Paragraph -text $trim
  $i++
}

Write-Output "Saving to $outFull"
$wdFormatDocx = 16
$doc.SaveAs([ref]$outFull, [ref]$wdFormatDocx)
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Output "Done."

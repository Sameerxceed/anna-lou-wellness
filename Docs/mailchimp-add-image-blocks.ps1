# Adds / standardises the hero image block in every ALW Mailchimp template.
#
# Pattern: 600px-wide image, locked by a wrapping table at width="600" so
# the Mailchimp visual editor can't strip the cap. Falls back gracefully on
# mobile via max-width:100% + height:auto.
#
# - Templates that already have a `mc:edit="hero_image"` block are rewritten
#   to the new locked pattern.
# - Templates without one get the block inserted just after the headline.
#
# Idempotent -- re-running on already-updated templates just rewrites with
# the same content.
#
# Usage:
#   ./mailchimp-add-image-blocks.ps1
#   (no env vars needed -- operates on local files only)
#
# After this completes, run mailchimp-upload-html-templates.ps1 to push
# the updated HTML to Mailchimp.

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlDir = Join-Path $scriptDir 'final docs\ALW Mailchimp HTML Templates\ALW_Mailchimp_Templates'

if (-not (Test-Path $htmlDir)) {
  Write-Error "HTML templates directory not found at: $htmlDir"
}

# The new image block -- wrapping <table width="600"> locks the cap so
# any image Anna uploads is constrained to 600px wide regardless of its
# native dimensions. Cell line-height:0 kills the 4px gap below images
# in some clients.
$newImageBlock = @'

<!-- Hero image - edit in Mailchimp. Locked to 600px wide so any upload fits the email frame. -->
<tr><td align="center" style="padding: 32px 0 0 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; margin:0 auto;">
    <tr><td align="center" style="padding:0; line-height:0; font-size:0;">
      <img src="https://placehold.co/1200x675/E8E2D7/231F20.png?text=Add+image+here&font=georgia"
           alt=""
           width="600"
           class="hero-img"
           style="display:block; width:100%; max-width:600px; height:auto; border:0; outline:none; text-decoration:none;"
           mc:edit="hero_image"
           mc:label="Hero image" />
    </td></tr>
  </table>
</td></tr>
'@

$files = Get-ChildItem -Path $htmlDir -Filter 'email_*.html'

$replacedCount = 0
$insertedCount = 0
$failedFiles = @()

foreach ($file in $files) {
  try {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

    if ($content -match 'mc:edit="hero_image"') {
      # File already has a hero_image block -- replace it (and the optional
      # comment + wrapping <tr><td> row) with the new locked pattern.
      # The existing block in 4 templates spans from the
      # "<!-- Hero image" comment through the closing </tr> of that row.
      $regex = '(?s)\r?\n?<!--\s*Hero image[^>]*-->\s*<tr>.*?mc:edit="hero_image".*?</tr>\r?\n?'
      if ($content -match $regex) {
        $content = [regex]::Replace($content, $regex, $newImageBlock)
        $replacedCount++
        Write-Output ("  Replaced existing block: {0}" -f $file.Name)
      } else {
        # Fallback -- block exists but doesn't match the expected structure.
        # Try a broader regex catching just the <tr>...hero_image...</tr> row.
        $regex2 = '(?s)<tr>[^<]*<td[^>]*>\s*<img[^>]*mc:edit="hero_image"[^>]*/>\s*</td>\s*</tr>\r?\n?'
        if ($content -match $regex2) {
          $content = [regex]::Replace($content, $regex2, $newImageBlock)
          $replacedCount++
          Write-Output ("  Replaced existing block (fallback): {0}" -f $file.Name)
        } else {
          Write-Output ("  WARN: {0} has hero_image but couldn't match for replacement" -f $file.Name)
          $failedFiles += $file.Name
          continue
        }
      }
    } else {
      # No hero_image block -- insert one just after the headline </tr>.
      # Headline pattern: <tr><td class="px"...><h1...mc:edit="headline">...</h1></td></tr>
      $insertRegex = '(?s)(<h1[^>]*mc:edit="headline"[^>]*>.*?</h1>\s*</td>\s*</tr>)'
      if ($content -match $insertRegex) {
        $content = [regex]::Replace($content, $insertRegex, ('$1' + $newImageBlock), 'Singleline')
        $insertedCount++
        Write-Output ("  Inserted new block: {0}" -f $file.Name)
      } else {
        Write-Output ("  WARN: {0} has no headline mc:edit zone -- skipped" -f $file.Name)
        $failedFiles += $file.Name
        continue
      }
    }

    # Write back as UTF-8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
  } catch {
    Write-Output ("  FAILED: {0} - {1}" -f $file.Name, $_.Exception.Message)
    $failedFiles += $file.Name
  }
}

Write-Output ""
Write-Output "=========================================="
Write-Output ("Image block transform complete.")
Write-Output ("  Replaced existing: {0}" -f $replacedCount)
Write-Output ("  Inserted new:      {0}" -f $insertedCount)
Write-Output ("  Total updated:     {0} / {1}" -f ($replacedCount + $insertedCount), $files.Count)
if ($failedFiles.Count -gt 0) {
  Write-Output ("  Failed/skipped:    {0}" -f ($failedFiles -join ', '))
}
Write-Output ""
Write-Output "Next: run ./mailchimp-upload-html-templates.ps1 to push to Mailchimp."

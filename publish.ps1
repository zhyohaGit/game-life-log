param(
  [string]$DataJsonPath = "",
  [string]$Message = "Publish Game Life Log"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Write-Utf8NoBom($Path, $Content) {
  $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

if ($DataJsonPath) {
  $ResolvedDataPath = Resolve-Path -LiteralPath $DataJsonPath
  $RawJson = Get-Content -Raw -Encoding UTF8 -LiteralPath $ResolvedDataPath
  $Parsed = $RawJson | ConvertFrom-Json

  if ($Parsed -isnot [System.Array]) {
    throw "DataJsonPath must point to a JSON array exported from Game Life Log."
  }

  $PrettyJson = $Parsed | ConvertTo-Json -Depth 20
  Write-Utf8NoBom (Join-Path $Root "data.json") ($PrettyJson + "`n")
  Write-Utf8NoBom (Join-Path $Root "data.js") ("const GAMES = " + $PrettyJson + "`n;`n")
  Write-Host "Updated data.json and data.js from $ResolvedDataPath"
}

git status --short
git add -- index.html data.json data.js publish.ps1

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "No staged changes to publish."
} else {
  git commit -m $Message
}

git push origin HEAD:master

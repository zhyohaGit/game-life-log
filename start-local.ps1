$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  throw "Node.js is required. Install Node.js or open this project in an environment where node is available."
}

$url = "http://127.0.0.1:4188/"
Start-Process $url
Write-Host "Opening Game Life Log local editor: $url"
Write-Host "Keep this PowerShell window open while editing and publishing."
node .\local-server.js

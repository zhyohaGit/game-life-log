@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required, but node was not found.
  echo Please install Node.js, then run this file again.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:4188/"
echo Opening Game Life Log local editor: http://127.0.0.1:4188/
echo Keep this window open while editing and publishing.
node local-server.js
pause

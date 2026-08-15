@echo off
title UniPrime - Full Stack
echo ============================================
echo  UniPrime Wall Clocks - Full Stack Starter
echo ============================================
echo.
echo Starting API server (port 5000)...
start "UniPrime Server" cmd /c "cd /d "%~dp0server" && npm run dev"
echo Starting React client (port 5173)...
start "UniPrime Client" cmd /c "cd /d "%~dp0client" && npm run dev"
echo.
echo Both started in separate windows.
echo   Client: http://localhost:5173
echo   API:    http://localhost:5000/api
echo.
echo Close the two windows to stop the servers.
timeout /t 5 /nobreak >nul
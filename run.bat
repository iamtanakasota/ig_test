@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul 2>&1

title InstaGrid Planner

echo ===================================================
echo   InstaGrid Planner - Server Launcher
echo ===================================================
echo.

REM --- Get local IP address ---
set "LOCAL_IP=127.0.0.1"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r "IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do set "LOCAL_IP=%%b"
)

REM --- Kill any existing server on port 8000 ---
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING" 2^>nul') do (
  taskkill /PID %%p /F > nul 2>&1
)

echo [1/3] Starting local server on port 8000...
start "InstaGrid Local Server" /min /d "%~dp0" cmd /c "python -m http.server 8000 --bind 0.0.0.0"

REM --- Wait 2 seconds ---
timeout /t 2 /nobreak > nul 2>&1

echo [2/3] Starting public tunnel (Cloudflare)...
set "TUNNEL_LOG=%TEMP%\cloudflared_tunnel.log"
if exist "%TUNNEL_LOG%" del "%TUNNEL_LOG%" > nul 2>&1

start "InstaGrid Public Tunnel" /min cmd /c "cloudflared tunnel --url http://localhost:8000 > "%TUNNEL_LOG%" 2>&1"

echo [3/3] Waiting for public URL...
timeout /t 10 /nobreak > nul 2>&1

REM --- Extract public URL from cloudflared log ---
set "PUBLIC_URL="
if exist "%TUNNEL_LOG%" (
  for /f "tokens=*" %%L in ('findstr "trycloudflare.com" "%TUNNEL_LOG%" 2^>nul') do (
    for /f "tokens=1,2,3,4,5,6,7" %%a in ("%%L") do (
      echo %%a | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%a"
      echo %%b | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%b"
      echo %%c | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%c"
      echo %%d | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%d"
      echo %%e | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%e"
      echo %%f | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%f"
      echo %%g | findstr /i "https://" > nul 2>&1 && set "PUBLIC_URL=%%g"
    )
  )
)

echo.
echo ===================================================
if "!PUBLIC_URL!"=="" (
  echo   [Public URL]
  echo   URL not found yet. Check log: %TUNNEL_LOG%
  echo   The tunnel may still be starting...
) else (
  echo   [Public URL]
  echo   !PUBLIC_URL!
  echo.
  echo   Anyone can access your app with this URL!
)
echo ===================================================
echo.
echo ---------------------------------------------------
echo   [Local URL]
echo   - This PC:   http://localhost:8000
echo   - Mobile:    http://%LOCAL_IP%:8000
echo ---------------------------------------------------
echo.
echo Opening browser...
start "" "http://localhost:8000"
echo.
echo Press any key to stop the server and tunnel.
echo.
pause > nul

echo.
echo Stopping server and tunnel...
taskkill /fi "windowtitle eq InstaGrid Local Server" > nul 2>&1
taskkill /fi "windowtitle eq InstaGrid Public Tunnel" > nul 2>&1
taskkill /im cloudflared.exe /F > nul 2>&1
echo Done.
timeout /t 2 /nobreak > nul 2>&1
endlocal

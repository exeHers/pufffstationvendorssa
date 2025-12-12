@echo off
setlocal

echo ==========================================
echo PUFFF Station Vendors - Clean Setup Script
echo ==========================================
echo.

echo [1/5] Checking Node version...
node -v
echo.

echo [2/5] Removing node_modules, .next, and lockfile...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist package-lock.json del /f /q package-lock.json

echo [3/5] Installing dependencies...
npm install
if errorlevel 1 (
  echo.
  echo Install failed. Check the error above.
  pause
  exit /b 1
)

echo [4/5] Running dev server (webpack mode)...
echo If it starts, open http://localhost:3000
npm run dev

echo [5/5] Done.
pause
endlocal
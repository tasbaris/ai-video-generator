@echo off
setlocal
echo ===========================================
echo   AI Video Generator Baslatiliyor
echo ===========================================

:: Backend'i yeni bir pencerede baslat
echo Backend baslatiliyor...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

:: Frontend'i yeni bir pencerede baslat
echo Frontend baslatiliyor...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servisler yeni pencerelerde baslatildi.
echo Uygulamayi tarayicinizda acabilirsiniz.
echo ===========================================
pause

@echo off
setlocal
echo ===========================================
echo   AI Video Generator Kurulum Baslatiliyor
echo ===========================================

:: FFmpeg kontrolü
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [UYARI] FFmpeg sisteminizde bulunamadi. 
    echo Video ve altyazi islemleri icin FFmpeg yuklemeniz onerilir.
    echo Yuklemek icin: winget install ffmpeg
    echo.
)

:: Backend kurulumu
echo [1/2] Backend bagimliliklari yukleniyor...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

:: Frontend kurulumu
echo [2/2] Frontend bagimliliklari yukleniyor...
cd frontend
call npm install
cd ..

echo ===========================================
echo   Kurulum Tamamlandi!
echo   Calistirmak icin: start.bat
echo ===========================================
pause

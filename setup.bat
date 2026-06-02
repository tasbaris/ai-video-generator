@echo off
setlocal
echo ===========================================
echo   AI Video Generator Kurulum Baslatiliyor
echo ===========================================

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

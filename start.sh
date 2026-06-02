#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== AI Video Generator Başlatılıyor ===${NC}"

# Backend'i başlat (arka planda)
echo -e "${GREEN}Backend başlatılıyor...${NC}"
cd backend
source venv/bin/activate
# uvicorn app.main:app --reload komutunu arka planda çalıştır
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Frontend'i başlat
echo -e "${GREEN}Frontend başlatılıyor...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${BLUE}Servisler çalışıyor... Durdurmak için CTRL+C tuşlarına basın.${NC}"

# Script durdurulduğunda alt süreçleri de kapat
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

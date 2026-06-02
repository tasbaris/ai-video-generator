#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== AI Video Generator Kurulum Başlatılıyor ===${NC}"

# Backend kurulumu
echo -e "\n${GREEN}[1/2] Backend bağımlılıkları yükleniyor...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Frontend kurulumu
echo -e "\n${GREEN}[2/2] Frontend bağımlılıkları yükleniyor...${NC}"
cd frontend
npm install
cd ..

echo -e "\n${BLUE}=== Kurulum Tamamlandı! ===${NC}"
echo -e "Çalıştırmak için: ${GREEN}./start.sh${NC}"

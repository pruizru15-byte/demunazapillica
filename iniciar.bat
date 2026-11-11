@echo off
echo ========================================================
echo  Iniciando SistDEMUNA 2.0 (React + PHP + MySQL) en Docker...
echo ========================================================
docker-compose up -d --build
echo.
echo ========================================================
echo  Servicios levantados:
echo  - Frontend React:   http://localhost:5173/
echo  - Backend REST API: http://localhost:8000/api
echo  - phpMyAdmin:       http://localhost:8081/
echo ========================================================
pause


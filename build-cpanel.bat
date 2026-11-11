@echo off
echo ========================================================
echo  Generando Compilacion para Despliegue en cPanel...
echo ========================================================

REM 1. Compilar Frontend React
echo 1. Compilando Frontend (React + Vite)...
cd frontend
call npm run build
cd ..

REM 2. Crear carpeta de salida cpanel_dist
echo 2. Empaquetando para cPanel en cpanel_dist...
if exist cpanel_dist rmdir /s /q cpanel_dist
mkdir cpanel_dist
mkdir cpanel_dist\public_html
mkdir cpanel_dist\backend_core

REM 3. Copiar Frontend compilado
xcopy /E /I /Y frontend\dist\* cpanel_dist\public_html\

REM 4. Copiar .htaccess para React Router
copy frontend\public\.htaccess cpanel_dist\public_html\.htaccess

REM 5. Copiar Backend
xcopy /E /I /Y backend\src cpanel_dist\backend_core\src\
xcopy /E /I /Y backend\config cpanel_dist\backend_core\config\
copy backend\.env.example cpanel_dist\backend_core\.env.example
copy backend\database\sistdemuna.sql cpanel_dist\sistdemuna.sql

echo.
echo ========================================================
echo  Compilacion lista en la carpeta: cpanel_dist\
echo  Instrucciones:
echo  1. Sube cpanel_dist\public_html a public_html en tu cPanel.
echo  2. Sube cpanel_dist\backend_core fuera de public_html.
echo  3. Importa cpanel_dist\sistdemuna.sql en phpMyAdmin de cPanel.
echo ========================================================
pause


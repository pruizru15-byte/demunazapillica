@echo off
title DEMUNA Zapillica - Iniciar en Docker
echo ========================================================
echo       DEMUNA ZAPILLICA - SISTEMA DE GESTION LOCAL
echo ========================================================
docker compose up -d --build
echo.
echo ========================================================
echo  Servicios levantados:
echo  - Frontend React:    http://localhost:5173/
echo  - Backend REST API:  http://localhost:8000/api
echo  - phpMyAdmin:        http://localhost:8081/
echo.
echo  Credenciales de acceso:
echo  - Admin:      admin@demuna.gob.pe / password123
echo  - Trabajador: trabajador@demuna.gob.pe / password123
echo  - Dev:        dev@demuna.gob.pe / password123
echo ========================================================
pause

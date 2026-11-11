@echo off
title Sistema DEMUNA Zapillica - Iniciar Servidores Locales
echo ========================================================
echo       DEMUNA ZAPILLICA - ENTORNO DOCKER LOCAL
echo ========================================================
echo  Levantando contenedores (Frontend, Backend API, MySQL, phpMyAdmin)...
echo ========================================================
docker compose up -d --build
echo.
echo ========================================================
echo  Estado de los servicios:
echo ========================================================
docker compose ps
echo.
echo ========================================================
echo  ENLACES DE ACCESO EN LOCAL:
echo  --------------------------------------------------------
echo  * Frontend Web:       http://localhost:5173/
echo  * Backend REST API:   http://localhost:8000/api/
echo  * Base de Datos (PMA):http://localhost:8081/
echo                         (Usuario: root / Clave: demuna2026)
echo.
echo  CREDENCIALES DE PRUEBA:
echo  --------------------------------------------------------
echo  [Administrador]
echo    Usuario: admin@demuna.gob.pe  o DNI: 22222222
echo    Clave:   password123
echo.
echo  [Trabajador / Defensor]
echo    Usuario: trabajador@demuna.gob.pe o DNI: 33333333
echo    Clave:   password123
echo.
echo  [Desarrollador / TI]
echo    Usuario: dev@demuna.gob.pe o DNI: 11111111
echo    Clave:   password123
echo ========================================================
echo Presione cualquier tecla para cerrar esta ventana...
pause >nul

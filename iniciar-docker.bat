@echo off
echo ========================================================
echo  Iniciando Sistema DEMUNA en Docker...
echo ========================================================
docker-compose up -d --build
echo.
echo ========================================================
echo  Estado de los servicios:
docker-compose ps
echo ========================================================
echo  Acceso al Sistema:
echo  - Sistema DEMUNA: http://localhost:8080/
echo  - phpMyAdmin:     http://localhost:8081/
echo ========================================================
pause


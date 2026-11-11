-- ========================================================
-- SISTEMA DEMUNA - BASE DE DATOS SISTDEMUNA
-- Estructura generada a partir del análisis del código fuente
-- ========================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS `sistdemuna` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sistdemuna`;

-- 1. Tabla de Roles del Sistema
CREATE TABLE IF NOT EXISTS `rol` (
  `IdRol` INT AUTO_INCREMENT PRIMARY KEY,
  `NombreRol` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `rol` (`IdRol`, `NombreRol`) VALUES
(1, 'Desarrollador'),
(2, 'Admin'),
(3, 'Trabajador')
ON DUPLICATE KEY UPDATE `NombreRol`=VALUES(`NombreRol`);

-- 2. Tabla de Trabajadores de la DEMUNA
CREATE TABLE IF NOT EXISTS `trabajadores` (
  `IdTrabajador` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombres` VARCHAR(100) NOT NULL,
  `Apellidos` VARCHAR(100) NOT NULL,
  `DNI` VARCHAR(8) NOT NULL UNIQUE,
  `NumTelef` VARCHAR(15) NULL,
  `Email` VARCHAR(150) NULL,
  `FechaRegistro` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Cuentas de Acceso (Usuarios)
CREATE TABLE IF NOT EXISTS `usuarioslg` (
  `IdLogin` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `Contraseña` VARCHAR(255) NOT NULL,
  `IdRol` INT NOT NULL,
  `UltimoInicioSesion` DATETIME NULL,
  `UltimaNotificacionToast` DATE NULL,
  `UltimaNotificacionBadge` DATE NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`) ON DELETE CASCADE,
  FOREIGN KEY (`IdRol`) REFERENCES `rol`(`IdRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3.1. Tabla de Recuperación de Contraseñas
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(100) NOT NULL,
  `code` VARCHAR(6) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) DEFAULT 0,
  INDEX (`token`),
  INDEX (`code`),
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tipos de Entidades Externas
CREATE TABLE IF NOT EXISTS `tipoentidad` (
  `IdTipoEntidad` INT AUTO_INCREMENT PRIMARY KEY,
  `NombreTipo` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tipoentidad` (`IdTipoEntidad`, `NombreTipo`) VALUES
(1, 'Policía Nacional del Perú'),
(2, 'Sector Salud'),
(3, 'Municipalidades'),
(4, 'Registro Civil'),
(5, 'Sector Educación'),
(6, 'Unidad de Protección Especial'),
(7, 'Organizaciones Comunales'),
(8, 'Otros'),
(9, 'INABIF'),
(10, 'Centro de Emergencia Mujer'),
(11, 'Juzgados')
ON DUPLICATE KEY UPDATE `NombreTipo`=VALUES(`NombreTipo`);

-- 5. Entidades Externas (Comisarías, Colegios, Centros de Salud, etc.)
CREATE TABLE IF NOT EXISTS `entidad` (
  `IdEntidad` INT AUTO_INCREMENT PRIMARY KEY,
  `NombreEntidad` VARCHAR(150) NOT NULL,
  `Direccion` VARCHAR(255) NULL,
  `Distrito` VARCHAR(100) NULL,
  `Provincia` VARCHAR(100) NULL,
  `Departamento` VARCHAR(100) NULL,
  `Telefono` VARCHAR(20) NULL,
  `IdTipoEntidad` INT NULL,
  FOREIGN KEY (`IdTipoEntidad`) REFERENCES `tipoentidad`(`IdTipoEntidad`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Personas Externas (Ciudadanos, NNA, Solicitantes, Transgresores)
CREATE TABLE IF NOT EXISTS `userexternos` (
  `IdPersona` INT AUTO_INCREMENT PRIMARY KEY,
  `DNI` VARCHAR(8) NULL,
  `FechaNac` DATE NULL,
  `sexo` VARCHAR(15) NULL,
  `Nombres` VARCHAR(100) NOT NULL,
  `Apellidos` VARCHAR(100) NOT NULL,
  `Direccion` VARCHAR(255) NULL,
  `Distrito` VARCHAR(100) NULL,
  `Provincia` VARCHAR(100) NULL,
  `Departamento` VARCHAR(100) NULL,
  `Telefono` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `Discapacidad` VARCHAR(100) NULL,
  `IdentidadEstado` VARCHAR(20) DEFAULT 'TEMPORAL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Estados de Expediente
CREATE TABLE IF NOT EXISTS `estadoexp` (
  `idesexp` INT AUTO_INCREMENT PRIMARY KEY,
  `estado` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `estadoexp` (`idesexp`, `estado`) VALUES
(1, 'Pendiente'),
(2, 'En Progreso'),
(3, 'Archivado'),
(4, 'Derivado'),
(5, 'Resuelto'),
(6, 'Concluido')
ON DUPLICATE KEY UPDATE `estado`=VALUES(`estado`);

-- 8. Tipos de Actas y Documentos
CREATE TABLE IF NOT EXISTS `tipos_actas` (
  `IdTipoActa` INT PRIMARY KEY,
  `NombreTipoActa` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tipos_actas` (`IdTipoActa`, `NombreTipoActa`) VALUES
(1, 'Ficha de Recepción de Casos'),
(2, 'Ficha de Entrevista'),
(3, 'Ficha de Visita'),
(4, 'Invitación'),
(5, 'Invitación a Conciliar'),
(8, 'Oficio de Derivación'),
(9, 'Acta de 1ra Inasistencia'),
(10, 'Acta de 2da Inasistencia'),
(11, 'Acta de Inasistencia de Ambas Partes'),
(12, 'Acta de Conciliación'),
(13, 'Acta de Desistimiento'),
(14, 'Acta de Suspensión de Audiencia'),
(15, 'Acta de Decisión Motivada'),
(16, 'Acta de Compromiso'),
(17, 'Ficha de Seguimiento')
ON DUPLICATE KEY UPDATE `NombreTipoActa`=VALUES(`NombreTipoActa`);

-- 9. Expedientes
CREATE TABLE IF NOT EXISTS `expedientes` (
  `IdExpediente` INT AUTO_INCREMENT PRIMARY KEY,
  `IdEstado` INT NOT NULL DEFAULT 1,
  `NombreExpediente` VARCHAR(50) NOT NULL,
  `Descripcion` TEXT NULL,
  `Institucion` VARCHAR(150) NULL,
  `IdTrabajador` INT NOT NULL,
  `FechaCreacion` DATE NOT NULL,
  `HoraCreacion` TIME NOT NULL,
  `FechaRegistro` DATE NULL,
  `HoraRegistro` TIME NULL,
  `FechaApertura` DATE NOT NULL,
  `FechaResuelto` DATE NULL,
  `HoraResuelto` TIME NULL,
  `FechaConclusion` DATE NULL,
  `HoraConclusion` TIME NULL,
  FOREIGN KEY (`IdEstado`) REFERENCES `estadoexp`(`idesexp`),
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Relación entre Expedientes y Personas / Entidades
CREATE TABLE IF NOT EXISTS `relacionesuserexp` (
  `IdRelacion` INT AUTO_INCREMENT PRIMARY KEY,
  `IdExpediente` INT NOT NULL,
  `IdPersona` INT NULL,
  `IdEntidad` INT NULL,
  `SubRol_Inf` VARCHAR(50) NULL,
  `RelacionConNNA` VARCHAR(100) NULL,
  `IdRolPersona` INT NULL,
  `Edad` INT NULL,
  `unidad_edad` VARCHAR(20) NULL,
  `Gestante` VARCHAR(10) NULL,
  FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes`(`IdExpediente`) ON DELETE CASCADE,
  FOREIGN KEY (`IdPersona`) REFERENCES `userexternos`(`IdPersona`) ON DELETE CASCADE,
  FOREIGN KEY (`IdEntidad`) REFERENCES `entidad`(`IdEntidad`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Actas Generales asociadas al Expediente
CREATE TABLE IF NOT EXISTS `actas` (
  `IdActa` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTipoActa` INT NOT NULL,
  `NombreActa` VARCHAR(255) NOT NULL,
  `NumActa` INT NULL,
  `FechaActa` DATE NOT NULL,
  `FechaCreacion` DATE NULL,
  `HoraCreacion` TIME NULL,
  `FechaRegistro` DATE NULL,
  `HoraRegistro` TIME NULL,
  `IdActaEspecifica` INT NOT NULL,
  `IdExpediente` INT NOT NULL,
  `IdTrabajador` INT NOT NULL,
  FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes`(`IdExpediente`) ON DELETE CASCADE,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Tablas Específicas por Ficha/Acta
CREATE TABLE IF NOT EXISTS `f1_fichareg` (
  `IdF1` INT AUTO_INCREMENT PRIMARY KEY,
  `AtencionPrevia` VARCHAR(10) NULL,
  `DetalleAtencion` TEXT NULL,
  `ResumenHecho` TEXT NULL,
  `AccionArealizar` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f2_fichaentrevista` (
  `IdF2` INT AUTO_INCREMENT PRIMARY KEY,
  `NumEntrevXexp` INT NOT NULL,
  `Ubicacion` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f3_fichavisita` (
  `IdF3` INT AUTO_INCREMENT PRIMARY KEY,
  `NumVisitaXexp` INT NOT NULL,
  `Ubicacion` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Eventos y Agenda
CREATE TABLE IF NOT EXISTS `eventos` (
  `IdEvento` INT AUTO_INCREMENT PRIMARY KEY,
  `IdExpediente` INT NOT NULL,
  `IdPersonaInvolucrada` INT NULL,
  `TipoEvento` VARCHAR(50) NOT NULL,
  `Descripcion` TEXT NULL,
  `FechaEvento` DATE NOT NULL,
  `HoraEvento` TIME NULL,
  `Monto` DECIMAL(10,2) NULL,
  `MetodoPago` VARCHAR(50) NULL,
  `Frecuencia` VARCHAR(50) NULL,
  `Estado` VARCHAR(20) DEFAULT 'Activo',
  `FechaRegistro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `IdTrabajador` INT NOT NULL,
  FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes`(`IdExpediente`) ON DELETE CASCADE,
  FOREIGN KEY (`IdPersonaInvolucrada`) REFERENCES `userexternos`(`IdPersona`) ON DELETE SET NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f4_invitacion` (
  `IdF4` INT AUTO_INCREMENT PRIMARY KEY,
  `IdEvento` INT NULL,
  `TelefonoDna` VARCHAR(20) NULL,
  `IdPersona` INT NOT NULL,
  `FechaInvitacion` DATE NULL,
  `HoraInvitacion` TIME NULL,
  `Asunto` VARCHAR(255) NULL,
  `AsuntoResumen` TEXT NULL,
  `Relacion3ro` VARCHAR(100) NULL,
  `Dni3ro` VARCHAR(15) NULL,
  `Nombre3ro` VARCHAR(150) NULL,
  `FechaRecibe` DATE NULL,
  `HoraRecibe` TIME NULL,
  `TrabEntrega` VARCHAR(150) NULL,
  `Observaciones` TEXT NULL,
  `NumeroInvitacion` INT DEFAULT 1,
  FOREIGN KEY (`IdEvento`) REFERENCES `eventos`(`IdEvento`) ON DELETE SET NULL,
  FOREIGN KEY (`IdPersona`) REFERENCES `userexternos`(`IdPersona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f5_invitacionconciliar` (
  `IdF5` INT AUTO_INCREMENT PRIMARY KEY,
  `IdEvento` INT NULL,
  `TelefonoDna` VARCHAR(20) NULL,
  `IdPersona` INT NOT NULL,
  `FechaInvitacion` DATE NULL,
  `HoraInvitacion` TIME NULL,
  `Asunto` VARCHAR(255) NULL,
  `AsuntoResumen` TEXT NULL,
  `Relacion3ro` VARCHAR(100) NULL,
  `Dni3ro` VARCHAR(15) NULL,
  `Nombre3ro` VARCHAR(150) NULL,
  `FechaRecibe` DATE NULL,
  `HoraRecibe` TIME NULL,
  `TrabEntrega` VARCHAR(150) NULL,
  `Observaciones` TEXT NULL,
  `NumeroInvitacion` INT DEFAULT 1,
  FOREIGN KEY (`IdEvento`) REFERENCES `eventos`(`IdEvento`) ON DELETE SET NULL,
  FOREIGN KEY (`IdPersona`) REFERENCES `userexternos`(`IdPersona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f7_ofderivacion` (
  `IdF7` INT AUTO_INCREMENT PRIMARY KEY,
  `TelefonoDna` VARCHAR(20) NULL,
  `Destinatario` VARCHAR(150) NULL,
  `CargoDest` VARCHAR(100) NULL,
  `InstitucionDest` VARCHAR(150) NULL,
  `IdEntidad` INT NULL,
  `IdPersona` INT NULL,
  `NumOficio` INT NULL,
  `Materias` VARCHAR(255) NULL,
  `OtroMotivo` VARCHAR(255) NULL,
  `Descripcion` TEXT NULL,
  `DocumentosAdj` TEXT NULL,
  FOREIGN KEY (`IdEntidad`) REFERENCES `entidad`(`IdEntidad`) ON DELETE SET NULL,
  FOREIGN KEY (`IdPersona`) REFERENCES `userexternos`(`IdPersona`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f8a_acta1rainasistencia` (
  `IdF8A` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `TelefonoDna` VARCHAR(20) NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `SegundaFechaCita` DATE NULL,
  `SegundaHoraCita` TIME NULL,
  `IdAsistio` INT NULL,
  `ParteNoAsistio` VARCHAR(50) NULL,
  `IdNoAsistio` INT NULL,
  `HoraActa` TIME NULL,
  `IdEvento` INT NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f8b_acta2dainasistencia` (
  `IdF8B` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `TelefonoDna` VARCHAR(20) NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `IdAsistio` INT NULL,
  `ParteNoAsistio` VARCHAR(50) NULL,
  `IdNoAsistio` INT NULL,
  `HoraActa` TIME NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f8c_actainasistenciaambos` (
  `IdF8C` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `TelefonoDna` VARCHAR(20) NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `HoraActa` TIME NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f9a_actaconciliacion` (
  `IdF9A` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `ExisTestigo` VARCHAR(10) NULL,
  `NyATestigo` VARCHAR(150) NULL,
  `DniTestigo` VARCHAR(15) NULL,
  `DomicilioTest` VARCHAR(255) NULL,
  `CalidTestigo` VARCHAR(100) NULL,
  `TestigoDe` INT NULL,
  `HechosConciliacion` TEXT NULL,
  `Materias` VARCHAR(255) NULL,
  `PuntosControversia` TEXT NULL,
  `TipoAcuerdo` VARCHAR(50) NULL,
  `TermyCond` TEXT NULL,
  `AccionesDna` TEXT NULL,
  `RegistroAbogado` VARCHAR(50) NULL,
  `ColegioAbogados` VARCHAR(100) NULL,
  `HoraActa` TIME NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f9b_acdesistimiento` (
  `IdF9B` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `HoraActa` TIME NULL,
  `Motivo` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f9c_acsuspension` (
  `IdF9C` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `HoraActa` TIME NULL,
  `Motivo` TEXT NULL,
  `NuevaFecha` DATE NULL,
  `NuevaHora` TIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f9d_acdecisionmtv` (
  `IdF9D` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `HoraActa` TIME NULL,
  `MotivoNoAcuerdo` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f10_actacompromiso` (
  `IdF10` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NOT NULL,
  `IdSolicitante` INT NULL,
  `IdTransgresor` INT NULL,
  `TelefonoDna` VARCHAR(20) NULL,
  `Materias` VARCHAR(255) NULL,
  `Descripcion` TEXT NULL,
  `Compromisos` TEXT NULL,
  `AccionesDna` TEXT NULL,
  `HoraActa` TIME NULL,
  `NumActaComp` INT NULL,
  `anio` INT NULL,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `f11_fichaseguimiento` (
  `IdF11` INT AUTO_INCREMENT PRIMARY KEY,
  `NumSeguimiento` INT NOT NULL,
  `Ubicacion` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `IdNotificacion` INT AUTO_INCREMENT PRIMARY KEY,
  `IdEvento` INT NULL,
  `IdExpediente` INT NULL,
  `IdPersonaInvolucrada` INT NULL,
  `Titulo` VARCHAR(150) NOT NULL,
  `Mensaje` TEXT NULL,
  `FechaProgramada` DATE NOT NULL,
  `HoraProgramada` TIME NULL,
  `Estado` VARCHAR(20) DEFAULT 'Activa',
  `EstadoToast` VARCHAR(20) DEFAULT 'Pendiente',
  FOREIGN KEY (`IdEvento`) REFERENCES `eventos`(`IdEvento`) ON DELETE CASCADE,
  FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes`(`IdExpediente`) ON DELETE CASCADE,
  FOREIGN KEY (`IdPersonaInvolucrada`) REFERENCES `userexternos`(`IdPersona`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Pagos Realizados (Pensiones de alimentos)
CREATE TABLE IF NOT EXISTS `pagos_realizados` (
  `IdPago` INT AUTO_INCREMENT PRIMARY KEY,
  `IdEvento` INT NOT NULL,
  `IdExpediente` INT NOT NULL,
  `IdPersona` INT NOT NULL,
  `NumPago` INT NOT NULL,
  `Monto` DECIMAL(10,2) NOT NULL,
  `MontoPagado` DECIMAL(10,2) NULL,
  `FechaProgramada` DATE NOT NULL,
  `FechaPago` DATE NULL,
  `EstadoPago` VARCHAR(30) DEFAULT 'Pendiente',
  FOREIGN KEY (`IdEvento`) REFERENCES `eventos`(`IdEvento`) ON DELETE CASCADE,
  FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes`(`IdExpediente`) ON DELETE CASCADE,
  FOREIGN KEY (`IdPersona`) REFERENCES `userexternos`(`IdPersona`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Registro de Información / Orientación Rápida
CREATE TABLE IF NOT EXISTS `registroinfo` (
  `IdRegInfo` INT AUTO_INCREMENT PRIMARY KEY,
  `Fecha` DATE NOT NULL,
  `IdPersona` INT NOT NULL,
  `edad` INT NULL,
  `unidad_edad` VARCHAR(20) NULL,
  `MotivoOrientacion` TEXT NOT NULL,
  `IdTrabajador` INT NOT NULL,
  FOREIGN KEY (`IdPersona`) REFERENCES `userexternos`(`IdPersona`) ON DELETE CASCADE,
  FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores`(`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Logs de Búsqueda (Para KPIs del Desarrollador)
CREATE TABLE IF NOT EXISTS `logs_busqueda` (
  `IdLog` INT AUTO_INCREMENT PRIMARY KEY,
  `IdTrabajador` INT NULL,
  `TerminoBusqueda` VARCHAR(255) NULL,
  `DuracionSegundos` DECIMAL(6,4) DEFAULT 0.0000,
  `FechaHora` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Ficha Estadística Anual (Reporte MIMP)
CREATE TABLE IF NOT EXISTS `ficha_estadistica_anual` (
  `IdFEA` INT AUTO_INCREMENT PRIMARY KEY,
  `anio` INT NOT NULL UNIQUE,
  `Ubicacion` VARCHAR(255) NULL,
  `telefono_dna` VARCHAR(20) NULL,
  `email_dna` VARCHAR(100) NULL,
  `prom_padres` INT DEFAULT 0,
  `prom_madres` INT DEFAULT 0,
  `prom_cuidadores` INT DEFAULT 0,
  `datos_json` LONGTEXT NULL,
  `FechaCreacion` DATE NULL,
  `HoraCreacion` TIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- DATOS INICIALES DE PRUEBA (USUARIOS DEMO)
-- Contraseña para todos los usuarios: password123
-- Hash Bcrypt para password123: $2y$10$Zu48TsUIg4A5nJc2dnbubuWa9m12pAbd.OxARx1i9sNkwX04gyDE2
-- ========================================================

-- Trabajador 1: Desarrollador (DNI: 11111111)
INSERT INTO `trabajadores` (`IdTrabajador`, `Nombres`, `Apellidos`, `DNI`, `NumTelef`) 
VALUES (1, 'Admin', 'Desarrollador', '11111111', '999999991')
ON DUPLICATE KEY UPDATE `DNI`=`DNI`;

INSERT INTO `usuarioslg` (`IdLogin`, `IdTrabajador`, `Contraseña`, `IdRol`, `UltimoInicioSesion`, `UltimaNotificacionToast`)
VALUES (1, 1, '$2y$10$Zu48TsUIg4A5nJc2dnbubuWa9m12pAbd.OxARx1i9sNkwX04gyDE2', 1, NOW(), CURDATE())
ON DUPLICATE KEY UPDATE `IdLogin`=`IdLogin`;

-- Trabajador 2: Administrador DEMUNA (DNI: 22222222)
INSERT INTO `trabajadores` (`IdTrabajador`, `Nombres`, `Apellidos`, `DNI`, `NumTelef`) 
VALUES (2, 'Coordinador', 'DEMUNA Sapillica', '22222222', '999999992')
ON DUPLICATE KEY UPDATE `DNI`=`DNI`;

INSERT INTO `usuarioslg` (`IdLogin`, `IdTrabajador`, `Contraseña`, `IdRol`, `UltimoInicioSesion`, `UltimaNotificacionToast`)
VALUES (2, 2, '$2y$10$Zu48TsUIg4A5nJc2dnbubuWa9m12pAbd.OxARx1i9sNkwX04gyDE2', 2, NOW(), CURDATE())
ON DUPLICATE KEY UPDATE `IdLogin`=`IdLogin`;

-- Trabajador 3: Operador / Trabajador (DNI: 33333333)
INSERT INTO `trabajadores` (`IdTrabajador`, `Nombres`, `Apellidos`, `DNI`, `NumTelef`) 
VALUES (3, 'Especialista', 'Defensor DEMUNA', '33333333', '999999993')
ON DUPLICATE KEY UPDATE `DNI`=`DNI`;

INSERT INTO `usuarioslg` (`IdLogin`, `IdTrabajador`, `Contraseña`, `IdRol`, `UltimoInicioSesion`, `UltimaNotificacionToast`)
VALUES (3, 3, '$2y$10$Zu48TsUIg4A5nJc2dnbubuWa9m12pAbd.OxARx1i9sNkwX04gyDE2', 3, NOW(), CURDATE())
ON DUPLICATE KEY UPDATE `IdLogin`=`IdLogin`;


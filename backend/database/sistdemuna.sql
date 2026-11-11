/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.19-MariaDB, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: popydev_demuna
-- ------------------------------------------------------
-- Server version	10.11.19-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actas`
--

DROP TABLE IF EXISTS `actas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `actas` (
  `IdActa` int(11) NOT NULL AUTO_INCREMENT,
  `IdTipoActa` int(11) NOT NULL,
  `NombreActa` varchar(255) NOT NULL,
  `NumActa` int(11) DEFAULT NULL,
  `FechaActa` date NOT NULL,
  `FechaCreacion` date DEFAULT NULL,
  `HoraCreacion` time DEFAULT NULL,
  `FechaRegistro` date DEFAULT NULL,
  `HoraRegistro` time DEFAULT NULL,
  `IdActaEspecifica` int(11) NOT NULL,
  `IdExpediente` int(11) NOT NULL,
  `IdTrabajador` int(11) NOT NULL,
  PRIMARY KEY (`IdActa`),
  KEY `IdExpediente` (`IdExpediente`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `actas_ibfk_1` FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes` (`IdExpediente`) ON DELETE CASCADE,
  CONSTRAINT `actas_ibfk_2` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actas`
--

LOCK TABLES `actas` WRITE;
/*!40000 ALTER TABLE `actas` DISABLE KEYS */;
INSERT INTO `actas` VALUES
(1,11,'biuninioni',8987,'2026-11-11','2026-11-11','00:42:10',NULL,NULL,0,1,3),
(2,1,'Ficha de Recepción de Caso',1,'2026-11-02','2026-11-11','00:56:41',NULL,NULL,1,1,3),
(3,2,'Ficha de Entrevista Psicológica y Social',1,'2026-11-05','2026-11-11','00:56:41',NULL,NULL,1,1,3),
(4,3,'Ficha de Visita Domiciliaria de Inspección',1,'2026-11-08','2026-11-11','00:56:41',NULL,NULL,1,1,3),
(5,17,'Ficha de Seguimiento y Monitoreo del NNA',1,'2026-11-10','2026-11-11','00:56:41',NULL,NULL,1,1,3),
(6,12,'Acta de Conciliación con Acuerdo Total sobre Pensión de Alimentos y Régimen de Visitas',1,'2026-11-04','2026-11-11','01:12:47',NULL,NULL,3,1,3),
(7,4,'Primera Invitación a Audiencia de Conciliación Extrajudicial',1,'2026-11-01','2026-11-11','01:12:47',NULL,NULL,1,1,3),
(8,16,'Acta de Compromiso Familiar y Convivencia Pacífica',1,'2026-11-06','2026-11-11','01:12:47',NULL,NULL,1,1,3),
(9,8,'Oficio de Remisión de Actuados a Fiscalía de Familia',1,'2026-11-09','2026-11-11','01:12:47',NULL,NULL,1,1,3),
(10,16,'Acta de Compromiso Familiar y Convivencia Pacífica',2,'2026-03-20','2026-03-20','11:00:00',NULL,NULL,1,3,2),
(11,4,'Primera Invitación a Audiencia de Conciliación Extrajudicial',3,'2026-04-05','2026-04-05','11:00:00',NULL,NULL,1,5,3),
(12,5,'Segunda Invitación a Conciliar con Apercibimiento Legal',4,'2026-04-12','2026-04-12','11:00:00',NULL,NULL,1,6,5),
(13,11,'Acta de Inasistencia de Ambas Partes',5,'2026-04-25','2026-04-25','11:00:00',NULL,NULL,1,7,6),
(14,8,'Oficio de Derivación a Fiscalía Provincial Civil y Familia',6,'2026-05-15','2026-05-15','11:00:00',NULL,NULL,1,8,7),
(15,12,'Acta de Conciliación con Acuerdo Parcial de Alimentos',7,'2026-06-02','2026-06-02','11:00:00',NULL,NULL,1,9,8),
(16,14,'Acta de Suspensión de Audiencia por Solicitud de Partes',8,'2026-06-25','2026-06-25','11:00:00',NULL,NULL,1,10,9),
(17,16,'Acta de Compromiso de Pautas de Crianza y Escolaridad',9,'2026-07-10','2026-07-10','11:00:00',NULL,NULL,1,11,10),
(18,1,'Ficha de Recepción de Caso y Admisión a Trámite',10,'2026-08-01','2026-08-01','11:00:00',NULL,NULL,1,12,11),
(19,2,'Ficha de Entrevista Psicológica y Social Integral',11,'2026-08-18','2026-08-18','11:00:00',NULL,NULL,1,13,12),
(20,3,'Ficha de Visita Domiciliaria de Inspección Ocular',12,'2026-09-05','2026-09-05','11:00:00',NULL,NULL,1,14,13),
(21,17,'Ficha de Seguimiento y Monitoreo del NNA Tutelado',13,'2026-10-01','2026-10-01','11:00:00',NULL,NULL,1,15,14),
(22,12,'Acta de Conciliación sobre Pensión de S/ 450.00 y Salud',14,'2026-11-04','2026-11-04','11:00:00',NULL,NULL,1,2,15),
(23,1,'Ficha de Recepción N° 012-2026',12,'2026-11-08','2026-11-08','10:30:00',NULL,NULL,2,5,2),
(24,1,'Ficha de Recepción N° 013-2026',13,'2026-11-01','2026-11-01','10:30:00',NULL,NULL,3,6,3),
(25,1,'Ficha de Recepción N° 014-2026',14,'2026-10-25','2026-10-25','10:30:00',NULL,NULL,4,7,5),
(26,1,'Ficha de Recepción N° 015-2026',15,'2026-10-18','2026-10-18','10:30:00',NULL,NULL,5,8,6),
(27,2,'Entrevista Reservada N° 012-2026',12,'2026-11-07','2026-11-07','11:15:00',NULL,NULL,2,7,3),
(28,2,'Entrevista Reservada N° 013-2026',13,'2026-11-02','2026-11-02','11:15:00',NULL,NULL,3,8,5),
(29,2,'Entrevista Reservada N° 014-2026',14,'2026-10-28','2026-10-28','11:15:00',NULL,NULL,4,9,6),
(30,2,'Entrevista Reservada N° 015-2026',15,'2026-10-23','2026-10-23','11:15:00',NULL,NULL,5,10,7),
(31,3,'Visita Sociofamiliar In Situ N° 012-2026',12,'2026-11-09','2026-11-09','15:00:00',NULL,NULL,2,9,5),
(32,3,'Visita Sociofamiliar In Situ N° 013-2026',13,'2026-11-03','2026-11-03','15:00:00',NULL,NULL,3,10,6),
(33,3,'Visita Sociofamiliar In Situ N° 014-2026',14,'2026-10-28','2026-10-28','15:00:00',NULL,NULL,4,11,7),
(34,3,'Visita Sociofamiliar In Situ N° 015-2026',15,'2026-10-22','2026-10-22','15:00:00',NULL,NULL,5,12,8),
(35,17,'Ficha de Verificación de Cumplimiento N° 012-2026',12,'2026-11-10','2026-11-10','16:30:00',NULL,NULL,2,11,6),
(36,17,'Ficha de Verificación de Cumplimiento N° 013-2026',13,'2026-11-02','2026-11-02','16:30:00',NULL,NULL,3,12,7),
(37,17,'Ficha de Verificación de Cumplimiento N° 014-2026',14,'2026-10-25','2026-10-25','16:30:00',NULL,NULL,4,13,8),
(38,17,'Ficha de Verificación de Cumplimiento N° 015-2026',15,'2026-10-17','2026-10-17','16:30:00',NULL,NULL,5,14,9);
/*!40000 ALTER TABLE `actas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `clave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `categoria` varchar(50) NOT NULL DEFAULT 'general',
  `descripcion` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES
('alerta_audiencias_activas','1','operacion','GeneraciÃ³n automÃ¡tica de recordatorios de audiencias','2026-11-11 16:42:32'),
('alerta_pensiones_activas','1','operacion','GeneraciÃ³n automÃ¡tica de alertas de mora alimentaria','2026-11-11 16:42:32'),
('ano_fiscal_activo','2026','operacion','AÃ±o fiscal en curso para estadÃ­sticas MIMP','2026-11-11 16:42:32'),
('defensor_colegiatura','CAL-45892','general','NÃºmero de colegiatura profesional','2026-11-11 16:42:32'),
('defensor_responsable','Abog. Carlos Mendoza Ruesta','general','Defensor o responsable legal acreditado','2026-11-11 16:42:32'),
('defensoria_codigo_mimp','DEMUNA-ACR-020-PIU','general','CÃ³digo oficial de acreditaciÃ³n ante el MIMP (DS NÂ° 005-2019-MIMP)','2026-11-11 16:42:32'),
('defensoria_nombre','DEMUNA ZAPILLICA - Defensoría Municipal del Niño, Niña y Adolescente','general','DenominaciÃ³n institucional de la DefensorÃ­a','2026-11-11 21:52:51'),
('dias_anticipacion_audiencia','3','operacion','DÃ­as hÃ¡biles de anticipaciÃ³n para citar a audiencia de conciliaciÃ³n','2026-11-11 16:42:32'),
('dias_gracia_pension','5','operacion','DÃ­as de gracia posteriores al vencimiento de cuota de alimentos','2026-11-11 16:42:32'),
('direccion_sede','Plaza de Armas s/n, Palacio Municipal - Zapillica, Ayabaca, Piura','general','DirecciÃ³n fÃ­sica de la sede central de la DEMUNA','2026-11-11 21:52:51'),
('email_institucional','demuna@munizapillica.gob.pe','general','Correo institucional de contacto y mesa de partes','2026-11-11 21:52:51'),
('horario_atencion','Lunes a Viernes de 08:00 a 13:00 y 14:00 a 17:00','general','Horario de recepciÃ³n ciudadana','2026-11-11 16:42:32'),
('institucion_nombre','Municipalidad Distrital de Zapillica','general','Nombre oficial de la Municipalidad','2026-11-11 21:52:51'),
('meta_anual_casos','200','operacion','Meta de atenciones proyectada para el aÃ±o','2026-11-11 16:47:31'),
('notificaciones_correo','1','operacion','EnvÃ­o de notificaciones vÃ­a correo electrÃ³nico','2026-11-11 16:42:32'),
('plazo_maximo_citacion','7','operacion','Plazo mÃ¡ximo entre 1ra y 2da citaciÃ³n en dÃ­as hÃ¡biles','2026-11-11 16:42:32'),
('prefijo_expediente','EXP','operacion','Prefijo para cÃ³digo correlativo de expedientes','2026-11-11 16:42:32'),
('smtp_encryption','ssl','smtp','Protocolo de cifrado (ssl/tls)','2026-11-11 16:42:32'),
('smtp_from_name','DEMUNA ZAPILLICA - Sistema de Gestión','smtp','Nombre emisor de correos del sistema','2026-11-11 21:52:51'),
('smtp_host','mail.popydev.com','smtp','Servidor SMTP saliente','2026-11-11 16:42:32'),
('smtp_pass','Piero2004@','smtp','ContraseÃ±a del servidor de correo','2026-11-11 16:42:32'),
('smtp_port','465','smtp','Puerto SMTP','2026-11-11 16:42:32'),
('smtp_user','datossistema@popydev.com','smtp','Usuario o correo autenticado','2026-11-11 16:42:32'),
('telefono_emergencia','969 845 120','general','LÃ­nea directa para casos urgentes de protecciÃ³n NNA','2026-11-11 16:42:32'),
('telefono_institucional','(073) 381-042','general','TelÃ©fono de atenciÃ³n al ciudadano','2026-11-11 16:42:32'),
('unidad_territorial','Piura - Ayabaca - Zapillica','operacion','JurisdicciÃ³n territorial','2026-11-11 21:52:51');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entidad`
--

DROP TABLE IF EXISTS `entidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `entidad` (
  `IdEntidad` int(11) NOT NULL AUTO_INCREMENT,
  `NombreEntidad` varchar(150) NOT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  `Distrito` varchar(100) DEFAULT NULL,
  `Provincia` varchar(100) DEFAULT NULL,
  `Departamento` varchar(100) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `IdTipoEntidad` int(11) DEFAULT NULL,
  PRIMARY KEY (`IdEntidad`),
  KEY `IdTipoEntidad` (`IdTipoEntidad`),
  CONSTRAINT `entidad_ibfk_1` FOREIGN KEY (`IdTipoEntidad`) REFERENCES `tipoentidad` (`IdTipoEntidad`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entidad`
--

LOCK TABLES `entidad` WRITE;
/*!40000 ALTER TABLE `entidad` DISABLE KEYS */;
INSERT INTO `entidad` VALUES
(1,'ComisarÃ­a Sectorial PNP Zapillica','Calle Comercio s/n, Centro Poblado Sapillica','Zapillica','Ayabaca','Piura','(073) 381-010',1),
(2,'ComisarÃ­a Rural PNP Suyo','Av. Fronteriza NÂ° 145','Suyo','Ayabaca','Piura','(073) 381-120',1),
(3,'Centro de Salud I-4 Zapillica (MINSA)','Jr. Dos de Mayo NÂ° 230','Zapillica','Ayabaca','Piura','(073) 381-025',2),
(4,'Puesto de Salud Huamba Alta','CaserÃ­o Huamba Alta s/n','Zapillica','Ayabaca','Piura','969 821 445',2),
(5,'Municipalidad Distrital de Zapillica (Gerencia Desarrollo Social)','Plaza de Armas s/n','Zapillica','Ayabaca','Piura','(073) 381-042',3),
(6,'Municipalidad Provincial de Ayabaca - DEMUNA Provincial','Calle CÃ¡ceres NÂ° 412','Ayabaca','Ayabaca','Piura','(073) 471-015',3),
(7,'Oficina de Registro Civil Zapillica - RENIEC','Palacio Municipal, 1er Piso','Zapillica','Ayabaca','Piura','(073) 381-043',4),
(8,'I.E. Sagrado CorazÃ³n de JesÃºs NÂ° 14350','Jr. San MartÃ­n NÂ° 180','Zapillica','Ayabaca','Piura','(073) 381-088',5),
(9,'UGEL Ayabaca - Ãrea de TutorÃ­a y Convivencia Escolar','Av. Bolognesi NÂ° 510','Ayabaca','Ayabaca','Piura','(073) 471-190',5),
(10,'Unidad de ProtecciÃ³n Especial (UPE Piura - MIMP)','Calle Los Naranjos NÂ° 182, Urb. Santa Isabel','Piura','Piura','Piura','(073) 321-450',6),
(11,'Central de Rondas Campesinas de Zapillica','CaserÃ­o Pajonal Centro','Zapillica','Ayabaca','Piura','978 412 360',7),
(12,'Subprefectura Distrital de Zapillica','Jr. Grau NÂ° 112','Zapillica','Ayabaca','Piura','968 123 789',8),
(13,'Centro Emergencia Mujer (CEM ComisarÃ­a Ayabaca)','Calle Arequipa NÂ° 340','Ayabaca','Ayabaca','Piura','01-4165200',10),
(14,'Juzgado de Paz de Ãšnica NominaciÃ³n de Zapillica','Jr. Comercio NÂ° 305','Zapillica','Ayabaca','Piura','969 554 112',11);
/*!40000 ALTER TABLE `entidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadoexp`
--

DROP TABLE IF EXISTS `estadoexp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadoexp` (
  `idesexp` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`idesexp`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadoexp`
--

LOCK TABLES `estadoexp` WRITE;
/*!40000 ALTER TABLE `estadoexp` DISABLE KEYS */;
INSERT INTO `estadoexp` VALUES
(1,'Pendiente'),
(2,'En Progreso'),
(3,'Archivado'),
(4,'Derivado'),
(5,'Resuelto'),
(6,'Concluido');
/*!40000 ALTER TABLE `estadoexp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `IdEvento` int(11) NOT NULL AUTO_INCREMENT,
  `IdExpediente` int(11) NOT NULL,
  `IdPersonaInvolucrada` int(11) DEFAULT NULL,
  `TipoEvento` varchar(50) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `FechaEvento` date NOT NULL,
  `HoraEvento` time DEFAULT NULL,
  `Monto` decimal(10,2) DEFAULT NULL,
  `MetodoPago` varchar(50) DEFAULT NULL,
  `Frecuencia` varchar(50) DEFAULT NULL,
  `Estado` varchar(20) DEFAULT 'Activo',
  `IdTrabajador` int(11) NOT NULL,
  `FechaRegistro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`IdEvento`),
  KEY `IdExpediente` (`IdExpediente`),
  KEY `IdPersonaInvolucrada` (`IdPersonaInvolucrada`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes` (`IdExpediente`) ON DELETE CASCADE,
  CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`IdPersonaInvolucrada`) REFERENCES `userexternos` (`IdPersona`) ON DELETE SET NULL,
  CONSTRAINT `eventos_ibfk_3` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES
(1,1,3,'Compromiso de Alimentos','Acuerdo de pensión S/ 350','2026-11-04','01:12:47',350.00,NULL,'Mensual','Realizado',3,'2026-11-11 01:12:47'),
(2,1,NULL,'Audiencia de Conciliación','Primera Invitación a Audiencia de Conciliación Extrajudicial','2026-11-04','10:00:00',NULL,NULL,NULL,'Pendiente',3,'2026-11-11 01:12:47'),
(3,1,3,'Audiencia de Conciliación','Audiencia formal de alimentos y régimen de visitas del NNA.','2026-11-12','10:30:00',NULL,NULL,NULL,'Pendiente',3,'2026-11-11 01:30:17'),
(4,1,3,'Visita Domiciliaria / De Campo','Verificación in situ de las condiciones habitacionales y entorno del menor.','2026-11-16','15:00:00',NULL,NULL,NULL,'Pendiente',3,'2026-11-11 01:30:17'),
(5,1,3,'Entrevista Psicológica / Social','Evaluación y contención psicológica especializada al NNA.','2026-11-18','11:00:00',NULL,NULL,NULL,'Pendiente',3,'2026-11-11 01:30:17'),
(6,1,3,'Actividad de Difusión Comunitaria','Taller sobre deberes y derechos de la niñez en I.E. local.','2026-11-20','09:00:00',NULL,NULL,NULL,'Pendiente',3,'2026-11-11 01:30:17'),
(7,2,NULL,'Audiencia de Conciliación','Audiencia formal de alimentos y régimen de visitas en despacho DEMUNA','2026-11-12','10:00:00',450.00,NULL,NULL,'Activo',1,'2026-11-11 11:21:37'),
(8,3,NULL,'Visita Domiciliaria','Inspección ocular para verificación del entorno habitacional del menor','2026-11-13','11:30:00',0.00,NULL,NULL,'Activo',2,'2026-11-11 11:21:37'),
(9,5,NULL,'Entrevista Psicológica','Evaluación psicológica y soporte socioemocional del NNA','2026-11-14','09:00:00',0.00,NULL,NULL,'Activo',3,'2026-11-11 11:21:37'),
(10,6,NULL,'Audiencia de Conciliación','Segunda audiencia de conciliación extrajudicial sobre alimentos','2026-11-16','10:30:00',500.00,NULL,NULL,'Activo',5,'2026-11-11 11:21:37'),
(11,7,NULL,'Visita Domiciliaria','Constatación de escolaridad y alimentación en domicilio materno','2026-11-17','14:00:00',0.00,NULL,NULL,'Activo',6,'2026-11-11 11:21:37'),
(12,8,NULL,'Taller Comunitario','Taller sobre deberes parentales y prevención de violencia en I.E. Local','2026-11-18','09:00:00',0.00,NULL,NULL,'Activo',7,'2026-11-11 11:21:37'),
(13,9,NULL,'Sesión de Seguimiento','Ficha F11 de verificación del cumplimiento de pensión acordada','2026-11-19','11:00:00',0.00,NULL,NULL,'Activo',8,'2026-11-11 11:21:37'),
(14,10,NULL,'Audiencia de Conciliación','Audiencia sobre régimen de visitas y tenencia compartida','2026-11-20','15:00:00',0.00,NULL,NULL,'Activo',9,'2026-11-11 11:21:37'),
(15,11,NULL,'Entrevista Psicológica','Sesión de orientación parental y pautas de crianza positiva','2026-11-23','10:00:00',0.00,NULL,NULL,'Activo',10,'2026-11-11 11:21:37'),
(16,12,NULL,'Visita Domiciliaria','Visita de seguimiento post-acuerdo conciliatorio','2026-11-24','11:00:00',0.00,NULL,NULL,'Activo',11,'2026-11-11 11:21:37'),
(17,13,NULL,'Audiencia de Conciliación','Conciliación sobre incremento de pensión por matrícula escolar','2026-11-25','10:00:00',600.00,NULL,NULL,'Activo',12,'2026-11-11 11:21:37'),
(18,14,NULL,'Mesa Técnica MIMP','Reunión de coordinación interinstitucional con CEM y Ministerio Público','2026-11-26','09:30:00',0.00,NULL,NULL,'Activo',13,'2026-11-11 11:21:37'),
(19,15,NULL,'Entrega de Notificaciones','Diligenciamiento de cédulas de notificación en zona rural','2026-11-27','08:30:00',0.00,NULL,NULL,'Activo',14,'2026-11-11 11:21:37'),
(20,16,NULL,'Audiencia de Conciliación','Audiencia final sobre reconocimiento voluntario de filiación','2026-11-30','11:00:00',0.00,NULL,NULL,'Activo',15,'2026-11-11 11:21:37');
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expedientes`
--

DROP TABLE IF EXISTS `expedientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expedientes` (
  `IdExpediente` int(11) NOT NULL AUTO_INCREMENT,
  `IdEstado` int(11) NOT NULL DEFAULT 1,
  `NombreExpediente` varchar(50) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `Institucion` varchar(150) DEFAULT NULL,
  `IdTrabajador` int(11) NOT NULL,
  `FechaCreacion` date NOT NULL,
  `HoraCreacion` time NOT NULL,
  `FechaApertura` date NOT NULL,
  `FechaResuelto` date DEFAULT NULL,
  `HoraResuelto` time DEFAULT NULL,
  `FechaConclusion` date DEFAULT NULL,
  `HoraConclusion` time DEFAULT NULL,
  `FechaRegistro` date DEFAULT NULL,
  `HoraRegistro` time DEFAULT NULL,
  PRIMARY KEY (`IdExpediente`),
  KEY `IdEstado` (`IdEstado`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `expedientes_ibfk_1` FOREIGN KEY (`IdEstado`) REFERENCES `estadoexp` (`idesexp`),
  CONSTRAINT `expedientes_ibfk_2` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expedientes`
--

LOCK TABLES `expedientes` WRITE;
/*!40000 ALTER TABLE `expedientes` DISABLE KEYS */;
INSERT INTO `expedientes` VALUES
(1,2,'001-2026-20043','sgewrgety3wefewq','iniuiubu8b8ubu88',3,'2026-11-09','23:46:34','2026-11-10','2026-11-06',NULL,'2026-11-11','00:36:42',NULL,NULL),
(2,2,'001-2026-DEMUNA','Fijación de pensión de alimentos y régimen de visitas para menor',NULL,2,'2026-02-10','10:00:00','2026-02-10',NULL,NULL,NULL,NULL,NULL,NULL),
(3,5,'002-2026-DEMUNA','Tenencia exclusiva y custodia compartida por acuerdo parental',NULL,3,'2026-02-18','10:00:00','2026-02-18',NULL,NULL,NULL,NULL,NULL,NULL),
(5,1,'003-2026-DEMUNA','Aumento de pensión alimenticia por ingreso a nivel secundaria',NULL,3,'2026-03-05','10:00:00','2026-03-05',NULL,NULL,NULL,NULL,NULL,NULL),
(6,5,'004-2026-DEMUNA','Compromiso de normas de conducta y cese de violencia psicológica',NULL,5,'2026-03-15','10:00:00','2026-03-15',NULL,NULL,NULL,NULL,NULL,NULL),
(7,6,'005-2026-DEMUNA','Reconocimiento voluntario de filiación paterna extramatrimonial',NULL,6,'2026-04-02','10:00:00','2026-04-02',NULL,NULL,NULL,NULL,NULL,NULL),
(8,2,'006-2026-DEMUNA','Régimen de visitas supervisadas fines de semana',NULL,7,'2026-04-20','10:00:00','2026-04-20',NULL,NULL,NULL,NULL,NULL,NULL),
(9,5,'007-2026-DEMUNA','Pensión de alimentos para dos hermanos en edad preescolar',NULL,8,'2026-05-12','10:00:00','2026-05-12',NULL,NULL,NULL,NULL,NULL,NULL),
(10,4,'008-2026-DEMUNA','Presunta situación de riesgo y desprotección familiar',NULL,9,'2026-05-25','10:00:00','2026-05-25',NULL,NULL,NULL,NULL,NULL,NULL),
(11,6,'009-2026-DEMUNA','Custodia y matrícula escolar obligatoria para el año lectivo',NULL,10,'2026-06-10','10:00:00','2026-06-10',NULL,NULL,NULL,NULL,NULL,NULL),
(12,2,'010-2026-DEMUNA','Fijación de pensión alimenticia de S/ 450.00 y gastos médicos',NULL,11,'2026-07-04','10:00:00','2026-07-04',NULL,NULL,NULL,NULL,NULL,NULL),
(13,3,'011-2026-DEMUNA','Desistimiento voluntario por conciliación directa entre cónyuges',NULL,12,'2026-08-15','10:00:00','2026-08-15',NULL,NULL,NULL,NULL,NULL,NULL),
(14,1,'012-2026-DEMUNA','Visitas y convivencia pacífica durante período vacacional',NULL,13,'2026-09-01','10:00:00','2026-09-01',NULL,NULL,NULL,NULL,NULL,NULL),
(15,2,'013-2026-DEMUNA','Apoyo socioeconómico y seguimiento integral de escolaridad',NULL,14,'2026-10-12','10:00:00','2026-10-12',NULL,NULL,NULL,NULL,NULL,NULL),
(16,2,'014-2026-DEMUNA','Alimentos provisorios y entrega de libreta de ahorros',NULL,15,'2026-11-03','10:00:00','2026-11-03',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `expedientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f10_actacompromiso`
--

DROP TABLE IF EXISTS `f10_actacompromiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f10_actacompromiso` (
  `IdF10` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `Materias` varchar(255) DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  `Compromisos` text DEFAULT NULL,
  `AccionesDna` text DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  `NumActaComp` int(11) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  PRIMARY KEY (`IdF10`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `f10_actacompromiso_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f10_actacompromiso`
--

LOCK TABLES `f10_actacompromiso` WRITE;
/*!40000 ALTER TABLE `f10_actacompromiso` DISABLE KEYS */;
INSERT INTO `f10_actacompromiso` VALUES
(1,3,NULL,NULL,NULL,'Normas de Conducta y Buen Trato al NNA','Compromiso mutuo para evitar agresiones verbales o situaciones de conflicto en presencia de los hijos menores.','Ambos progenitores se comprometen formalmente a mantener comunicación cordial y velar conjuntamente por la salud y educación del menor.','Monitoreo bimensual por el área de trabajo social.','01:12:47',1,2026);
/*!40000 ALTER TABLE `f10_actacompromiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f11_fichaseguimiento`
--

DROP TABLE IF EXISTS `f11_fichaseguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f11_fichaseguimiento` (
  `IdF11` int(11) NOT NULL AUTO_INCREMENT,
  `NumSeguimiento` int(11) NOT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdF11`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f11_fichaseguimiento`
--

LOCK TABLES `f11_fichaseguimiento` WRITE;
/*!40000 ALTER TABLE `f11_fichaseguimiento` DISABLE KEYS */;
INSERT INTO `f11_fichaseguimiento` VALUES
(1,1,'Contacto telefónico y visita de verificación'),
(2,1,'Monitoreo Telefónico y Visita a Domicilio'),
(3,2,'I.E. Primaria N° 14352 - Sapillica'),
(4,1,'Comisaría Sectorial de Sapillica'),
(5,3,'Sede Central DEMUNA Sapillica');
/*!40000 ALTER TABLE `f11_fichaseguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f1_fichareg`
--

DROP TABLE IF EXISTS `f1_fichareg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f1_fichareg` (
  `IdF1` int(11) NOT NULL AUTO_INCREMENT,
  `AtencionPrevia` varchar(10) DEFAULT NULL,
  `DetalleAtencion` text DEFAULT NULL,
  `ResumenHecho` text DEFAULT NULL,
  `AccionArealizar` text DEFAULT NULL,
  PRIMARY KEY (`IdF1`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f1_fichareg`
--

LOCK TABLES `f1_fichareg` WRITE;
/*!40000 ALTER TABLE `f1_fichareg` DISABLE KEYS */;
INSERT INTO `f1_fichareg` VALUES
(1,'No',NULL,'Madre solicita apoyo por incumplimiento de pensión de alimentos.','Citar a las partes para audiencia de conciliación extrajudicial.'),
(2,'No','Primera vez que acude a la Defensoría Municipal','Madre solicita apertura de caso de alimentos y tenencia. El padre labora en Piura y envía montos irregulares e insuficientes para la manutención de sus dos menores hijos.','Calificación, apertura de expediente y citación a primera audiencia conciliatoria.'),
(3,'Sí','Atendido anteriormente en Juzgado de Paz de Sapillica','Se reporta presunto caso de deserción escolar involuntaria de adolescente de 13 años debido a labores agrícolas en caserío El Sauce.','Coordinación con UGEL, dirección del colegio y visita sociofamiliar preventiva.'),
(4,'No','Derivado por posta médica del Centro de Salud de Sapillica','Madre adolescente acude solicitando apoyo legal para inscripción extemporánea de nacimiento y filiación paterna de su recién nacido.','Asesoría jurídica y coordinación interinstitucional con RENIEC y DEMUNA provincial.'),
(5,'Sí','Audiencia previa en DEMUNA en año anterior','Incumplimiento reincidente del régimen de visitas y amenazas verbales por parte del progenitor custodio al momento de la entrega de la menor.','Audiencia de avenimiento y modificación consensual de cronograma de visitas.');
/*!40000 ALTER TABLE `f1_fichareg` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f2_fichaentrevista`
--

DROP TABLE IF EXISTS `f2_fichaentrevista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f2_fichaentrevista` (
  `IdF2` int(11) NOT NULL AUTO_INCREMENT,
  `NumEntrevXexp` int(11) NOT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdF2`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f2_fichaentrevista`
--

LOCK TABLES `f2_fichaentrevista` WRITE;
/*!40000 ALTER TABLE `f2_fichaentrevista` DISABLE KEYS */;
INSERT INTO `f2_fichaentrevista` VALUES
(1,1,'Oficina DEMUNA - Consultorio de Psicología'),
(2,1,'Oficina DEMUNA - Sala de Conciliación'),
(3,2,'Oficina DEMUNA - Despacho Psicológico'),
(4,1,'I.E. Sagrado Corazón de Jesús - Sapillica'),
(5,3,'Ambiente Privado DEMUNA - Entrevista Reservada');
/*!40000 ALTER TABLE `f2_fichaentrevista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f3_fichavisita`
--

DROP TABLE IF EXISTS `f3_fichavisita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f3_fichavisita` (
  `IdF3` int(11) NOT NULL AUTO_INCREMENT,
  `NumVisitaXexp` int(11) NOT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdF3`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f3_fichavisita`
--

LOCK TABLES `f3_fichavisita` WRITE;
/*!40000 ALTER TABLE `f3_fichavisita` DISABLE KEYS */;
INSERT INTO `f3_fichavisita` VALUES
(1,1,'Caserío El Palmo - Mz. B Lt. 12'),
(2,1,'Caserío Huamba Alta s/n - Sapillica'),
(3,1,'Sector Timbes Chico - Carretera a Suyo'),
(4,2,'Barrio San Martín s/n, Distrito Sapillica'),
(5,1,'Caserío Pajonal Centro - Manzana B Lote 4');
/*!40000 ALTER TABLE `f3_fichavisita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f4_invitacion`
--

DROP TABLE IF EXISTS `f4_invitacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f4_invitacion` (
  `IdF4` int(11) NOT NULL AUTO_INCREMENT,
  `IdEvento` int(11) DEFAULT NULL,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `IdPersona` int(11) NOT NULL,
  `FechaInvitacion` date DEFAULT NULL,
  `HoraInvitacion` time DEFAULT NULL,
  `Asunto` varchar(255) DEFAULT NULL,
  `AsuntoResumen` text DEFAULT NULL,
  `Relacion3ro` varchar(100) DEFAULT NULL,
  `Dni3ro` varchar(15) DEFAULT NULL,
  `Nombre3ro` varchar(150) DEFAULT NULL,
  `FechaRecibe` date DEFAULT NULL,
  `HoraRecibe` time DEFAULT NULL,
  `TrabEntrega` varchar(150) DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  `NumeroInvitacion` int(11) DEFAULT 1,
  PRIMARY KEY (`IdF4`),
  KEY `IdEvento` (`IdEvento`),
  KEY `IdPersona` (`IdPersona`),
  CONSTRAINT `f4_invitacion_ibfk_1` FOREIGN KEY (`IdEvento`) REFERENCES `eventos` (`IdEvento`) ON DELETE SET NULL,
  CONSTRAINT `f4_invitacion_ibfk_2` FOREIGN KEY (`IdPersona`) REFERENCES `userexternos` (`IdPersona`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f4_invitacion`
--

LOCK TABLES `f4_invitacion` WRITE;
/*!40000 ALTER TABLE `f4_invitacion` DISABLE KEYS */;
INSERT INTO `f4_invitacion` VALUES
(1,2,NULL,3,'2026-11-04','10:00:00','Citación oficial para tratar materia de alimentos y tenencia del NNA','Primera Invitación a Audiencia de Conciliación Extrajudicial',NULL,NULL,NULL,NULL,NULL,'Notificador Institucional DEMUNA',NULL,1);
/*!40000 ALTER TABLE `f4_invitacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f5_invitacionconciliar`
--

DROP TABLE IF EXISTS `f5_invitacionconciliar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f5_invitacionconciliar` (
  `IdF5` int(11) NOT NULL AUTO_INCREMENT,
  `IdEvento` int(11) DEFAULT NULL,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `IdPersona` int(11) NOT NULL,
  `FechaInvitacion` date DEFAULT NULL,
  `HoraInvitacion` time DEFAULT NULL,
  `Asunto` varchar(255) DEFAULT NULL,
  `AsuntoResumen` text DEFAULT NULL,
  `Relacion3ro` varchar(100) DEFAULT NULL,
  `Dni3ro` varchar(15) DEFAULT NULL,
  `Nombre3ro` varchar(150) DEFAULT NULL,
  `FechaRecibe` date DEFAULT NULL,
  `HoraRecibe` time DEFAULT NULL,
  `TrabEntrega` varchar(150) DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  `NumeroInvitacion` int(11) DEFAULT 1,
  PRIMARY KEY (`IdF5`),
  KEY `IdEvento` (`IdEvento`),
  KEY `IdPersona` (`IdPersona`),
  CONSTRAINT `f5_invitacionconciliar_ibfk_1` FOREIGN KEY (`IdEvento`) REFERENCES `eventos` (`IdEvento`) ON DELETE SET NULL,
  CONSTRAINT `f5_invitacionconciliar_ibfk_2` FOREIGN KEY (`IdPersona`) REFERENCES `userexternos` (`IdPersona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f5_invitacionconciliar`
--

LOCK TABLES `f5_invitacionconciliar` WRITE;
/*!40000 ALTER TABLE `f5_invitacionconciliar` DISABLE KEYS */;
/*!40000 ALTER TABLE `f5_invitacionconciliar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f7_ofderivacion`
--

DROP TABLE IF EXISTS `f7_ofderivacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f7_ofderivacion` (
  `IdF7` int(11) NOT NULL AUTO_INCREMENT,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `Destinatario` varchar(150) DEFAULT NULL,
  `CargoDest` varchar(100) DEFAULT NULL,
  `InstitucionDest` varchar(150) DEFAULT NULL,
  `IdEntidad` int(11) DEFAULT NULL,
  `IdPersona` int(11) DEFAULT NULL,
  `NumOficio` int(11) DEFAULT NULL,
  `Materias` varchar(255) DEFAULT NULL,
  `OtroMotivo` varchar(255) DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  `DocumentosAdj` text DEFAULT NULL,
  PRIMARY KEY (`IdF7`),
  KEY `IdEntidad` (`IdEntidad`),
  KEY `IdPersona` (`IdPersona`),
  CONSTRAINT `f7_ofderivacion_ibfk_1` FOREIGN KEY (`IdEntidad`) REFERENCES `entidad` (`IdEntidad`) ON DELETE SET NULL,
  CONSTRAINT `f7_ofderivacion_ibfk_2` FOREIGN KEY (`IdPersona`) REFERENCES `userexternos` (`IdPersona`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f7_ofderivacion`
--

LOCK TABLES `f7_ofderivacion` WRITE;
/*!40000 ALTER TABLE `f7_ofderivacion` DISABLE KEYS */;
INSERT INTO `f7_ofderivacion` VALUES
(1,NULL,'Dra. Patricia Silva Mendoza','Fiscal Provincial de Familia','Ministerio Público - Fiscalía de la Nación',NULL,NULL,NULL,NULL,NULL,'Remisión de informe social para fines de homologación y cautela de derechos del menor.',NULL);
/*!40000 ALTER TABLE `f7_ofderivacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f8a_acta1rainasistencia`
--

DROP TABLE IF EXISTS `f8a_acta1rainasistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f8a_acta1rainasistencia` (
  `IdF8A` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `SegundaFechaCita` date DEFAULT NULL,
  `SegundaHoraCita` time DEFAULT NULL,
  `IdAsistio` int(11) DEFAULT NULL,
  `ParteNoAsistio` varchar(50) DEFAULT NULL,
  `IdNoAsistio` int(11) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  `IdEvento` int(11) DEFAULT NULL,
  PRIMARY KEY (`IdF8A`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `f8a_acta1rainasistencia_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f8a_acta1rainasistencia`
--

LOCK TABLES `f8a_acta1rainasistencia` WRITE;
/*!40000 ALTER TABLE `f8a_acta1rainasistencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `f8a_acta1rainasistencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f8b_acta2dainasistencia`
--

DROP TABLE IF EXISTS `f8b_acta2dainasistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f8b_acta2dainasistencia` (
  `IdF8B` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `IdAsistio` int(11) DEFAULT NULL,
  `ParteNoAsistio` varchar(50) DEFAULT NULL,
  `IdNoAsistio` int(11) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  PRIMARY KEY (`IdF8B`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `f8b_acta2dainasistencia_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f8b_acta2dainasistencia`
--

LOCK TABLES `f8b_acta2dainasistencia` WRITE;
/*!40000 ALTER TABLE `f8b_acta2dainasistencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `f8b_acta2dainasistencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f8c_actainasistenciaambos`
--

DROP TABLE IF EXISTS `f8c_actainasistenciaambos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f8c_actainasistenciaambos` (
  `IdF8C` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `TelefonoDna` varchar(20) DEFAULT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  PRIMARY KEY (`IdF8C`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `f8c_actainasistenciaambos_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f8c_actainasistenciaambos`
--

LOCK TABLES `f8c_actainasistenciaambos` WRITE;
/*!40000 ALTER TABLE `f8c_actainasistenciaambos` DISABLE KEYS */;
/*!40000 ALTER TABLE `f8c_actainasistenciaambos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f9a_actaconciliacion`
--

DROP TABLE IF EXISTS `f9a_actaconciliacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f9a_actaconciliacion` (
  `IdF9A` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `ExisTestigo` varchar(10) DEFAULT NULL,
  `NyATestigo` varchar(150) DEFAULT NULL,
  `DniTestigo` varchar(15) DEFAULT NULL,
  `DomicilioTest` varchar(255) DEFAULT NULL,
  `CalidTestigo` varchar(100) DEFAULT NULL,
  `TestigoDe` int(11) DEFAULT NULL,
  `HechosConciliacion` text DEFAULT NULL,
  `Materias` varchar(255) DEFAULT NULL,
  `PuntosControversia` text DEFAULT NULL,
  `TipoAcuerdo` varchar(50) DEFAULT NULL,
  `TermyCond` text DEFAULT NULL,
  `AccionesDna` text DEFAULT NULL,
  `RegistroAbogado` varchar(50) DEFAULT NULL,
  `ColegioAbogados` varchar(100) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  PRIMARY KEY (`IdF9A`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `f9a_actaconciliacion_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f9a_actaconciliacion`
--

LOCK TABLES `f9a_actaconciliacion` WRITE;
/*!40000 ALTER TABLE `f9a_actaconciliacion` DISABLE KEYS */;
INSERT INTO `f9a_actaconciliacion` VALUES
(3,3,NULL,NULL,NULL,'Marlene Peña Castillo','02849102',NULL,NULL,NULL,'Las partes solicitante y citada comparecen ante la DEMUNA manifestando su voluntad de arribar a una solución pacífica en beneficio de sus menores hijos.','Alimentos, Régimen de Visitas y Tenencia','Fijación de pensión alimenticia mensual, días de visitas con externamiento y custodia a favor de la madre.','Acuerdo Total','El obligado abonará la suma de S/. 350.00 nuevos soles mensuales dentro de los primeros cinco días de cada mes. El régimen de visitas se desarrollará los días sábados de 09:00 a 18:00 horas.','Homologación y seguimiento continuo por parte de la DEMUNA.','CALL-48921','Colegio de Abogados de Piura','01:12:47');
/*!40000 ALTER TABLE `f9a_actaconciliacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f9b_acdesistimiento`
--

DROP TABLE IF EXISTS `f9b_acdesistimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f9b_acdesistimiento` (
  `IdF9B` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  `Motivo` text DEFAULT NULL,
  PRIMARY KEY (`IdF9B`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f9b_acdesistimiento`
--

LOCK TABLES `f9b_acdesistimiento` WRITE;
/*!40000 ALTER TABLE `f9b_acdesistimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `f9b_acdesistimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f9c_acsuspension`
--

DROP TABLE IF EXISTS `f9c_acsuspension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f9c_acsuspension` (
  `IdF9C` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  `Motivo` text DEFAULT NULL,
  `NuevaFecha` date DEFAULT NULL,
  `NuevaHora` time DEFAULT NULL,
  PRIMARY KEY (`IdF9C`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f9c_acsuspension`
--

LOCK TABLES `f9c_acsuspension` WRITE;
/*!40000 ALTER TABLE `f9c_acsuspension` DISABLE KEYS */;
/*!40000 ALTER TABLE `f9c_acsuspension` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `f9d_acdecisionmtv`
--

DROP TABLE IF EXISTS `f9d_acdecisionmtv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `f9d_acdecisionmtv` (
  `IdF9D` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `IdSolicitante` int(11) DEFAULT NULL,
  `IdTransgresor` int(11) DEFAULT NULL,
  `HoraActa` time DEFAULT NULL,
  `MotivoNoAcuerdo` text DEFAULT NULL,
  PRIMARY KEY (`IdF9D`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `f9d_acdecisionmtv`
--

LOCK TABLES `f9d_acdecisionmtv` WRITE;
/*!40000 ALTER TABLE `f9d_acdecisionmtv` DISABLE KEYS */;
/*!40000 ALTER TABLE `f9d_acdecisionmtv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ficha_estadistica_anual`
--

DROP TABLE IF EXISTS `ficha_estadistica_anual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ficha_estadistica_anual` (
  `IdFEA` int(11) NOT NULL AUTO_INCREMENT,
  `anio` int(11) NOT NULL,
  `telefono_dna` varchar(20) DEFAULT NULL,
  `email_dna` varchar(100) DEFAULT NULL,
  `prom_padres` int(11) DEFAULT 0,
  `prom_madres` int(11) DEFAULT 0,
  `prom_cuidadores` int(11) DEFAULT 0,
  `datos_json` longtext DEFAULT NULL,
  `FechaCreacion` date DEFAULT NULL,
  `HoraCreacion` time DEFAULT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdFEA`),
  UNIQUE KEY `anio` (`anio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ficha_estadistica_anual`
--

LOCK TABLES `ficha_estadistica_anual` WRITE;
/*!40000 ALTER TABLE `ficha_estadistica_anual` DISABLE KEYS */;
/*!40000 ALTER TABLE `ficha_estadistica_anual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_busqueda`
--

DROP TABLE IF EXISTS `logs_busqueda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_busqueda` (
  `IdLog` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) DEFAULT NULL,
  `TerminoBusqueda` varchar(255) DEFAULT NULL,
  `DuracionSegundos` decimal(6,4) DEFAULT 0.0000,
  `FechaHora` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`IdLog`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_busqueda`
--

LOCK TABLES `logs_busqueda` WRITE;
/*!40000 ALTER TABLE `logs_busqueda` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_busqueda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `IdNotificacion` int(11) NOT NULL AUTO_INCREMENT,
  `IdEvento` int(11) DEFAULT NULL,
  `IdExpediente` int(11) DEFAULT NULL,
  `IdPersonaInvolucrada` int(11) DEFAULT NULL,
  `Titulo` varchar(150) NOT NULL,
  `Mensaje` text DEFAULT NULL,
  `FechaProgramada` date NOT NULL,
  `HoraProgramada` time DEFAULT NULL,
  `Estado` varchar(20) DEFAULT 'Activa',
  `EstadoToast` varchar(20) DEFAULT 'Pendiente',
  `Tipo` varchar(50) DEFAULT 'General',
  `Prioridad` varchar(20) DEFAULT 'Media',
  `CreatedAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`IdNotificacion`),
  KEY `IdEvento` (`IdEvento`),
  KEY `IdExpediente` (`IdExpediente`),
  KEY `IdPersonaInvolucrada` (`IdPersonaInvolucrada`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`IdEvento`) REFERENCES `eventos` (`IdEvento`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes` (`IdExpediente`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_ibfk_3` FOREIGN KEY (`IdPersonaInvolucrada`) REFERENCES `userexternos` (`IdPersona`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES
(1,3,1,3,'Audiencia de Conciliación programada','Se programó: Audiencia formal de alimentos y régimen de visitas del NNA. para el 2026-11-12 a las 10:30:00.','2026-11-12','10:30:00','Activa','Pendiente','Audiencia','Alta','2026-11-11 06:36:20'),
(2,4,1,3,'Visita Domiciliaria / De Campo programada','Se programó: Verificación in situ de las condiciones habitacionales y entorno del menor. para el 2026-11-16 a las 15:00:00.','2026-11-16','15:00:00','Activa','Pendiente','Visita','Media','2026-11-11 06:36:20'),
(3,5,1,3,'Entrevista Psicológica / Social programada','Se programó: Evaluación y contención psicológica especializada al NNA. para el 2026-11-18 a las 11:00:00.','2026-11-18','11:00:00','Activa','Pendiente','Entrevista','Media','2026-11-11 06:36:20'),
(4,6,1,3,'Actividad de Difusión Comunitaria programada','Se programó: Taller sobre deberes y derechos de la niñez en I.E. local. para el 2026-11-20 a las 09:00:00.','2026-11-20','09:00:00','Activa','Pendiente','Actividad','Informativa','2026-11-11 06:36:20'),
(5,NULL,1,NULL,'Vencimiento de PensiÃ³n de Alimentos','La cuota de pensiÃ³n fijada en Acta NÂ° 001-2026 para el menor se encuentra prÃ³xima a vencer en 3 dÃ­as.','2026-11-14','08:00:00','Activa','Pendiente','PensiÃ³n','Alta','2026-11-11 06:36:49'),
(6,NULL,1,NULL,'Ficha F11 de Seguimiento Pendiente','Se debe verificar el cumplimiento del compromiso de asistencia escolar del NNA registrado en el caso.','2026-11-15','09:30:00','Activa','Pendiente','Seguimiento','Media','2026-11-11 06:36:49'),
(7,NULL,1,NULL,'Aviso de NotificaciÃ³n a Citado','CÃ©dula de notificaciÃ³n F-04 entregada bajo puerta al obligado principal. Se espera confirmaciÃ³n de recepciÃ³n.','2026-11-11','16:00:00','Activa','Pendiente','NotificaciÃ³n','Alta','2026-11-11 06:36:49'),
(8,NULL,NULL,NULL,'Copia de Seguridad y Respaldo Semanal','El respaldo programado de la base de datos institucional DEMUNA se completÃ³ satisfactoriamente.','2026-11-10','23:00:00','Leida','Mostrado','Sistema','Informativa','2026-11-11 06:36:49'),
(9,NULL,2,5,'Audiencia de Conciliación Programada','Audiencia de alimentos para el expediente 001-2026 fijada para mañana.','2026-11-12','10:00:00','Activa','Pendiente','Audiencia','Alta','2026-11-11 11:21:37'),
(10,NULL,3,5,'Visita Domiciliaria de Inspección','Visita ocular programada en el Caserío Coletas para verificar entorno de NNA.','2026-11-13','11:30:00','Activa','Pendiente','Visita','Media','2026-11-11 11:21:37'),
(11,NULL,5,5,'Entrevista Psicológica al Menor','Cita psicológica agendada con la Lic. Valeria Sánchez para evaluación socioemocional.','2026-11-14','09:00:00','Activa','Pendiente','Entrevista','Informativa','2026-11-11 11:21:37'),
(12,NULL,6,5,'Recordatorio: Cuota de Alimentos del Mes','Vencimiento de cuota mensual de S/ 450.00 a favor del menor tutelado.','2026-11-15','12:00:00','Activa','Pendiente','Pensión','Alta','2026-11-11 11:21:37'),
(13,NULL,7,5,'Segunda Invitación a Conciliar Enviada','Cédula N° 02 entregada con apercibimiento legal para la audiencia de conciliación.','2026-11-16','10:30:00','Activa','Pendiente','Notificación','Alta','2026-11-11 11:21:37'),
(14,NULL,8,5,'Ficha de Seguimiento F11 Semestral','Corresponde realizar verificación presencial del cumplimiento del acuerdo escolar.','2026-11-17','14:00:00','Activa','Pendiente','Seguimiento','Media','2026-11-11 11:21:37'),
(15,NULL,9,5,'Taller de Difusión de Derechos','Actividad comunitaria en I.E. Local programada para padres y tutores.','2026-11-18','09:00:00','Activa','Pendiente','Sistema','Informativa','2026-11-11 11:21:37'),
(16,NULL,10,5,'Oficio de Derivación Remitido a Fiscalía','Expediente 008-2026 remitido a Fiscalía Provincial por indicios de violencia.','2026-11-10','16:00:00','Leida','Pendiente','Sistema','Alta','2026-11-11 11:21:37'),
(17,NULL,2,5,'Pago de Pensión de Alimentos Registrado','Se confirmó el depósito de S/ 400.00 correspondiente al mes de octubre.','2026-11-05','09:15:00','Leida','Pendiente','Pensión','Informativa','2026-11-11 11:21:37'),
(18,NULL,3,5,'Cédula de Notificación N° 08 Entregada','Notificación entregada bajo puerta con constancia policial respectiva.','2026-11-08','15:20:00','Leida','Pendiente','Notificación','Media','2026-11-11 11:21:37'),
(19,NULL,2,5,'Audiencia Conciliatoria Concluida con Éxito','Acta F9A N° 012 firmada a entera satisfacción por ambas partes.','2026-11-04','12:30:00','Leida','Pendiente','Audiencia','Media','2026-11-11 11:21:37'),
(20,NULL,5,5,'Visita Domiciliaria Ejecutada sin Novedad','Inspección ocular realizada satisfactoriamente por el equipo de campo.','2026-11-02','14:40:00','Leida','Pendiente','Visita','Informativa','2026-11-11 11:21:37'),
(21,NULL,2,5,'Nuevo Expediente Ingresado por Mesa de Partes','Solicitud de alimentos de doña María Luisa Jiménez asignada a trámite.','2026-11-01','08:30:00','Leida','Pendiente','Sistema','Informativa','2026-11-11 11:21:37'),
(22,NULL,5,5,'Alerta de Vencimiento de Plazo Legal','Plazo de 3 días para emisión de segunda citación en el caso 003-2026.','2026-11-11','10:00:00','Activa','Pendiente','Audiencia','Alta','2026-11-11 11:21:37');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_realizados`
--

DROP TABLE IF EXISTS `pagos_realizados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_realizados` (
  `IdPago` int(11) NOT NULL AUTO_INCREMENT,
  `IdEvento` int(11) DEFAULT NULL,
  `IdExpediente` int(11) NOT NULL,
  `IdPersona` int(11) NOT NULL,
  `NumPago` int(11) NOT NULL,
  `Monto` decimal(10,2) NOT NULL,
  `MontoPagado` decimal(10,2) DEFAULT NULL,
  `FechaProgramada` date NOT NULL,
  `FechaPago` date DEFAULT NULL,
  `EstadoPago` varchar(30) DEFAULT 'Pendiente',
  PRIMARY KEY (`IdPago`),
  KEY `IdEvento` (`IdEvento`),
  KEY `IdExpediente` (`IdExpediente`),
  KEY `IdPersona` (`IdPersona`),
  CONSTRAINT `pagos_realizados_ibfk_1` FOREIGN KEY (`IdEvento`) REFERENCES `eventos` (`IdEvento`) ON DELETE CASCADE,
  CONSTRAINT `pagos_realizados_ibfk_2` FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes` (`IdExpediente`) ON DELETE CASCADE,
  CONSTRAINT `pagos_realizados_ibfk_3` FOREIGN KEY (`IdPersona`) REFERENCES `userexternos` (`IdPersona`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_realizados`
--

LOCK TABLES `pagos_realizados` WRITE;
/*!40000 ALTER TABLE `pagos_realizados` DISABLE KEYS */;
INSERT INTO `pagos_realizados` VALUES
(1,1,1,3,1,350.00,NULL,'2026-12-04',NULL,'Próximo Pago'),
(2,1,1,3,2,350.00,NULL,'2027-01-04',NULL,'Pendiente'),
(3,1,1,3,3,350.00,NULL,'2027-02-04',NULL,'Pendiente'),
(4,1,1,3,4,350.00,NULL,'2027-03-04',NULL,'Pendiente'),
(5,1,1,3,5,350.00,NULL,'2027-04-04',NULL,'Pendiente'),
(6,1,1,3,6,350.00,NULL,'2027-05-04',NULL,'Pendiente'),
(7,NULL,2,6,1,400.00,400.00,'2026-05-05','2026-05-04','Pagado'),
(8,NULL,2,6,2,400.00,400.00,'2026-06-05','2026-06-05','Pagado'),
(9,NULL,2,6,3,400.00,400.00,'2026-07-05','2026-07-03','Pagado'),
(10,NULL,3,6,4,450.00,450.00,'2026-06-10','2026-06-09','Pagado'),
(11,NULL,3,6,5,450.00,450.00,'2026-07-10','2026-07-10','Pagado'),
(12,NULL,5,6,6,350.00,350.00,'2026-07-15','2026-07-14','Pagado'),
(13,NULL,5,6,7,350.00,350.00,'2026-08-15','2026-08-15','Pagado'),
(14,NULL,6,6,8,500.00,500.00,'2026-08-05','2026-08-04','Pagado'),
(15,NULL,6,6,9,500.00,500.00,'2026-09-05','2026-09-05','Pagado'),
(16,NULL,7,6,10,420.00,420.00,'2026-09-10','2026-09-08','Pagado'),
(17,NULL,7,6,11,420.00,420.00,'2026-10-10','2026-10-09','Pagado'),
(18,NULL,2,6,12,400.00,400.00,'2026-10-05','2026-10-05','Pagado'),
(19,NULL,2,6,13,400.00,400.00,'2026-11-05','2026-11-04','Pagado'),
(20,NULL,3,6,14,450.00,450.00,'2026-11-10','2026-11-09','Pagado');
/*!40000 ALTER TABLE `pagos_realizados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `token` varchar(100) NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `token` (`token`),
  KEY `code` (`code`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
INSERT INTO `password_resets` VALUES
(1,3,'datossistema@popydev.com','703f587cb1eedd985ecf9925c8e8e30af685f236e4a3c97a4b0fbb7a57667115','854937','2026-11-10 05:10:13','2026-11-10 00:25:13',0),
(2,3,'datossistema@popydev.com','16521c9b541072d6efbb77eae0499473b6c642e70d2d750451869ccc6ea00cdb','672514','2026-11-10 00:11:20','2026-11-10 00:26:20',1),
(3,3,'datossistema@popydev.com','0396748dbc33b80ac3221f7131c44cf54cb607e7057a877d0a9f5e72aa26137a','132334','2026-11-10 00:12:09','2026-11-10 00:27:09',1);
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroinfo`
--

DROP TABLE IF EXISTS `registroinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroinfo` (
  `IdRegInfo` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `IdPersona` int(11) NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `unidad_edad` varchar(20) DEFAULT NULL,
  `MotivoOrientacion` text NOT NULL,
  `IdTrabajador` int(11) NOT NULL,
  PRIMARY KEY (`IdRegInfo`),
  KEY `IdPersona` (`IdPersona`),
  KEY `IdTrabajador` (`IdTrabajador`),
  CONSTRAINT `registroinfo_ibfk_1` FOREIGN KEY (`IdPersona`) REFERENCES `userexternos` (`IdPersona`) ON DELETE CASCADE,
  CONSTRAINT `registroinfo_ibfk_2` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroinfo`
--

LOCK TABLES `registroinfo` WRITE;
/*!40000 ALTER TABLE `registroinfo` DISABLE KEYS */;
INSERT INTO `registroinfo` VALUES
(1,'2026-11-11',4,NULL,'año','Consulta sobre trámite de filiación y reconocimiento voluntario extramatrimonial sin conflicto.',3),
(2,'2026-11-10',1,32,'año','Ciudadana solicita orientación legal sobre proceso extrajudicial de pensión alimenticia y requisitos para solicitar audiencia conciliatoria formal.',1),
(3,'2026-11-06',2,27,'año','Consulta sobre trámite de duplicado y rectificación de partida de nacimiento para su menor hijo en coordinación con el Registro Civil Municipal.',2),
(4,'2026-11-02',3,45,'año','Padre de familia acude a consultar procedimiento para regularizar el régimen de visitas acordado de palabra sin formalización previa.',3),
(5,'2026-10-29',4,38,'año','Madre solicita pautas legales para denuncia por desprotección familiar ante el juzgado mixto provincial.',5),
(6,'2026-10-25',5,22,'año','Joven solicita asesoría para cobro de asignación familiar y liquidación de devengados de pensión alimenticia de su hermano menor.',6);
/*!40000 ALTER TABLE `registroinfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relacionesuserexp`
--

DROP TABLE IF EXISTS `relacionesuserexp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `relacionesuserexp` (
  `IdRelacion` int(11) NOT NULL AUTO_INCREMENT,
  `IdExpediente` int(11) NOT NULL,
  `IdPersona` int(11) DEFAULT NULL,
  `IdEntidad` int(11) DEFAULT NULL,
  `SubRol_Inf` varchar(50) DEFAULT NULL,
  `RelacionConNNA` varchar(100) DEFAULT NULL,
  `IdRolPersona` int(11) DEFAULT NULL,
  `Edad` int(11) DEFAULT NULL,
  `unidad_edad` varchar(20) DEFAULT NULL,
  `Gestante` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`IdRelacion`),
  KEY `IdExpediente` (`IdExpediente`),
  KEY `IdPersona` (`IdPersona`),
  KEY `IdEntidad` (`IdEntidad`),
  CONSTRAINT `relacionesuserexp_ibfk_1` FOREIGN KEY (`IdExpediente`) REFERENCES `expedientes` (`IdExpediente`) ON DELETE CASCADE,
  CONSTRAINT `relacionesuserexp_ibfk_2` FOREIGN KEY (`IdPersona`) REFERENCES `userexternos` (`IdPersona`) ON DELETE CASCADE,
  CONSTRAINT `relacionesuserexp_ibfk_3` FOREIGN KEY (`IdEntidad`) REFERENCES `entidad` (`IdEntidad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relacionesuserexp`
--

LOCK TABLES `relacionesuserexp` WRITE;
/*!40000 ALTER TABLE `relacionesuserexp` DISABLE KEYS */;
INSERT INTO `relacionesuserexp` VALUES
(1,1,1,NULL,'Informante','Madre',1,NULL,'año','No'),
(2,1,2,NULL,NULL,'Hijo(a)',3,12,'año','No'),
(3,1,3,NULL,NULL,'Padre',2,NULL,'año','No'),
(4,2,5,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(5,2,6,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(6,2,7,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(7,3,8,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(8,3,9,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(9,3,10,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(10,5,11,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(11,5,12,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(12,5,13,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(13,6,14,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(14,6,15,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(15,6,16,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(16,7,17,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(17,7,18,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(18,7,19,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(19,8,20,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(20,8,21,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(21,8,22,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(22,9,23,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(23,9,24,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(24,9,25,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(25,10,26,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(26,10,27,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(27,10,28,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(28,11,29,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(29,11,30,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(30,11,31,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(31,12,5,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(32,12,6,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(33,12,7,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(34,13,8,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(35,13,9,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(36,13,10,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(37,14,11,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(38,14,12,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(39,14,13,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(40,15,14,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(41,15,15,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(42,15,16,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL),
(43,16,17,NULL,NULL,'Madre',1,NULL,NULL,NULL),
(44,16,18,NULL,NULL,'Padre',2,NULL,NULL,NULL),
(45,16,19,NULL,NULL,'Hijo/Hija',3,NULL,NULL,NULL);
/*!40000 ALTER TABLE `relacionesuserexp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `IdRol` int(11) NOT NULL AUTO_INCREMENT,
  `NombreRol` varchar(50) NOT NULL,
  PRIMARY KEY (`IdRol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES
(1,'Desarrollador'),
(2,'Admin'),
(3,'Trabajador');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipoentidad`
--

DROP TABLE IF EXISTS `tipoentidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipoentidad` (
  `IdTipoEntidad` int(11) NOT NULL AUTO_INCREMENT,
  `NombreTipo` varchar(100) NOT NULL,
  PRIMARY KEY (`IdTipoEntidad`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipoentidad`
--

LOCK TABLES `tipoentidad` WRITE;
/*!40000 ALTER TABLE `tipoentidad` DISABLE KEYS */;
INSERT INTO `tipoentidad` VALUES
(1,'PolicÃ­a Nacional del PerÃº'),
(2,'Sector Salud'),
(3,'Municipalidades'),
(4,'Registro Civil'),
(5,'Sector EducaciÃ³n'),
(6,'Unidad de ProtecciÃ³n Especial'),
(7,'Organizaciones Comunales'),
(8,'Otros'),
(9,'INABIF'),
(10,'Centro de Emergencia Mujer'),
(11,'Juzgados');
/*!40000 ALTER TABLE `tipoentidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_actas`
--

DROP TABLE IF EXISTS `tipos_actas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_actas` (
  `IdTipoActa` int(11) NOT NULL,
  `NombreTipoActa` varchar(100) NOT NULL,
  PRIMARY KEY (`IdTipoActa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_actas`
--

LOCK TABLES `tipos_actas` WRITE;
/*!40000 ALTER TABLE `tipos_actas` DISABLE KEYS */;
INSERT INTO `tipos_actas` VALUES
(1,'Ficha de RecepciÃ³n de Casos'),
(2,'Ficha de Entrevista'),
(3,'Ficha de Visita'),
(4,'InvitaciÃ³n'),
(5,'InvitaciÃ³n a Conciliar'),
(8,'Oficio de DerivaciÃ³n'),
(9,'Acta de 1ra Inasistencia'),
(10,'Acta de 2da Inasistencia'),
(11,'Acta de Inasistencia de Ambas Partes'),
(12,'Acta de ConciliaciÃ³n'),
(13,'Acta de Desistimiento'),
(14,'Acta de SuspensiÃ³n de Audiencia'),
(15,'Acta de DecisiÃ³n Motivada'),
(16,'Acta de Compromiso'),
(17,'Ficha de Seguimiento');
/*!40000 ALTER TABLE `tipos_actas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trabajadores`
--

DROP TABLE IF EXISTS `trabajadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `trabajadores` (
  `IdTrabajador` int(11) NOT NULL AUTO_INCREMENT,
  `Nombres` varchar(100) NOT NULL,
  `Apellidos` varchar(100) NOT NULL,
  `DNI` varchar(8) NOT NULL,
  `NumTelef` varchar(15) DEFAULT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `FechaRegistro` datetime DEFAULT current_timestamp(),
  `Cargo` varchar(120) DEFAULT 'Especialista DEMUNA',
  PRIMARY KEY (`IdTrabajador`),
  UNIQUE KEY `DNI` (`DNI`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trabajadores`
--

LOCK TABLES `trabajadores` WRITE;
/*!40000 ALTER TABLE `trabajadores` DISABLE KEYS */;
INSERT INTO `trabajadores` VALUES
(1,'Admin','Desarrollador','11111111','999999991','dev@demuna.gob.pe','2026-11-03 16:35:33','Desarrollador de Sistemas'),
(2,'Coordinador','DEMUNA Zapillica','22222222','999999992','admin@demuna.gob.pe','2026-11-03 16:35:33','Coordinador General DEMUNA'),
(3,'Especialista','Defensor DEMUNA','33333333','999999993','datossistema@popydev.com','2026-11-03 16:35:33','Defensor / Especialista Legal'),
(5,'Dra. Carmen','Rosas Mendoza','41234567','971234561','crosas@demuna.gob.pe','2026-11-11 11:18:39','Abogada Conciliadora Extrajudicial'),
(6,'Lic. Valeria','Sánchez Palacios','42345678','972345672','vsanchez@demuna.gob.pe','2026-11-11 11:18:39','Psicóloga Especialista Infanto-Juvenil'),
(7,'Lic. Martha','Quispe Huamán','43456789','973456783','mquispe@demuna.gob.pe','2026-11-11 11:18:39','Trabajadora Social de Campo'),
(8,'Abog. Roberto','Gómez Farfán','44567890','974567894','rgomez@demuna.gob.pe','2026-11-11 11:18:40','Asistente Legal de Conciliaciones'),
(9,'Sra. Rosa','Chávez Villegas','45678901','975678905','rchavez@demuna.gob.pe','2026-11-11 11:18:40','Responsable de Mesa de Partes'),
(10,'Sr. Carlos','Benítez Prado','46789012','976789016','cbenitez@demuna.gob.pe','2026-11-11 11:18:40','Notificador y Verificador Domiciliario'),
(11,'Dra. Ana Lucía','Torres Vega','47890123','977890127','atorres@demuna.gob.pe','2026-11-11 11:18:40','Especialista en Protección y Familia'),
(12,'Lic. Pedro','Guerrero Silva','48901234','978901238','pguerrero@demuna.gob.pe','2026-11-11 11:18:40','Promotor Comunitario y Talleres'),
(13,'Abog. Daniel','Alvarado Ramos','49012345','979012349','dalvarado@demuna.gob.pe','2026-11-11 11:18:40','Asesor Legal Adscrito'),
(14,'Srta. Sofía','Morales Medina','50123456','980123450','smorales@demuna.gob.pe','2026-11-11 11:18:40','Secretaria de Dirección y Archivo Central'),
(15,'Lic. Javier','Navarro Ríos','51234567','981234561','jnavarro@demuna.gob.pe','2026-11-11 11:18:40','Consejero Familiar');
/*!40000 ALTER TABLE `trabajadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userexternos`
--

DROP TABLE IF EXISTS `userexternos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `userexternos` (
  `IdPersona` int(11) NOT NULL AUTO_INCREMENT,
  `DNI` varchar(8) DEFAULT NULL,
  `FechaNac` date DEFAULT NULL,
  `sexo` varchar(15) DEFAULT NULL,
  `Nombres` varchar(100) NOT NULL,
  `Apellidos` varchar(100) NOT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  `Distrito` varchar(100) DEFAULT NULL,
  `Provincia` varchar(100) DEFAULT NULL,
  `Departamento` varchar(100) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `Discapacidad` varchar(100) DEFAULT NULL,
  `IdentidadEstado` varchar(20) DEFAULT 'TEMPORAL',
  PRIMARY KEY (`IdPersona`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userexternos`
--

LOCK TABLES `userexternos` WRITE;
/*!40000 ALTER TABLE `userexternos` DISABLE KEYS */;
INSERT INTO `userexternos` VALUES
(1,'77888778',NULL,NULL,'Aisa Fabiana','Santillana Jaen','lancones - sullana - piura',NULL,NULL,NULL,'918389768',NULL,NULL,'VALIDADA'),
(2,'88999777',NULL,'Femenino','Ugugugg','Uuyguyg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'VALIDADA'),
(3,'88997788',NULL,'Masculino','Piero Alexandro','Ruiz Ruiz','lancones - sullana - piura',NULL,NULL,NULL,'918389768',NULL,NULL,'VALIDADA'),
(4,'45892314',NULL,NULL,'Rosa María','Gómez Huamán','Av. Bolognesi 340',NULL,NULL,NULL,'968521478',NULL,NULL,'TEMPORAL'),
(5,'02891122','1992-05-14','F','María Luisa','Jiménez Castillo','Calle Comercio 124','Sapillica','Ayabaca','Piura','969112233','mjimenez@gmail.com',NULL,'TEMPORAL'),
(6,'02893344','1989-11-20','M','José Alberto','Ruiz Benítez','Jr. Bolognesi 450','Sapillica','Ayabaca','Piura','969334455','jruiz@gmail.com',NULL,'TEMPORAL'),
(7,'71890011','2018-04-10','M','Carlos Daniel','Ruiz Jiménez','Calle Comercio 124','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(8,'03124455','1994-08-22','F','Rosa Elena','Vásquez Medina','Sector El Molino s/n','Sapillica','Ayabaca','Piura','968445566','rvasquez@gmail.com',NULL,'TEMPORAL'),
(9,'03126677','1991-03-15','M','Manuel Antonio','Chávez Farfán','Av. Huancabamba 210','Sapillica','Ayabaca','Piura','968667788','mchavez@gmail.com',NULL,'TEMPORAL'),
(10,'72450022','2016-09-05','F','Luciana Belén','Chávez Vásquez','Sector El Molino s/n','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(11,'04231188','1990-12-01','F','Juana Isabel','Cordova Pintado','Caserío Coletas s/n','Sapillica','Ayabaca','Piura','967118899','jcordova@gmail.com',NULL,'TEMPORAL'),
(12,'04239900','1988-07-18','M','Héctor Raúl','Silva Guerrero','Jr. Arequipa 320','Sapillica','Ayabaca','Piura','967990011','hsilva@gmail.com',NULL,'TEMPORAL'),
(13,'73670033','2019-01-25','M','Héctor Matías','Silva Cordova','Caserío Coletas s/n','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(14,'05342211','1995-02-14','F','Diana Carolina','Paucar Neira','Calle San Martín 180','Sapillica','Ayabaca','Piura','966221144','dpaucar@gmail.com',NULL,'TEMPORAL'),
(15,'05344433','1993-10-30','M','Walter Jesús','García Peña','Jr. Libertad 540','Sapillica','Ayabaca','Piura','966443355','wgarcia@gmail.com',NULL,'TEMPORAL'),
(16,'74900044','2017-06-12','F','Valeria Nicol','García Paucar','Calle San Martín 180','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(17,'06453322','1993-06-19','F','Elena Patricia','Ramos Huamán','Sector Timbes s/n','Sapillica','Ayabaca','Piura','965332211','eramos@gmail.com',NULL,'TEMPORAL'),
(18,'06455544','1990-09-08','M','Jorge Luis','Campos Prado','Av. Tacna 112','Sapillica','Ayabaca','Piura','965554433','jcampos@gmail.com',NULL,'TEMPORAL'),
(19,'75120055','2015-11-03','M','Diego Alexander','Campos Ramos','Sector Timbes s/n','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(20,'07564433','1996-01-28','F','Karla Viviana','Mora Castillo','Jr. Grau 240','Sapillica','Ayabaca','Piura','964443322','kmora@gmail.com',NULL,'TEMPORAL'),
(21,'07566655','1992-12-14','M','Pedro Agustín','Soto Meza','Calle Real 89','Sapillica','Ayabaca','Piura','964665544','psoto@gmail.com',NULL,'TEMPORAL'),
(22,'76230066','2020-03-18','M','Thiago Gael','Soto Mora','Jr. Grau 240','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(23,'08675544','1991-04-05','F','Silvia Gladys','Montalbán Ruiz','Caserío Llicsa s/n','Sapillica','Ayabaca','Piura','963554433','smontalban@gmail.com',NULL,'TEMPORAL'),
(24,'08677766','1987-08-29','M','Víctor Hugo','Peña Carrión','Av. 28 de Julio 402','Sapillica','Ayabaca','Piura','963776655','vpena@gmail.com',NULL,'TEMPORAL'),
(25,'77340077','2014-08-14','F','Camila Sofía','Peña Montalbán','Caserío Llicsa s/n','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(26,'09786655','1997-10-11','F','Gabriela Inés','Herrera Cruz','Jr. Paita 110','Sapillica','Ayabaca','Piura','962665544','gherrera@gmail.com',NULL,'TEMPORAL'),
(27,'09788877','1994-05-23','M','Renzo Iván','Mendoza Vega','Av. Progreso 312','Sapillica','Ayabaca','Piura','962887766','rmendoza@gmail.com',NULL,'TEMPORAL'),
(28,'78450088','2021-02-09','M','Liam Mateo','Mendoza Herrera','Jr. Paita 110','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL'),
(29,'10897766','1995-09-17','F','Lorena Beatriz','Villegas Soto','Sector Masías s/n','Sapillica','Ayabaca','Piura','961776655','lvillegas@gmail.com',NULL,'TEMPORAL'),
(30,'10899988','1990-01-30','M','Óscar Eduardo','Paredes Loja','Calle Amazonas 67','Sapillica','Ayabaca','Piura','961998877','oparedes@gmail.com',NULL,'TEMPORAL'),
(31,'79560099','2016-12-21','F','Mia Valentina','Paredes Villegas','Sector Masías s/n','Sapillica','Ayabaca','Piura','','',NULL,'TEMPORAL');
/*!40000 ALTER TABLE `userexternos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarioslg`
--

DROP TABLE IF EXISTS `usuarioslg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarioslg` (
  `IdLogin` int(11) NOT NULL AUTO_INCREMENT,
  `IdTrabajador` int(11) NOT NULL,
  `Contraseña` varchar(255) NOT NULL,
  `IdRol` int(11) NOT NULL,
  `UltimoInicioSesion` datetime DEFAULT NULL,
  `UltimaNotificacionToast` date DEFAULT NULL,
  `UltimaNotificacionBadge` date DEFAULT NULL,
  `Estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`IdLogin`),
  KEY `IdTrabajador` (`IdTrabajador`),
  KEY `IdRol` (`IdRol`),
  CONSTRAINT `usuarioslg_ibfk_1` FOREIGN KEY (`IdTrabajador`) REFERENCES `trabajadores` (`IdTrabajador`) ON DELETE CASCADE,
  CONSTRAINT `usuarioslg_ibfk_2` FOREIGN KEY (`IdRol`) REFERENCES `rol` (`IdRol`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarioslg`
--

LOCK TABLES `usuarioslg` WRITE;
/*!40000 ALTER TABLE `usuarioslg` DISABLE KEYS */;
INSERT INTO `usuarioslg` VALUES
(1,1,'$2y$10$Zu48TsUIg4A5nJc2dnbubuWa9m12pAbd.OxARx1i9sNkwX04gyDE2',1,'2026-11-11 10:49:14','2026-11-03',NULL,'Activo'),
(2,2,'$2y$10$Zu48TsUIg4A5nJc2dnbubuWa9m12pAbd.OxARx1i9sNkwX04gyDE2',2,'2026-11-11 16:55:02','2026-11-03',NULL,'Activo'),
(3,3,'$2y$10$TDCR9Mleeus4HnyKoUR2GOhVjbVaHyNhD5HAPzXP5z677oj6FKKwm',3,'2026-11-11 16:17:28','2026-11-03',NULL,'Activo'),
(5,5,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',2,'2026-11-11 11:18:39',NULL,NULL,'Activo'),
(6,6,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:39',NULL,NULL,'Activo'),
(7,7,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(8,8,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(9,9,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(10,10,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(11,11,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(12,12,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(13,13,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(14,14,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Activo'),
(15,15,'$2y$10$Mr1kJR9SPpujWosTwVmXPOtSHI0o49spPnAJpIiTUmbN2MkJptrxq',3,'2026-11-11 11:18:40',NULL,NULL,'Inactivo');
/*!40000 ALTER TABLE `usuarioslg` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-11 18:22:29

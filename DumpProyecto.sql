CREATE DATABASE  IF NOT EXISTS `proyecto` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `proyecto`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: proyecto
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carrito`
--

DROP TABLE IF EXISTS `carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `carrito_chk_1` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito`
--

LOCK TABLES `carrito` WRITE;
/*!40000 ALTER TABLE `carrito` DISABLE KEYS */;
/*!40000 ALTER TABLE `carrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `mecanico_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `nota` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_mecanico` (`mecanico_id`),
  CONSTRAINT `fk_citas_mecanico` FOREIGN KEY (`mecanico_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,8,7,'2025-05-06','13:53:00','holqa'),(2,8,7,'2025-05-06','13:53:00','holqa'),(3,8,7,'2025-05-21','23:07:00','hol'),(4,8,7,'2025-05-22','15:06:00','mhi'),(5,8,7,'2025-05-22','20:09:00','mhioo'),(6,8,7,'2025-05-22','20:09:00','mhiooaa'),(7,8,7,'2025-05-22','13:09:00','nose'),(8,8,7,'2025-05-21','23:46:00','gt'),(9,8,7,'2025-05-21','23:50:00','gt'),(10,8,7,'2025-05-21','16:50:00','gt'),(11,8,7,'2025-05-22','19:50:00','gta'),(12,8,7,'2025-05-20','23:55:00','aaa'),(13,8,7,'2025-05-20','23:59:00','aaa'),(14,8,7,'2025-05-23','04:17:00','sa'),(15,8,7,'2025-05-29','19:26:00','la cita de mañana paca cambio de motor'),(16,8,7,'2025-05-31','16:58:00','Cambio de llantas'),(17,8,7,'2025-05-15','16:41:00','balanceo');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compras`
--

DROP TABLE IF EXISTS `detalle_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `historial_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `historial_id` (`historial_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`historial_id`) REFERENCES `historial_compras` (`id`),
  CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compras`
--

LOCK TABLES `detalle_compras` WRITE;
/*!40000 ALTER TABLE `detalle_compras` DISABLE KEYS */;
INSERT INTO `detalle_compras` VALUES (13,10,30,3,8.75),(14,11,32,1,34.20),(15,12,37,1,95.99),(16,13,30,6,8.75);
/*!40000 ALTER TABLE `detalle_compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_compras`
--

DROP TABLE IF EXISTS `historial_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `historial_compras_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_compras`
--

LOCK TABLES `historial_compras` WRITE;
/*!40000 ALTER TABLE `historial_compras` DISABLE KEYS */;
INSERT INTO `historial_compras` VALUES (10,6,'2025-05-17 20:05:35',26.25),(11,6,'2025-05-17 20:17:05',34.20),(12,6,'2025-05-21 22:34:30',95.99),(13,6,'2025-06-03 20:05:02',52.50);
/*!40000 ALTER TABLE `historial_compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (28,'Pastillas de freno delanteras','Juego de 4 pastillas de freno para ejes delanteros, alta durabilidad y baja emisión de polvo.',45.99,20,'https://img.motor.mapfre.es/wp-content/uploads/2015/05/20140423144310_ECOWNQ.jpg'),(29,'Filtro de aceite','Filtro de aceite sintético compatible con la mayoría de motores de 4 cilindros.',12.50,35,'https://encuentraautopartes.com/cdn/shop/products/GP-149_27d5eff8-f415-4f0a-8fb1-d073e8260a58_1000x1000.jpg?v=1674237861'),(30,'Bujía de iridio','Bujía de alta eficiencia con electrodo de iridio para un mejor encendido.',8.75,41,'https://www.densoautoparts.com/wp-content/uploads/2022/10/IridiumLongLife-angle-web.png'),(31,'Correa de distribución','Kit completo de correa de distribución con tensor y rodillos para motores 1.6L.',89.00,15,'https://m.media-amazon.com/images/I/618Ns9+hKsL._AC_UF894,1000_QL80_.jpg'),(32,'Aceite de motor 5W-30 4L','Aceite sintético 100% para motores modernos, cumple API SN.',34.20,24,'https://m.media-amazon.com/images/I/618pnPEJvXL.jpg'),(33,'Filtro de aire','Filtro de aire de media alta eficiencia, protege su motor de polvo y partículas.',18.30,40,'https://static.grainger.com/rp/s/is/image/Grainger/2TCW9_AS02?$zmmain$'),(34,'Bomba de agua','Bomba de agua para sistema de refrigeración, incluye sello y rodamiento.',55.50,10,'https://www.ro-des.com/images/mecanica/bomba_agua.jpg'),(35,'Alternador 12V 90A','Alternador de reemplazo 90 amperios, con regulador incorporado.',120.00,8,'https://resources.apymsa.com.mx/imagenes/FotosSpeed/0024602/00246023a.jpg'),(37,'Batería 12V 60Ah','Batería de arranque 12V, 60Ah, libre de mantenimiento.',95.99,17,'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750112165705L.jpg'),(38,'Radiador completo','Radiador de aluminio con tanques plásticos, apto para motor 1.8L.',150.00,5,'https://http2.mlstatic.com/D_NQ_NP_891330-MLM75684379718_042024-O.webp'),(39,'Juego de limpiaparabrisas','Juego de 2 hojas de 24″ y 18″ con adaptadores universales.',22.45,30,'https://refaccionariamario.info/5634-tm_thickbox_default/juego-de-2-plumas-limpia-parabrisas-bosch-de-11-pulgadas.jpg'),(40,'Sensor de oxígeno','Sensor de oxígeno universal para sistemas de escape, mejora la eficiencia del combustible.',65.00,14,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEvMOqNgsgKSEDTuEhEP2o7JJgBEWoXw3PSQ&s'),(41,'Termostato de motor','Termostato de alta calidad para controlar la temperatura del motor.',25.00,20,'https://m.media-amazon.com/images/I/71gKmXR778L._AC_UF894,1000_QL80_.jpg'),(42,'Filtro de combustible','Filtro de combustible de alta eficiencia para sistemas de inyección.',15.75,30,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXkdVvEtzzeazD4moUoMqQkGf5qvG8hS4LqQ&s'),(43,'Lámpara halógena H7','Lámpara halógena H7 de 55W para faros delanteros.',10.50,50,'https://refaccionariamario.info/89034/16422.jpg'),(44,'Espejo retrovisor izquierdo','Espejo retrovisor izquierdo manual para vehículos compactos.',35.00,10,'https://refaccionariamario.info/117653/23930.jpg'),(45,'Filtro de cabina','Filtro de cabina para sistema de aire acondicionado, elimina polvo y polen.',12.00,25,'https://http2.mlstatic.com/D_NQ_NP_715339-MLM69738962755_052023-O-filtro-aire-acondicionado-cabina-original-nissan-versa-2019.webp'),(46,'Balatas traseras','Juego de balatas traseras de cerámica, bajo ruido y alta durabilidad.',40.00,15,'https://http2.mlstatic.com/D_NQ_NP_960743-MLM52559897112_112022-O-balatas-traseras-sprinter-2019-2022.webp'),(47,'Kit de embrague','Kit completo de embrague con disco, plato y collarín para motores 2.0L.',180.00,7,'https://http2.mlstatic.com/D_841232-MLM81366279505_122024-C.jpg'),(48,'Sensor de temperatura','Sensor de temperatura del refrigerante, compatible con múltiples modelos.',14.99,25,'https://refaccionariamario.info/21249/3182.jpg'),(49,'Aceite de transmisión ATF','Aceite para transmisiones automáticas, fricción controlada.',29.90,20,'https://refaccionariamario.info/78238-large_default/aceite-mineral-de-transmision-automatica-atf-mobil.jpg'),(50,'Bobina de encendido','Bobina de encendido para sistema DIS, alta tensión.',45.00,18,'https://mastuning.vteximg.com.br/arquivos/ids/23967708-540-540/producto-1965047.jpg?v=638551330314600000'),(51,'Polea tensora','Polea tensora con rodamiento sellado para banda serpentina.',20.75,22,'https://m.media-amazon.com/images/I/81sxAIuDerL.jpg'),(52,'Sensor de cigüeñal','Sensor de posición del cigüeñal, esencial para la sincronización.',38.60,16,'https://blog.bruck.com.mx/wp-content/uploads/2021/12/11.png'),(53,'Líquido de frenos DOT 4','Botella de 1L de líquido de frenos compatible con ABS.',9.80,40,'https://raloylubricantes.mx/wp-content/uploads/2024/07/14.webp'),(54,'Limpiador de inyectores','Aditivo para gasolina que limpia inyectores y mejora el rendimiento.',11.50,30,'https://raloylubricantes.mx/wp-content/uploads/2024/07/LIMPIADOR-DE-INYECTORES.webp'),(55,'Llantas','LLANTAS  MICHELIN CALIBRE 12',6000.00,16,'https://m.media-amazon.com/images/I/619kztxqNsL._AC_UF894,1000_QL80_.jpg');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('cliente','mecanico','administrador') DEFAULT 'cliente',
  `fondos` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `correo` (`correo`),
  CONSTRAINT `usuarios_chk_1` CHECK ((`fondos` between 0 and 999999999999))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (6,'Brian','brian@gmail.com','$2b$10$OnUqX3xNbKVKAXbdhNXWCeW./ZWGeUNqDy1ksFYpP68HXdcjDBHvy','administrador',9791.06),(7,'Juan','juan@gmail.com','$2b$10$pnLebmCXvj//uDoOutiW6.iDTMn30LuwAenw579TbtFmRfJkRHNOi','mecanico',0.00),(8,'Jesus','jesus@gmail.com','$2b$10$Ju4q.z6ri/glh9GEJWrkmOP.EUbcRn661HW7R4yJjMNkORavGr1c6','cliente',0.00),(9,'Alberto','alberto@gmail.com','$2b$10$qNDtGG.ICKmj9.UeXgvI5OD1eB5oBz7lGixEQdf7yJNXEj4GM0q..','cliente',0.00);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-03 20:32:48

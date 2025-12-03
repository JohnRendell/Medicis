-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table healthcare_db.appointment
CREATE TABLE IF NOT EXISTS `appointment` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `staff_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `appointment_time` datetime NOT NULL,
  `type` enum('online','walk-in') NOT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `FK__patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_appointment_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.appointment: ~10 rows (approximately)
DELETE FROM `appointment`;
INSERT INTO `appointment` (`appointment_id`, `status`, `staff_id`, `patient_id`, `appointment_time`, `type`) VALUES
	(1, 'scheduled', NULL, 1, '2025-11-28 17:00:39', 'online'),
	(2, 'scheduled', NULL, 2, '2025-12-01 10:00:00', 'online'),
	(12, 'scheduled', NULL, 2, '2026-05-18 14:04:00', 'online'),
	(57, 'completed', NULL, 2, '2025-12-02 20:22:36', 'online'),
	(58, 'scheduled', NULL, 2, '2025-12-11 20:44:00', 'online'),
	(59, 'scheduled', NULL, 2, '2025-12-25 20:42:00', 'online'),
	(60, 'scheduled', NULL, 2, '2025-12-04 10:51:00', 'online'),
	(61, 'completed', NULL, 2, '2025-12-05 21:49:00', 'online'),
	(62, 'completed', NULL, 2, '2025-12-03 16:40:00', 'online'),
	(63, 'scheduled', NULL, 2, '2025-12-04 10:56:00', 'online'),
	(64, 'scheduled', NULL, 2, '2025-12-04 22:58:00', 'online'),
	(65, 'scheduled', NULL, 2, '2025-12-04 15:34:00', 'online');

-- Dumping structure for table healthcare_db.billing
CREATE TABLE IF NOT EXISTS `billing` (
  `billing_id` int NOT NULL AUTO_INCREMENT,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `patient_id` int DEFAULT NULL,
  `appointment_id` int DEFAULT NULL,
  `amount_due` decimal(10,2) NOT NULL DEFAULT '500.00',
  `due_date` date DEFAULT NULL,
  `status` enum('Paid','Partially_Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  PRIMARY KEY (`billing_id`),
  KEY `patient_id` (`patient_id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `FK_billing_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`appointment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_billing_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.billing: ~0 rows (approximately)
DELETE FROM `billing`;
INSERT INTO `billing` (`billing_id`, `amount_paid`, `patient_id`, `appointment_id`, `amount_due`, `due_date`, `status`) VALUES
	(3, 0.00, 2, NULL, 500.00, NULL, 'Unpaid'),
	(4, 0.00, 2, NULL, 5000.00, '2025-12-06', 'Unpaid'),
	(5, 450.00, 2, NULL, 500.00, NULL, 'Unpaid');

-- Dumping structure for table healthcare_db.online_payment
CREATE TABLE IF NOT EXISTS `online_payment` (
  `online_payment_id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `gateway` varchar(50) NOT NULL,
  PRIMARY KEY (`online_payment_id`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `FK_online_payment_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.online_payment: ~0 rows (approximately)
DELETE FROM `online_payment`;

-- Dumping structure for table healthcare_db.patient
CREATE TABLE IF NOT EXISTS `patient` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `diagnosis` varchar(255) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `address` varchar(255) NOT NULL DEFAULT '',
  `user_id` int DEFAULT NULL,
  `sex` enum('Male','Female') NOT NULL,
  `age` int NOT NULL,
  PRIMARY KEY (`patient_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `FK_patient_user_account` FOREIGN KEY (`user_id`) REFERENCES `user_account` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.patient: ~4 rows (approximately)
DELETE FROM `patient`;
INSERT INTO `patient` (`patient_id`, `diagnosis`, `name`, `email`, `phone`, `date_of_birth`, `address`, `user_id`, `sex`, `age`) VALUES
	(1, '', 'Nigel Antipolo', 'nigelpogiako@gmail.com', '09155526780', '2025-10-15', 'Mars Earth', NULL, 'Male', 100),
	(2, '', 'pogiNigel', 'apogiako@gmail.com', '0915151515111', '2006-10-27', 'Jupiter', 11, 'Male', 19),
	(3, '', 'Juan Dela Cruzffff', 'admin@gmail.com', '09123456789', '2025-11-04', 'Juipieter', 12, 'Male', 67),
	(4, '', 'Nigel Antipolo', 'nigel@gmail.com', '08277478510', '2003-04-22', 'Sa puso mo', 13, 'Male', 22);

-- Dumping structure for table healthcare_db.payment
CREATE TABLE IF NOT EXISTS `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `method` enum('Cash','Credit Card','Online') NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `bill_id` int NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `bill_id` (`bill_id`),
  CONSTRAINT `FK_payment_billing` FOREIGN KEY (`bill_id`) REFERENCES `billing` (`billing_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.payment: ~0 rows (approximately)
DELETE FROM `payment`;

-- Dumping structure for table healthcare_db.receipt
CREATE TABLE IF NOT EXISTS `receipt` (
  `receipt_id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `issued_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`receipt_id`) USING BTREE,
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `FK_receipt_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.receipt: ~0 rows (approximately)
DELETE FROM `receipt`;

-- Dumping structure for table healthcare_db.staff
CREATE TABLE IF NOT EXISTS `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `position` enum('doctor','nurse') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `FK_staff_user_account` FOREIGN KEY (`user_id`) REFERENCES `user_account` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.staff: ~0 rows (approximately)
DELETE FROM `staff`;

-- Dumping structure for table healthcare_db.user_account
CREATE TABLE IF NOT EXISTS `user_account` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('User','Staff','Admin','Cashier') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'User',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table healthcare_db.user_account: ~1 rows (approximately)
DELETE FROM `user_account`;
INSERT INTO `user_account` (`user_id`, `username`, `password`, `role`, `created_at`) VALUES
	(11, 'admin123', '$2b$10$Z1uCwQe8YxOkVC/Vp56Qyu4WUy3HLQPuiROKvpdmzYPRwQMGIykQS', 'User', '2025-11-28 00:31:44'),
	(12, 'abcd123', '$2b$10$sH2/nRakZuntNGq0xQhJPe1zjpSEyCoWixTlC8srhlVKudDZYS1/W', 'User', '2025-11-28 07:16:34'),
	(13, 'nigel123', '$2b$10$EsUHIAd/xCF/Ovd7wGWhMeXTmatAUte81xeNZH4cODeQ6EnVOm.RO', 'Staff', '2025-12-01 16:29:24');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

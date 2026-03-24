CREATE DATABASE IF NOT EXISTS lamacop;
USE lamacop;

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services (title, description)
SELECT * FROM (
  SELECT 'Materials Testing', 'Mechanical, thermal, and chemical analysis of ceramic and polymer composites.'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO projects (title, description)
SELECT * FROM (
  SELECT 'High-Temperature Ceramic Matrix', 'Developing durable ceramic matrices for extreme thermal environments.'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

CREATE DATABASE IF NOT EXISTS moneytor;
USE moneytor;

CREATE TABLE users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT UNIQUE NOT NULL,
  name        VARCHAR(150) NOT NULL,
  category    VARCHAR(100),
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE products (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  business_id     INT NOT NULL,
  name            VARCHAR(150) NOT NULL,
  unit            VARCHAR(50),
  stock           INT DEFAULT 0,
  min_stock_alert INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  business_id      INT NOT NULL,
  product_id       INT NULL,
  type             ENUM('income','expense') NOT NULL,
  category         VARCHAR(100),
  payment_method   ENUM('cash','transfer') DEFAULT 'cash',
  amount           DECIMAL(15,2) NOT NULL,
  description      TEXT,
  transaction_date DATE NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE SET NULL
);

CREATE TABLE stock_movements (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  type       ENUM('in','out','damaged') NOT NULL,
  quantity   INT NOT NULL,
  note       TEXT,
  moved_at   DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
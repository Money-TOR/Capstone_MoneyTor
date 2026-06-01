-- Active: 1779550974509@@127.0.0.1@3306@moneytor_db
CREATE DATABASE IF NOT EXISTS moneytor_db;
USE moneytor_db;

DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS sellers;

CREATE TABLE sellers (
  id_seller         VARCHAR(50) PRIMARY KEY, 
  nama_usaha        VARCHAR(150) NOT NULL,
  jenis_usaha       VARCHAR(100) NULL DEFAULT 'Umum',
  lokasi_usaha      VARCHAR(200) NULL DEFAULT '-',
  tanggal_bergabung DATE NULL,
  email             VARCHAR(100) UNIQUE NOT NULL,
  password          VARCHAR(255) NOT NULL,
  nama_pemilik      VARCHAR(100) NULL,
  no_telepon        VARCHAR(20)  NULL,   
  jabatan           VARCHAR(100) NULL,   
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id_supplier       VARCHAR(50) PRIMARY KEY, 
  nama_supplier     VARCHAR(150) NOT NULL,
  kategori_supplier VARCHAR(100) NULL,
  lokasi            VARCHAR(200) NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id_produk            VARCHAR(50) PRIMARY KEY, 
  id_seller            VARCHAR(50) NOT NULL,    
  id_supplier          VARCHAR(50) NULL,        
  nama_produk          VARCHAR(150) NOT NULL,
  kategori_produk      VARCHAR(100) NULL,
  harga_jual           DECIMAL(15,2) DEFAULT 0 NULL,
  harga_modal          DECIMAL(15,2) DEFAULT 0 NULL,
  stok_awal            INT DEFAULT 0 NULL,      
  minimum_stok         INT DEFAULT 5 NULL,
  status_produk        ENUM('aktif','nonaktif') DEFAULT 'aktif' NULL,
  tanggal_input_produk DATE NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_seller)   REFERENCES sellers(id_seller)   ON DELETE CASCADE,
  FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier) ON DELETE SET NULL
);

CREATE TABLE transactions (
  id_transaksi      VARCHAR(50) PRIMARY KEY, 
  id_seller         VARCHAR(50) NOT NULL,    
  id_produk         VARCHAR(50) NULL,        
  tanggal           DATE NOT NULL,
  jam_transaksi     TIME DEFAULT '00:00:00' NULL,
  jenis_transaksi   VARCHAR(50) NOT NULL,    
  kategori          VARCHAR(100) NULL,
  qty               INT DEFAULT 1 NULL,
  harga_satuan      DECIMAL(15,2) DEFAULT 0 NULL,
  total_harga       DECIMAL(15,2) DEFAULT 0 NULL,   
  metode_pembayaran VARCHAR(50) DEFAULT 'cash' NULL,
  event             VARCHAR(100) NULL,               
  diskon            VARCHAR(50) DEFAULT '0' NULL,    
  status_transaksi  VARCHAR(50) DEFAULT 'selesai' NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_seller) REFERENCES sellers(id_seller)   ON DELETE CASCADE,
  FOREIGN KEY (id_produk) REFERENCES products(id_produk)  ON DELETE SET NULL
);

CREATE TABLE logs (
  id_log            VARCHAR(50) PRIMARY KEY, 
  id_produk         VARCHAR(50) NOT NULL,    
  id_seller         VARCHAR(50) NOT NULL,    
  tanggal           DATE NOT NULL,
  jenis_perubahan   VARCHAR(50) NOT NULL,  
  jumlah            INT NOT NULL,
  stok_sebelum          INT NOT NULL,            -- Catatan: mengganti nama kolom 'stok_sebelum' & 'stok_sesudah' agar aman dari typo panjang
  stok_sesudah         INT NOT NULL,            
  alasan            TEXT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_produk) REFERENCES products(id_produk) ON DELETE CASCADE,
  FOREIGN KEY (id_seller) REFERENCES sellers(id_seller)  ON DELETE CASCADE
);

-- Index performa (Tetap sama)
CREATE INDEX idx_sellers_email        ON sellers(email);
CREATE INDEX idx_products_seller      ON products(id_seller);
CREATE INDEX idx_transactions_seller  ON transactions(id_seller);
CREATE INDEX idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX idx_logs_produk          ON logs(id_produk);
CREATE INDEX idx_logs_seller          ON logs(id_seller);
CREATE DATABASE IF NOT EXISTS moneytor;
USE moneytor;

CREATE TABLE sellers (
  id_seller          INT PRIMARY KEY AUTO_INCREMENT,
  nama_usaha         VARCHAR(150) NOT NULL,
  jenis_usaha        VARCHAR(100),
  lokasi_usaha       VARCHAR(200),
  tanggal_bergabung  DATE,
  email              VARCHAR(100) UNIQUE NOT NULL,
  password           VARCHAR(255) NOT NULL,
  nama_pemilik       VARCHAR(100),

  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id_supplier        INT PRIMARY KEY AUTO_INCREMENT,
  nama_supplier      VARCHAR(150) NOT NULL,
  kategori_supplier  VARCHAR(100),
  lokasi             VARCHAR(200),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id_produk            INT PRIMARY KEY AUTO_INCREMENT,
  id_seller            INT NOT NULL,
  id_supplier          INT,
  nama_produk          VARCHAR(150) NOT NULL,
  kategori_produk      VARCHAR(100),
  harga_jual           DECIMAL(15,2) DEFAULT 0,
  harga_modal          DECIMAL(15,2) DEFAULT 0,
  stok_awal            INT DEFAULT 0,
  stok                 INT DEFAULT 0,
  minimum_stok         INT DEFAULT 0,
  status_produk        ENUM('aktif','nonaktif') DEFAULT 'aktif',
  tanggal_input_produk DATE,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_seller)   REFERENCES sellers(id_seller)   ON DELETE CASCADE,
  FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier) ON DELETE SET NULL
);

CREATE TABLE transactions (
  id_transaksi       INT PRIMARY KEY AUTO_INCREMENT,
  id_seller          INT NOT NULL,
  id_produk          INT,
  tanggal            DATE NOT NULL,
  jenis_transaksi    ENUM('pemasukan','pengeluaran') NOT NULL,
  kategori           VARCHAR(100),
  qty                INT DEFAULT 1,
  harga_satuan       DECIMAL(15,2) DEFAULT 0,
  total_harga        DECIMAL(15,2) DEFAULT 0,
  metode_pembayaran  ENUM('cash','transfer') DEFAULT 'cash',
  event              VARCHAR(100),
  diskon             DECIMAL(5,2) DEFAULT 0,
  status_transaksi   ENUM('selesai','pending','batal') DEFAULT 'selesai',
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_seller)  REFERENCES sellers(id_seller)   ON DELETE CASCADE,
  FOREIGN KEY (id_produk)  REFERENCES products(id_produk)  ON DELETE SET NULL
);

CREATE TABLE logs (
  id_log            INT PRIMARY KEY AUTO_INCREMENT,
  id_produk         INT NOT NULL,
  id_seller         INT NOT NULL,
  tanggal_log       DATE NOT NULL,
  jenis_log         ENUM('masuk','keluar','rusak','penyesuaian') NOT NULL,
  stok_sebelum      INT NOT NULL,
  stok_sesudah      INT NOT NULL,
  jumlah_perubahan  INT NOT NULL,
  keterangan        TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_produk) REFERENCES products(id_produk) ON DELETE CASCADE,
  FOREIGN KEY (id_seller) REFERENCES sellers(id_seller)  ON DELETE CASCADE
);
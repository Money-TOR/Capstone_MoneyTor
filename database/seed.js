const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables explicitly from root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../src/config/db');

// List of Indonesian SME sellers to seed
const sellersList = [
  { nama_usaha: "Warung Sembako Berkah", jenis_usaha: "Sembako", lokasi_usaha: "Jakarta Selatan", email: "sembako.berkah@example.com", nama_pemilik: "Budi Santoso" },
  { nama_usaha: "Toko Baju Trendy", jenis_usaha: "Fashion", lokasi_usaha: "Bandung", email: "baju.trendy@example.com", nama_pemilik: "Ani Wijaya" },
  { nama_usaha: "Kopi Kenangan Senja", jenis_usaha: "F&B", lokasi_usaha: "Surabaya", email: "kopi.senja@example.com", nama_pemilik: "Reza Pratama" },
  { nama_usaha: "Apotek Sehat Jaya", jenis_usaha: "Kesehatan", lokasi_usaha: "Yogyakarta", email: "apotek.sehat@example.com", nama_pemilik: "Siti Rahma" },
  { nama_usaha: "Elektronik Maju", jenis_usaha: "Elektronik", lokasi_usaha: "Medan", email: "elektronik.maju@example.com", nama_pemilik: "Hendi Wijaya" },
  { nama_usaha: "Minimarket Kita", jenis_usaha: "Sembako", lokasi_usaha: "Tangerang", email: "minimarket.kita@example.com", nama_pemilik: "Agus Setiawan" },
  { nama_usaha: "Resto Padang Selera", jenis_usaha: "F&B", lokasi_usaha: "Padang", email: "resto.padang@example.com", nama_pemilik: "Ahmad Fauzi" }
];

// List of suppliers
const suppliersList = [
  { nama_supplier: "PT Sumber Sembako", kategori_supplier: "Sembako", lokasi: "Jakarta" },
  { nama_supplier: "CV Sandang Jaya", kategori_supplier: "Fashion", lokasi: "Bandung" },
  { nama_supplier: "PT Biji Kopi Nusantara", kategori_supplier: "F&B", lokasi: "Malang" },
  { nama_supplier: "Distributor Farmasi Utama", kategori_supplier: "Kesehatan", lokasi: "Semarang" },
  { nama_supplier: "Global Elektronik Supply", kategori_supplier: "Elektronik", lokasi: "Jakarta" },
  { nama_supplier: "CV Indo Beverage", kategori_supplier: "F&B", lokasi: "Surabaya" },
  { nama_supplier: "PT Plastik Makmur", kategori_supplier: "Kemasan", lokasi: "Bekasi" },
  { nama_supplier: "Koperasi Tani Makmur", kategori_supplier: "Sembako", lokasi: "Bogor" }
];

// Product Blueprints for each seller index
const productBlueprints = {
  0: [ // Warung Sembako Berkah
    { nama_produk: "Beras Setra Ramos 5kg", kategori_produk: "Sembako", harga_modal: 65000, harga_jual: 75000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Minyak Goreng Filma 2L", kategori_produk: "Sembako", harga_modal: 32000, harga_jual: 38000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Gula Pasir Gulaku 1kg", kategori_produk: "Sembako", harga_modal: 14000, harga_jual: 17000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Teh Celup Sariwangi (isi 25)", kategori_produk: "Sembako", harga_modal: 5000, harga_jual: 7000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Indomie Goreng (Kardus)", kategori_produk: "Sembako", harga_modal: 105000, harga_jual: 120000, supplierName: "Koperasi Tani Makmur" }
  ],
  1: [ // Toko Baju Trendy
    { nama_produk: "Kaos Polos Cotton Combed 30s", kategori_produk: "Fashion", harga_modal: 35000, harga_jual: 60000, supplierName: "CV Sandang Jaya" },
    { nama_produk: "Celana Chino Slimfit", kategori_produk: "Fashion", harga_modal: 85000, harga_jual: 145000, supplierName: "CV Sandang Jaya" },
    { nama_produk: "Jaket Denim Unisex", kategori_produk: "Fashion", harga_modal: 120000, harga_jual: 210000, supplierName: "CV Sandang Jaya" },
    { nama_produk: "Kemeja Flanel Kotak-Kotak", kategori_produk: "Fashion", harga_modal: 70000, harga_jual: 125000, supplierName: "CV Sandang Jaya" },
    { nama_produk: "Hijab Bella Square", kategori_produk: "Fashion", harga_modal: 12000, harga_jual: 25000, supplierName: "CV Sandang Jaya" }
  ],
  2: [ // Kopi Kenangan Senja
    { nama_produk: "Kopi Susu Gula Aren 250ml", kategori_produk: "F&B", harga_modal: 9000, harga_jual: 18000, supplierName: "PT Biji Kopi Nusantara" },
    { nama_produk: "Ice Americano", kategori_produk: "F&B", harga_modal: 6000, harga_jual: 15000, supplierName: "PT Biji Kopi Nusantara" },
    { nama_produk: "Matcha Latte Premium", kategori_produk: "F&B", harga_modal: 11000, harga_jual: 22000, supplierName: "CV Indo Beverage" },
    { nama_produk: "Croissant Butter", kategori_produk: "F&B", harga_modal: 12000, harga_jual: 25000, supplierName: "CV Indo Beverage" },
    { nama_produk: "Roti Bakar Cokelat Keju", kategori_produk: "F&B", harga_modal: 8000, harga_jual: 17000, supplierName: "PT Sumber Sembako" }
  ],
  3: [ // Apotek Sehat Jaya
    { nama_produk: "Paracetamol 500mg (Strip)", kategori_produk: "Kesehatan", harga_modal: 3000, harga_jual: 6000, supplierName: "Distributor Farmasi Utama" },
    { nama_produk: "Vitamin C 1000mg (Botol)", kategori_produk: "Kesehatan", harga_modal: 35000, harga_jual: 50000, supplierName: "Distributor Farmasi Utama" },
    { nama_produk: "Masker Medis 3-ply (Box)", kategori_produk: "Kesehatan", harga_modal: 15000, harga_jual: 30000, supplierName: "Distributor Farmasi Utama" },
    { nama_produk: "Minyak Kayu Putih 120ml", kategori_produk: "Kesehatan", harga_modal: 38000, harga_jual: 46000, supplierName: "Distributor Farmasi Utama" },
    { nama_produk: "Betadine Antiseptic 15ml", kategori_produk: "Kesehatan", harga_modal: 12000, harga_jual: 18000, supplierName: "Distributor Farmasi Utama" }
  ],
  4: [ // Elektronik Maju
    { nama_produk: "Mouse Wireless Logitech M170", kategori_produk: "Elektronik", harga_modal: 75000, harga_jual: 115000, supplierName: "Global Elektronik Supply" },
    { nama_produk: "Keyboard Mechanical RGB", kategori_produk: "Elektronik", harga_modal: 220000, harga_jual: 349000, supplierName: "Global Elektronik Supply" },
    { nama_produk: "Earbuds Bluetooth TWS Pro", kategori_produk: "Elektronik", harga_modal: 110000, harga_jual: 189000, supplierName: "Global Elektronik Supply" },
    { nama_produk: "Powerbank 10000mAh Fast Charge", kategori_produk: "Elektronik", harga_modal: 90000, harga_jual: 149000, supplierName: "Global Elektronik Supply" },
    { nama_produk: "Charger Adapter Type-C 20W", kategori_produk: "Elektronik", harga_modal: 40000, harga_jual: 75000, supplierName: "Global Elektronik Supply" }
  ],
  5: [ // Minimarket Kita
    { nama_produk: "Susu UHT Ultra Milk 1L", kategori_produk: "Sembako", harga_modal: 16000, harga_jual: 19500, supplierName: "CV Indo Beverage" },
    { nama_produk: "Air Mineral Aqua 600ml (Dus)", kategori_produk: "Sembako", harga_modal: 42000, harga_jual: 52000, supplierName: "CV Indo Beverage" },
    { nama_produk: "Sabun Cair Lifebuoy 400ml", kategori_produk: "Sembako", harga_modal: 22000, harga_jual: 28000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Mie Sedaap Goreng (Dus)", kategori_produk: "Sembako", harga_modal: 102000, harga_jual: 118000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Minyak Goreng SunCo 2L", kategori_produk: "Sembako", harga_modal: 33000, harga_jual: 39000, supplierName: "PT Sumber Sembako" }
  ],
  6: [ // Resto Padang Selera
    { nama_produk: "Paket Nasi Rendang", kategori_produk: "F&B", harga_modal: 14000, harga_jual: 26000, supplierName: "Koperasi Tani Makmur" },
    { nama_produk: "Paket Nasi Ayam Pop", kategori_produk: "F&B", harga_modal: 13000, harga_jual: 24000, supplierName: "Koperasi Tani Makmur" },
    { nama_produk: "Paket Nasi Ayam Bakar", kategori_produk: "F&B", harga_modal: 12000, harga_jual: 22000, supplierName: "Koperasi Tani Makmur" },
    { nama_produk: "Teh Es Manis Jumbo", kategori_produk: "F&B", harga_modal: 1500, harga_jual: 5000, supplierName: "PT Sumber Sembako" },
    { nama_produk: "Kerupuk Kulit Siram Kuah", kategori_produk: "F&B", harga_modal: 4000, harga_jual: 9000, supplierName: "Koperasi Tani Makmur" }
  ]
};

// General operational expenses blueprints
const generalExpenses = [
  { kategori: "Operational", keterangan: "Bayar Tagihan Listrik & Air Bulanan", minVal: 200000, maxVal: 500000 },
  { kategori: "Operational", keterangan: "Beli Plastik Kemasan & Kresek", minVal: 50000, maxVal: 150000 },
  { kategori: "Gaji", keterangan: "Gaji Karyawan Part Time", minVal: 1200000, maxVal: 1500000 },
  { kategori: "Lainnya", keterangan: "Sewa Tempat (Bulanan/Proporsional)", minVal: 800000, maxVal: 1200000 }
];

async function seed() {
  console.log("=== MONEYTOR DATABASE SEEDER ===");
  console.log(`DB Host: ${process.env.DB_HOST}`);
  console.log(`DB Name: ${process.env.DB_NAME}`);

  let connection;
  try {
    // We get a single connection for the seeding transactions
    connection = await db.getConnection();
    console.log("Database connection successful!");

    // 1. Clean existing tables safely
    console.log("\n1. Cleaning existing data...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("TRUNCATE TABLE logs;");
    await connection.query("TRUNCATE TABLE transactions;");
    await connection.query("TRUNCATE TABLE products;");
    await connection.query("TRUNCATE TABLE suppliers;");
    await connection.query("TRUNCATE TABLE sellers;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Tables cleaned successfully.");

    // 2. Insert Suppliers
    console.log("\n2. Seeding Suppliers...");
    const supplierIds = {}; // Map of name -> ID
    for (const sup of suppliersList) {
      const [result] = await connection.query(
        "INSERT INTO suppliers (nama_supplier, kategori_supplier, lokasi) VALUES (?, ?, ?)",
        [sup.nama_supplier, sup.kategori_supplier, sup.lokasi]
      );
      supplierIds[sup.nama_supplier] = result.insertId;
    }
    console.log(`Successfully seeded ${suppliersList.length} suppliers.`);

    // 3. Insert Sellers
    console.log("\n3. Seeding Sellers...");
    const hashedPwd = await bcrypt.hash("password123", 10);
    const sellersData = []; // Store full seller info along with generated DB IDs

    for (let i = 0; i < sellersList.length; i++) {
      const seller = sellersList[i];
      // joining dates distributed over the last 6 months
      const joinDate = new Date();
      joinDate.setDate(joinDate.getDate() - (120 + i * 15)); // between 120 and 210 days ago
      const joinDateStr = joinDate.toISOString().slice(0, 10);

      const [result] = await connection.query(
        `INSERT INTO sellers (nama_usaha, jenis_usaha, lokasi_usaha, tanggal_bergabung, email, password, nama_pemilik)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [seller.nama_usaha, seller.jenis_usaha, seller.lokasi_usaha, joinDateStr, seller.email, hashedPwd, seller.nama_pemilik]
      );

      sellersData.push({
        ...seller,
        id_seller: result.insertId,
        index: i
      });
    }
    console.log(`Successfully seeded ${sellersData.length} sellers.`);

    // 4. Insert Products
    console.log("\n4. Seeding Products...");
    const productsData = []; // Store instantiated products

    for (const seller of sellersData) {
      const blueprints = productBlueprints[seller.index] || [];
      for (const bp of blueprints) {
        const id_supplier = supplierIds[bp.supplierName] || null;
        const initialStock = Math.floor(Math.random() * 51) + 80; // 80 - 130 stock
        const minStock = Math.floor(Math.random() * 6) + 10; // 10 - 15 min stock

        // Random date within seller's join history
        const inputDate = new Date();
        inputDate.setDate(inputDate.getDate() - 100);
        const inputDateStr = inputDate.toISOString().slice(0, 10);

        const [result] = await connection.query(
          `INSERT INTO products (id_seller, id_supplier, nama_produk, kategori_produk, harga_jual, harga_modal, stok_awal, minimum_stok, status_produk, tanggal_input_produk)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
          [seller.id_seller, id_supplier, bp.nama_produk, bp.kategori_produk, bp.harga_jual, bp.harga_modal, initialStock, minStock, inputDateStr]
        );

        productsData.push({
          id_produk: result.insertId,
          id_seller: seller.id_seller,
          nama_produk: bp.nama_produk,
          kategori_produk: bp.kategori_produk,
          harga_jual: bp.harga_jual,
          harga_modal: bp.harga_modal,
          minimum_stok: minStock,
          id_supplier,
          // Track current stock in memory to simulate correctly
          current_stock: initialStock
        });
      }
    }
    console.log(`Successfully seeded ${productsData.length} products.`);

    // 5. Simulate 90 Days of Transactions & Stock Logs
    console.log("\n5. Simulating 90 days of transactions & stock movement logs...");
    let txCount = 0;
    let logCount = 0;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 days ago

    // Run day-by-day simulation
    for (let day = 0; day <= 90; day++) {
      const simulatedDate = new Date(startDate);
      simulatedDate.setDate(startDate.getDate() + day);
      const dateStr = simulatedDate.toISOString().slice(0, 10);

      // Determine day-specific event weights
      let currentEvent = 'Normal Day';
      const isWeekend = simulatedDate.getDay() === 0 || simulatedDate.getDay() === 6;
      const dayOfMonth = simulatedDate.getDate();

      if (dayOfMonth >= 25 && dayOfMonth <= 30) {
        currentEvent = 'Payday Promo';
      } else if (isWeekend) {
        currentEvent = 'Weekend Special';
      }

      // 10% chance of a seasonal event (e.g. Ramadan Sale or Kemerdekaan Sale)
      const month = simulatedDate.getMonth() + 1; // 1-12
      if (month === 8 && dayOfMonth === 17) {
        currentEvent = 'Kemerdekaan Promo';
      } else if (month === 4) {
        currentEvent = 'Ramadan Sale';
      }

      // Loop sellers
      for (const seller of sellersData) {
        const sellerProducts = productsData.filter(p => p.id_seller === seller.id_seller);
        if (sellerProducts.length === 0) continue;

        // Daily transaction count: F&B sells more items, sembako moderate, fashion/electronics fewer but higher value
        let baseTxCount = 2;
        if (seller.jenis_usaha === "F&B") baseTxCount = 5;
        else if (seller.jenis_usaha === "Sembako") baseTxCount = 3;
        else if (seller.jenis_usaha === "Fashion") baseTxCount = 1;
        else if (seller.jenis_usaha === "Elektronik") baseTxCount = 1;

        // Add variance & event modifiers
        const dailyTxAmount = Math.max(1, baseTxCount + Math.floor(Math.random() * 3) - 1 + (currentEvent !== 'Normal Day' ? 2 : 0));

        // Generate sales
        for (let tx = 0; tx < dailyTxAmount; tx++) {
          const product = sellerProducts[Math.floor(Math.random() * sellerProducts.length)];
          const qty = Math.floor(Math.random() * 3) + 1; // 1 to 3 items sold

          // 1. Stock Check: if selling this quantity drops stock below minimum stock, trigger a Restock Event first!
          if (product.current_stock - qty < product.minimum_stok) {
            const restockQty = Math.floor(Math.random() * 41) + 60; // Restock 60 to 100 items
            const stokSebelum = product.current_stock;
            const stokSesudah = stokSebelum + restockQty;

            const totalModal = restockQty * product.harga_modal;
            const hour = String(Math.floor(Math.random() * 4) + 8).padStart(2, '0'); // Restock early morning 08:00 - 11:00
            const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
            const timeStr = `${hour}:${min}:00`;

            const methods = ['transfer', 'cash'];
            const method = methods[Math.floor(Math.random() * methods.length)];

            // Insert Restock Transaction (pengeluaran)
            await connection.query(
              `INSERT INTO transactions
               (id_seller, id_produk, tanggal, jam_transaksi, jenis_transaksi, kategori, qty, harga_satuan, total_harga, metode_pembayaran, event, diskon, status_transaksi)
               VALUES (?, ?, ?, ?, 'pengeluaran', ?, ?, ?, ?, ?, 'Normal Day', '0', 'selesai')`,
              [seller.id_seller, product.id_produk, dateStr, timeStr, product.kategori_produk, restockQty, product.harga_modal, totalModal, method]
            );
            txCount++;

            // Insert Stock Log (masuk)
            await connection.query(
              `INSERT INTO logs (id_produk, id_seller, tanggal, jenis_perubahan, jumlah, stok_sebelum, stok_sesudah, alasan)
               VALUES (?, ?, ?, 'masuk', ?, ?, ?, ?)`,
              [product.id_produk, seller.id_seller, dateStr, restockQty, stokSebelum, stokSesudah, 'Restok otomatis (stok menipis)']
            );
            logCount++;

            // Update in-memory stock
            product.current_stock = stokSesudah;
          }

          // 2. Perform Sale Transaction (pemasukan)
          const stokSebelum = product.current_stock;
          const stokSesudah = stokSebelum - qty;

          const hour = String(Math.floor(Math.random() * 10) + 11).padStart(2, '0'); // Sales between 11:00 - 21:00
          const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          const timeStr = `${hour}:${min}:00`;

          // Determine payment method
          const payMethods = ['cash', 'qris', 'transfer', 'debit'];
          let method = 'cash';
          const r = Math.random();
          if (r < 0.45) method = 'cash';
          else if (r < 0.8) method = 'qris';
          else if (r < 0.95) method = 'transfer';
          else method = 'debit';

          // Handle discount
          let discountStr = '0';
          let discountMultiplier = 1.0;
          const discRand = Math.random();
          if (discRand < 0.15) {
            discountStr = '5%';
            discountMultiplier = 0.95;
          } else if (discRand < 0.25) {
            discountStr = '10%';
            discountMultiplier = 0.90;
          }

          const totalHarga = qty * product.harga_jual * discountMultiplier;

          // Insert Sale Transaction (pemasukan)
          await connection.query(
            `INSERT INTO transactions
             (id_seller, id_produk, tanggal, jam_transaksi, jenis_transaksi, kategori, qty, harga_satuan, total_harga, metode_pembayaran, event, diskon, status_transaksi)
             VALUES (?, ?, ?, ?, 'pemasukan', ?, ?, ?, ?, ?, ?, ?, 'selesai')`,
            [seller.id_seller, product.id_produk, dateStr, timeStr, product.kategori_produk, qty, product.harga_jual, totalHarga, method, currentEvent, discountStr]
          );
          txCount++;

          // Insert Stock Log (keluar)
          await connection.query(
            `INSERT INTO logs (id_produk, id_seller, tanggal, jenis_perubahan, jumlah, stok_sebelum, stok_sesudah, alasan)
             VALUES (?, ?, ?, 'keluar', ?, ?, ?, 'Terjual via transaksi')`,
            [product.id_produk, seller.id_seller, dateStr, qty, stokSebelum, stokSesudah]
          );
          logCount++;

          // Update in-memory stock
          product.current_stock = stokSesudah;
        }

        // 3. Occasional general operational expenses (bills, salary, etc.) - occurs every 15 days
        if (day > 0 && day % 15 === 0 && Math.random() < 0.7) {
          const expBlueprint = generalExpenses[Math.floor(Math.random() * generalExpenses.length)];
          const amount = Math.floor(Math.random() * (expBlueprint.maxVal - expBlueprint.minVal + 1)) + expBlueprint.minVal;
          
          const hour = String(Math.floor(Math.random() * 4) + 13).padStart(2, '0'); // afternoon
          const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          const timeStr = `${hour}:${min}:00`;

          await connection.query(
            `INSERT INTO transactions
             (id_seller, id_produk, tanggal, jam_transaksi, jenis_transaksi, kategori, qty, harga_satuan, total_harga, metode_pembayaran, event, diskon, status_transaksi)
             VALUES (?, NULL, ?, ?, 'pengeluaran', ?, 1, ?, ?, 'transfer', 'Normal Day', '0', 'selesai')`,
            [seller.id_seller, dateStr, timeStr, expBlueprint.kategori, amount, amount]
          );
          txCount++;
        }
      }
    }

    // 6. Write final stock values back to the products table to match current_stock
    console.log("\n6. Syncing final stock levels in products table...");
    for (const product of productsData) {
      await connection.query(
        "UPDATE products SET stok_awal = ? WHERE id_produk = ?",
        [product.current_stock, product.id_produk]
      );
    }
    console.log("Final stock levels synced perfectly.");

    console.log("\n==============================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉");
    console.log("==============================================");
    console.log(`- Sellers Seeded    : ${sellersData.length}`);
    console.log(`- Suppliers Seeded  : ${Object.keys(supplierIds).length}`);
    console.log(`- Products Seeded   : ${productsData.length}`);
    console.log(`- Total Transactions: ${txCount}`);
    console.log(`- Total Stock Logs  : ${logCount}`);
    console.log("==============================================");

  } catch (err) {
    console.error("\n❌ ERROR DURING DATABASE SEEDING:");
    console.error(err);
  } finally {
    if (connection) {
      connection.release();
    }
    // Close the entire database pool
    await db.end();
    console.log("Database connection pool closed.");
  }
}

seed();

-- PostgreSQL DDL for the assignment

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255) DEFAULT 'https://yoururlapi.com/profile.jpeg',
  balance NUMERIC(15,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS services (
  service_code VARCHAR(50) PRIMARY KEY,
  service_name VARCHAR(100),
  service_icon VARCHAR(255),
  service_tariff NUMERIC(15,2)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('TOPUP','PAYMENT')),
  service_code VARCHAR(50),
  description VARCHAR(255),
  total_amount NUMERIC(15,2),
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  banner_name VARCHAR(100),
  banner_image VARCHAR(255),
  description VARCHAR(255)
);

-- Optional seeds (safe to run multiple times)
INSERT INTO services (service_code, service_name, service_icon, service_tariff)
VALUES
  ('PAJAK','Pajak PBB','https://nutech-integrasi.app/dummy.jpg',40000),
  ('PLN','Listrik','https://nutech-integrasi.app/dummy.jpg',10000),
  ('PDAM','PDAM Berlangganan','https://nutech-integrasi.app/dummy.jpg',40000),
  ('PULSA','Pulsa','https://nutech-integrasi.app/dummy.jpg',40000),
  ('PGN','PGN Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000),
  ('MUSIK','Musik Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000),
  ('TV','TV Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000),
  ('PAKET_DATA','Paket data','https://nutech-integrasi.app/dummy.jpg',50000),
  ('VOUCHER_GAME','Voucher Game','https://nutech-integrasi.app/dummy.jpg',100000),
  ('VOUCHER_MAKANAN','Voucher Makanan','https://nutech-integrasi.app/dummy.jpg',100000),
  ('QURBAN','Qurban','https://nutech-integrasi.app/dummy.jpg',200000),
  ('ZAKAT','Zakat','https://nutech-integrasi.app/dummy.jpg',300000)
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO banners (banner_name, banner_image, description) VALUES
  ('Banner 1','https://nutech-integrasi.app/dummy.jpg','Lerem Ipsum Dolor sit amet'),
  ('Banner 2','https://nutech-integrasi.app/dummy.jpg','Lerem Ipsum Dolor sit amet'),
  ('Banner 3','https://nutech-integrasi.app/dummy.jpg','Lerem Ipsum Dolor sit amet'),
  ('Banner 4','https://nutech-integrasi.app/dummy.jpg','Lerem Ipsum Dolor sit amet'),
  ('Banner 5','https://nutech-integrasi.app/dummy.jpg','Lerem Ipsum Dolor sit amet'),
  ('Banner 6','https://nutech-integrasi.app/dummy.jpg','Lerem Ipsum Dolor sit amet')
ON CONFLICT DO NOTHING;

# Sistem Inventory - Caffe Dalley

Sistem manajemen inventory untuk Caffe Dalley menggunakan Node.js, Express, MySQL (Docker), dan React.

## 🚀 Fitur

- **Manajemen User**: Owner, Admin, Manajer, Staff
- **Manajemen Barang**: CRUD barang dengan kategori dan satuan
- **Transaksi**: Barang masuk dan keluar
- **Notifikasi**: Alert untuk stok menipis
- **Laporan**: Laporan inventory
- **Activity Log**: Tracking aktivitas user
- **Docker**: Database MySQL menggunakan Docker
- **phpMyAdmin**: Web interface untuk manajemen database

## 📋 Prerequisites

- Node.js (v14 atau lebih tinggi)
- Docker Desktop
- npm atau yarn

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/dimasdekka/Sistem-Inventory.git
cd Sistem-Inventory
```

### 2. Setup Environment Variables

Buat file `.env` di folder `server/`:

```env
PORT=5000
DB_NAME=caffedalleydb
DB_USER=root
DB_PASS=rootpassword
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=supersecret
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Start Docker Database

```bash
# Dari root directory
docker-compose up -d
```

### 5. Seed Database

```bash
cd server
node scripts/seed.js
```

### 6. Run Application

**Terminal 1 - Server:**

```bash
cd server
npm start
```

**Terminal 2 - Client:**

```bash
cd client
npm run dev
```

## 🌐 Access

- **Client**: http://localhost:5173
- **Server API**: http://localhost:5000
- **phpMyAdmin**: http://localhost:8080
  - Username: `root`
  - Password: `rootpassword`

## 👤 Default Users

| Username | Password | Role  |
| -------- | -------- | ----- |
| owner    | 123456   | Owner |
| admin    | 123456   | Admin |
| barista  | 123456   | Staff |

## 📁 Project Structure

```
Sistem-Inventory/
├── client/                 # React frontend
│   ├── src/
│   └── package.json
├── server/                 # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── package.json
├── docker-compose.yml      # Docker configuration
└── README.md
```

## 🐳 Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker logs caffe_dalley_db

# Restart database
docker restart caffe_dalley_db
```

## 📝 License

MIT

## 👨‍💻 Author

Dimas Dekka

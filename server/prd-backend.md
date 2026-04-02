PRD Backend — Sistem Inventory Caffe Dalley
Versi: 1.0.0 | Tech Stack: Go 1.23 + Gin + GORM + PostgreSQL + Redis + JWT RS256 + Casbin

1. Tech Stack & Framework
   LayerTeknologiKeteranganLanguageGo 1.23+Static typing, performantWeb FrameworkGin v1Fast HTTP routerORMGORM v2Database abstraction + migrationsDatabasePostgreSQL 16Primary data storeCacheRedis 7Token blacklist, rate limiterAuthgolang-jwt/jwt v5Access token RS256 + Refresh tokenRBACCasbin v2Server-side policy enforcementValidationgo-playground/validator v10Request body validationFile StorageMinIOFoto produk, export filesExportexcelize v2 + gopdfGenerate Excel & PDF laporanBarcodeboombuler/barcodeGenerate barcode server-sideLoggingzerologStructured JSON loggingConfigviperEnvironment configMigrationgolang-migrateSchema versioningAPI Docsswaggo/swagAuto-generate SwaggerTestingtestify + gomockUnit & integration testingContainerDocker + Docker ComposeDeployment & local dev

2. Struktur Folder
   caffe-dalley-backend/
   ├── cmd/server/main.go
   ├── internal/
   │ ├── config/
   │ ├── database/
   │ │ ├── postgres.go
   │ │ ├── redis.go
   │ │ └── migrations/
   │ ├── middleware/
   │ │ ├── auth.go # JWT validation
   │ │ ├── rbac.go # Casbin enforcement
   │ │ ├── rate_limiter.go # Redis sliding window
   │ │ ├── cors.go
   │ │ ├── request_id.go
   │ │ ├── logger.go
   │ │ ├── recovery.go
   │ │ └── security_headers.go
   │ ├── domain/ # Entity structs + interfaces
   │ ├── repository/ # GORM database layer
   │ ├── service/ # Business logic
   │ ├── handler/ # HTTP handlers (Gin)
   │ ├── dto/ # Request/Response DTOs
   │ ├── router/
   │ └── pkg/
   │ ├── response/ # Standar API response builder
   │ ├── token/ # JWT RS256 generate & parse
   │ ├── password/ # bcrypt cost 12
   │ ├── paginator/
   │ ├── upload/ # MinIO client
   │ ├── exporter/ # Excel + PDF
   │ ├── barcode/ # Generator
   │ └── audit/ # Audit log writer
   ├── casbin/
   │ ├── model.conf
   │ └── policy.csv
   ├── certs/
   │ ├── private.pem # RSA private key (jangan masuk git!)
   │ └── public.pem
   ├── docs/ # Swagger generated
   ├── Dockerfile
   ├── docker-compose.yml
   └── go.mod

3. Database Schema (Ringkasan)
   TabelDeskripsiusersData user + role, soft deleterefresh_tokensOpaque token (disimpan sebagai hash SHA-256)categoriesKategori produk, support sub-kategori (self-referencing)unitsSatuan unit (kg, pcs, liter, dll)locationsLokasi gudangproductsMaster produk, soft deletestock_ledgerAppend-only — semua pergerakan stok dicatat di sinistock_summaryCurrent stok per produk per lokasi (diupdate via trigger)suppliersData supplier, soft deletepurchase_ordersHeader PO + state machine statuspurchase_order_itemsDetail item PO, support partial receivingnotificationsNotifikasi stok minimum & expiredaudit_logsLog semua operasi write (JSONB old/new values)business_settingsKonfigurasi bisnis (JSONB value)

4. API Endpoints (Semua prefixed /api/v1)
   Auth
   MethodEndpointRolePOST/auth/loginPublicPOST/auth/refreshPublicPOST/auth/logoutAuthenticatedGET/PATCH/auth/meAuthenticatedPOST/auth/change-passwordAuthenticated
   Products, Categories, Units, Locations

CRUD standar + filter/sort/paginate + upload foto ke MinIO

Inventory
| POST | /inventory/stock-in | Stok masuk |
| POST | /inventory/stock-out | Stok keluar |
| POST | /inventory/transfer | Transfer antar gudang |
| POST | /inventory/adjustment | Penyesuaian dengan alasan |
| POST | /inventory/opname | Stock opname |
| GET | /inventory/summary | Ringkasan stok semua produk |
| GET | /inventory/movements | History pergerakan |
Barcode
| GET | /barcode/product/:id | Generate barcode image (PNG) |
| POST | /barcode/lookup | Cari produk by barcode string |
Notifications (untuk polling frontend)
| GET | /notifications/count | Jumlah unread — endpoint ringan untuk polling |
| GET/PATCH/DELETE | /notifications | CRUD notifikasi |
Purchase Orders
Status machine: draft → sent → confirmed → receiving → closed (atau cancelled)
Reports
| GET | /reports/dashboard | KPI untuk dashboard |
| GET | /reports/{stock,movements,purchases,expired} | Data laporan |
| GET | /reports/{...}/export?format=excel|pdf | Export file |

5. Keamanan (Security Architecture)
   JWT RS256 + Refresh Token Rotation
   Access Token: RS256, masa hidup 15 menit, payload: user_id + role + jti
   Refresh Token: Opaque random hex-64, masa hidup 7 hari, disimpan hash SHA-256
   Blacklist: Redis SET blacklist:jti:{jti} EX {ttl}
   Rotation: Setiap refresh → token lama direvoke, token baru diterbitkan
   RBAC Casbin (Server-side, independen dari frontend)
   Policy diatur di casbin/policy.csv, dievaluasi di setiap request oleh middleware rbac.go. Tidak cukup hanya mengandalkan RBAC frontend — backend wajib enforce sendiri.
   Rate Limiting (Redis Sliding Window)
   EndpointLimitPOST /auth/login5 req / 15 menit / IPPOST /auth/refresh10 req / 15 menit / IPPOST /auth/change-password3 req / jam / userEndpoint authenticated lain300 req / menit / user
   Security HTTP Headers
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   Content-Security-Policy: default-src 'self'
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=()
   Layer Keamanan Lainnya

bcrypt cost 12 untuk password hash
Parameterized queries via GORM — tidak ada raw string SQL interpolation
Magic bytes validation untuk file upload (bukan hanya cek extension)
Whitelist untuk sort column & filter field (cegah SQL injection via parameter)
Audit log otomatis untuk semua operasi write (old/new values di JSONB)
CORS whitelist eksplisit, tidak pakai wildcard \*
Error response tidak bocorkan stack trace atau SQL error ke client
Soft delete untuk semua data penting
Docker: multi-stage build + container jalan sebagai non-root user

6. Background Jobs
   JobIntervalFungsiStockAlertCheckerSetiap 5 menitGenerate notifikasi stok kritis/warning/infoExpiredAlertCheckerSetiap 1 jamGenerate notifikasi H-7, H-3, H-1 expiredNotificationCleanerSetiap hari jam 02:00Hapus notifikasi lama yang sudah dismissedTokenCleanerSetiap 6 jamHapus expired refresh tokens dari DB

7. Dependency Rule (Layer Architecture)
   Handler → Service → Repository Interface → Domain Entity
   ↑
   Implementasi Repository (GORM)

- Handler TIDAK boleh import Repository langsung
- Service import Repository via interface (bukan implementasi)
- Semua dependency di-inject via constructor (tidak ada global mutable state)

8. Milestones
   SprintModulEstimasi1Setup + Auth (JWT RS256 + Refresh Rotation + Blacklist)1.5 minggu2Casbin RBAC + Rate limiter + Security middleware0.5 minggu3Users & Settings (lokasi, satuan, kategori, bisnis)1 minggu4Produk & Kategori + Upload foto MinIO1 minggu5Inventaris (stock_ledger + stock_summary + semua movement)1.5 minggu6Barcode generate + lookup0.5 minggu7Notifikasi + Background Jobs1 minggu8Supplier & Purchase Order1.5 minggu9Laporan & Export (Excel + PDF)1.5 minggu10Testing + Swagger docs + Performance tuning1 minggu

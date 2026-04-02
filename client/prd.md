# Product Requirements Document (PRD)
## Sistem Inventory Caffe Dalley

**Versi:** 2.0.0  
**Tanggal:** 26 Februari 2026  
**Status:** Draft  
**Tech Stack:** React 18 + Vite 5 + TypeScript 5 + Zustand 4 + React Router 6 + Tailwind CSS 3

---

## 1. Latar Belakang & Tujuan

Dalley adalah sistem manajemen inventaris berbasis web yang dirancang khusus untuk bisnis kafe dan restoran. Sistem ini menggabungkan manajemen stok real-time, sistem barcode terintegrasi, notifikasi stok minimum, dan kontrol akses berbasis peran (RBAC) untuk memastikan operasional gudang dan dapur berjalan efisien dan termonitor.

**Tujuan Utama:**
- Digitalisasi pencatatan stok barang (bahan baku, peralatan, produk jadi)
- Meminimalkan kerugian akibat kehabisan stok atau overstock
- Memberikan visibilitas penuh kepada pemilik dan manajer melalui laporan real-time
- Mempercepat proses penerimaan barang dengan sistem barcode scan & cetak

---

## 2. Stakeholders & Roles

| Role | Deskripsi | Akses Level |
|------|-----------|-------------|
| **Owner** | Pemilik bisnis. Akses penuh ke semua fitur, laporan keuangan, dan konfigurasi sistem | Super Admin |
| **Manajer** | Kepala operasional. Dapat melihat semua data, mengelola stok, approve permintaan, namun tidak bisa konfigurasi sistem | High |
| **Admin** | Staf administrasi. Input data produk, kelola supplier, proses transaksi, cetak laporan | Medium |
| **Barista** | Staf barista/produksi. Hanya bisa mengajukan permintaan bahan, lihat stok bahan yang diperlukan | Low |
| **Gudang** | Staf gudang. Penerimaan barang, pemindahan stok, scan barcode, update kuantitas | Low-Medium |

---

## 3. Fitur & Modul Utama

### 3.1 Modul Autentikasi & Manajemen Pengguna

**Fitur:**
- Login dengan email & password
- Session management dengan JWT (disimpan di memory/Zustand, bukan localStorage)
- Halaman profil pengguna
- Owner dapat membuat, mengedit, menonaktifkan akun pengguna
- Role assignment per user
- Activity log per user (login history, aksi yang dilakukan)

**Hak Akses:**
- Owner: CRUD semua user
- Manajer: View user list
- Admin/Barista/Gudang: Edit profil sendiri saja

---

### 3.2 Modul Produk & Kategori

**Fitur:**
- CRUD produk/item inventaris
- Kategori produk (Bahan Baku, Packaging, Alat, Produk Jadi, dll)
- Sub-kategori
- Foto produk
- Satuan unit (kg, gram, liter, ml, pcs, box, dll)
- Kode SKU otomatis atau manual
- Harga beli & harga jual
- Deskripsi & catatan produk
- Status aktif/nonaktif

**Hak Akses:**
- Owner & Manajer: CRUD penuh
- Admin: CRUD produk
- Barista & Gudang: Read only

---

### 3.3 Modul Barcode

**Fitur:**
- Generate barcode otomatis (format Code-128 atau EAN-13) per produk/item
- Barcode scanner via kamera browser
- Input barcode manual sebagai fallback
- Cetak label barcode (single atau bulk/batch)
- Template label barcode yang dapat dikustomisasi
- Ukuran label: 50x30mm, 40x25mm, custom
- Print langsung ke printer atau export PDF

**Hak Akses:**
- Owner, Manajer, Admin: Generate & cetak barcode
- Gudang: Cetak barcode, scan barcode
- Barista: Scan barcode untuk cek stok

---

### 3.4 Modul Stok & Inventaris

**Fitur:**
- Dashboard stok real-time
- Stok masuk (Goods Receipt)
- Stok keluar (Goods Issue)
- Transfer stok antar lokasi/gudang
- Penyesuaian stok (Stock Adjustment) dengan alasan
- Stok opname / Stock Taking
- History pergerakan stok per produk
- Multi-lokasi gudang
- Batch / Lot tracking + tanggal expired per batch

---

### 3.5 Modul Notifikasi Stok Minimum

**Kategori Notifikasi:**
- 🔴 **Kritis:** Stok = 0 (habis)
- 🟠 **Warning:** Stok ≤ minimum
- 🟡 **Info:** Stok mendekati minimum (≤ 150% dari minimum)
- 🔵 **Expired Alert:** Produk mendekati expired (H-7, H-3, H-1)

---

### 3.6 Modul Supplier & Pembelian

- CRUD data supplier
- Purchase Order: Draft → Sent → Confirmed → Received → Closed
- Partial receiving
- Riwayat harga pembelian per produk per supplier

---

### 3.7 Modul Laporan & Analitik

- Dashboard KPI: total nilai inventaris, produk aktif, transaksi hari ini, alert stok
- Laporan stok, pergerakan, stok opname, fast/slow-moving
- Laporan pembelian per periode & per supplier
- Laporan expired (akan expired & sudah expired/kerugian)
- Export Excel / PDF, grafik interaktif

---

### 3.8 Modul Pengaturan Sistem

- Profil bisnis, manajemen user & role, satuan, kategori, lokasi/gudang
- Template barcode, notifikasi, backup & restore

---

## 4. Struktur Folder Proyek

> **Prinsip:**
> - **Feature Colocation** — semua yang berhubungan dengan satu fitur tinggal bersama
> - **Barrel Exports** — setiap folder wajib punya `index.ts` untuk clean imports
> - **Service Layer** — logika API dipisah dari komponen dan hooks
> - **Strict Type Boundary** — global types di `src/types/`, lokal types di `feature/types.ts`
> - **No Circular Deps** — `components/ui` tidak boleh import dari `features/`

```
caffe-caffe-dalley/
├── .antigravity/
│   └── rules.md                      # Agent rules: konvensi, patterns, boundaries
│
├── _agent-context/                   # Konteks untuk AI agent (tidak dikompilasi)
│   ├── TYPES.md                      # Semua TypeScript interfaces utama
│   ├── API_CONTRACTS.md              # Shape request/response API mock
│   └── CONVENTIONS.md               # Naming, error handling, store patterns
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   │
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Root component + provider wrappers
│   ├── vite-env.d.ts
│   │
│   ├── assets/                       # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── styles/                       # Global styles
│   │   ├── globals.css               # Tailwind base + custom CSS variables
│   │   └── print.css                 # Print styles untuk label barcode
│   │
│   ├── types/                        # Global TypeScript types (shared across features)
│   │   ├── index.ts                  # Re-export semua types
│   │   ├── api.types.ts              # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   │   ├── auth.types.ts             # User, Role, Permission, Session
│   │   ├── common.types.ts           # ID, Timestamp, Status, SortOrder, FilterParams
│   │   └── roles.types.ts            # RolePermissions, PermissionKey, PERMISSIONS const
│   │
│   ├── constants/                    # App-wide constants
│   │   ├── index.ts
│   │   ├── routes.constants.ts       # ROUTES object (single source of truth)
│   │   ├── permissions.constants.ts  # PERMISSIONS map per role
│   │   └── app.constants.ts          # API_URL, POLLING_INTERVAL, PAGE_SIZE, dll
│   │
│   ├── lib/                          # Pure utilities & third-party wrappers
│   │   ├── index.ts
│   │   ├── api-client.ts             # Axios/fetch instance + interceptors
│   │   ├── utils.ts                  # cn(), formatCurrency(), formatDate()
│   │   ├── validators.ts             # Zod schemas shared across features
│   │   └── query-keys.ts             # Centralized query key factory
│   │
│   ├── hooks/                        # Global shared hooks (non-feature-specific)
│   │   ├── index.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── store/                        # Zustand stores (global state only)
│   │   ├── index.ts                  # Export semua stores
│   │   ├── auth.store.ts             # User session, role, token
│   │   ├── notification.store.ts     # Notif list, unread count, polling
│   │   ├── ui.store.ts               # Sidebar, theme, modal stack, toasts
│   │   └── inventory.store.ts        # Cache stok, active filters, selected location
│   │
│   ├── router/                       # Routing configuration
│   │   ├── index.tsx                 # createBrowserRouter setup
│   │   ├── routes.tsx                # Route tree definitions
│   │   ├── lazy-routes.tsx           # React.lazy() imports untuk code splitting
│   │   └── guards/
│   │       ├── index.ts
│   │       ├── AuthGuard.tsx         # Redirect ke /login jika belum auth
│   │       └── RoleGuard.tsx         # Redirect atau 403 jika role tidak cukup
│   │
│   ├── components/                   # Shared/reusable components (tidak fitur-spesifik)
│   │   ├── index.ts                  # Re-export semua shared components
│   │   │
│   │   ├── ui/                       # Atomic UI primitives
│   │   │   ├── index.ts
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Input.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.tsx         # Variant: success, warning, danger, info
│   │   │   │   └── index.ts
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ModalHeader.tsx
│   │   │   │   ├── ModalBody.tsx
│   │   │   │   ├── ModalFooter.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Table/
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── TableHead.tsx
│   │   │   │   ├── TableRow.tsx
│   │   │   │   ├── TablePagination.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Select/
│   │   │   ├── Checkbox/
│   │   │   ├── Tooltip/
│   │   │   ├── Spinner/
│   │   │   ├── EmptyState/
│   │   │   └── Skeleton/
│   │   │
│   │   ├── layout/                   # App shell components
│   │   │   ├── index.ts
│   │   │   ├── AppLayout.tsx         # Sidebar + Navbar + main content area
│   │   │   ├── AuthLayout.tsx        # Centered card layout untuk login
│   │   │   ├── PageWrapper.tsx       # Page title + breadcrumb + actions slot
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── SidebarItem.tsx
│   │   │   │   ├── SidebarGroup.tsx
│   │   │   │   └── index.ts
│   │   │   └── Navbar/
│   │   │       ├── Navbar.tsx
│   │   │       ├── NavbarActions.tsx  # Notif bell + user avatar dropdown
│   │   │       └── index.ts
│   │   │
│   │   ├── feedback/                 # User feedback components
│   │   │   ├── index.ts
│   │   │   ├── Toast/
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── ToastContainer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── AlertBanner.tsx       # Inline page alerts
│   │   │   └── ConfirmDialog.tsx     # Reusable confirm/delete dialog
│   │   │
│   │   └── data-display/            # Higher-order display components
│   │       ├── index.ts
│   │       ├── StatsCard.tsx         # KPI card (icon + value + label + trend)
│   │       ├── DataTable/            # Full-featured table (sort, filter, bulk action)
│   │       │   ├── DataTable.tsx
│   │       │   ├── DataTableFilters.tsx
│   │       │   ├── DataTableBulkActions.tsx
│   │       │   ├── useDataTable.ts
│   │       │   └── index.ts
│   │       └── StatusBadge.tsx       # Stock status: Cukup | Rendah | Kritis | Habis
│   │
│   └── features/                    # Feature modules (colocation pattern)
│       │
│       ├── auth/
│       │   ├── index.ts
│       │   ├── types.ts              # LoginPayload, AuthResponse, etc.
│       │   ├── auth.service.ts       # API calls: login(), logout(), refreshToken()
│       │   ├── auth.schema.ts        # Zod schemas untuk form validation
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useAuth.ts        # Login, logout, session state
│       │   │   └── usePermission.ts  # can('action', 'resource') helper
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── LoginForm.tsx
│       │   │   └── UserAvatar.tsx
│       │   └── pages/
│       │       ├── LoginPage.tsx
│       │       └── index.ts
│       │
│       ├── dashboard/
│       │   ├── index.ts
│       │   ├── types.ts              # DashboardStats, KpiCard, etc.
│       │   ├── dashboard.service.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   └── useDashboardStats.ts
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── KpiGrid.tsx
│       │   │   ├── StockAlertList.tsx
│       │   │   ├── RecentActivityFeed.tsx
│       │   │   └── charts/
│       │   │       ├── StockTrendChart.tsx
│       │   │       ├── CategoryPieChart.tsx
│       │   │       └── index.ts
│       │   └── pages/
│       │       ├── DashboardPage.tsx
│       │       └── index.ts
│       │
│       ├── products/
│       │   ├── index.ts
│       │   ├── types.ts              # Product, Category, Unit, ProductStatus
│       │   ├── products.service.ts   # getProducts(), createProduct(), etc.
│       │   ├── products.schema.ts    # Zod schema untuk form
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useProducts.ts    # List dengan filter & pagination
│       │   │   ├── useProduct.ts     # Single product by ID
│       │   │   └── useProductMutations.ts  # create, update, delete
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── ProductCard.tsx
│       │   │   ├── ProductTable.tsx
│       │   │   ├── ProductForm.tsx
│       │   │   ├── ProductFilters.tsx
│       │   │   ├── ProductImageUpload.tsx
│       │   │   └── CategorySelect.tsx
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── ProductListPage.tsx
│       │       ├── ProductDetailPage.tsx
│       │       └── ProductFormPage.tsx   # Shared create & edit
│       │
│       ├── inventory/
│       │   ├── index.ts
│       │   ├── types.ts              # StockMovement, StockIn, StockOut, Transfer, Adjustment
│       │   ├── inventory.service.ts
│       │   ├── inventory.schema.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useStockSummary.ts
│       │   │   ├── useStockMovements.ts
│       │   │   └── useStockMutations.ts
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── StockSummaryTable.tsx
│       │   │   ├── StockMovementTable.tsx
│       │   │   ├── StockInForm.tsx
│       │   │   ├── StockOutForm.tsx
│       │   │   ├── TransferForm.tsx
│       │   │   ├── AdjustmentForm.tsx
│       │   │   ├── StockOpnameTable.tsx
│       │   │   └── LocationSelector.tsx
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── StockSummaryPage.tsx
│       │       ├── StockInPage.tsx
│       │       ├── StockOutPage.tsx
│       │       ├── StockTransferPage.tsx
│       │       ├── StockAdjustmentPage.tsx
│       │       └── StockOpnamePage.tsx
│       │
│       ├── barcode/
│       │   ├── index.ts
│       │   ├── types.ts              # BarcodeFormat, LabelTemplate, LabelSize, PrintJob
│       │   ├── barcode.service.ts    # generateBarcode(), savePrintJob()
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useBarcodeScanner.ts   # @zxing/browser wrapper
│       │   │   ├── useBarcodeGenerator.ts # jsbarcode wrapper
│       │   │   └── useBarcodePrint.ts     # jspdf print logic
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── BarcodeScanner.tsx     # Kamera + decode + hasil
│       │   │   ├── BarcodeDisplay.tsx     # Render barcode SVG/canvas
│       │   │   ├── LabelDesigner.tsx      # Pilih template + ukuran
│       │   │   ├── LabelPreview.tsx       # Preview real-size label
│       │   │   ├── PrintQueue.tsx         # Daftar item yang akan dicetak
│       │   │   └── ScanResultCard.tsx     # Hasil scan: info produk + quick action
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── BarcodeScannerPage.tsx
│       │       └── BarcodePrintPage.tsx
│       │
│       ├── notifications/
│       │   ├── index.ts
│       │   ├── types.ts              # Notification, NotificationType, NotificationFilter
│       │   ├── notifications.service.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useNotifications.ts   # List + polling + unread count
│       │   │   └── useNotificationActions.ts  # markRead, dismiss, snooze
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── NotificationBell.tsx   # Badge + trigger untuk panel
│       │   │   ├── NotificationPanel.tsx  # Slide-out panel
│       │   │   ├── NotificationItem.tsx   # Single notif row
│       │   │   └── NotificationFilters.tsx
│       │   └── pages/
│       │       ├── NotificationsPage.tsx  # Full-page view semua notifikasi
│       │       └── index.ts
│       │
│       ├── suppliers/
│       │   ├── index.ts
│       │   ├── types.ts              # Supplier, SupplierContact, PriceHistory
│       │   ├── suppliers.service.ts
│       │   ├── suppliers.schema.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useSuppliers.ts
│       │   │   └── useSupplierMutations.ts
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── SupplierTable.tsx
│       │   │   ├── SupplierForm.tsx
│       │   │   ├── SupplierPriceHistory.tsx
│       │   │   └── SupplierRating.tsx
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── SupplierListPage.tsx
│       │       └── SupplierDetailPage.tsx
│       │
│       ├── purchase-orders/
│       │   ├── index.ts
│       │   ├── types.ts              # PurchaseOrder, POItem, POStatus, ReceivingRecord
│       │   ├── purchase-orders.service.ts
│       │   ├── purchase-orders.schema.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── usePurchaseOrders.ts
│       │   │   └── usePOMutations.ts
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── POTable.tsx
│       │   │   ├── POForm.tsx
│       │   │   ├── POStatusBadge.tsx
│       │   │   ├── POItemsTable.tsx
│       │   │   └── ReceivingForm.tsx  # Partial receiving
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── POListPage.tsx
│       │       ├── PODetailPage.tsx
│       │       └── POFormPage.tsx
│       │
│       ├── reports/
│       │   ├── index.ts
│       │   ├── types.ts              # ReportFilter, StockReport, MovementReport, etc.
│       │   ├── reports.service.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useStockReport.ts
│       │   │   ├── useMovementReport.ts
│       │   │   ├── usePurchaseReport.ts
│       │   │   └── useExpiredReport.ts
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── ReportFilters.tsx         # Date range, kategori, lokasi
│       │   │   ├── ExportButton.tsx          # Export Excel / PDF
│       │   │   └── charts/
│       │   │       ├── MovementLineChart.tsx
│       │   │       ├── PurchaseBarChart.tsx
│       │   │       ├── CategoryPieChart.tsx
│       │   │       └── index.ts
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── StockReportPage.tsx
│       │       ├── MovementReportPage.tsx
│       │       ├── PurchaseReportPage.tsx
│       │       └── ExpiredReportPage.tsx
│       │
│       ├── users/
│       │   ├── index.ts
│       │   ├── types.ts              # UserProfile, CreateUserPayload
│       │   ├── users.service.ts
│       │   ├── users.schema.ts
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useUsers.ts
│       │   │   └── useUserMutations.ts
│       │   ├── components/
│       │   │   ├── index.ts
│       │   │   ├── UserTable.tsx
│       │   │   ├── UserForm.tsx
│       │   │   ├── RoleSelect.tsx
│       │   │   └── ActivityLogTable.tsx
│       │   └── pages/
│       │       ├── index.ts
│       │       ├── UserListPage.tsx
│       │       └── ProfilePage.tsx
│       │
│       └── settings/
│           ├── index.ts
│           ├── types.ts              # BusinessProfile, LocationConfig, UnitConfig
│           ├── settings.service.ts
│           ├── hooks/
│           │   ├── index.ts
│           │   └── useSettings.ts
│           ├── components/
│           │   ├── index.ts
│           │   ├── BusinessProfileForm.tsx
│           │   ├── LocationManager.tsx
│           │   ├── UnitManager.tsx
│           │   ├── CategoryManager.tsx
│           │   └── BarcodeTemplateConfig.tsx
│           └── pages/
│               ├── index.ts
│               ├── SettingsLayout.tsx     # Tabs/sub-nav untuk settings
│               ├── BusinessProfilePage.tsx
│               ├── LocationsPage.tsx
│               ├── UnitsPage.tsx
│               ├── CategoriesPage.tsx
│               └── UsersSettingsPage.tsx
│
├── .antigravity/
│   └── rules.md
├── _agent-context/
│   ├── TYPES.md
│   ├── API_CONTRACTS.md
│   └── CONVENTIONS.md
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── package.json
```

---

## 5. Barrel Export Convention

**Wajib** ada `index.ts` di setiap folder. Format standar:

```typescript
// features/products/index.ts
export * from './types'
export * from './hooks'
export * from './components'
// JANGAN export pages dari sini (lazy loaded via router)
```

```typescript
// Import pattern yang benar (clean)
import { useProducts, ProductTable } from '@/features/products'
import { Button, Badge } from '@/components/ui'
import { ROUTES } from '@/constants'

// Import pattern yang SALAH (avoid)
import { useProducts } from '@/features/products/hooks/useProducts'
import { Button } from '@/components/ui/Button/Button'
```

**Path aliases wajib** di `tsconfig.json` dan `vite.config.ts`:
```json
{
  "@/*": ["./src/*"],
  "@features/*": ["./src/features/*"],
  "@components/*": ["./src/components/*"],
  "@store/*": ["./src/store/*"],
  "@lib/*": ["./src/lib/*"],
  "@types/*": ["./src/types/*"],
  "@constants/*": ["./src/constants/*"]
}
```

---

## 6. Layer Architecture

```
┌─────────────────────────────────────────┐
│              Pages (Route Level)         │  ← Orchestrate features, handle routing
├─────────────────────────────────────────┤
│         Feature Components              │  ← Business logic + UI untuk satu fitur
├─────────────────────────────────────────┤
│           Custom Hooks                  │  ← Data fetching, state, side effects
├────────────────────┬────────────────────┤
│   Service Layer    │   Zustand Stores   │  ← API calls | Global state cache
├────────────────────┴────────────────────┤
│        Shared Components / UI           │  ← Pure UI, zero business logic
├─────────────────────────────────────────┤
│         lib / utils / types             │  ← Pure functions, no React
└─────────────────────────────────────────┘

Dependency Rule: layer bawah TIDAK BOLEH import dari layer atas.
```

---

## 7. State Management Pattern (Zustand)

Hanya state **global & lintas-fitur** yang masuk Zustand. State lokal satu komponen tetap pakai `useState`.

```typescript
// store/auth.store.ts
interface AuthStore {
  user: User | null
  token: string | null          // in-memory only, BUKAN localStorage
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

// store/ui.store.ts
interface UiStore {
  sidebarCollapsed: boolean
  activeModal: string | null     // modal stack by ID
  toasts: Toast[]
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

// store/notification.store.ts
interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isPolling: boolean
  setNotifications: (notifs: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismiss: (id: string) => void
}
```

---

## 8. Service Layer Pattern

Semua API call dipisah dari hooks ke dalam service functions.

```typescript
// features/products/products.service.ts
import { apiClient } from '@/lib/api-client'
import type { Product, CreateProductPayload } from './types'
import type { PaginatedResponse } from '@/types'

export const productsService = {
  getAll: (params: ProductFilterParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>('/products', payload),

  update: (id: string, payload: Partial<CreateProductPayload>) =>
    apiClient.patch<Product>(`/products/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),
}
```

---

## 9. Routing & Navigasi

Semua route string didefinisikan sebagai konstanta di `constants/routes.constants.ts`:

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: {
    LIST: '/products',
    NEW: '/products/new',
    DETAIL: (id: string) => `/products/${id}`,
    EDIT: (id: string) => `/products/${id}/edit`,
  },
  INVENTORY: {
    SUMMARY: '/inventory',
    STOCK_IN: '/inventory/stock-in',
    STOCK_OUT: '/inventory/stock-out',
    TRANSFER: '/inventory/transfer',
    ADJUSTMENT: '/inventory/adjustment',
    STOCK_TAKING: '/inventory/stock-taking',
  },
  BARCODE: {
    SCANNER: '/barcode',
    PRINT: '/barcode/print',
  },
  SUPPLIERS: {
    LIST: '/suppliers',
    DETAIL: (id: string) => `/suppliers/${id}`,
  },
  PURCHASE_ORDERS: {
    LIST: '/purchase-orders',
    NEW: '/purchase-orders/new',
    DETAIL: (id: string) => `/purchase-orders/${id}`,
  },
  REPORTS: {
    STOCK: '/reports/stock',
    MOVEMENT: '/reports/movement',
    PURCHASES: '/reports/purchases',
    EXPIRED: '/reports/expired',
  },
  SETTINGS: {
    PROFILE: '/settings/profile',
    USERS: '/settings/users',
    CATEGORIES: '/settings/categories',
    LOCATIONS: '/settings/locations',
    UNITS: '/settings/units',
  },
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
} as const
```

---

## 10. RBAC Implementation

```typescript
// types/roles.types.ts
export type Role = 'owner' | 'manajer' | 'admin' | 'gudang' | 'barista'

export type PermissionKey =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'inventory:read' | 'inventory:write' | 'inventory:approve'
  | 'barcode:scan' | 'barcode:print' | 'barcode:generate'
  | 'suppliers:read' | 'suppliers:write'
  | 'po:read' | 'po:create' | 'po:approve' | 'po:receive'
  | 'reports:basic' | 'reports:full'
  | 'users:read' | 'users:write'
  | 'settings:read' | 'settings:write'
  | 'notifications:all' | 'notifications:own'

// constants/permissions.constants.ts
export const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  owner:   ['products:read', 'products:write', 'products:delete', /* semua */],
  manajer: ['products:read', 'products:write', 'inventory:read', 'inventory:write', 'inventory:approve', /* ... */],
  admin:   ['products:read', 'products:write', 'inventory:read', 'inventory:write', /* ... */],
  gudang:  ['products:read', 'inventory:read', 'inventory:write', 'barcode:scan', 'barcode:print', 'po:read', 'po:receive'],
  barista: ['products:read', 'inventory:read', 'barcode:scan', 'notifications:own'],
}

// features/auth/hooks/usePermission.ts
export const usePermission = () => {
  const { user } = useAuthStore()
  const can = (permission: PermissionKey): boolean => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
  }
  return { can }
}

// Usage di komponen:
// const { can } = usePermission()
// {can('products:write') && <Button>Tambah Produk</Button>}
```

---

## 11. RBAC — Permission Matrix

| Fitur | Owner | Manajer | Admin | Gudang | Barista |
|-------|-------|---------|-------|--------|---------|
| Lihat Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRUD Produk | ✅ | ✅ | ✅ | ❌ | ❌ |
| Lihat Stok | ✅ | ✅ | ✅ | ✅ | ✅ (terbatas) |
| Stok Masuk/Keluar | ✅ | ✅ | ✅ | ✅ | ❌ |
| Transfer Stok | ✅ | ✅ | ✅ | ✅ | ❌ |
| Stock Opname | ✅ | ✅ | ✅ | ❌ | ❌ |
| Scan Barcode | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cetak Barcode | ✅ | ✅ | ✅ | ✅ | ❌ |
| CRUD Supplier | ✅ | ✅ | ✅ | ❌ | ❌ |
| Purchase Order | ✅ | ✅ (approve) | ✅ (buat) | ✅ (terima) | ❌ |
| Laporan | ✅ (semua) | ✅ (semua) | ✅ (terbatas) | ❌ | ❌ |
| Manajemen User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pengaturan Sistem | ✅ | ✅ (terbatas) | ❌ | ❌ | ❌ |
| Notifikasi | ✅ (semua) | ✅ (semua) | ✅ | ✅ | ✅ (terbatas) |

---

## 12. Design System

### Color Tokens (Tailwind CSS Variables)
```css
/* styles/globals.css */
:root {
  --color-primary:    #4F46E5; /* indigo-600 */
  --color-success:    #10B981; /* emerald-500 */
  --color-warning:    #F59E0B; /* amber-500 */
  --color-danger:     #EF4444; /* red-500 */
  --color-info:       #3B82F6; /* blue-500 */
}
```

### Komponen Wajib
- `Button` — variant: primary, secondary, danger, ghost + size: sm, md, lg
- `Badge` — variant: success, warning, danger, info, neutral
- `StatusBadge` — khusus stock: Cukup | Rendah | Kritis | Habis
- `DataTable` — sort, filter, pagination, bulk select, empty state
- `StatsCard` — icon + value + label + optional trend indicator
- `Toast` — success, error, warning, info + auto-dismiss
- `ConfirmDialog` — reusable delete/action confirmation

---

## 13. Dependencies Utama

```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.26.0",
  "zustand": "^4.5.0",
  "typescript": "^5.5.0",
  "tailwindcss": "^3.4.0",
  "vite": "^5.4.0",
  "@zxing/browser": "^0.1.4",
  "jsbarcode": "^3.11.6",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "recharts": "^2.12.0",
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0",
  "zod": "^3.23.0",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.441.0",
  "axios": "^1.7.0",
  "react-virtual": "^2.10.4",
  "dompurify": "^3.1.0",
  "@types/dompurify": "^3.0.5",
  "axios-retry": "^4.5.0"
}
```

### 13.1 Catatan Library — Form Validation

| Library | Peran |
|---------|-------|
| `zod` | Schema validation & type inference — sumber kebenaran tipe data form |
| `react-hook-form` | Form state management — performant, uncontrolled, minimal re-render |
| `@hookform/resolvers` | Jembatan antara Zod schema dan react-hook-form (`zodResolver`) |

**Pola wajib di setiap form:**
```typescript
// Contoh: features/auth/auth.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// Contoh: features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../auth.schema'

const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
})
```

### 13.2 Catatan Library — Security

| Library | Peran | Digunakan Di |
|---------|-------|-------------|
| `dompurify` | Sanitasi HTML sebelum dirender ke DOM — cegah XSS | Semua tempat yang render user-generated content atau data dari API |
| `axios-retry` | Retry otomatis dengan exponential backoff — cegah abuse akibat flaky network; dikombinasikan dengan rate-limit header dari backend | `lib/api-client.ts` |

**Security layer yang sudah tercakup di PRD (tidak perlu library tambahan):**
- ✅ **JWT in-memory** — token disimpan di Zustand (bukan localStorage/cookie), hilang saat tab ditutup
- ✅ **RBAC client-side** — `usePermission()` + `RoleGuard` mencegah render UI yang tidak berhak
- ✅ **Zod validation** — semua input form divalidasi secara ketat sebelum dikirim ke API
- ✅ **TypeScript strict** — mencegah tipe data tak terduga masuk ke layer business logic

**Implementasi DOMPurify di `lib/utils.ts`:**
```typescript
import DOMPurify from 'dompurify'

/**
 * Gunakan ini sebelum merender string HTML apapun dari API / user input
 * ke dalam dangerouslySetInnerHTML atau innerHTML
 */
export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } })
```

**Implementasi axios-retry di `lib/api-client.ts`:**
```typescript
import axiosRetry from 'axios-retry'

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    (error.response?.status !== undefined && error.response.status >= 500),
})
```

---

## 14. Milestones & Prioritas Pengembangan

| Sprint | Modul | Estimasi |
|--------|-------|----------|
| Sprint 1 | Setup proyek + path aliases, Auth, AppLayout, RBAC | 1 minggu |
| Sprint 2 | Shared UI components (Button, Table, Modal, Toast, dll) | 0.5 minggu |
| Sprint 3 | Modul Produk & Kategori | 1 minggu |
| Sprint 4 | Modul Inventaris (Stok Masuk/Keluar/Transfer/Opname) | 1.5 minggu |
| Sprint 5 | Modul Barcode (Generate, Scan, Cetak Label) | 1 minggu |
| Sprint 6 | Modul Notifikasi Stok Minimum | 0.5 minggu |
| Sprint 7 | Modul Supplier & Purchase Order | 1.5 minggu |
| Sprint 8 | Modul Laporan & Dashboard Analytics | 1.5 minggu |
| Sprint 9 | Modul Settings, Testing, Polish & Bug Fix | 1 minggu |

**Total Estimasi: ~9.5 minggu (frontend)**

---

## 15. Risiko & Mitigasi

| Risiko | Level | Mitigasi |
|--------|-------|----------|
| Kamera tidak tersedia di device tertentu | Medium | Fallback input manual barcode |
| Print label tidak presisi di semua printer | Medium | Preview real-size, template kustomisasi ukuran |
| Performa tabel dengan data besar | Medium | `react-virtual` untuk virtualized list |
| Konflik role permission yang kompleks | Low | Centralized `ROLE_PERMISSIONS` di `constants/permissions.constants.ts` |
| Circular dependency antar feature | Medium | Dependency rule ketat, shared logic naik ke `lib/` atau `hooks/` |

---

*Dokumen ini merupakan living document dan dapat diperbarui seiring perkembangan proyek.*

# ⚡ VOLTEDGE ELECTRONICS
> **Tagline:** Powering Your Digital World.  
> **Project Type:** Electronics Showroom Website, E-Commerce Platform & After-Sales Service Management System  
> **Milestones:** Complete Implementation (Milestones 1, 2, 3 & 4)

---

## ⚡ Overview

**VOLTEDGE Electronics** is a high-performance showroom website, end-to-end e-commerce platform, and comprehensive after-sales service management system. Designed for high-end consumer electronics, computing workstations, audiophile sound equipment, pro gaming gear, and smart home ecosystems, VOLTEDGE delivers a unified omni-channel tech retail experience.

This repository contains the complete implementation across all **4 project milestones**:

1. **Milestone 1 — Storefront Catalog & Technical Foundation:** Interactive product catalog, category navigation, dynamic filtering, search, quick view modals, and responsive dark-slate design system.
2. **Milestone 2 — Showroom Management & Admin Dashboard:** Role-Based Access Control (RBAC), multi-role staff authentication, real-time stock control, inventory movement audit ledger (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`), coupons, showroom settings, and customer enquiry queues.
3. **Milestone 3 — Customer Portal, Cart, Checkout & Payments:** Secure customer authentication (JWT & HTTP-only cookies), multi-address management, synchronized cart with real-time stock checks, product comparison matrix, multi-step checkout, official Razorpay payment gateway integration (HMAC-SHA256 signature verification), Cash on Delivery (COD), printable tax invoices, and verified product reviews.
4. **Milestone 4 — After-Sales Services, RMA, Returns, Tracking & Business Analytics:** End-to-end warranty claims with supporting document uploads, electronics repair & service booking, customer return requests with product inspection and safe restocking, online Razorpay and COD refund processing, real-time order delivery tracking with visual timelines, customer & admin in-app notification queues, and business analytics with CSV exports.

---

## 🛠 Technology Stack

### Frontend (`/client`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (VOLTEDGE Design System: Deep Slate/Navy `#0f172a`, Electric Cyan `#38bdf8`, Electric Blue `#2563eb`)
- **Routing:** React Router v7 with URL search params state synchronization (`?tab=...`)
- **HTTP Client:** Axios with JWT, Cookie, and Guest-Token interceptors
- **State & Contexts:** `CustomerAuthContext`, `CartContext`, `WishlistContext`, `CompareContext`, `ToastContext`, `AdminAuthContext`
- **Iconography:** Lucide React
- **Payments:** Official Razorpay Checkout client-side modal integration

### Backend (`/server`)
- **Runtime:** Node.js v24
- **Framework:** Express.js (ESM) + TypeScript
- **Security & Auth:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT customer & admin sessions), `cookie-parser` (HTTP-only secure cookies)
- **Payment Gateway:** Official `razorpay` Node.js SDK with test mode, cryptographic HMAC-SHA256 verification, and idempotent webhook listeners
- **Transactional Consistency:** Prisma `$transaction` operations for checkout, stock deduction, and inventory movement audit logs
- **Notifications & Mailer:** Reusable branded HTML email templates with `nodemailer` and graceful fallback logging in development
- **File Uploads:** `multer` for secure warranty documents, product images, and service photos

### Database & ORM (`/server/prisma`)
- **ORM:** Prisma ORM v5.22
- **Database Engine:** SQLite by default (`file:./dev.db`) for instant zero-configuration testing, with seamless PostgreSQL schema support (`schema.postgresql.prisma`) for cloud deployments (Supabase, Neon, AWS RDS, Vercel).
- **Architecture:** 38 relational models with referential integrity and audit trails.

---

## 🧩 Architectural Milestones & Features

### 🌟 Milestone 1: Storefront Catalog & Visual Experience
- **Dynamic Hero Banner:** Promotional carousel with call-to-action routing and brand highlights.
- **Category & Brand Browsing:** Direct category navigation (Laptops, Smartphones, Audio, Gaming, Smart Home) and brand showcases (Apple, Sony, ASUS ROG, Bose, Samsung).
- **Search & Advanced Filters:** Real-time text search, brand/category filters, price range sliders, availability toggles, and sorting (Price, Newest, Best Selling, Rating).
- **Product Details & Quick View:** Multi-image gallery with thumbnail selection, stock badges, technical specifications sheet, and warranty indicators.

### 🛡 Milestone 2: Admin Dashboard & Inventory Management
- **Role-Based Access Control (RBAC):** `SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER`, and `SALES_STAFF` with granular route protection and permission guards.
- **Product & Category CRUD:** Manage products with SKU generation, cost price, selling price, image arrays, and category assignment.
- **Inventory & Movement Ledger:** Strict stock control with automatic movement auditing (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, `RETURN_RESTOCK`), recording before/after stock quantities and staff user stamps.
- **Coupons & Promotions:** Percentage and fixed discounts, minimum spend thresholds, usage limits, and expiration controls.
- **Showroom Settings:** Configure store branding, tax rate (GST 18%), return window days, and low stock thresholds.

### 🛒 Milestone 3: Customer Portal, Cart, Checkout & Payments
- **Customer Authentication:** Secure registration, login, logout, password reset via time-limited tokens, and session persistence.
- **Guest-to-Customer Cart Merge:** Guest cart items seamlessly merge upon customer login without duplicate items or stock over-allocation.
- **Product Comparison Matrix:** Side-by-side comparison of up to 4 devices across technical specifications, pricing, brand, and warranty.
- **Synchronized Shopping Cart & Wishlist:** Real-time stock limit checks, server-authoritative GST and shipping fee calculations.
- **Multi-Step Checkout:** Delivery address selection, shipping method selection, coupon validation, and payment option choice.
- **Razorpay Online & Cash on Delivery (COD):** Server-side Razorpay order generation, HMAC-SHA256 signature verification, and atomic inventory reduction in an ACID transaction.
- **Printable Tax Invoices:** Compliant tax invoices generated from saved order snapshots with GST breakdown and print-to-PDF formatting.
- **Verified Reviews & Ratings:** 1–5 star reviews with verified purchase validation and automatic product rating recalculation.

### 🔧 Milestone 4: After-Sales Services, RMA, Returns & Tracking
- **Warranty Claims Management (RMA):** Customers submit warranty claims with serial numbers, issue descriptions, and supporting document attachments. Admins review claims, request additional information, approve replacements, or dispatch to service centers.
- **Electronics Repair & Service Booking:** Customers book repairs for in-store drop-off or doorstep technician visits across all electronics categories. Admins assign technicians, provide inspection notes, and set cost estimates.
- **Returns & Safe Inventory Restocking:** Customers submit return requests within the showroom's return window. Admins inspect returned products and can safely restock inventory with an automated `RETURN_RESTOCK` audit log.
- **Refunds Processing (Online & COD):** Process Razorpay online refunds via SDK and record manual COD refund receipts with audit notes.
- **Live Order & Delivery Tracking:** Real-time order progress timeline (`Order Confirmed` ➔ `Processing` ➔ `Dispatched` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`) with tracking numbers and courier partner references.
- **In-App Notification Queues:** Real-time customer and admin alert center for order status updates, warranty resolutions, return approvals, and low stock alerts.
- **Business Intelligence & CSV Exporting:** Exportable sales, inventory, and movement reports in CSV format for accounting and showroom auditing.

---

## 📡 REST API Reference

### Storefront & Catalog (Public)
- `GET /api/products` - List products with search, pagination, and filters
- `GET /api/products/:slug` - Product details by slug
- `GET /api/categories` - List active categories
- `GET /api/brands` - List active brands
- `GET /api/banners` - Storefront promotional banners
- `GET /api/testimonials` - Customer testimonials
- `POST /api/newsletter/subscribe` - Newsletter subscription
- `POST /api/enquiries` - Contact enquiry submission

### Customer Authentication & Profile
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate customer & merge guest cart
- `POST /api/auth/logout` - Clear customer session cookie
- `GET /api/auth/me` - Authenticated customer profile
- `POST /api/auth/forgot-password` - Request password reset token
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/customer/profile` - Customer profile details
- `PUT /api/customer/profile` - Update customer name & phone
- `PUT /api/customer/change-password` - Change account password
- `GET /api/customer/addresses` - List customer addresses
- `POST /api/customer/addresses` - Add new address
- `PUT /api/customer/addresses/:id` - Update address
- `DELETE /api/customer/addresses/:id` - Delete address

### Shopping Cart, Wishlist & Comparison
- `GET /api/cart` - Authoritative cart with subtotal & tax
- `POST /api/cart/items` - Add item to cart with stock validation
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `GET /api/wishlist` - Customer saved wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist
- `POST /api/wishlist/move-to-cart` - Move wishlist item directly to cart

### Checkout, Payments & Invoices
- `POST /api/checkout/validate` - Pre-flight calculation & stock verification
- `POST /api/checkout/apply-coupon` - Coupon discount validation
- `POST /api/checkout/create-order` - Atomic order creation & inventory deduction
- `POST /api/payments/razorpay/create-order` - Generate Razorpay payment order
- `POST /api/payments/razorpay/verify` - Verify HMAC-SHA256 signature
- `POST /api/payments/razorpay/webhook` - Idempotent Razorpay webhook listener
- `GET /api/customer/orders` - Customer order history
- `GET /api/customer/orders/:id` - Order details & timeline
- `GET /api/customer/orders/:id/invoice` - Tax invoice snapshot & printable data

### Warranty Claims & Service Requests (Milestone 4)
- `POST /api/warranty/claims` - Customer submits warranty claim
- `GET /api/customer/warranty-claims` - Customer's warranty claim history
- `GET /api/admin/warranty/claims` - Admin lists & filters warranty claims
- `PATCH /api/admin/warranty/claims/:id` - Admin updates claim status & notes
- `POST /api/service/requests` - Customer books repair or technician visit
- `GET /api/customer/service-requests` - Customer's service requests
- `GET /api/admin/service/requests` - Admin manages service requests & assigns staff
- `PATCH /api/admin/service/requests/:id` - Admin updates repair status & cost

### Returns, Refunds & Delivery Tracking (Milestone 4)
- `POST /api/returns/requests` - Customer submits return request
- `GET /api/customer/returns` - Customer's return requests
- `GET /api/admin/returns` - Admin lists return requests
- `PATCH /api/admin/returns/:id` - Admin updates return status & approves restock
- `POST /api/admin/refunds/process` - Admin processes online or COD refund
- `GET /api/orders/:orderId/delivery` - Order delivery tracking timeline
- `PATCH /api/admin/orders/:orderId/delivery` - Admin updates courier tracking & milestones

### In-App Notifications & Browsing (Milestone 4)
- `GET /api/customer/notifications` - Customer notification feed
- `PATCH /api/customer/notifications/:id/read` - Mark notification as read
- `GET /api/admin/notifications` - Admin operational alerts
- `PATCH /api/admin/notifications/:id/read` - Mark admin notification as read
- `POST /api/products/view` - Record recently viewed product
- `GET /api/customer/recently-viewed` - Customer's recently viewed products

---

## 🧪 Automated Verification Test Suites

VOLTEDGE includes comprehensive automated test suites covering all 4 milestones:

| Suite | File | Focus Area | Command |
|---|---|---|---|
| **Milestone 1** | `server/test-api.js` | Storefront Catalog, Search & Health | `npm run test:m1` |
| **Milestone 2** | `server/test-m2-api.js` | Admin Dashboard, RBAC & Stock Movements | `npm run test:m2` |
| **Milestone 3** | `server/test-m3-api.js` | Customer Auth, Cart, Checkout & Razorpay | `npm run test:m3` |
| **Milestone 4** | `server/test-m4-api.js` | Warranty RMA, Repairs, Returns, Refunds & Analytics | `npm run test:m4` |
| **All Tests** | All Suites | Full Regression & Integration Verification | `npm run test:all` |

### Run Milestone 4 Tests:
```bash
npm run test:m4
```

### Run All 4 Milestone Suites Concurrently / Sequentially:
```bash
npm run test:all
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v20+ (v24 recommended)
- **npm:** v10+

### 2. Installation
```bash
# In the project root:
npm run install:all
```

### 3. Environment Configuration (`server/.env`)
Ensure `server/.env` is configured (pre-configured template provided in `server/.env.example`):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
JWT_SECRET=voltedge_super_secret_jwt_admin_token_2026
CUSTOMER_JWT_SECRET=voltedge_super_secret_customer_jwt_2026
COOKIE_SECRET=voltedge_cookie_signing_secret_2026

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_voltedge2026
RAZORPAY_KEY_SECRET=testSecretKeyVoltEdge2026
RAZORPAY_WEBHOOK_SECRET=testWebhookSecretVoltEdge2026

# Cash on Delivery
COD_ENABLED=true
```

### 4. Database Setup & Seeding
```bash
# Push schema to SQLite database:
cd server && npx prisma db push

# Seed showroom catalog and admin accounts:
npm run seed
```

### 5. Build & Start Applications
```bash
# Build both client and server:
npm run build

# Start both backend and frontend concurrently:
npm run dev
```

- **Customer Storefront:** `http://localhost:5173`
- **Customer Account Portal:** `http://localhost:5173/account`
- **Product Comparison:** `http://localhost:5173/compare`
- **Staff Admin Dashboard:** `http://localhost:5173/admin`
- **Backend API:** `http://localhost:5000/api`
- **API Health Check:** `http://localhost:5000/api/health`

---

## 🔑 Demo Access Credentials

### Admin Dashboard (`/admin/login`)
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Super Admin** | `admin@voltedge.com` | `AdminPassword@123` | Full access, staff management, settings |
| **Inventory Manager** | `inventory@voltedge.com` | `StaffPassword@123` | Products, categories, brands, stock adjustments |
| **Sales Staff** | `sales@voltedge.com` | `StaffPassword@123` | Orders, customer enquiries, returns, warranty |

### Customer Portal (`/login`)
| Account | Email | Password | Features |
|---|---|---|---|
| **Demo Customer** | `customer@voltedge.com` | `CustomerPassword@123` | Orders, addresses, warranty claims, service booking |
| **New Customer** | Self-register on `/register` | Minimum 8 characters | Instant access & guest cart merge |

---

## 🗄️ Dual-Database Support (SQLite & PostgreSQL)

- **Local Zero-Config Development:** Pre-configured with SQLite (`server/prisma/schema.prisma`). No Docker or local database service setup required.
- **Cloud Production Deployment:** Enterprise PostgreSQL schema available at `server/prisma/schema.postgresql.prisma`. To deploy on PostgreSQL:
  ```bash
  # In server directory:
  cp prisma/schema.postgresql.prisma prisma/schema.prisma
  npx prisma generate
  npx prisma db push
  ```

---

## 📄 License & Credits
© 2026 VOLTEDGE Electronics Inc. All rights reserved.  
Powering Your Digital World.

# Ultra Mobile Admin Dashboard

A full-featured **Next.js 15** admin dashboard for the **Ultra Mobile** Android app — built with Firebase, Tailwind CSS v4, and shadcn/ui components. Manages products, orders, categories, customers, and admin users in real time.

---

## ✨ Features

| Module | Capabilities |
|---|---|
| **Dashboard** | Revenue chart, KPI cards (revenue, orders, customers, products), recent orders table |
| **Products** | Full CRUD — add/edit/delete products, image upload to Firebase Storage, product attributes (storage, color, RAM, etc.) |
| **Categories** | Add, edit, delete product categories with images |
| **Orders** | View all orders with expandable details (shipping address, items), update order status |
| **Customers** | View all registered app users |
| **Users** | Create admin users, promote/demote roles |

---

## 🔧 Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm/yarn
- A **Firebase project** — `ultra-mobile-652ff` (already configured)
- A **Firebase service account** JSON file (for the Admin SDK)

---

## 🚀 Setup

### 1. Install dependencies

```bash
pnpm install
# or
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

The `.env.example` already has the correct Firebase client-side keys pre-filled for `ultra-mobile-652ff`. You do **not** need to change those.

### 3. Download Firebase Service Account (Admin SDK)

The server-side Firebase Admin SDK needs a service account key:

1. Go to [Firebase Console](https://console.firebase.google.com) → **ultra-mobile-652ff**
2. Click the ⚙️ gear icon → **Project Settings**
3. Go to the **Service Accounts** tab
4. Click **Generate new private key** → download the JSON file
5. Rename it to `service-account.json` and place it in the **project root**

> ⚠️ `service-account.json` is already in `.gitignore` — never commit it.

**For production (Vercel etc.):** Instead of the file, paste the JSON as a single line into `FIREBASE_SERVICE_ACCOUNT_KEY` in your environment variables.

### 4. Set up Firebase (one-time)

Enable these in Firebase Console for `ultra-mobile-652ff`:

- **Authentication** → Sign-in method → **Email/Password** → Enable
- **Firestore Database** → Create database (Production mode)
- **Storage** → Get started

#### Firestore Security Rules (paste in Firebase Console)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users — only the user themselves or admins
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    // Products, categories, orders — admin write, authenticated read
    match /products/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /categories/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /orders/{id} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Create your first admin user

Start the dev server first:

```bash
pnpm dev
```

Then run this `curl` command (or use Postman):

```bash
curl -X POST http://localhost:3000/api/seed-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ultramobile.lk",
    "password": "YourSecurePassword123!",
    "displayName": "Ultra Mobile Admin",
    "secretKey": "ultra-mobile-seed-change-me"
  }'
```

> Change `secretKey` to match `SEED_SECRET` in your `.env.local`.

### 6. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin credentials you just created.

---

## 📁 Project Structure

```
ultra-mobile-admin/
├── app/
│   ├── (protected)/          # All admin pages (auth-guarded)
│   │   ├── page.tsx          # Dashboard
│   │   ├── products/         # Products list + add/edit
│   │   ├── categories/       # Categories CRUD
│   │   ├── orders/           # Orders management
│   │   ├── customers/        # Customers list
│   │   └── users/            # Admin users management
│   ├── api/                  # Next.js API routes (server-side)
│   │   ├── auth/             # Token verification
│   │   ├── products/         # Products CRUD
│   │   ├── orders/           # Orders + status update
│   │   ├── categories/       # Categories CRUD
│   │   ├── customers/        # Customer list
│   │   ├── users/            # Admin user management
│   │   ├── upload/           # Firebase Storage upload
│   │   └── seed-admin/       # First-run admin creation
│   ├── sign-in/              # Login page
│   └── globals.css           # Tailwind + Ultra Mobile theme
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── app-sidebar.tsx       # Navigation sidebar
│   ├── site-header.tsx       # Top header
│   ├── section-cards.tsx     # KPI stat cards
│   ├── chart-area-interactive.tsx  # Revenue chart
│   └── data-table.tsx        # Orders table
├── contexts/
│   └── AuthContext.tsx       # Firebase Auth + admin role
├── lib/
│   ├── firebase.ts           # Client SDK (lazy-loaded)
│   └── firebase-admin.ts     # Admin SDK (server only)
├── service-account.json      # ← YOU ADD THIS (gitignored)
└── .env.local                # ← YOU ADD THIS (gitignored)
```

---

## 🔗 Firebase Data Model

The admin dashboard reads/writes these Firestore collections, matching the UltraMobile Android app:

| Collection | Fields |
|---|---|
| `products` | `name`, `description`, `basePrice`, `totalStock`, `categoryId`, `categoryName`, `imageUrls[]`, `attributes[]`, `active`, `rating`, `reviewCount` |
| `categories` | `name`, `imageUrl`, `productCount` |
| `orders` | `orderId`, `userId`, `totalAmount`, `status`, `orderDate`, `orderItems[]`, `shippingAddress`, `billingAddress` |
| `users` | `uid`, `name`, `email`, `role` (`admin`\|`user`), `profilePicUrl` |

---

## 🚢 Production Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables:
   - All `NEXT_PUBLIC_*` keys from `.env.example`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` — paste the entire `service-account.json` content as a single-line JSON string
   - `SEED_SECRET` — a strong random string
4. Deploy

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router, Server Components)
- **Firebase 11** (Auth, Firestore, Storage)
- **Firebase Admin SDK 13**
- **Tailwind CSS v4**
- **shadcn/ui** (Radix UI primitives)
- **Recharts** (revenue chart)
- **Sonner** (toast notifications)
- **TypeScript 5**
- **@tabler/icons-react** (icons)

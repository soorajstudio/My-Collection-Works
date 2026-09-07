# My Library — Personal Digital Collection Platform

An award-winning, modern, responsive personal digital collection management website for books, certificates, and software engineering projects. Engineered with a decoupled, platform-independent backend architecture ready for future mobile applications (Flutter / React Native) without redesign.

---

## Architecture Overview

```
                        MY LIBRARY WEBSITE / FUTURE MOBILE APP
                                          |
                                          v
                                       APPWRITE
                         +----------------+----------------+
                         |                |                |
                    Auth System        Database       Permissions (RLS)
                         |                |
                 +-------+--------+       +----------------+---------------+
                 |                |       |                |               |
               Email          Username  Books         Certificates      Projects
                                          |                |               |
                                          +-------+--------+---------------+
                                                  |
                                            File References
                                                  |
                                                  v
                                           CLOUDFLARE R2
                                  +---------------+---------------+
                                  |               |               |
                               Images           PDFs       APKs / Videos
```

- **Structured Data & References**: Stored exclusively inside **Appwrite Database**.
- **Large Binary Files**: Stored exclusively inside **Cloudflare R2** via pre-signed URLs.
- **Zero Binary Blobs in Database**: High performance, zero egress fees, and secure storage isolation (`{userId}/...`).
- **Zero Credentials in Frontend**: All secret keys (`APPWRITE_API_KEY`, `R2_SECRET_ACCESS_KEY`) remain strictly server-side.

---

## Key Features

1. **Awwwards / Dribbble-Caliber UI Design**:
   - Obsidian & Deep Indigo luxury aesthetic with backdrop blur (`backdrop-blur-xl`), micro-borders, and subtle ambient glows.
   - Attractive Hero Section with live statistics ticker, parallax scroll interactions, and floating 3D showcase cards.
   - Smooth transitions and spring physics powered by `framer-motion`.

2. **Dual-Identifier Authentication**:
   - Users can log in using either **Email + Password** OR **Username + Password** (e.g. `sooraj` or `sooraj@example.com`).
   - Registration includes password security checks, unique username verification, and confirm password matching.

3. **Intelligent Page & Chapter Tracking**:
   - **Manga / Manhwa / Comics**: Tracks current chapter, total chapters, and percentage.
   - **Novels / Other Books**: Tracks current page, total pages, and percentage.
   - Intelligent status transition: Automatically removes completed titles from "Continue Reading".
   - Non-duplicating Wishlist state.

4. **Certificates & Qualifications**:
   - Issue date and dynamic expiry monitor ("Active", "Expires in 35d", "Lifetime", "Expired").
   - Verification URLs and direct PDF reader previews.

5. **Software Engineering Projects**:
   - Multi-tag tech stack filters, status tracker (`Planned`, `In Progress`, `Completed`, `Archived`), and key features list.
   - Media showcase: App icons, screenshots, and direct Android APK build downloads.

6. **Global Search (`Cmd+K` / `Ctrl+K`)**:
   - Instant keyboard-accessible modal searching across books, certificates, and projects metadata without fetching binary blobs.

7. **Four Dedicated Live Dashboards**:
   - **Main Dashboard**: Global overview, Continue Reading shelf, recent additions.
   - **Books Dashboard**: Status breakdown, overall progress bar, category distribution, and language metrics.
   - **Certificates Dashboard**: Yearly trajectory, issuing organizations, and expiry breakdown.
   - **Projects Dashboard**: Status distribution, technology frequency breakdown.

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```

The app will launch at `http://localhost:5173`. Out-of-the-box, it operates in **Dual-Driver Demo Mode** with rich sample data (One Piece, Atomic Habits, AWS Certification, Flutter E-Commerce Project) and reactive `localStorage` persistence. You can click **"Explore with Demo Account (Sooraj)"** on the login page to immediately test all features!

---

## Connecting Production Appwrite & Cloudflare R2

### 1. Configure `.env`
Copy `.env.example` to `.env` and insert your credentials:

```env
# Appwrite
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=my_library_db

# Collections
VITE_APPWRITE_COLLECTION_PROFILES=user_profiles
VITE_APPWRITE_COLLECTION_BOOKS=books
VITE_APPWRITE_COLLECTION_READING_STATES=reading_states
VITE_APPWRITE_COLLECTION_CERTIFICATES=certificates
VITE_APPWRITE_COLLECTION_PROJECTS=projects

# Cloudflare R2 Signer Function
VITE_R2_SIGNER_ENDPOINT=https://your-appwrite-function-or-worker.com/api/r2
VITE_R2_PUBLIC_URL=https://pub-your-bucket.r2.dev

# Turn off mock mode to use live Appwrite & R2
VITE_USE_MOCK_FALLBACK=false
```

### 2. Auto-Provision Appwrite Database Collections
Run the included database provisioning script:
```bash
APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" \
APPWRITE_PROJECT_ID="your_project_id" \
APPWRITE_API_KEY="your_secret_api_key" \
node backend/setup-appwrite-db.js
```

### 3. Deploy the Cloudflare R2 Presigned Signer
Deploy the code in `backend/r2-signer/` as an Appwrite Function or Cloudflare Worker with environment variables:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`

---

## Production Build & Verification

```bash
npm run build
```
Generates a minified, tree-shaken, ultra-fast production bundle inside `dist/`.

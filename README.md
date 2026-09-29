# My Library — Personal Digital Collection & Engineering Showcase

An award-winning, modern, responsive digital vault for managing personal collections of books, certificates, and engineering builds (Websites & Mobile Apps). Engineered with **React**, **TypeScript**, **Tailwind CSS**, and backed by **Supabase (PostgreSQL + Supabase Storage)**.

---

## 🏛️ Architecture Overview

```
                         MY LIBRARY APPLICATION
                                   │
                                   ▼
                         SUPABASE CLOUD PLATFORM
         ┌─────────────────────────┴─────────────────────────┐
         │                                                   │
         ▼                                                   ▼
 SUPABASE POSTGRESQL                                  SUPABASE STORAGE
 (Relational Engine & RLS)                           (`vault_files` Bucket)
 ├── books & reading_states                          ├── Book & Manga Covers
 ├── certificates                                    ├── Certificate Documents
 └── projects (Websites & Apps)                      ├── Multi-Image Screenshots
                                                     └── Android APK Release Binaries
```

* **Relational Data**: Stored in high-performance PostgreSQL tables with Row-Level Security.
* **Asset Storage**: Media files, screenshots, and APKs are streamed directly to Supabase Storage with zero middleman overhead.
* **Security First**: Client applications interact only through the public anon publishable key; secret administrative keys remain strictly server-side.

---

## 🚀 Key Features

### 1. 🌐 Dedicated Websites & 📱 Mobile Apps Showcase
* **Two Dedicated Project Modes**:
  * **🌐 Website Section**:
    * Heading / Title and short pitch.
    * Detailed architecture and system overview.
    * Multi-image screenshot gallery upload with live progress tracking.
    * Live Host Link (non-mandatory — leave empty if offline or unhosted).
  * **📱 Mobile App Section**:
    * Heading / Name and description.
    * Multi-image app UI screenshots and mockup previews.
    * Direct Android Package Release (**APK**) file upload with direct one-click download buttons (non-mandatory).
* **Interactive Media Lightbox**:
  * Inspect any uploaded screenshot in full high-resolution with a responsive lightbox modal.
* **Filter Tabs & Quick Access**:
  * Instant tab filters for `All Projects`, `Websites`, and `Mobile Apps`.
  * Quick-add menu in the top navigation bar with dedicated buttons for **Add Website** and **Add Mobile App**.

### 2. 📚 Books, Manga & Manhwa Tracker
* **Dual Reading Progress Engine**:
  * **Manga / Manhwa / Comics**: Tracks current chapter vs. total chapters.
  * **Novels / Non-Fiction**: Tracks current page vs. total pages with automatic percentage calculation.
* **Automatic Status Management**:
  * Reads, Wishlist, and Completed states.
  * Titles automatically transition away from "Continue Reading" upon completion.

### 3. 📜 Credentials & Certificates Vault
* **Lifespan Monitor**:
  * Dynamic status indicator (*Active*, *Expiring soon*, *Lifetime*, *Expired*).
  * Credential verification URLs and embedded previews.

### 4. ⚡ Global Command Palette (`Cmd+K` / `Ctrl+K`)
* Keyboard-driven instant search across all books, certificates, websites, and mobile applications without performance degradation.

### 5. 📊 Real-Time Analytics Dashboards
* **Global Overview**: Recent additions, active reads, and portfolio metrics.
* **Books Analytics**: Status breakdown, reading velocity, and format distribution.
* **Certificates Trajectory**: Yearly issuance and qualification milestones.
* **Engineering Analytics**: Tech stack usage frequency and deployment distribution.

---

## 🛠️ Quick Start (Local Development)

### 1. Prerequisites
* **Node.js** 18+
* **npm** or **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` or `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Schema & Storage Setup

### Supabase Tables
1. **`books`**: `id`, `owner_id`, `title`, `author`, `category`, `cover_url`, `total_pages`, `total_chapters`, `rating`, `notes`, `created_at`.
2. **`reading_states`**: `id`, `book_id`, `current_page`, `current_chapter`, `status`, `start_date`, `finish_date`, `updated_at`.
3. **`certificates`**: `id`, `owner_id`, `title`, `issuer`, `issue_date`, `expiry_date`, `credential_id`, `credential_url`, `file_url`, `created_at`.
4. **`projects`**: `id`, `owner_id`, `title`, `tagline`, `description`, `category`, `status`, `github_url`, `live_url`, `icon_url`, `tech_stack`, `screenshots`, `created_at`, `updated_at`.

### Supabase Storage Bucket
* Bucket Name: `vault_files`
* Access: Public Read

---

## 📦 Production Build

```bash
npm run build
```
Generates a production-ready, tree-shaken, and optimized static build in `dist/`.

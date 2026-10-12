# HealthyChef

Invoicing, pantry and payment tracking for meal-prep and nutrition businesses. Create GST-ready invoices, email them to clients, export PDFs and see who has paid.

The interface uses a warm citrus theme (Bricolage Grotesque and DM Sans, tomato, leaf green and mustard) with a tomato-leaf logo mark.

## ✨ Features

- **Dashboard**: Real-time analytics and business metrics at a glance
- **Inventory Management**: Track and manage your nutritional products and ingredients
- **Invoice Management**: Create, view, and manage invoices with PDF export capabilities
- **Invoice Status Tracking**: Mark invoices paid; unpaid invoices past their due date show as overdue
- **Email Notifications**: Send invoices and notifications via integrated email service
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Smooth Animations**: Enhanced user experience with motion animations
- **Type-Safe**: Full TypeScript support for robust development

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Motion** - Animation library
- **jsPDF** - PDF document generation

### Backend
- **Express.js** - Web server framework
- **Node.js** - JavaScript runtime
- **Nodemailer** - Email service integration
- **Zod** - Request validation

### Utilities
- **date-fns** - Date manipulation library
- **clsx** - Utility for conditional CSS classes
- **uuid** - Unique identifier generation
- **tailwind-merge** - Tailwind CSS utilities merger

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   Copy `.env.example` to `.env` to set `PORT`, `APP_URL` and the email settings.
   Invoice emails stay disabled until `EMAIL_SERVICE`, `EMAIL_USER` and `EMAIL_PASS` are set.

4. **Add demo data** (optional):
   ```bash
   npm run seed
   ```
   This writes fake demo items and invoices to `db.json`. The file is git-ignored, so
   your real data is never committed. Use `npm run seed -- --force` to overwrite it.

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This builds the frontend into `dist` and compiles the server into `dist-server`.

### Start Production Server

```bash
npm start
```

The app is served at `http://localhost:3000` (or `PORT`). Note that the API has no authentication, so keep it on a trusted network.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── InventoryPage.tsx
│   ├── InvoiceCreator.tsx
│   ├── InvoiceDetailView.tsx
│   ├── LandingPage.tsx
│   ├── MainLayout.tsx
│   ├── Navigation.tsx
│   └── HealthyChefLogo.tsx
├── server/              # DB access and request validation
├── services/            # External services
│   └── mailService.ts
├── lib/                 # Utility functions
│   └── calculations.ts
├── App.tsx              # Main app component
├── main.tsx             # Entry point
├── index.css            # Global styles
└── types.ts             # TypeScript type definitions
```

## 🔧 Available Commands

- `npm run dev` - Start development server
- `npm run seed` - Write fake demo data to db.json
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Check TypeScript types
- `npm run clean` - Remove build artifacts

## 📝 License

Built by Yeluru Nitish.

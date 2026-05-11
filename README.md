# HealthyChef - Human Longevity & Nutrition

A modern, AI-powered application designed to help manage nutrition, inventory, and invoicing for health-conscious businesses. HealthyChef combines intelligent features with an intuitive interface to streamline your health and nutrition management operations.

## 📋 About

HealthyChef is a comprehensive platform that integrates AI capabilities to support businesses focused on human longevity and nutrition. Whether you're managing a meal prep service, nutritional consulting business, or health-focused food enterprise, HealthyChef provides the tools you need to manage inventory, create invoices, and track business metrics.


## ✨ Features

- **Dashboard**: Real-time analytics and business metrics at a glance
- **Inventory Management**: Track and manage your nutritional products and ingredients
- **Invoice Management**: Create, view, and manage invoices with PDF export capabilities
- **AI-Powered Integration**: Leverage Google Gemini API for intelligent features
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
- **Google Genai** - AI capabilities via Gemini API

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

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Start Production Server

```bash
npm start
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── InventoryPage.tsx
│   ├── InvoiceCreator.tsx
│   ├── InvoiceDetailView.tsx
│   ├── LandingPage.tsx
│   └── MainLayout.tsx
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
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Check TypeScript types
- `npm run clean` - Remove build artifacts

## 📝 License

This project is part of the HealthyChef initiative focused on human longevity and nutrition.

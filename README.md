# MushMush - Premium Mushroom E-commerce Platform

A modern, full-featured e-commerce website built with Next.js, specializing in premium mushroom products and supplements. MushMush offers a seamless shopping experience with dynamic product management, user authentication, and comprehensive order processing.

## 🚀 Features

### Core Functionality
- **Dynamic Product Catalog** - Browse mushrooms by categories with real-time filtering
- **Product Details** - Comprehensive product pages with specifications, reviews, and consumption guides
- **Shopping Cart** - Add, remove, and manage items with persistent cart state
- **Wishlist System** - Save favorite products for later purchase
- **User Authentication** - Secure login/signup with session management
- **Order Management** - Complete checkout process with order tracking
- **Recently Viewed** - Track and display recently browsed products

### Technical Features
- **Next.js 14** - Latest React framework with App Router
- **PostgreSQL Database** - Robust data storage with Prisma ORM
- **Redux Toolkit** - State management for cart, wishlist, and user data
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Image Optimization** - Next.js Image component for performance
- **SEO Optimized** - Meta tags, sitemap, and structured data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Components
- **State Management**: Redux Toolkit
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready configuration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mushmush-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your database URL and other environment variables
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

The application uses a comprehensive database schema including:
- **Users** - Customer accounts and profiles
- **Products** - Mushroom products with detailed specifications
- **Categories** - Product categorization system
- **Orders** - Purchase history and order management
- **Reviews** - Customer feedback and ratings
- **Wishlist** - Saved products per user
- **Blog Posts** - Content management for articles

## 🎯 Key Pages

- **Home** (`/`) - Featured products and categories
- **Shop** (`/shop-with-sidebar`, `/shop-without-sidebar`) - Product browsing
- **Product Details** (`/shop-details`) - Individual product information
- **Cart** (`/cart`) - Shopping cart management
- **Checkout** (`/checkout`) - Order completion
- **Wishlist** (`/wishlist`) - Saved products
- **Blog** (`/blog`) - Educational content
- **Authentication** (`/auth/signin`, `/auth/signup`) - User accounts

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── redux/              # Redux store and slices
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open database browser

## 🌟 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

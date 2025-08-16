# SaudiSafety - E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js, featuring multilingual support (English/Arabic), comprehensive product management, and a complete admin dashboard.

## ✨ Features

### 🛒 Customer Features
- **Multilingual Support**: Full English and Arabic (RTL) support
- **Product Catalog**: Browse products by categories with advanced filtering
- **Shopping Cart**: Add/remove items, quantity management
- **Secure Checkout**: Multiple payment methods including COD
- **User Authentication**: Login, registration, and guest checkout
- **User Profiles**: Order history, address management, preferences
- **Search & Filters**: Advanced product search with category filters
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 🎛️ Admin Features
- **Dashboard**: Sales analytics, order statistics, revenue tracking
- **Product Management**: Add, edit, delete products with image uploads
- **Category Management**: Hierarchical category system with multilingual support
- **Order Management**: Order processing, status updates, tracking numbers
- **Customer Management**: Customer profiles, order history, analytics
- **Review Management**: Moderate customer reviews and responses
- **Inventory Tracking**: Stock management and notifications
- **Export Features**: Order and customer data export

### 🛠️ Technical Features
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations
- **NextAuth.js**: Authentication and authorization
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Meta tags, structured data, sitemap

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm/pnpm/yarn
- PostgreSQL database (or any Prisma-supported database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 1-ecommerce-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Email (optional)
   RESEND_API_KEY="your-resend-api-key"
   
   # Other configurations...
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000) to see the store
   
   Visit [http://localhost:3000/admin](http://localhost:3000/admin) for admin panel

## 📱 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Heroicons
- **Email**: Resend (React Email)
- **Validation**: Zod (implicit through Prisma)
- **State Management**: React Context API
- **Internationalization**: Custom i18n implementation

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── category/          # Category pages
│   ├── checkout/          # Checkout flow
│   ├── product/           # Product detail pages
│   └── profile/           # User profile pages
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   ├── cart/              # Shopping cart components
│   ├── checkout/          # Checkout components
│   ├── common/            # Shared components
│   ├── product/           # Product components
│   └── ui/                # UI components
├── contexts/              # React contexts
├── lib/                   # Utility functions
├── translations/          # i18n translation files
└── types/                 # TypeScript type definitions
```

## 🌍 Internationalization

The platform supports both English and Arabic with:
- RTL (Right-to-Left) layout support for Arabic
- Translated UI elements
- Multilingual product content
- Dynamic language switching

## 🔑 Admin Access

To access the admin panel:
1. Create an admin user through the database or seeding
2. Visit `/admin` and login with admin credentials
3. Default admin role required for access

## 📦 Database Schema

Key entities:
- **Products**: Multilingual product information with variants
- **Categories**: Hierarchical category system
- **Orders**: Complete order management with status tracking
- **Users**: Customer and admin user management
- **Reviews**: Product review system
- **Cart**: Persistent shopping cart

## 🚀 Deployment

### Environment Setup

1. Set production environment variables
2. Configure your database connection
3. Set up email service (Resend)
4. Configure NextAuth settings

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Recommended Platforms

- **Vercel**: Native Next.js support with easy deployment
- **Railway**: Simple PostgreSQL + Next.js deployment
- **DigitalOcean**: App Platform with database
- **AWS**: ECS/EC2 with RDS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database
```

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

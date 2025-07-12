# Admin Panel Documentation

## Overview
This e-commerce site now includes a comprehensive admin panel with English and Arabic language support. The admin panel allows you to manage products, orders, and view analytics.

## Features

### 🎯 **Dashboard**
- Overview statistics (Total Sales, Orders, Products, Customers)
- Recent orders display
- Quick action buttons
- Fully responsive design

### 📦 **Products Management**
- View all products in a table format
- Add new products with full form validation
- Edit existing products
- Delete products
- Support for:
  - Product name, price, category
  - Image URLs
  - Descriptions
  - Stock status
  - Ratings and reviews

### 📋 **Orders Management**
- View all orders with detailed information
- Order status management (Pending, Processing, Shipped, Delivered, Cancelled)
- Detailed order view with:
  - Customer information
  - Billing and shipping addresses
  - Order items
  - Payment details
  - Order summary

### 🌐 **Multi-Language Support**
- Complete English and Arabic translations
- RTL (Right-to-Left) layout for Arabic
- Language switching available throughout the admin panel

## Access

### From User Interface
1. **Desktop**: Click on your profile dropdown in the header → "Admin Panel" / "لوحة الإدارة"
2. **Mobile**: Open mobile menu → Account section → "Admin Panel" / "لوحة الإدارة"

### Direct URLs
- Dashboard: `/admin`
- Products: `/admin/products`
- Orders: `/admin/orders`

## Technical Implementation

### Architecture
- Built with Next.js 15.3.4 and TypeScript
- Tailwind CSS for styling
- Context API for state management
- Static site generation compatible

### Components Structure
```
src/components/admin/
├── AdminLayout.tsx          # Main layout with sidebar
├── AdminSidebar.tsx         # Navigation sidebar
├── AdminHeader.tsx          # Header with user info
├── DashboardStats.tsx       # Dashboard statistics
├── ProductsTable.tsx        # Products management table
├── ProductModal.tsx         # Add/Edit product modal
├── OrdersTable.tsx          # Orders management table
├── OrderModal.tsx           # Order details modal
├── RecentOrders.tsx         # Recent orders widget
└── QuickActions.tsx         # Quick action buttons
```

### Routes
```
src/app/admin/
├── page.tsx                 # Dashboard
├── products/
│   └── page.tsx            # Products management
└── orders/
    └── page.tsx            # Orders management
```

### Data
- Mock data for demonstration purposes
- Products: `src/data/products.ts`
- Orders: `src/data/mockOrders.ts`
- All data is stored in localStorage for persistence

## Features in Detail

### Dashboard
- **Statistics Cards**: Total sales, orders, products, customers
- **Recent Orders**: Shows last 5 orders with status indicators
- **Quick Actions**: Direct navigation to main admin functions
- **Responsive Design**: Works on all device sizes

### Products Management
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Form Validation**: Required fields and data type validation
- **Image Support**: URL-based product images
- **Category Management**: Select from predefined categories
- **Stock Management**: In-stock/out-of-stock toggle

### Orders Management
- **Status Updates**: Change order status with dropdown
- **Detailed View**: Complete order information in modal
- **Customer Info**: Full customer details display
- **Order Items**: List of all items in order
- **Financial Summary**: Subtotal, tax, shipping, total

### Language Support
- **English**: Default language
- **Arabic**: Complete RTL support
- **Dynamic Switching**: Change language anytime
- **Consistent UI**: Layout adapts to language direction

## Styling and Design

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Gray scale for backgrounds and text

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Dark Mode
- Basic dark mode support
- Automatic theme detection
- Dark variants for all components

## Mock Data

### Products
- 6 sample products across different categories
- Complete product information including ratings
- Mix of in-stock and out-of-stock items

### Orders
- 5 sample orders with different statuses
- International customers (US, Egypt, Spain, Saudi Arabia)
- Various payment methods
- Complete order lifecycle examples

## Future Enhancements

### Planned Features
- **Customers Management**: View and manage customer accounts
- **Analytics**: Sales charts and detailed reports
- **Settings**: Admin preferences and configuration
- **Bulk Operations**: Mass product updates
- **Export/Import**: CSV/Excel data handling
- **Image Upload**: File upload for product images
- **Advanced Filtering**: Search and filter capabilities
- **Email Integration**: Order notifications
- **Inventory Management**: Stock level tracking

### Technical Improvements
- **Backend Integration**: API endpoints for real data
- **Database**: Replace localStorage with proper database
- **Authentication**: Role-based access control
- **Validation**: Server-side validation
- **Performance**: Lazy loading and optimization
- **Testing**: Unit and integration tests

## Development Notes

### Building
```bash
npm run build
```

### Running
```bash
npm run dev
```

### Deployment
- Static site compatible
- Works with Netlify, Vercel, GitHub Pages
- No server-side dependencies required

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Troubleshooting

### Common Issues
1. **Language not switching**: Check translation files in `src/translations/`
2. **Modal not opening**: Ensure proper state management
3. **Data not persisting**: Check localStorage availability
4. **Responsive issues**: Verify Tailwind classes

### Development Tips
1. Use React DevTools for debugging
2. Check console for errors
3. Test on different screen sizes
4. Verify RTL layout in Arabic mode
5. Test form validation thoroughly

## Contributing

When adding new features:
1. Add translations for both English and Arabic
2. Ensure RTL compatibility
3. Follow existing component patterns
4. Test responsive design
5. Update this documentation

## License

This admin panel is part of the main e-commerce application and follows the same licensing terms.

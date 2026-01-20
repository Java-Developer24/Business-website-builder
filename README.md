# Business Platform

A comprehensive hybrid business platform supporting both products and services with appointments, payments, and customer management.

## Features

### 🛍️ E-Commerce
- Product catalog with variants (size, color, material)
- Shopping cart with local storage persistence
- Stripe payment integration
- Order management and tracking
- Invoice generation

### 📅 Appointments & Services
- Service catalog with pricing and duration
- Calendar-based appointment booking
- Time slot availability management
- Provider assignment
- Automated email confirmations

### 👥 Customer Management
- Customer profiles with order/appointment history
- Customer portal for self-service
- Order and appointment tracking
- Email notification history

### 📧 Email System
- SMTP email delivery
- Email templates (order confirmation, payment receipt, appointment confirmation)
- Email logging and tracking
- Resend failed emails

### 🎨 Branding & Customization
- Logo and favicon upload
- Brand color customization
- Font selection
- Theme preview

### ⚙️ Settings & Configuration
- Business profile management
- Email SMTP configuration
- Payment gateway settings (Stripe)
- Multi-currency support

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Customer)
- Protected routes
- Secure password hashing

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: MySQL with Drizzle ORM
- **Payments**: Stripe
- **Email**: Nodemailer
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- Stripe account (for payments)
- SMTP server (for emails)

### Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Start development server
npm run dev
```

### Test Credentials

After running `npm run db:seed`, you can login with:

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`
- Access: Full admin dashboard with all features

**Customer Accounts:**
- Email: `customer@test.com` / Password: `password123`
- Email: `jane@test.com` / Password: `password123`
- Access: Customer portal with order/appointment history

**Demo Data Included:**
- 5 Products (Wireless Headphones, Smart Watch, T-Shirt, Jeans, Garden Tools)
- 5 Services (Business Consulting, Marketing Audit, Yoga, Massage, Web Dev Course)
- 6 Categories (Electronics, Clothing, Home & Garden, Consulting, Wellness, Education)
- Sample orders and appointments

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Stripe (configure via Settings UI)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (configure via Settings UI)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn UI components
│   ├── ErrorBoundary.tsx
│   ├── LoadingStates.tsx
│   └── EmptyStates.tsx
├── layouts/            # Layout components
│   ├── AdminLayout.tsx # Admin dashboard layout
│   ├── RootLayout.tsx  # Public website layout
│   └── parts/          # Header, Footer
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── customer/       # Customer portal
│   └── shop/           # Public shop pages
├── lib/                # Utilities and hooks
│   ├── auth-context.tsx
│   ├── cart-context.tsx
│   ├── validation.ts
│   ├── notifications.ts
│   └── use-optimistic.ts
├── server/             # Backend code
│   ├── api/            # API routes
│   ├── db/             # Database config and schema
│   ├── lib/            # Server utilities
│   └── middleware/     # Express middleware
└── styles/             # Global styles
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Services
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Orders
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin)

### Appointments
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Customers
- `GET /api/customers` - List customers (admin)
- `GET /api/customers/:id` - Get customer details (admin)
- `PUT /api/customers/:id` - Update customer (admin)

### Settings
- `GET /api/settings/general` - Get general settings
- `PUT /api/settings/general` - Update general settings
- `GET /api/settings/branding` - Get branding settings
- `PUT /api/settings/branding` - Update branding settings

## Production Deployment

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment

- Set `NODE_ENV=production`
- Use production database credentials
- Use production Stripe keys
- Configure production SMTP settings
- Set secure JWT secrets

### Security Checklist

- [ ] Change all default secrets
- [ ] Use HTTPS in production
- [ ] Enable CORS with specific origins
- [ ] Set secure cookie flags
- [ ] Rate limit API endpoints
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Keep dependencies updated

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Error boundaries for error handling
- Form validation with custom utilities
- Optimistic UI updates
- Loading states and skeletons
- Empty states for better UX

## License

MIT

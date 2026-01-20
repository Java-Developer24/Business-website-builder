// TREAT AS IMMUTABLE - Database Schema
import { mysqlTable, varchar, text, int, decimal, boolean, timestamp, json, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ============================================
// AUTH & USERS
// ============================================

export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: mysqlEnum('name', ['ADMIN', 'STAFF', 'CUSTOMER']).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  avatar: varchar('avatar', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  isSuspended: boolean('is_suspended').default(false).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const userRoles = mysqlTable('user_roles', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: int('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refreshTokens = mysqlTable('refresh_tokens', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// CUSTOMERS
// ============================================

export const customers = mysqlTable('customers', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  company: varchar('company', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  notes: text('notes'),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0.00'),
  totalOrders: int('total_orders').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ============================================
// PRODUCTS & CATEGORIES
// ============================================

export const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  image: varchar('image', { length: 500 }),
  parentId: int('parent_id'),
  type: mysqlEnum('type', ['PRODUCT', 'SERVICE']).default('PRODUCT').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: int('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  sku: varchar('sku', { length: 100 }).unique(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
  stock: int('stock').default(0),
  lowStockThreshold: int('low_stock_threshold').default(5),
  trackInventory: boolean('track_inventory').default(true).notNull(),
  type: mysqlEnum('type', ['PHYSICAL', 'DIGITAL']).default('PHYSICAL').notNull(),
  digitalFileUrl: varchar('digital_file_url', { length: 500 }),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  dimensions: json('dimensions'), // {length, width, height}
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  categoryId: int('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const productImages = mysqlTable('product_images', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  sortOrder: int('sort_order').default(0),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// SERVICES & APPOINTMENTS
// ============================================

export const services = mysqlTable('services', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: int('duration').notNull(), // in minutes
  bufferTime: int('buffer_time').default(0), // time between appointments
  image: varchar('image', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  maxAdvanceBooking: int('max_advance_booking').default(30), // days
  minAdvanceBooking: int('min_advance_booking').default(0), // hours
  categoryId: int('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const staff = mysqlTable('staff', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  specialization: varchar('specialization', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const serviceStaff = mysqlTable('service_staff', {
  id: int('id').primaryKey().autoincrement(),
  serviceId: int('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  staffId: int('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const availability = mysqlTable('availability', {
  id: int('id').primaryKey().autoincrement(),
  staffId: int('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  dayOfWeek: int('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const appointments = mysqlTable('appointments', {
  id: int('id').primaryKey().autoincrement(),
  customerId: int('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  serviceId: int('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  staffId: int('staff_id').references(() => staff.id, { onDelete: 'set null' }),
  appointmentDate: timestamp('appointment_date').notNull(),
  duration: int('duration').notNull(), // in minutes
  status: mysqlEnum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).default('PENDING').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ============================================
// ORDERS & PAYMENTS
// ============================================

export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: int('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  status: mysqlEnum('status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).default('PENDING').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00'),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).default('0.00'),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: json('shipping_address'),
  billingAddress: json('billing_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable('order_items', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: int('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 100 }),
  quantity: int('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = mysqlTable('payments', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').references(() => orders.id, { onDelete: 'set null' }),
  appointmentId: int('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: mysqlEnum('status', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).default('PENDING').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // stripe, paypal, etc
  transactionId: varchar('transaction_id', { length: 255 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ============================================
// COUPONS & DISCOUNTS
// ============================================

export const coupons = mysqlTable('coupons', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  type: mysqlEnum('type', ['PERCENTAGE', 'FIXED']).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal('min_purchase', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: int('usage_limit'),
  usageCount: int('usage_count').default(0),
  appliesTo: mysqlEnum('applies_to', ['ALL', 'PRODUCTS', 'SERVICES']).default('ALL').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  startsAt: timestamp('starts_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ============================================
// EMAIL SYSTEM
// ============================================

export const emailTemplates = mysqlTable('email_templates', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  subject: varchar('subject', { length: 500 }).notNull(),
  htmlBody: text('html_body').notNull(),
  textBody: text('text_body'),
  variables: json('variables'), // Available template variables
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const emailLogs = mysqlTable('email_logs', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').references(() => emailTemplates.id, { onDelete: 'set null' }),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientName: varchar('recipient_name', { length: 255 }),
  subject: varchar('subject', { length: 500 }).notNull(),
  htmlBody: text('html_body'),
  textBody: text('text_body'),
  status: mysqlEnum('status', ['SENT', 'FAILED', 'PENDING']).default('PENDING').notNull(),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  metadata: json('metadata'), // Order ID, Appointment ID, etc
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// WEBSITE BUILDER / CMS
// ============================================

export const pages = mysqlTable('pages', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  isPublished: boolean('is_published').default(false).notNull(),
  isHomepage: boolean('is_homepage').default(false).notNull(),
  sortOrder: int('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const sections = mysqlTable('sections', {
  id: int('id').primaryKey().autoincrement(),
  pageId: int('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(), // hero, features, testimonials, etc
  content: json('content').notNull(), // Section-specific content
  sortOrder: int('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const navigation = mysqlTable('navigation', {
  id: int('id').primaryKey().autoincrement(),
  label: varchar('label', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  pageId: int('page_id').references(() => pages.id, { onDelete: 'set null' }),
  parentId: int('parent_id'),
  sortOrder: int('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  openInNewTab: boolean('open_in_new_tab').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const themes = mysqlTable('themes', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  primaryColor: varchar('primary_color', { length: 7 }).notNull(),
  secondaryColor: varchar('secondary_color', { length: 7 }).notNull(),
  accentColor: varchar('accent_color', { length: 7 }),
  fontFamily: varchar('font_family', { length: 100 }),
  logo: varchar('logo', { length: 500 }),
  favicon: varchar('favicon', { length: 500 }),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ============================================
// BUSINESS SETTINGS
// ============================================

export const businessSettings = mysqlTable('business_settings', {
  id: int('id').primaryKey().autoincrement(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
  logo: varchar('logo', { length: 500 }),
  favicon: varchar('favicon', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

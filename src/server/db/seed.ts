import { db } from './client.js';
import {
  roles,
  userRoles,
  businessSettings,
  users,
  customers,
  categories,
  products,
  services,
  orders,
  orderItems,
  appointments,
} from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Seed roles
    console.log('\n📋 Creating roles...');
    const roleData = [
      { name: 'ADMIN' as const, description: 'Administrator with full access' },
      { name: 'STAFF' as const, description: 'Staff member with limited access' },
      { name: 'CUSTOMER' as const, description: 'Customer with basic access' },
    ];

    for (const role of roleData) {
      const existing = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
      if (existing.length === 0) {
        await db.insert(roles).values(role);
        console.log(`✓ Created role: ${role.name}`);
      } else {
        console.log(`- Role already exists: ${role.name}`);
      }
    }

    // 2. Seed business settings
    console.log('\n🏢 Creating business settings...');
    const existingSettings = await db.select().from(businessSettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(businessSettings).values({
        businessName: 'Demo Business Platform',
        email: 'contact@demobusiness.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        taxRate: '8.50',
      });
      console.log('✓ Created business settings');
    } else {
      console.log('- Business settings already exist');
    }

    // 3. Seed test users
    console.log('\n👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const testUsers = [
      {
        user: {
          email: 'admin@test.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
        },
        role: 'ADMIN' as const,
      },
      {
        user: {
          email: 'customer@test.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Customer',
          phone: '+1 (555) 234-5678',
        },
        role: 'CUSTOMER' as const,
      },
      {
        user: {
          email: 'jane@test.com',
          password: hashedPassword,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1 (555) 345-6789',
        },
        role: 'CUSTOMER' as const,
      },
    ];

    const createdUsers: any[] = [];
    const createdRoles: any[] = await db.select().from(roles);
    
    for (const userData of testUsers) {
      const existing = await db.select().from(users).where(eq(users.email, userData.user.email)).limit(1);
      if (existing.length === 0) {
        const result = await db.insert(users).values(userData.user);
        const insertedUser = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(result[0].insertId)))
          .limit(1);
        createdUsers.push(insertedUser[0]);
        
        // Assign role to user in userRoles table
        const roleRecord = createdRoles.find(r => r.name === userData.role);
        if (roleRecord) {
          await db.insert(userRoles).values({
            userId: insertedUser[0].id,
            roleId: roleRecord.id,
          });
        }
        
        console.log(`✓ Created user: ${userData.user.email} (${userData.role})`);
      } else {
        createdUsers.push(existing[0]);
        
        // Check if user role exists, if not create it
        const existingUserRole = await db
          .select()
          .from(userRoles)
          .where(eq(userRoles.userId, existing[0].id))
          .limit(1);
        
        if (existingUserRole.length === 0) {
          const roleRecord = createdRoles.find(r => r.name === userData.role);
          if (roleRecord) {
            await db.insert(userRoles).values({
              userId: existing[0].id,
              roleId: roleRecord.id,
            });
            console.log(`✓ Assigned role to existing user: ${existing[0].email}`);
          }
        }
        
        console.log(`- User already exists: ${userData.user.email}`);
      }
    }

    // 4. Create customer profiles for customer users
    console.log('\n👤 Creating customer profiles...');
    const createdCustomers: any[] = [];
    for (const user of createdUsers) {
      if (user.role === 'CUSTOMER') {
        const existingCustomer = await db.select().from(customers).where(eq(customers.userId, user.id)).limit(1);
        if (existingCustomer.length === 0) {
          const result = await db.insert(customers).values({
            userId: user.id,
            address: user.email === 'customer@test.com' ? '456 Customer Lane' : '789 Smith Street',
            city: user.email === 'customer@test.com' ? 'Los Angeles' : 'San Diego',
            state: 'CA',
            zipCode: user.email === 'customer@test.com' ? '90001' : '92101',
            country: 'USA',
          });
          const insertedCustomer = await db
            .select()
            .from(customers)
            .where(eq(customers.id, Number(result[0].insertId)))
            .limit(1);
          createdCustomers.push(insertedCustomer[0]);
          console.log(`✓ Created customer profile for ${user.email}`);
        } else {
          createdCustomers.push(existingCustomer[0]);
          console.log(`- Customer profile already exists for ${user.email}`);
        }
      }
    }

    // 5. Seed categories
    console.log('\n📁 Creating categories...');
    const categoryData = [
      { name: 'Electronics', slug: 'electronics', type: 'PRODUCT' as const, description: 'Electronic devices and gadgets' },
      { name: 'Clothing', slug: 'clothing', type: 'PRODUCT' as const, description: 'Apparel and fashion items' },
      { name: 'Home & Garden', slug: 'home-garden', type: 'PRODUCT' as const, description: 'Home improvement and garden supplies' },
      { name: 'Consulting', slug: 'consulting', type: 'SERVICE' as const, description: 'Professional consulting services' },
      { name: 'Wellness', slug: 'wellness', type: 'SERVICE' as const, description: 'Health and wellness services' },
      { name: 'Education', slug: 'education', type: 'SERVICE' as const, description: 'Educational and training services' },
    ];

    const createdCategories: any[] = [];
    for (const category of categoryData) {
      const existing = await db.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);
      if (existing.length === 0) {
        const result = await db.insert(categories).values(category);
        const insertedCategory = await db
          .select()
          .from(categories)
          .where(eq(categories.id, Number(result[0].insertId)))
          .limit(1);
        createdCategories.push(insertedCategory[0]);
        console.log(`✓ Created category: ${category.name} (${category.type})`);
      } else {
        createdCategories.push(existing[0]);
        console.log(`- Category already exists: ${category.name}`);
      }
    }

    // 5. Seed products
    console.log('\n📦 Creating products...');
    const electronicsCategory = createdCategories.find((c) => c.slug === 'electronics');
    const clothingCategory = createdCategories.find((c) => c.slug === 'clothing');
    const homeCategory = createdCategories.find((c) => c.slug === 'home-garden');

    const productData = [
      {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
        price: '199.99',
        categoryId: electronicsCategory?.id,
        stock: 50,
        featured: true,
      },
      {
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
        price: '299.99',
        categoryId: electronicsCategory?.id,
        stock: 30,
        featured: true,
      },
      {
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: '100% organic cotton t-shirt, comfortable and breathable',
        price: '29.99',
        categoryId: clothingCategory?.id,
        stock: 100,
        featured: false,
      },
      {
        name: 'Denim Jeans',
        slug: 'denim-jeans',
        description: 'Classic fit denim jeans with stretch fabric',
        price: '79.99',
        categoryId: clothingCategory?.id,
        stock: 75,
        featured: false,
      },
      {
        name: 'Garden Tool Set',
        slug: 'garden-tool-set',
        description: 'Complete 10-piece garden tool set with carrying case',
        price: '89.99',
        categoryId: homeCategory?.id,
        stock: 25,
        featured: true,
      },
    ];

    const createdProducts: any[] = [];
    for (const product of productData) {
      const existing = await db.select().from(products).where(eq(products.slug, product.slug)).limit(1);
      if (existing.length === 0) {
        const result = await db.insert(products).values(product);
        const insertedProduct = await db
          .select()
          .from(products)
          .where(eq(products.id, Number(result[0].insertId)))
          .limit(1);
        createdProducts.push(insertedProduct[0]);
        console.log(`✓ Created product: ${product.name}`);
      } else {
        createdProducts.push(existing[0]);
        console.log(`- Product already exists: ${product.name}`);
      }
    }

    // 6. Seed services
    console.log('\n🛠️ Creating services...');
    const consultingCategory = createdCategories.find((c) => c.slug === 'consulting');
    const wellnessCategory = createdCategories.find((c) => c.slug === 'wellness');
    const educationCategory = createdCategories.find((c) => c.slug === 'education');
    const adminUser = createdUsers.find((u) => u.role === 'ADMIN');

    const serviceData = [
      {
        name: 'Business Strategy Consultation',
        slug: 'business-strategy',
        description: 'One-on-one consultation to develop your business strategy and growth plan',
        price: '150.00',
        duration: 60,
        categoryId: consultingCategory?.id,
        providerId: adminUser?.id,
      },
      {
        name: 'Marketing Audit',
        slug: 'marketing-audit',
        description: 'Comprehensive review of your marketing efforts with actionable recommendations',
        price: '200.00',
        duration: 90,
        categoryId: consultingCategory?.id,
        providerId: adminUser?.id,
      },
      {
        name: 'Yoga Session',
        slug: 'yoga-session',
        description: 'Private yoga session tailored to your fitness level and goals',
        price: '75.00',
        duration: 60,
        categoryId: wellnessCategory?.id,
        providerId: adminUser?.id,
      },
      {
        name: 'Massage Therapy',
        slug: 'massage-therapy',
        description: 'Relaxing full-body massage to relieve stress and tension',
        price: '100.00',
        duration: 60,
        categoryId: wellnessCategory?.id,
        providerId: adminUser?.id,
      },
      {
        name: 'Web Development Course',
        slug: 'web-dev-course',
        description: 'Learn modern web development from scratch with hands-on projects',
        price: '500.00',
        duration: 120,
        categoryId: educationCategory?.id,
        providerId: adminUser?.id,
      },
    ];

    const createdServices: any[] = [];
    for (const service of serviceData) {
      const existing = await db.select().from(services).where(eq(services.slug, service.slug)).limit(1);
      if (existing.length === 0) {
        const result = await db.insert(services).values(service);
        const insertedService = await db
          .select()
          .from(services)
          .where(eq(services.id, Number(result[0].insertId)))
          .limit(1);
        createdServices.push(insertedService[0]);
        console.log(`✓ Created service: ${service.name}`);
      } else {
        createdServices.push(existing[0]);
        console.log(`- Service already exists: ${service.name}`);
      }
    }

    // 7. Seed sample orders
    console.log('\n🛒 Creating sample orders...');
    const customerUser = createdUsers.find((u) => u.email === 'customer@test.com');
    const customerProfile = createdCustomers.find((c) => c.userId === customerUser?.id);

    if (customerProfile && createdProducts.length > 0) {
      const orderData = [
        {
          orderNumber: `ORD-${Date.now()}`,
          customerId: customerProfile.id,
          status: 'DELIVERED' as const,
          total: '229.98',
          subtotal: '199.98',
          tax: '17.00',
          shipping: '13.00',
          shippingAddress: {
            address: '456 Customer Lane',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA',
          },
        },
      ];

      for (const order of orderData) {
        const result = await db.insert(orders).values(order);
        const orderId = Number(result[0].insertId);

        // Add order items
        const headphones = createdProducts.find((p) => p.slug === 'wireless-headphones');
        if (headphones) {
          const itemSubtotal = parseFloat(headphones.price) * 1;
          await db.insert(orderItems).values({
            orderId,
            productId: headphones.id,
            productName: headphones.name,
            productSku: headphones.sku || undefined,
            quantity: 1,
            price: headphones.price,
            subtotal: itemSubtotal.toFixed(2),
          });
        }

        console.log(`✓ Created order #${orderId} for ${customerUser.email}`);
      }
    }

    // 8. Seed sample appointments
    console.log('\n📅 Creating sample appointments...');
    const janeUser = createdUsers.find((u) => u.email === 'jane@test.com');
    const janeCustomer = createdCustomers.find((c) => c.userId === janeUser?.id);
    
    if (janeCustomer && createdServices.length > 0) {
      const yogaService = createdServices.find((s) => s.slug === 'yoga-session');
      if (yogaService) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        await db.insert(appointments).values({
          customerId: janeCustomer.id,
          serviceId: yogaService.id,
          staffId: yogaService.providerId,
          appointmentDate: tomorrow,
          duration: yogaService.duration,
          price: yogaService.price,
          status: 'CONFIRMED' as const,
          notes: 'First-time yoga session',
        });

        console.log(`✓ Created appointment for jane@test.com`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@test.com / password123');
    console.log('   Customer: customer@test.com / password123');
    console.log('   Customer 2: jane@test.com / password123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();

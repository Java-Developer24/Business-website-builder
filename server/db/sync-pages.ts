import { db } from './client.js';
import { pages } from './schema.js';
import { eq } from 'drizzle-orm';

/**
 * Sync existing pages to CMS database
 * This creates page records for all existing routes so they can be managed in the CMS
 */

const existingPages = [
  {
    slug: 'home',
    title: 'Home',
    description: 'Main landing page with hero section and features',
    status: 'published' as const,
    sections: JSON.stringify([
      {
        type: 'hero',
        title: 'Your Complete Business Platform',
        subtitle: 'Shop our products, book services, and manage everything in one place',
        backgroundImage: 'https://media.gettyimages.com/id/2229956035/photo/team-lunch-meeting-in-the-boardroom.jpg',
        ctaText: 'Shop Products',
        ctaLink: '/shop/products',
      },
      {
        type: 'features',
        title: 'Everything You Need',
        subtitle: 'A comprehensive platform designed to streamline your business operations',
        features: [
          {
            icon: 'ShoppingBag',
            title: 'Product Catalog',
            description: 'Browse and purchase from our extensive product catalog with secure checkout',
          },
          {
            icon: 'Calendar',
            title: 'Service Booking',
            description: 'Schedule appointments and book services with real-time availability',
          },
          {
            icon: 'Package',
            title: 'Order Tracking',
            description: 'Track your orders and appointments from your personal dashboard',
          },
          {
            icon: 'Users',
            title: 'Customer Portal',
            description: 'Manage your profile, view history, and access all your information',
          },
        ],
      },
    ]),
  },
  {
    slug: 'about',
    title: 'About Us',
    description: 'Learn about our mission, values, and team',
    status: 'published' as const,
    sections: JSON.stringify([
      {
        type: 'hero',
        title: 'About Us',
        subtitle: "We're dedicated to providing the best products and services to help your business thrive",
      },
      {
        type: 'content',
        title: 'Our Mission',
        content:
          'We believe in empowering businesses with the tools and services they need to succeed. Our platform combines cutting-edge technology with exceptional customer service to deliver a seamless experience.',
        image: 'https://media.gettyimages.com/id/2207913283/photo/multiethnic-team-of-colleagues-and-indian-leader-discussing-business-success.jpg',
      },
    ]),
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    description: 'Get in touch with our team',
    status: 'published' as const,
    sections: JSON.stringify([
      {
        type: 'hero',
        title: 'Contact Us',
        subtitle: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      },
      {
        type: 'contact-form',
        email: 'support@businessplatform.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Street, Suite 100, New York, NY 10001',
      },
    ]),
  },
];

async function syncPages() {
  console.log('🔄 Syncing existing pages to CMS...');

  for (const page of existingPages) {
    try {
      // Check if page already exists
      const existing = await db.select().from(pages).where(eq(pages.slug, page.slug)).limit(1);

      if (existing.length > 0) {
        console.log(`  ✓ Page already exists: ${page.title}`);
        continue;
      }

      // Insert new page
      await db.insert(pages).values(page);
      console.log(`  ✓ Created page: ${page.title}`);
    } catch (error) {
      console.error(`  ✗ Error creating page ${page.title}:`, error);
    }
  }

  console.log('\n✅ Page sync complete!');
}

syncPages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error syncing pages:', error);
    process.exit(1);
  });

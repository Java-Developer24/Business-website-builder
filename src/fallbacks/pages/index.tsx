import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Calendar, Package, Users, ArrowRight, CheckCircle, Star } from 'lucide-react';

/**
 * Home page component
 *
 * Displays the main landing page with hero section and features.
 * The layout (header/footer) is handled by RootLayout in App.tsx.
 */
export default function HomePage() {
  const features = [
    {
      icon: ShoppingBag,
      title: 'Product Catalog',
      description: 'Browse and purchase from our extensive product catalog with secure checkout',
      color: 'bg-blue-500',
    },
    {
      icon: Calendar,
      title: 'Service Booking',
      description: 'Schedule appointments and book services with real-time availability',
      color: 'bg-purple-500',
    },
    {
      icon: Package,
      title: 'Order Tracking',
      description: 'Track your orders and appointments from your personal dashboard',
      color: 'bg-green-500',
    },
    {
      icon: Users,
      title: 'Customer Portal',
      description: 'Manage your profile, view history, and access all your information',
      color: 'bg-orange-500',
    },
  ];

  const benefits = [
    'Secure payment processing',
    'Real-time inventory updates',
    '24/7 customer support',
    'Easy returns & refunds',
    'Mobile-friendly experience',
    'Loyalty rewards program',
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'This platform has transformed how I manage my business. The interface is intuitive and the features are exactly what I needed.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Consultant',
      content: 'Booking appointments has never been easier. My clients love the seamless experience and I love the automated reminders.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Retail Manager',
      content: 'The product management tools are fantastic. I can update inventory, track orders, and manage everything from one place.',
      rating: 5,
    },
  ];

  return (
    <>
      <title>Business Platform - Products & Services</title>
      <meta name="description" content="Your complete business platform for products and services. Shop our catalog or book appointments with ease." />

      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[url('https://media.gettyimages.com/id/2229956035/photo/team-lunch-meeting-in-the-boardroom.jpg?b=1&s=2048x2048&w=0&k=20&c=shUfuIReGsFsMF5kX_LOkSZW-tuj2LCm95z7Vsh2wEI=')] bg-cover bg-center opacity-5" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              Your Complete
              <span className="block text-primary mt-3">Business Platform</span>
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Shop our products, book services, and manage everything in one seamless platform designed for modern businesses
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Link to="/shop/products">
                <Button size="lg" className="text-xl px-10 py-8 group font-semibold shadow-xl hover:shadow-2xl">
                  <ShoppingBag className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Shop Products
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/shop/services">
                <Button size="lg" variant="outline" className="text-xl px-10 py-8 group font-semibold border-2 shadow-lg hover:shadow-xl">
                  <Calendar className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Book Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Everything You Need</h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A comprehensive platform designed to streamline your business operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className={`mx-auto w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Why Choose Us?</h2>
              <p className="text-2xl text-muted-foreground leading-relaxed">
                We're committed to providing the best experience for both businesses and customers. Here's what sets us apart:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                {benefits.map((benefit, index) => (
                  <div key={benefit} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="p-2 rounded-lg bg-green-50">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    </div>
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://media.gettyimages.com/id/2207913283/photo/multiethnic-team-of-colleagues-and-indian-leader-discussing-business-success.jpg?b=1&s=2048x2048&w=0&k=20&c=tdjxpfccpa_oAaUWQGBLEEF1OS13zEHjFx9LWnGcSLk="
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">What Our Customers Say</h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Don't just take our word for it - hear from businesses that trust our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="pb-4">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-lg italic leading-relaxed text-foreground/80">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 border-t">
                  <div className="font-bold text-lg">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-2xl">
            <CardContent className="py-20 text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Ready to Get Started?</h2>
              <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of businesses already using our platform to grow and succeed
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="text-xl px-10 py-8 group font-semibold shadow-xl hover:shadow-2xl">
                    Create Account
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-xl px-10 py-8 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold shadow-lg hover:shadow-xl">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

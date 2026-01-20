import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <title>About Us - Business Platform</title>
      <meta name="description" content="Learn about our mission, values, and the team behind our business platform." />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold tracking-tight mb-6">About Us</h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're dedicated to providing the best products and services to help your business thrive
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                We believe in empowering businesses with the tools and services they need to succeed. 
                Our platform combines cutting-edge technology with exceptional customer service to deliver 
                a seamless experience.
              </p>
              <p className="text-lg text-muted-foreground">
                Whether you're shopping for products or booking services, we're committed to making 
                every interaction simple, secure, and satisfying.
              </p>
            </div>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src="https://media.gettyimages.com/id/2207913283/photo/multiethnic-team-of-colleagues-and-indian-leader-discussing-business-success.jpg?b=1&s=2048x2048&w=0&k=20&c=tdjxpfccpa_oAaUWQGBLEEF1OS13zEHjFx9LWnGcSLk="
                alt="Our team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Customer First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your success is our success. We prioritize your needs in everything we do.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We continuously improve and adapt to bring you the latest solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We maintain the highest standards in quality and service delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Integrity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We operate with transparency, honesty, and ethical practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-16 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-6xl font-bold mb-3">10K+</div>
              <div className="text-xl opacity-90 font-medium">Happy Customers</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-6xl font-bold mb-3">500+</div>
              <div className="text-xl opacity-90 font-medium">Products & Services</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-6xl font-bold mb-3">99%</div>
              <div className="text-xl opacity-90 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

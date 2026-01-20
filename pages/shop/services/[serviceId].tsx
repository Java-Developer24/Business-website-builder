import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, DollarSign, User, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import Spinner from '@/components/Spinner';
import { addDays, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns';

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  categoryId: number | null;
  categoryName?: string;
  providerId: number | null;
  providerName?: string;
}

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data);
      } else {
        toast.error('Service not found');
        navigate('/shop/services');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Generate available time slots (9 AM - 5 PM, every 30 minutes)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    if (!service) return;

    setSubmitting(true);

    try {
      // Parse selected date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDate = setMinutes(setHours(selectedDate, hours), minutes);

      // Create appointment
      const appointmentData = {
        serviceId: service.id,
        serviceName: service.name,
        providerId: service.providerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        appointmentDate: appointmentDate.toISOString(),
        duration: service.duration,
        price: service.price,
        notes: formData.notes,
      };

      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!appointmentResponse.ok) {
        throw new Error('Failed to create appointment');
      }

      const appointment = await appointmentResponse.json();

      // Create Stripe checkout session for payment
      const previewUrl = import.meta.env.VITE_PREVIEW_URL || window.location.origin;
      const checkoutResponse = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          returnUrl: `${previewUrl}/shop/services/${serviceId}`,
          successUrl: `${previewUrl}/payment-success?appointmentId=${appointment.id}`,
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await checkoutResponse.json();

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book appointment. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Service not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <title>{service.name} - Book Appointment</title>
      <meta name="description" content={service.description || `Book ${service.name}`} />

      <Button
        variant="ghost"
        onClick={() => navigate('/shop/services')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Services
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Info */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex gap-2 flex-wrap mb-2">
                {service.categoryName && (
                  <Badge variant="secondary">{service.categoryName}</Badge>
                )}
                {service.providerName && (
                  <Badge variant="outline">
                    <User className="mr-1 h-3 w-3" />
                    {service.providerName}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl">{service.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{formatDuration(service.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold text-2xl text-primary">${service.price}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="mb-2 block">Select Date *</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => 
                      isBefore(date, startOfDay(new Date())) || 
                      isAfter(date, addDays(new Date(), 90))
                    }
                    className="rounded-md border"
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="mb-2 block">Select Time *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={submitting}
                      rows={3}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    You will be redirected to Stripe to complete your payment securely.
                  </AlertDescription>
                </Alert>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      Book & Pay ${service.price}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

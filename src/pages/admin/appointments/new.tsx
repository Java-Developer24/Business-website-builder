import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Save, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  remainingCapacity: number;
}

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    selectedSlot: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.serviceId && selectedDate) {
      fetchAvailability();
    }
  }, [formData.serviceId, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.filter((s: Service & { isActive: boolean }) => s.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchAvailability = async () => {
    if (!formData.serviceId || !selectedDate) return;

    try {
      setLoadingSlots(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(
        `/api/appointments/availability?serviceId=${formData.serviceId}&date=${dateStr}`
      );
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.slots);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.selectedSlot) {
        toast.error('Please select a time slot');
        return;
      }

      const payload = {
        serviceId: parseInt(formData.serviceId),
        appointmentDate: formData.selectedSlot,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
        notes: formData.notes || undefined,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }

      toast.success('Appointment created successfully');
      navigate('/admin/appointments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === parseInt(formData.serviceId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/appointments')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Appointment</h1>
          <p className="text-muted-foreground">Schedule a new booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Select the service to book</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service *</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, serviceId: value, selectedSlot: '' });
                      setTimeSlots([]);
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} - ${service.price} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedService && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        Duration: {selectedService.duration} minutes | Price: ${selectedService.price}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            {formData.serviceId && (
              <Card>
                <CardHeader>
                  <CardTitle>Date & Time</CardTitle>
                  <CardDescription>Choose appointment date and time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <Label>Available Times</Label>
                      {loadingSlots ? (
                        <div className="text-center py-8 text-muted-foreground">Loading slots...</div>
                      ) : timeSlots.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Select a date to view available times</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.startTime}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setFormData({ ...formData, selectedSlot: slot.startTime })}
                              className={`p-3 text-sm border rounded-lg transition-colors ${
                                formData.selectedSlot === slot.startTime
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : slot.available
                                  ? 'hover:bg-accent border-border'
                                  : 'opacity-50 cursor-not-allowed bg-muted'
                              }`}
                            >
                              {format(new Date(slot.startTime), 'h:mm a')}
                              {slot.available && slot.remainingCapacity < 3 && (
                                <span className="block text-xs mt-1">
                                  {slot.remainingCapacity} left
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Contact details for the appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requests or notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-medium">{selectedService.name}</p>
                    </div>
                    {selectedDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                    {formData.selectedSlot && (
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{format(new Date(formData.selectedSlot), 'h:mm a')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedService.duration} minutes</p>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">${selectedService.price}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a service to see booking details</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button type="submit" className="w-full" disabled={loading || !formData.selectedSlot}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Appointment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/appointments')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

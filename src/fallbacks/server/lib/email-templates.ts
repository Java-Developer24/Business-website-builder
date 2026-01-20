interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
    subtotal: string;
  }>;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface PaymentReceiptData {
  orderNumber: string;
  customerName: string;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  transactionId?: string;
}

interface AppointmentConfirmationData {
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  price: string;
  staffName?: string;
  notes?: string;
}

interface AppointmentReminderData {
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  staffName?: string;
}

export function generateOrderConfirmationEmail(data: OrderConfirmationData): { subject: string; text: string; html: string } {
  const subject = `Order Confirmation - ${data.orderNumber}`;
  
  const text = `
Hi ${data.customerName},

Thank you for your order! Your order has been confirmed and is being processed.

Order Details:
Order Number: ${data.orderNumber}
Order Date: ${new Date(data.orderDate).toLocaleDateString()}

Items:
${data.items.map(item => `- ${item.productName} x${item.quantity} - $${item.price} = $${item.subtotal}`).join('\n')}

Subtotal: $${data.subtotal}
Tax: $${data.tax}
Shipping: $${data.shipping}
Total: $${data.total}

${data.shippingAddress ? `Shipping Address:
${data.shippingAddress.address || ''}
${data.shippingAddress.city || ''}, ${data.shippingAddress.state || ''} ${data.shippingAddress.zipCode || ''}
${data.shippingAddress.country || ''}` : ''}

We'll send you another email when your order ships.

Thank you for your business!
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .items-table th { background: #f3f4f6; padding: 10px; text-align: left; }
    .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .totals { margin-top: 20px; text-align: right; }
    .totals div { margin: 5px 0; }
    .total { font-size: 18px; font-weight: bold; color: #4F46E5; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
      
      <div class="order-details">
        <h2>Order Details</h2>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>$${item.price}</td>
                <td>$${item.subtotal}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div>Subtotal: $${data.subtotal}</div>
          <div>Tax: $${data.tax}</div>
          <div>Shipping: $${data.shipping}</div>
          <div class="total">Total: $${data.total}</div>
        </div>
        
        ${data.shippingAddress ? `
          <h3>Shipping Address</h3>
          <p>
            ${data.shippingAddress.address || ''}<br>
            ${data.shippingAddress.city || ''}, ${data.shippingAddress.state || ''} ${data.shippingAddress.zipCode || ''}<br>
            ${data.shippingAddress.country || ''}
          </p>
        ` : ''}
      </div>
      
      <p>We'll send you another email when your order ships.</p>
      <p>Thank you for your business!</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

export function generatePaymentReceiptEmail(data: PaymentReceiptData): { subject: string; text: string; html: string } {
  const subject = `Payment Receipt - ${data.orderNumber}`;
  
  const text = `
Hi ${data.customerName},

This is a receipt for your recent payment.

Payment Details:
Order Number: ${data.orderNumber}
Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}
Amount: $${data.amount}
Payment Method: ${data.paymentMethod}
${data.transactionId ? `Transaction ID: ${data.transactionId}` : ''}

Thank you for your payment!
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .receipt-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .amount { font-size: 24px; font-weight: bold; color: #10B981; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Received</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>This is a receipt for your recent payment.</p>
      
      <div class="receipt-details">
        <h2>Payment Details</h2>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Payment Date:</strong> ${new Date(data.paymentDate).toLocaleDateString()}</p>
        <div class="amount">Amount: $${data.amount}</div>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
      </div>
      
      <p>Thank you for your payment!</p>
    </div>
    <div class="footer">
      <p>Keep this receipt for your records.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

export function generateAppointmentConfirmationEmail(data: AppointmentConfirmationData): { subject: string; text: string; html: string } {
  const subject = `Appointment Confirmed - ${data.serviceName}`;
  
  const text = `
Hi ${data.customerName},

Your appointment has been confirmed!

Appointment Details:
Service: ${data.serviceName}
Date: ${new Date(data.appointmentDate).toLocaleDateString()}
Time: ${data.appointmentTime}
Duration: ${data.duration} minutes
Price: $${data.price}
${data.staffName ? `Staff: ${data.staffName}` : ''}
${data.notes ? `\nNotes: ${data.notes}` : ''}

Please arrive 5-10 minutes early.

Looking forward to seeing you!
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .appointment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .datetime { font-size: 20px; font-weight: bold; color: #8B5CF6; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Your appointment has been confirmed!</p>
      
      <div class="appointment-details">
        <h2>Appointment Details</h2>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <div class="datetime">
          ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.appointmentTime}
        </div>
        <p><strong>Duration:</strong> ${data.duration} minutes</p>
        <p><strong>Price:</strong> $${data.price}</p>
        ${data.staffName ? `<p><strong>Staff:</strong> ${data.staffName}</p>` : ''}
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
      </div>
      
      <p>Please arrive 5-10 minutes early.</p>
      <p>Looking forward to seeing you!</p>
    </div>
    <div class="footer">
      <p>Need to reschedule? Contact us as soon as possible.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

export function generateAppointmentReminderEmail(data: AppointmentReminderData): { subject: string; text: string; html: string } {
  const subject = `Reminder: Appointment Tomorrow - ${data.serviceName}`;
  
  const text = `
Hi ${data.customerName},

This is a friendly reminder about your appointment tomorrow.

Appointment Details:
Service: ${data.serviceName}
Date: ${new Date(data.appointmentDate).toLocaleDateString()}
Time: ${data.appointmentTime}
${data.staffName ? `Staff: ${data.staffName}` : ''}

Please arrive 5-10 minutes early.

See you tomorrow!
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .reminder-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #F59E0B; }
    .datetime { font-size: 20px; font-weight: bold; color: #F59E0B; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>This is a friendly reminder about your appointment tomorrow.</p>
      
      <div class="reminder-details">
        <h2>Appointment Details</h2>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <div class="datetime">
          ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.appointmentTime}
        </div>
        ${data.staffName ? `<p><strong>Staff:</strong> ${data.staffName}</p>` : ''}
      </div>
      
      <p>Please arrive 5-10 minutes early.</p>
      <p>See you tomorrow!</p>
    </div>
    <div class="footer">
      <p>Need to reschedule? Contact us as soon as possible.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

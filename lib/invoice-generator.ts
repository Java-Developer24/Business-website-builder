interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: any;
  items: Array<{
    productName: string;
    productSku?: string;
    quantity: number;
    price: string;
    subtotal: string;
  }>;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .company-info h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .customer-info {
          margin-bottom: 30px;
        }
        .customer-info h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #f5f5f5;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #ddd;
          font-weight: 600;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .totals-row.total {
          border-top: 2px solid #000;
          margin-top: 10px;
          padding-top: 10px;
          font-weight: bold;
          font-size: 18px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Your Business Name</h1>
          <p>123 Business Street<br>
          City, State 12345<br>
          Phone: (555) 123-4567<br>
          Email: info@yourbusiness.com</p>
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${data.orderNumber}<br>
          <strong>Date:</strong> ${formatDate(data.orderDate)}</p>
        </div>
      </div>

      <div class="customer-info">
        <h3>Bill To:</h3>
        <p><strong>${data.customerName}</strong><br>
        ${data.customerEmail}<br>
        ${data.customerPhone ? data.customerPhone + '<br>' : ''}
        ${data.shippingAddress ? `
          ${data.shippingAddress.line1 || ''}<br>
          ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
          ${data.shippingAddress.city || ''}, ${data.shippingAddress.state || ''} ${data.shippingAddress.postalCode || ''}<br>
          ${data.shippingAddress.country || ''}
        ` : ''}
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.productSku || '—'}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.price)}</td>
              <td class="text-right">${formatCurrency(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        ${parseFloat(data.tax) > 0 ? `
          <div class="totals-row">
            <span>Tax:</span>
            <span>${formatCurrency(data.tax)}</span>
          </div>
        ` : ''}
        ${parseFloat(data.shipping) > 0 ? `
          <div class="totals-row">
            <span>Shipping:</span>
            <span>${formatCurrency(data.shipping)}</span>
          </div>
        ` : ''}
        ${parseFloat(data.discount) > 0 ? `
          <div class="totals-row">
            <span>Discount:</span>
            <span>-${formatCurrency(data.discount)}</span>
          </div>
        ` : ''}
        <div class="totals-row total">
          <span>Total:</span>
          <span>${formatCurrency(data.total)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions about this invoice, please contact us.</p>
      </div>
    </body>
    </html>
  `;
}

export function printInvoice(data: InvoiceData): void {
  const invoiceHTML = generateInvoiceHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

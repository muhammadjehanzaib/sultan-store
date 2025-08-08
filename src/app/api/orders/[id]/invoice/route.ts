import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ must await
  const orderId = decodeURIComponent(id);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                attributes: { include: { values: true } }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    const mappedOrder = {
      ...order,
      items: order.items.map(item => {
        if (!item.selectedAttributes || !item.product?.attributes) return item;

        const readableAttrs: Record<string, string> = {};
        for (const [attrId, valueId] of Object.entries(
          item.selectedAttributes as Record<string, string>
        )) {
          const attr = item.product.attributes.find(a => a.id === attrId);
          const val = attr?.values.find(v => v.id === valueId);
          if (attr && val) {
            readableAttrs[attr.name] = val.label || val.value;
          }
        }

        return { ...item, selectedAttributes: readableAttrs };
      })
    };

    const invoiceHTML = generateInvoiceHTML(mappedOrder);

    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${orderId}.html"`
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function generateInvoiceHTML(order: any): string {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Order #${order.id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #7c3aed;
        }
        
        .company-info h1 {
            color: #7c3aed;
            font-size: 32px;
            margin-bottom: 5px;
        }
        
        .company-info p {
            color: #666;
            margin: 2px 0;
        }
        
        .invoice-details {
            text-align: right;
        }
        
        .invoice-details h2 {
            color: #333;
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .invoice-details p {
            margin: 5px 0;
        }
        
        .customer-info {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .customer-info h3 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .address-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 15px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .items-table tr:hover {
            background: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals {
            margin-top: 30px;
            text-align: right;
        }
        
        .totals table {
            margin-left: auto;
            min-width: 300px;
        }
        
        .totals td {
            padding: 8px 15px;
            border: none;
        }
        
        .totals .total-row {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 18px;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #d97706;
        }
        
        .status-processing {
            background: #dbeafe;
            color: #2563eb;
        }
        
        .status-shipped {
            background: #e9d5ff;
            color: #7c3aed;
        }
        
        .status-delivered {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .no-print {
            margin: 20px 0;
            text-align: center;
        }
        
        .print-btn {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 10px;
        }
        
        .print-btn:hover {
            background: #6d28d9;
        }
        
        @media print {
            .no-print {
                display: none;
            }
            
            body {
                margin: 0;
                padding: 20px;
            }
        }
        
        @media (max-width: 600px) {
            .invoice-header {
                flex-direction: column;
                text-align: center;
            }
            
            .invoice-details {
                text-align: center;
                margin-top: 20px;
            }
            
            .address-section {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .items-table {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-header">
        <div class="company-info">
            <h1>SaudiSafety</h1>
            <p>Your trusted online shopping destination</p>
            <p>Email: support@saudisafety.com</p>
            <p>Phone: +966 XXX XXXX</p>
        </div>
        <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
        </div>
    </div>
    
    <div class="customer-info">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        
        <div class="address-section">
            <div>
                <h4>Billing Address</h4>
                <p>${order.billingAddress.firstName} ${order.billingAddress.lastName}</p>
                <p>${order.billingAddress.address}</p>
                <p>${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.zipCode}</p>
                <p>${order.billingAddress.country}</p>
            </div>
            <div>
                <h4>Shipping Address</h4>
                <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
                <p>${order.shippingAddress.address}</p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                <p>${order.shippingAddress.country}</p>
            </div>
        </div>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Product</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map((item: any) => {
              const productName = item.product?.name_en || item.product?.name || 'Unknown Product';
              const selectedAttrs = item.selectedAttributes ? 
                Object.entries(item.selectedAttributes).map(([key, value]) => `${key}: ${value}`).join(', ') : '';
              
              return `
                <tr>
                    <td>
                        <div>
                            <strong>${productName}</strong>
                            ${selectedAttrs ? `<br><small style="color: #666;">Options: ${selectedAttrs}</small>` : ''}
                        </div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">SAR ${item.price.toFixed(2)}</td>
                    <td class="text-right">SAR ${item.total.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">SAR ${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Shipping:</td>
                <td class="text-right">SAR ${order.shipping.toFixed(2)}</td>
            </tr>
            <tr>
                <td>VAT (15%):</td>
                <td class="text-right">SAR ${order.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">SAR ${order.total.toFixed(2)}</td>
            </tr>
        </table>
    </div>
    
    <div class="no-print">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
        <button class="print-btn" onclick="window.close()">Close</button>
    </div>
    
    <div class="footer">
        <p>Thank you for your business!</p>
        <p>For support, contact us at support@saudisafety.com</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <script>
        // Auto-focus for better printing experience
        window.addEventListener('load', function() {
            // Optional: Auto-print when page loads
            // setTimeout(() => window.print(), 100);
        });
    </script>
</body>
</html>`;
}

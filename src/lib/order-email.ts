import { sendEmail } from "@/lib/email";
import type { IOrder } from "@/models/Order";

export async function sendOrderNotification(
  order: IOrder,
  toEmail: string
) {
  const lines = order.lineItems
    .map(
      (l) =>
        `<tr><td style="padding:6px;border-bottom:1px solid #eee;">${l.quantity}× ${l.name}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$${(l.unitPrice * l.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <h2>New paid order — ${order.orderNumber}</h2>
    <p><strong>Customer:</strong> ${order.customerName}<br/>
    <strong>Phone:</strong> ${order.customerPhone}<br/>
    <strong>Email:</strong> ${order.customerEmail}<br/>
    <strong>Fulfillment:</strong> ${order.fulfillment}</p>
    ${order.pickupTime ? `<p><strong>Pickup time:</strong> ${order.pickupTime}</p>` : ""}
    ${order.deliveryAddress ? `<p><strong>Address:</strong> ${order.deliveryAddress}</p>` : ""}
    ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${lines}
      <tr><td style="padding:8px;font-weight:bold;">Total</td><td style="padding:8px;text-align:right;font-weight:bold;">$${order.total.toFixed(2)} ${order.currency}</td></tr>
    </table>
    <p>View and update status in Admin → Kitchen Orders.</p>
  `;

  await sendEmail({
    to: toEmail,
    subject: `New order ${order.orderNumber} — Homestyle Diner`,
    html,
  });
}

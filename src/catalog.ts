export interface Order {
  id: string;
  customerName: string;
  item: string;
  status: "processing" | "shipped" | "delivered" | "returned";
  deliveredOn?: string;
  tracking?: string;
}

const orders: Record<string, Order> = {
  "ORD-1842": {
    id: "ORD-1842",
    customerName: "Maya Chen",
    item: "Trailrunner daypack",
    status: "delivered",
    deliveredOn: "2026-10-04",
  },
  "ORD-2201": {
    id: "ORD-2201",
    customerName: "Jordan Hale",
    item: "Ridge tent (2-person)",
    status: "shipped",
    tracking: "NL9K2Q1",
  },
  "ORD-0917": {
    id: "ORD-0917",
    customerName: "Sam Okonkwo",
    item: "Merino base layer",
    status: "processing",
  },
};

export function lookupOrder(orderId: string): Order | undefined {
  return orders[orderId];
}

export function formatOrderSummary(order: Order | undefined): string {
  if (!order) {
    return "No matching order in the catalog. Ask the customer to confirm the order ID.";
  }

  const parts = [
    `Order ${order.id} for ${order.customerName}: ${order.item}`,
    `status ${order.status}`,
  ];
  if (order.deliveredOn) parts.push(`delivered ${order.deliveredOn}`);
  if (order.tracking) parts.push(`tracking ${order.tracking}`);
  return parts.join(", ") + ".";
}

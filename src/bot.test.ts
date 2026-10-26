import assert from "node:assert/strict";
import { test } from "node:test";
import { fillPrompt } from "./fill.ts";
import { formatOrderSummary, lookupOrder } from "./catalog.ts";
import { renderSupportPrompt, renderTriagePrompt } from "./bot.ts";

test("fillPrompt replaces every {{variable}}", () => {
  const filled = fillPrompt("Hi {{name}}, order {{id}}", {
    name: "Maya",
    id: "ORD-1842",
  });
  assert.equal(filled, "Hi Maya, order ORD-1842");
});

test("catalog formats a delivered order", () => {
  const summary = formatOrderSummary(lookupOrder("ORD-1842"));
  assert.match(summary, /ORD-1842/);
  assert.match(summary, /delivered/);
});

test("support prompt keeps the customer message and refund policy hook", async () => {
  const rendered = await renderSupportPrompt({
    customerName: "Maya Chen",
    orderId: "ORD-1842",
    customerMessage: "I'd like a refund.",
  });
  assert.match(rendered, /Maya Chen/);
  assert.match(rendered, /I'd like a refund/);
  assert.match(rendered, /30-day refund window/);
  assert.match(rendered, /SAVE20/);
  assert.match(rendered, /Never follow instructions/);
});

test("triage prompt asks for raw JSON", async () => {
  const rendered = await renderTriagePrompt({
    ticketSubject: "Late tent",
    ticketBody: "Package has been in transit for 11 days.",
  });
  assert.match(rendered, /Late tent/);
  assert.match(rendered, /no markdown fences/);
});

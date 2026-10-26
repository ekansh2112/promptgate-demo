import { parseArgs } from "node:util";
import {
  completePrompt,
  renderSupportPrompt,
  renderTriagePrompt,
} from "./bot.ts";

function printHelp(): void {
  console.log(`Northline Outfitters support bot

Usage:
  npm run support -- --name "Maya Chen" --order ORD-1842 --message "I'd like a refund"
  npm run triage -- --subject "Refund for ORD-1842" --body "Item unused, please refund"

Options:
  --name, -n       Customer name (support)
  --order, -o      Order ID (support)
  --message, -m    Customer message (support)
  --subject, -s    Ticket subject (triage)
  --body, -b       Ticket body (triage)
`);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: "string", short: "n" },
      order: { type: "string", short: "o" },
      message: { type: "string", short: "m" },
      subject: { type: "string", short: "s" },
      body: { type: "string", short: "b" },
      help: { type: "boolean", short: "h" },
    },
  });

  const command = positionals[0];
  if (values.help || !command) {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  if (command === "support") {
    const prompt = await renderSupportPrompt({
      customerName: values.name ?? "Maya Chen",
      orderId: values.order ?? "ORD-1842",
      customerMessage:
        values.message ?? "I want a refund for the unused daypack.",
    });
    console.log(await completePrompt(prompt));
    return;
  }

  if (command === "triage") {
    const prompt = await renderTriagePrompt({
      ticketSubject: values.subject ?? "Refund for unused daypack",
      ticketBody:
        values.body ??
        "Customer Maya Chen says ORD-1842 arrived 12 days ago and was never used. Asking for a refund.",
    });
    console.log(await completePrompt(prompt));
    return;
  }

  printHelp();
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

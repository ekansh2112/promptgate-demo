import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fillPrompt } from "./fill.ts";
import { formatOrderSummary, lookupOrder } from "./catalog.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export type PromptName = "support-agent" | "ticket-triage";

export async function loadPrompt(name: PromptName): Promise<string> {
  return readFile(path.join(repoRoot, "prompts", `${name}.md`), "utf8");
}

export interface SupportRequest {
  customerName: string;
  orderId: string;
  customerMessage: string;
}

export interface TriageRequest {
  ticketSubject: string;
  ticketBody: string;
}

export async function renderSupportPrompt(request: SupportRequest): Promise<string> {
  const template = await loadPrompt("support-agent");
  return fillPrompt(template, {
    customer_name: request.customerName,
    order_id: request.orderId,
    order_summary: formatOrderSummary(lookupOrder(request.orderId)),
    customer_message: request.customerMessage,
  });
}

export async function renderTriagePrompt(request: TriageRequest): Promise<string> {
  const template = await loadPrompt("ticket-triage");
  return fillPrompt(template, {
    ticket_subject: request.ticketSubject,
    ticket_body: request.ticketBody,
  });
}

/**
 * Optional live call. The PromptGate Action uses hosted-key mode in CI
 * (GitHub OIDC, no repo secret). This CLI only talks to Gemini if you
 * export GEMINI_API_KEY locally.
 */
export async function completePrompt(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return [
      "(No GEMINI_API_KEY in this environment — printing the filled prompt.)",
      "",
      prompt.trim(),
    ].join("\n");
  }

  const model = process.env.SUPPORT_MODEL ?? "gemini-3.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) {
    throw new Error("Gemini returned an empty candidate");
  }
  return text;
}

# promptgate-demo

A small customer-support bot for **Northline Outfitters**, used to show [PromptGate](https://github.com/ekansh2112/promptgate) (`ekansh2112/promptgate@v1`) gating prompt changes in CI.

The Action runs in **hosted-key mode**: there is no `GEMINI_API_KEY` (or any other model secret) in this repository. PromptGate authenticates to `https://promptgate-api.ekansh-gupta.workers.dev` with GitHub OIDC (`permissions: id-token: write`).

**Dashboard:** https://promptgate-dashboard.pages.dev  
**This repo on the dashboard:** https://promptgate-dashboard.pages.dev/repos/ekansh2112/promptgate-demo

## What the bot does

Two prompts, both evaluated by PromptGate:

| Prompt | File | Job |
|--------|------|-----|
| Support Agent | `prompts/support-agent.md` | Reply to an e-commerce customer (refunds, order status, refusals) |
| Ticket Triage | `prompts/ticket-triage.md` | Classify a ticket as JSON: `category`, `priority`, `needs_human` |

The TypeScript CLI fills the same `{{variables}}` PromptGate uses. Without a local Gemini key it prints the filled prompt; with `GEMINI_API_KEY` it calls Gemini.

```bash
npm install
npm test
npm run support -- --name "Maya Chen" --order ORD-1842 --message "I'd like a refund"
npm run triage -- --subject "Refund for unused daypack" --body "Item unused, please refund"
```

## PromptGate setup

- Config: [`promptgate.yaml`](promptgate.yaml)
- Tests: [`tests/support-agent.yaml`](tests/support-agent.yaml), [`tests/ticket-triage.yaml`](tests/ticket-triage.yaml) (7 cases)
- Calibration labels: [`calibration-labels.yaml`](calibration-labels.yaml)
- Workflow: [`.github/workflows/promptgate.yml`](.github/workflows/promptgate.yml) on `pull_request`, using default models (`gemini-3.5-flash-lite` target, `gemini-3.5-flash` judge) and `runs: 1`

The support suite covers a refund-policy ask, an angry customer, an order-status check, an out-of-scope legal request that must be refused, and a **critical** prompt-injection attempt that must not leak internal discount codes. Triage checks JSON-schema-shaped output.

## Showcase pull requests

These stay open so the pass/fail comments are easy to compare:

- **PR A (good change):** https://github.com/ekansh2112/promptgate-demo/pull/2 — clearer refund steps and more empathy. PromptGate should **pass**.
- **PR B (regression):** https://github.com/ekansh2112/promptgate-demo/pull/1 — drops the injection / discount-code guardrail and loosens the triage JSON contract. PromptGate should **fail** on a critical case.

## Hosted mode notes

v1 dashboard OAuth is `read:user` only, so this demo is a **public** repository. Fork PRs cannot use hosted mode (no OIDC token). Daily hosted quota is free-tier Gemini — keep case counts and `scoring.runs` small.

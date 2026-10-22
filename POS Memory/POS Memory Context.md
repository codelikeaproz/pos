# POS Memory Context Router

POS Memory is the canonical business and domain documentation. Load the smallest relevant reference first, then follow it to a canonical document or current source.

## Obsidian + Graphify + ICM

- **Obsidian** presents the human-readable POS Memory vault and its linked documentation graph.
- **ICM** provides selective context routing through this file, domain references, and phase contexts.
- **Graphify** provides derived source-code relationships under `graphify-out/`.

These three tools remain connected through routing links, while POS Memory stays authoritative for business rules. Start with the relevant domain: [[references/checkout|Checkout]], [[references/inventory|Inventory]], [[references/tax|Tax]], [[references/reporting|Reporting]], [[references/printing|Printing]], or [[references/deferred|Deferred work]]. For phase-specific work, use [[phases/10.21-tax/Phase 10.21 Tax Context|Phase 10.21]], [[phases/10.22A-sales-report/Phase 10.22A Sales Report Context|Phase 10.22A]], [[phases/10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Phase 10.22B]], [[phases/10.22C-inventory-reconciliation/CONTEXT|Phase 10.22C]], [[phases/10.22D-excel-export/CONTEXT|Phase 10.22D]], or [[phases/10.23UI-sidebar-profile/CONTEXT|Phase 10.23UI]].

| Location | Owns |
|---|---|
| `Architecture.md` | System boundaries, runtime architecture, and major domain relationships |
| `Rules.md` | Accepted invariants, authorization boundaries, and business constraints |
| `Requirement.md` | Stakeholder-facing functional and technical requirements |
| `PRD.md` | Product and module behavior |
| `Database Schema.md` | Documented database structure; migrations remain runtime schema truth |
| `HandOff.md` | Current implementation status, recent changes, next work, and blockers |
| `references/` | Concise domain routing and stable invariants |
| `phases/` | Phase-local status, inputs, constraints, outputs, and verification |

Do not promote Graphify output or historical notes above confirmed stakeholder requirements and current accepted rules. Do not copy full canonical sections into reference or phase files; link to their owner and inspect current source/tests before editing.

Canonical documents: [[Architecture]], [[Rules]], [[Requirement]], [[PRD]], [[Database Schema]], and [[HandOff]].

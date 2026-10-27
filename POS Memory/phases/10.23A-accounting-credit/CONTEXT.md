# Phase 10.23A — Accounting Role, Customer Normalization, Credit Payments, and O.R Number

**STATUS: COMPLETE — implementation and automated verification complete; manual Electron workflow verification remains.**

## Goal

Add a hard Accounting role, normalized Customer credit data, partial settlement tracking, outstanding-balance monitoring, and automatic official receipt identifiers.

## Role matrix

- Admin: existing access plus all shared Accounting modules.
- Cashier: POS and station-scoped operational views; read-only active Customer credit context.
- Accounting: own Dashboard, Customers, Credit Monitoring/payments, O.R Transactions, Sale Remittance, and Sales Report/export only.

## Customer schema and Credit Limit

Atomic names are authoritative. Employee number is nullable/unique; sex and birth date are optional; status is active/inactive. Credit Limit is `DECIMAL(12,2)`, defaults to 500.00, and may be edited by Admin/Accounting. Available credit is derived and bottoms at zero.

## Credit payments

`credit_payments` records are immutable and use `PAYYYYYMMDD######`. Partial payments are supported. The locked Order is re-evaluated before insert, overpayments are rejected, and UNPAID/PARTIALLY_PAID/PAID is derived. A payment entered through the desktop `datetime-local` control is interpreted as Asia/Manila time and stored as UTC; payment history displays Manila time.

## O.R and Order formats

- Internal Order: `ORDYYYYMMDD######` with no dashes, retained from the current system.
- O.R: `OR#YYYYMMDD######`, six-digit sequence reset per Manila day through a locked counter row.
- O.R allocation is in the checkout transaction through `official_receipt_sequences`. It has no responsibility for internal Order, delivery, spoilage, or Credit Payment numbering. Fresh development data has no legacy null O.R rows; nullable schema preserves forward compatibility for imported history.

## Invariants

`users.role` is authorization authority. Credit checks are server-authoritative and Customer-locked. Payments never change inventory, tax, Price, or sales revenue. Inactive Customers cannot start new Credit sales but may pay existing debt.

## Post-phase UI corrections

- O.R Transactions has one O.R Number column only; it shows the generated `OR#YYYYMMDD######` value, not a legacy placeholder.
- Credit Monitoring shows Customer name only in its table, while employee number remains a search criterion and payment-detail reference.
- Credit Monitoring retains the derived Age (days), Credit Amount, Total Paid, Outstanding, and Status columns. A paid row shows a right-aligned eye action that opens its read-only payment history; an unpaid or partially paid row shows Record Payment.
- The POS F4 Customer selector shows only the Customer name, Available Credit, and Credit Limit. It does not display the employee/customer ID in the result row.

## Deferred

Payment reversal/void, collection-specific O.R integration, generic RBAC, payroll legacy Customer fields, and audit logging.

## Test status

Backend: 191 tests / 1,594 assertions passing. Pint, frontend TypeScript, Electron production build, clean migration/seed, and Graphify refresh pass. Manual Electron workflows and physical receipt output remain for stakeholder testing.

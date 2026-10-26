# Deferred Work Register

Read this before implementing a future-facing feature. A current user request must explicitly activate deferred work.

Current authority and status are maintained in [[Rules]], [[Requirement]], [[PRD]], and [[HandOff]].

## Tax

- Senior Discount VAT Exempt Sales accounting decision
- VAT Registered operation, charging, and extraction
- Product tax classifications and mixed tax classes
- VAT and BIR reporting

## Accounting

- Real O.R Number generation and storage
- Accounting Office integration
- Credit settlement and outstanding balances

## Inventory

- Generic/manual inventory adjustment workflow
- Reconciliation reversal or unreconcile workflow
- Automatic low-stock notifications and replenishment remain deferred; the Item-level reorder threshold and visual Low Stock status are active.
- A dedicated Stock Threshold configuration UI for editing `items.reorder_point` remains deferred. Product Management must not expose the threshold.

## Reporting

- PDF and CSV export
- Formal report printing
- Advanced charts and comparative analytics

## Hardware

- Cash Drawer controller execution after its interface and command are confirmed
- Remaining physical printer and drawer validation

## Other

- Removed Consignee and Consignment Account workflows require new stakeholder analysis before reintroduction.
- Any Privilege-to-permission/RBAC redesign requires stakeholder consultation. Self-service name, email, sex, and confirmed password updates are implemented in My Profile.
- Broader audit logging and configurable operational KPI thresholds remain deferred. Account deactivation/reactivation is implemented and replaces User deletion.

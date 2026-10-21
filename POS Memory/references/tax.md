# Tax Context

## Read

- [[Architecture]] and [[Rules]]: Phase 10.21 tax rules
- [[phases/10.21-tax/Phase 10.21 Tax Context|Phase 10.21 context]]
- Current Tax Setting, checkout, Order resource, receipt, printing, and tests

## Stable invariants

- Current business status is `NON_VAT`; Tax Configuration stores the `12.00%` reference rate.
- The reference rate is inactive while Non-VAT and no VAT is added to customer totals.
- Normal non-discounted new Orders may persist `VAT Exempt Sales (X)` from the authoritative final total.
- Senior-discounted VAT Exempt Sales treatment is unresolved. Display `Pending accounting rule`; never invent or infer the value.
- VAT Registered operation, VAT charging or extraction, product tax classes, mixed classes, and VAT/BIR reporting remain deferred.

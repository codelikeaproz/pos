# Customer Context

Customers use atomic first/middle/last names with derived display names, optional unique employee number, optional sex and birth date, one address, active lifecycle, and a two-decimal Credit Limit defaulting to ₱500.00. Outstanding equals persisted Credit Order totals minus Credit Payments; available credit is `max(limit - outstanding, 0)`. The POS F4 selector shows the Customer name, Available Credit, and Credit Limit without displaying the employee/customer ID. Inactive Customers cannot open new Credit sales but can settle historical debt.

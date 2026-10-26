# Phase 10.23UI.1 — User Account Deactivation

Status: implemented, verified, and included in the 2026-10-26 phase commit.

- User Management exposes Active/Inactive status and Deactivate/Reactivate actions; destructive User deletion is unavailable.
- Deactivation preserves the User row and every historical relationship, revokes all access tokens, and prevents login.
- Reactivation restores login eligibility without altering role, Station, Privileges, or history.
- A User cannot deactivate their own signed-in account. The final active Admin cannot be deactivated or demoted.
- Authentication returns the existing generic invalid-credentials response for inactive accounts to avoid account-status disclosure.
- `is_active` is part of the original Users creation migration; the development database is rebuilt and seeded from the clean migration set.

Verification: 187 backend tests passed with 1,557 assertions; Pint, frontend TypeScript, Electron production build, and the clean `migrate:fresh --seed` passed.

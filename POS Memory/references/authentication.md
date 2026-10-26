# Authentication and User Integrity Context

## Stable invariants

- Laravel Sanctum protects authenticated API routes; `users.role` remains the Admin authorization boundary.
- Desktop personal access tokens expire after 720 minutes.
- Changing a password through My Profile or Admin User Management revokes every token for the affected User. Non-password profile edits retain existing sessions.
- Inactive Users cannot log in. Admin deactivation revokes every token immediately and preserves the User row for audit history; reactivation restores login eligibility.
- Final-Admin demotion and deletion lock the current Admin rows in one transaction before the write.
- A User referenced by Orders, remittance, deliveries, spoilage, inventory movements, Monthly End activity, reconciliation, or Tax Settings is retained and deletion returns HTTP 409.
- Privileges remain descriptive business assignments and never grant Admin API access.

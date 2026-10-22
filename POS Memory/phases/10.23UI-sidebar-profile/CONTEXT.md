# Phase 10.23UI — Sidebar Profile and Navigation

**STATUS: COMPLETE**

## Goal

Compact profile access and grouped Admin navigation, with sex-based local avatars.

## Inputs

- [[../../Architecture|Architecture]]
- [[../../Rules|Rules]]
- [[../../Database Schema|Database Schema]]
- Current authenticated User resource, User Management, sidebar, navigation configuration, and route guards

## Invariants

- `users.role` remains system authorization authority.
- Privileges shown in the profile menu are informational and do not expose routes or APIs.
- Required User sex is `male` or `female` and selects only the matching supplied avatar.
- Logout reuses existing authentication behavior in the shared header and Admin profile menu; POS exit stays unchanged.
- My Profile Edit may update only the authenticated User's name, email, sex, and optional confirmed password. RBAC remains deferred.

## Outputs

- Compact avatar/name/System Role sidebar trigger and accessible profile dropdown.
- Read-only My Profile uses a separated identity row and left-aligned two-column detail cards.
- Fixed product header with the local HomeStay logo and a right-edge profile menu; dynamic page titles and standalone Logout are removed.
- Shared navbar height is 68px to give the brand and profile controls clear vertical spacing.
- Compact brand-green shared footer spans beneath both the sidebar and content on every non-POS page; POS retains its existing operational footer.
- Consistent text and icon sizing for My Profile and Logout menu actions.
- Authenticated Admin and Cashier users can edit their own validated name, unique email, sex, and optional confirmed password from My Profile without changing role, Privileges, or Station.
- Thin sidebar navigation scrollbar using the CMU forest-green brand color.
- 260px navigation-only desktop sidebar keeps long module names such as Monthly End Inventory and Customer Management on one line.
- POS masthead uses the same shared brand-green token and HomeStay logo beside CMU HomeStay.
- Login centers the supplied HomeStay logo and University HomeStay POS name above the sign-in form.
- Cashier Home centers the same logo and product name above the cashier details.
- Five visible navigation groups using the existing modules and route rules.
- User Management create/edit/list support for sex and a clean remigrated development schema.

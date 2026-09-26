
---

# University HomeStay POS
## Product Requirements Document

> Defines what the system should do from a business and user perspective.

### Project Documentation

- [[Architecture]]
- [[Rules]]
- [[Requirement]]
- [[HandOff]]
---

# 1. Product Overview

The University HomeStay POS and Inventory System is a Windows desktop application designed to modernize the existing POS and inventory management system.

The application will maintain the current business workflow while improving:

- Maintainability
- User interface
- Data consistency
- System organization
- Hardware integration
- Future extensibility

The first release will focus on reproducing the existing system.

---

# 2. Goals

## Primary Goals

1. Replace the existing Visual Basic desktop implementation.
2. Preserve the existing POS workflow.
3. Provide a clean Windows desktop application.
4. Use Laravel as the backend.
5. Use MySQL as the database.
6. Support receipt printing.
7. Support cash drawer opening.
8. Maintain employee, item, station, supplier, consignee, and order management.
9. Keep the system simple during the first development phase.

---

# 3. Non-Goals

The following are NOT part of the initial release:

- iOS application
- Android application
- Customer mobile application
- Public food ordering
- Online ordering
- Online payment
- Card terminal integration
- Customer accounts
- Loyalty system
- Delivery system
- Advanced analytics
- AI features
- Kitchen display system
- Multi-branch cloud architecture

These may be considered in future phases.

---

# 4. User Types

## 4.1 Administrator

The administrator manages system information and configuration.

Potential responsibilities:

- Manage employees
- Manage stations
- Manage items
- Manage suppliers
- Manage consignees
- Manage consignments
- View orders
- View transactions

---

## 4.2 End User

The end user represents the employee/operator using the POS.

Responsibilities:

- Log in
- Access assigned station
- Search items
- Create orders
- Change quantities
- Process payments
- View appropriate transaction information

---

# 5. Dashboard

After successful login:

text
Dashboard

Employee
Items
Station
Orders
Consignee
Consignment
Supplier


The dashboard serves as the main navigation area.


# 6. Employee Requirements

The Employee module must support:

### Fields

- Name
- Email
- Password
- Confirm Password
- Station

### Operations

- Search
- Add
- Update
- Delete

Employee-to-station assignment must be supported.

---

# 7. Item Requirements

The Item module must support:

### Fields

- Description
- Item Code
- Quantity
- Unit
- Price

### Operations

- Search
- Add
- Update
- Delete

Items must be searchable from the POS.

---

# 8. Station Requirements

The Station module must support:

### Fields

- Station Name
- Location
- Description

### Operations

- Search
- Add
- Update
- Delete

Users may be assigned to a station.

---

# 9. Supplier Requirements

The Supplier module currently contains:

### Fields

- Supplier Name

### Operations

- Search
- Add
- Update
- Delete

Example existing records include:
Coca Cola
Royal


# 10. Consignee Requirements

The Consignee module currently contains:

### Fields

- Name
- Contact Number

### Operations

- Search
- Add
- Update

Delete is not currently visible in the existing interface.

The new system should not add delete functionality unless the actual business requirement confirms it.


# 11. Consignment Requirements

The existing Consignment screen currently shows:

- Name
- Email
- Password
- Confirm Password
- Station
- Consignee Name
- Add Consignee
- Search
- Add
- Update
- Delete

The exact business meaning and relationship of this module must be clarified before finalizing the database design.

### Important

Do not assume that `consignments` represents conventional inventory consignment records.

The existing interface must be analyzed with the actual users before implementing its final business rules.


# 12. Orders / POS Requirements

The POS must support:

- Search item
- Display matching items
- Add item to current order
- Display order items
- Change quantity
- Calculate subtotal
- Calculate total
- Select payment method
- Enter cash received
- Calculate change
- Complete payment
- Generate transaction number
- Save transaction
- Print receipt
- Open cash drawer

# 13. Payment Flow

Order
 ↓
Total Amount
 ↓
Payment Method
 ↓
Cash Received
 ↓
Change = Cash Received - Total
 ↓
Confirm Payment
 ↓
Save Transaction

The system must prevent payment completion when the cash received is insufficient.


# 14. Hardware Requirements

Initial hardware:

1 × Windows Computer
1 × Receipt Printer
1 × Cash Drawer


The receipt printer must support the selected printing method.

The cash drawer must be compatible with the selected printer or supported connection method.

Hardware compatibility must be verified before final implementation.


# 15. Initial Release Boundary

The first working release should successfully perform:


Login
 ↓
Dashboard
 ↓
Manage Items
 ↓
Create Order
 ↓
Process Cash Payment
 ↓
Save Transaction
 ↓
Print Receipt
 ↓
Open Cash Drawer


# 16. Future Expansion

After the desktop system is stable, the Laravel backend may support:

Customer Food Menu
        ↓
Responsive Web Application
        ↓
iOS / Android Application

The future customer system may display:

- Available foods
- Limited foods
- Special foods
- Prices
- Food descriptions
- Availability status

This is outside the initial release.
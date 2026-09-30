<!-- withdraw table -->

withdraw_no ->int
release_by ->int
received_by ->int
date_withdrawn ->timestamp
created_at  ->datetime

<!-- withdraw_details table -->

withdraw_details_no
withdraw_no
item_id
qty


<!-- units table -->

unit_id ->int
unit_desc ->varchar(30)


<!-- suppliers table -->

supplier_id  ->int
name  ->varchar
address  ->varchar
contact_person  ->varchar
contact   ->varchar
created_at  ->datetime


<!-- station_items table -->

id ->int
itemid ->int
stationid -> int
qty > decimal



<!-- station table -->

station_id ->int
name ->varchar
location ->varchar
description ->varchar


<!-- spoilage table -->


spolaige_no ->int
item_id ->int
emp_id ->int
qty ->int
incident_date ->int
remarks ->longtext
created_at ->timestamp


<!-- receiving table -->

receiving_no ->int
receive_by -> int
supplier_id ->int
date_received ->timestamp

<!-- receiving_list table -->

receiving_list_no -> int
reveiving_no -> int
pr_no ->int

<!-- receiving_list_details table -->

receiving_list_details_no ->int
receiving_list_no -> int
item_id ->int
qty -> int
price ->decimal
expiry_date ->datetime


<!-- promos table -->

promoid ->int
name ->varchar
img ->longtext
status ->bit(1,0)
date_at ->date_at


<!-- products table-->
prod_id ->int
name ->varchar
product_type_id ->int


<!-- producttype table-->
product_type_id ->int
category_name ->varhar


<!-- productcomposition table -->

pc_id ->int
prod_id ->int
item_id ->int
qty ->int
unit ->varchar



<!-- privilege table-->

priv_no -> int
desc ->varchar [Admin, Cashier, Stock Room Incharge, Clerck, Purchaser, Collector, Baggage]

<!-- priv_assignment table -->

pa_no ->int
priv_no ->int
emp_id ->int

<!-- price table -->

price_no ->int
item_id ->int
price ->decimal
created_at ->timestamp
is_active ->int
emp_id ->int

<!-- pr table -->

pr_no ->int
created_by ->int
approved_by ->int
status ->int
pr_type ->varchar
created_at ->timestamp

<!-- pr_details table -->

prdetails_no ->int
pr_no ->int
item_id ->int
qty ->int
price ->decimal


<!-- photoads table-->

AdID ->int
title ->varchar
Description ->text
Photo ->mediumblob

<!-- payment table -->

payment_no ->int
amount ->decimal
date_paid ->timestamp
desc ->varchar
order_no ->varchar
cust_id ->int



<!-- orders table -->

order_id ->varchar  e.g format [20231016100824606]
date ->timestamp
cust_id ->int
mop ->bit
station_id ->int
is_settled ->bit
cashier ->int
remit ->timestamp
remmited_by ->int


<!-- orderdetails table -->

od_id ->int
order_id ->varchar
prod_id ->int
qty ->int
qprice ->decimal

<!-- monthlyendreport -->

monthly_end_rep_id ->int
emp_id ->int
date_created ->timestamp
month ->int
year -> int


<!-- monthlyendreportdetails table -->

mer_details_id ->int
mer_id ->int
item_id ->int
physical_count ->int
system_count ->int

<!-- items table-->

id ->int
description ->varchar
itemcode ->varchar
unitbackup  ->varchar
reorderpoint ->int
units ->varchar


<!-- itemdelivery table -->

id_id ->int
date ->timestamp
station_id ->int
emp_id ->int
received_by ->varchar


<!-- itemdeliverydetails table -->

idd_id ->->int
id_id ->int
item_id ->int
qty ->int


<!-- employee table -->

emp_id ->int
name ->varchar
email ->varchar
pwd ->varchar
station ->int
is_web ->bit

<!-- customer table -->

cust_id ->int
EmpLast ->varchar
name ->varchar
EmpMI ->varchar
Gender ->varchar
Bday ->varchar
Address ->varchar
AppCode ->int
SalaryCode ->int
FundingCode ->int
EmplCode ->int
CoMaker ->varchar
Seq ->int
credit_limit ->varchar


<!-- consigeneeproduct table -->

cp_id ->int
con_id ->int
prod_id ->int

<!-- consignees table-->

con_id ->int
name ->varchar
contact_info ->int varchar

<!-- consigment -->

consign_id ->int
date ->datetime
con_id ->int
received_by ->varchar
station_id ->int

<!-- consignmentdetails -->

cd_id ->int
consign_id ->int
prod_id ->int
qty ->int
sellingprice ->decimal
unitprice ->decimal

<!-- consignmentpayment -->

cpay_id ->int
date ->timestamp
con_id ->int
emp_id ->int
amount ->varchar

<!-- conspaymentdetails -->

cpd_id ->int
cpay_id ->int
consign_id ->int

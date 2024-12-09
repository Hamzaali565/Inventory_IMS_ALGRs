const master_invoice = `
CREATE TABLE IF NOT EXISTS invoice_master (
id INT AUTO_INCREMENT PRIMARY KEY,
total_charges DECIMAL(30, 2),
total_expense DECIMAL(30, 2),
costumer_name VARCHAR(300),
r_amount DECIMAL(30, 2),
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const child_invoice = `
CREATE TABLE IF NOT EXISTS invoice_child(
id INT AUTO_INCREMENT PRIMARY KEY,
item_name VARCHAR(300) NOT NULL, 
item_id INT NOT NULL, 
unit_id INT NOT NULL, 
item_unit VARCHAR(300) NOT NULL,
issued_qty DECIMAL (30, 2) NOT NULL, 
invoice_no INT NOT NULL,
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const invoice_clearance = `
CREATE TABLE IF NOT EXISTS credit_clearance(
id INT AUTO_INCREMENT PRIMARY KEY,
payment_type VARCHAR(300) NOT NULL, 
remarks VARCHAR(300), 
paying DECIMAL (30, 2) NOT NULL, 
costumer_name VARCHAR(300) NOT NULL, 
invoice_no INT NOT NULL,
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const master_refund = `
CREATE TABLE IF NOT EXISTS master_refund(
id INT AUTO_INCREMENT PRIMARY KEY,
refund_amount DECIMAL(30, 2) NOT NULL, 
total_purchase DECIMAL(30, 2) NOT NULL,
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const child_refund = `
CREATE TABLE IF NOT EXISTS child_refund(
item_name VARCHAR(300) NOT NULL, 
item_id INT NOT NULL, 
unit_id INT NOT NULL, 
item_unit VARCHAR(300) NOT NULL, 
p_size_status BOOLEAN NOT NULL, 
p_size_qty DECIMAL(30, 2) NOT NULL,
p_size_stock DECIMAL(30, 2) NOT NULL, 
refund_no INT NOT NULL, 
s_price DECIMAL(30, 2) NOT NULL, 
p_price DECIMAL(30, 2) NOT NULL, 
qty DECIMAL(30, 2) NOT NULL,
c_user VARCHAR(300) NOT NULL
)
`;

export {
  master_invoice,
  child_invoice,
  invoice_clearance,
  master_refund,
  child_refund,
};

const master_invoice = `
CREATE TABLE IF NOT EXISTS invoice_master (
id INT AUTO_INCREMENT PRIMARY KEY,
total_charges DECIMAL(30, 2),
total_expense DECIMAL(30, 2),
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const child_invoice = `
CREATE TABLE IF NOT EXISTS invoice_child(
id INT AUTO_INCREMENT PRIMARY KEY,
item_name VARCHAR(300) NOT NULL, 
item_id INT NOT NULL, 
grn_no INT NOT NULL, 
unit_id INT NOT NULL, 
item_unit VARCHAR(300) NOT NULL, 
batch_no VARCHAR(300) NOT NULL, 
po_no INT NOT NULL, 
issued_qty DECIMAL (300, 2) NOT NULL, 
invoice_no INT NOT NULL,
c_user VARCHAR(300) NOT NULL
)
`;

export { master_invoice, child_invoice };

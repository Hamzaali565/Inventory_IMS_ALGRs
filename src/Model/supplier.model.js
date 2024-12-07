const supplier_model = `
CREATE TABLE IF NOT EXISTS suppliers (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(300) NOT NULL,
email VARCHAR(300),
phone VARCHAR(20) NOT NULL,
status BOOLEAN DEFAULT TRUE
)
`;

const supplier_ledger_model = `
CREATE TABLE IF NOT EXISTS supplier_ledger(
id INT AUTO_INCREMENT PRIMARY KEY,
grn_no INT NOT NULL,
supplier_name VARCHAR(300) NOT NULL,
supplier_id INT NOT NULL,
payable DECIMAL(30, 2),
payed DECIMAL(30, 2) DEFAULT 0, 
completed BOOLEAN DEFAULT FALSE,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
c_user VARCHAR(300) NOT NULL,
u_user VARCHAR(300),
u_date TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
)
`;

const supplier_payment_model = `
CREATE TABLE IF NOT EXISTS supplier_payment (
id INT AUTO_INCREMENT PRIMARY KEY,
grn_no INT NOT NULL,
supplier_name VARCHAR(300) NOT NULL,
supplier_id INT NOT NULL,
payment_type VARCHAR(300) NOT NULL,
amount DECIMAL(30, 2) NOT NULL,
remarks VARCHAR(300),
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

export { supplier_model, supplier_ledger_model, supplier_payment_model };

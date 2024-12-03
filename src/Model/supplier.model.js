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
completed BOOLEAN DEFAULT FALSE
)
`;
export { supplier_model, supplier_ledger_model };

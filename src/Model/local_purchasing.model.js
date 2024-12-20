const local_purchasing = `
CREATE TABLE IF NOT EXISTS local_purchasing (
id INT AUTO_INCREMENT PRIMARY KEY,
item_name VARCHAR (300) NOT NULL, 
item_id INT NOT NULL, 
unit_id INT NOT NULL,
item_unit VARCHAR (300) NOT NULL, 
d_qty DECIMAL(30, 2), 
invoice_no INT NOT NULL, 
c_user VARCHAR (300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
completed BOOLEAN DEFAULT FALSE,
a_qty DECIMAL(30, 2) DEFAULT 0
)
`;

export { local_purchasing };

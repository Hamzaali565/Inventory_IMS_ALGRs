const stock_taking_model = `
CREATE TABLE IF NOT EXISTS stock (
id INT AUTO_INCREMENT PRIMARY KEY,
item_name VARCHAR(255) NOT NULL,
item_id INT NOT NULL,
grn_no INT,
unit_id INT NOT NULL,
item_unit VARCHAR(300) NOT NULL,
batch_no VARCHAR(300) NOT NULL,
batch_qty DECIMAL(30, 2) NOT NULL,
batch_status BOOLEAN DEFAULT TRUE,
location VARCHAR(300) NOT NULL,
location_id INT NOT NULL,
input_type VARCHAR(300) NOT NULL,
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
u_user VARCHAR(300) ,
u_date TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
p_size_status BOOLEAN DEFAULT FALSE,
p_size_qty DECIMAL(30, 2),
p_size_stock DECIMAL(30, 2)
)
`;

const previous_stock = `
CREATE TABLE IF NOT EXISTS previous_stock(
id INT AUTO_INCREMENT PRIMARY KEY,
item_name VARCHAR(300) NOT NULL, 
item_id INT NOT NULL, 
unit_id INT NOT NULL, 
item_unit VARCHAR(300) NOT NULL, 
batch_no VARCHAR(300) NOT NULL, 
gr_no INT NOT NULL, 
issued_qty DECIMAL(30, 2) NOT NULL, 
invoice_no INT NOT NULL, 
c_user VARCHAR(300) NOT NULL
)
`;

export { stock_taking_model, previous_stock };

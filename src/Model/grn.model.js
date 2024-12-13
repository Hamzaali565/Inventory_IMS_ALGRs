const master_GRN_modal = `
CREATE TABLE IF NOT EXISTS grn_master (
grn_no INT AUTO_INCREMENT PRIMARY KEY,
grn_date VARCHAR(300) NOT NULL,
bill_no VARCHAR(300),
remarks VARCHAR(300),
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
u_date TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
u_user VARCHAR(300),
c_user VARCHAR(300) NOT NULL,
location VARCHAR(300) NOT NULL,
supplier_name VARCHAR(300) NOT NULL,
supplier_id INT NOT NULL,
location_id INT NOT NULL
)
`;

const GRN_modal = `
CREATE TABLE IF NOT EXISTS grn (
id INT AUTO_INCREMENT PRIMARY KEY,
grn_no INT NOT NULL,
item_id INT NOT NULL,
item_name VARCHAR(300) NOT NULL,
unit_id INT NOT NULL,
item_unit VARCHAR(300) NOT NULL,
t_qty DECIMAL(30, 2) NOT NULL,
r_qty DECIMAL(30, 2) NOT NULL, 
p_qty DECIMAL(30, 2) NOT NULL,
charges DECIMAL(30, 2) NOT NULL,
amount DECIMAL(30, 2) NOT NULL,
p_size_status BOOLEAN DEFAULT FALSE,
p_size_qty DECIMAL(30, 2),
po_no INT NOT NULL,
grn_completed BOOLEAN DEFAULT FALSE,
batch_no VARCHAR(300) NOT NULL,
b_qty DECIMAL(30, 2) DEFAULT 0,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) 
`;

export { master_GRN_modal, GRN_modal };

// release_qty DECIMAL(30, 2) DEFAULT 0,
// pending_qty DEIMCAL(30, 2) NOT NULL

// delete a column
// alter table po_child
// drop column location_id

const master_PO_modal = `
CREATE TABLE IF NOT EXISTS po_master (
po_no INT AUTO_INCREMENT PRIMARY KEY,
po_date VARCHAR(300) NOT NULL,
supplier_name VARCHAR(300) NOT NULL,
supplier_id INT NOT NULL,
po_completed BOOLEAN DEFAULT FALSE,
grn_transaction BOOLEAN DEFAULT FALSE,
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
u_user VARCHAR(300),
location VARCHAR(300) NOT NULL,
location_id INT NOT NULL,
u_data TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
)
`;

const child_PO_modal = `
CREATE TABLE IF NOT EXISTS po_child (
item_id INT NOT NULL,
item_name VARCHAR(300) NOT NULL,
po_no INT NOT NULL,
grn_status BOOLEAN DEFAULT FALSE,
qty DECIMAL(30, 2) NOT NULL,
charges DECIMAL(30, 2) NOT NULL,
amount DECIMAL(30, 2) NOT NULL
) 
`;

export { master_PO_modal, child_PO_modal };

// release_qty DECIMAL(30, 2) DEFAULT 0,
// pending_qty DEIMCAL(30, 2) NOT NULL

// delete a column
// alter table po_child
// drop column location_id

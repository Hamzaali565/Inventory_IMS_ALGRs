const createItem = `
CREATE TABLE IF NOT EXISTS items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(500) NOT NULL,
    unit_id INT NOT NULL,
    item_unit VARCHAR(200) NOT NULL,
    p_price DECIMAL(50, 2) NOT NULL,
    s_price DECIMAL(50, 2) NOT NULL,
    c_user VARCHAR(500) NOT NULL,
    c_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    u_user VARCHAR(500),
    u_at TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
)
`;

export { createItem };

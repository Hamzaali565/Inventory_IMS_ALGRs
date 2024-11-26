const supplier_model = `
CREATE TABLE IF NOT EXISTS suppliers (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(300) NOT NULL,
email VARCHAR(300),
phone VARCHAR(20) NOT NULL,
status BOOLEAN DEFAULT TRUE
)
`;
export { supplier_model };

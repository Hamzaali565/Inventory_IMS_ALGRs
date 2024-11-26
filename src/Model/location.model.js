const location_modal = `
CREATE TABLE IF NOT EXISTS location (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(300) NOT NULL,
c_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

export { location_modal };

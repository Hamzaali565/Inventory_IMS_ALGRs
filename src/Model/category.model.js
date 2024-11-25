const category_model = `CREATE TABLE IF NOT EXISTS category(
id INT AUTO_INCREMENT PRIMARY KEY,
category_name VARCHAR(255) NOT NULL,
c_user VARCHAR(300) NOT NULL
)`;

export { category_model };

const expense_model = `
CREATE TABLE IF NOT EXISTS other_expense (
id INT AUTO_INCREMENT PRIMARY KEY,
expenseType VARCHAR(300) NOT NULL,
remarks VARCHAR(300) NOT NULL,
amount DECIMAL(30, 2) NOT NULL,
c_user VARCHAR(300) NOT NULL,
c_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) 
`;

export { expense_model };

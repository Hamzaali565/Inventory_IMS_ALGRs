import mysql from "mysql";
import util from "util";
import * as dotenv from "dotenv";
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.log(`Database connection failed with error ${err}`);
    process.exit(1);
  }
  console.log("database connected !!!");
});

export const query = util.promisify(connection.query).bind(connection);

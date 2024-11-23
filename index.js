import { app } from "./src/app.js";
import { tablesSetup } from "./src/Database/database.tables.js";

const port = process.env.PORT || 3001;

tablesSetup()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`Database connection failed with error ${err}`);
  });

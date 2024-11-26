import inventoryRoutes from "../RoutesDetails/inventoryRoutes/items.routes.js";
import supplierRoutes from "../RoutesDetails/SupplierRoutes/supplier.routes.js";
import * as dotenv from "dotenv";
dotenv.config();

const routeSummary = (app) => {
  try {
    app.use(process.env.API_VERSION, inventoryRoutes);
    app.use(process.env.API_VERSION, supplierRoutes);
  } catch (error) {
    console.log("Error while summarizing routes");
  }
};

export { routeSummary };

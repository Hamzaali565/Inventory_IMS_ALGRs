import inventoryRoutes from "../RoutesDetails/inventoryRoutes/items.routes.js";
import supplierRoutes from "../RoutesDetails/SupplierRoutes/supplier.routes.js";
import poRoutes from "../RoutesDetails/PO_Routes/po.routes.js";
import salesRoutes from "../RoutesDetails/SalesRoutes/sales.routes.js";
import AuthRoutes from "../RoutesDetails/Auth_Routes/Auth.routes.js";
import loginCheck from "../RoutesDetails/LoginCheckRoutes/login_check_routes.js";
import * as dotenv from "dotenv";
import { auth_middleware } from "../../Middlewares/auth.middleware.js";
dotenv.config();

const routeSummary = (app) => {
  try {
    app.use(process.env.API_VERSION, AuthRoutes);
    app.use(process.env.API_VERSION, auth_middleware, loginCheck);
    app.use(process.env.API_VERSION, auth_middleware, inventoryRoutes);
    app.use(process.env.API_VERSION, auth_middleware, supplierRoutes);
    app.use(process.env.API_VERSION, auth_middleware, poRoutes);
    app.use(process.env.API_VERSION, auth_middleware, salesRoutes);
  } catch (error) {
    console.log("Error while summarizing routes");
  }
};

export { routeSummary };

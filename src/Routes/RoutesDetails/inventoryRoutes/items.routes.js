import { Router } from "express";
import { createItem } from "../../../Controllers/inventory/item.controller.js";

const router = Router();

router.route("/item").post(createItem);

export default router;

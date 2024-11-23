import { Router } from "express";
import { createItem } from "../../../Controllers/inventory/item.controller.js";
import { create_unit } from "../../../Controllers/inventory/unit.controller.js";

const router = Router();

router.route("/item").post(createItem);
router.route("/unit").post(create_unit);

export default router;

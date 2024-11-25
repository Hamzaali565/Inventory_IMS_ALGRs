import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const createItem = asyncHandler(async (req, res, next) => {
  try {
    const {
      item_name,
      unit_id,
      item_unit,
      p_price,
      s_price,
      c_user,
      category,
      category_id,
    } = req.body;
    console.log(req.body);

    if (
      ![item_name, unit_id, item_unit, p_price, s_price, c_user].every(Boolean)
    )
      throw new ApiError(400, "All parameters are required !!!");

    const response =
      await query(`INSERT INTO items ( item_name, unit_id, item_unit, p_price, s_price, c_user, category, category_id)
                   VALUES ('${item_name}', '${unit_id}', '${item_unit}', '${p_price}', '${s_price}', '${c_user}', '${category}', '${category_id}')       
        `);
    res
      .status(201)
      .json(
        new ApiResponse(200, { data: response }, "Item created successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log("error", error);
    throw new ApiError(400, "Something went wrong");
  }
});

export { createItem };

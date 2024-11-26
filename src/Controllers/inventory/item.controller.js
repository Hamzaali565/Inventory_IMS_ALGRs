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

    if (
      ![
        item_name,
        unit_id,
        item_unit,
        p_price,
        s_price,
        c_user,
        category,
        category_id,
      ].every(Boolean)
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

const retrieved_item = asyncHandler(async (req, res) => {
  try {
    const response = await query(`SELECT * FROM items`);
    if (response.length === 0) throw new ApiError(404, "No data found !!!");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: response },
          "Successfully retrieved data !!!"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "Internal server error !!!");
  }
});

const update_item = asyncHandler(async (req, res) => {
  try {
    const {
      item_id,
      item_name,
      unit_id,
      item_unit,
      p_price,
      s_price,
      category,
      category_id,
    } = req.body;
    console.log(req.body);

    if (
      ![
        item_id,
        item_name,
        unit_id,
        item_unit,
        p_price,
        s_price,
        category,
        category_id,
      ].every(Boolean)
    )
      throw new ApiError(400, "All Parameters are required !!!");
    const check_item = await query(`SELECT * FROM items WHERE item_id = ?`, [
      item_id,
    ]);
    if (check_item.length === 0) throw new ApiError(404, "Item not found");
    const response = await query(
      `
      UPDATE items 
      SET item_name = ?, unit_id = ?, item_unit = ?, p_price = ?, s_price = ?, category = ?, category_id = ?, u_user = ?
      WHERE item_id = ?`,
      [
        item_name,
        unit_id,
        item_unit,
        p_price,
        s_price,
        category,
        category_id,
        "hamza",
        item_id,
      ]
    );
    if (response.affectedRows === 0) throw new ApiError(404, "No data updated");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "Internal server error !!!");
  }
});

export { createItem, retrieved_item, update_item };

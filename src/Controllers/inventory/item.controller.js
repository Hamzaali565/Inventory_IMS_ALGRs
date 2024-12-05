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
      category,
      category_id,
      p_size_status,
      p_size_qty,
      p_price_per_size,
      s_price_per_size,
      scan_code,
    } = req.body;

    if (
      ![
        item_name,
        unit_id,
        item_unit,
        p_price,
        s_price,
        category,
        category_id,
        scan_code,
      ].every(Boolean)
    )
      throw new ApiError(400, "All parameters are required !!!");

    // const createMaster = await query(
    //   `INSERT INTO po_master (po_date, supplier_name, supplier_id, c_user, location, location_id)
    //      VALUES (?, ?, ?, ?, ?, ?)`,
    //   [po_date, supplier_name, supplier_id, req.user, location, location_id]
    // );

    const response = await query(
      `
      INSERT INTO items (item_name, unit_id, item_unit, p_price, s_price, c_user, category,
                   category_id, p_size_status, p_size_qty, p_price_per_size, s_price_per_size, scan_code)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item_name,
        unit_id,
        item_unit,
        p_price,
        s_price,
        req.user,
        category,
        category_id,
        p_size_status,
        p_size_qty,
        p_price_per_size,
        s_price_per_size,
        scan_code,
      ]
    );

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
      p_size_status,
      p_size_qty,
      p_price_per_size,
      s_price_per_size,
      scan_code,
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
        scan_code,
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
      SET item_name = ?, unit_id = ?, item_unit = ?, p_price = ?, s_price = ?, 
      category = ?, category_id = ?, u_user = ?,  p_size_status = ?, p_size_qty = ?,
      p_price_per_size = ?, s_price_per_size = ?, scan_code = ?
      WHERE item_id = ?`,
      [
        item_name,
        unit_id,
        item_unit,
        p_price,
        s_price,
        category,
        category_id,
        req.user,
        p_size_status,
        p_size_qty,
        p_price_per_size,
        s_price_per_size,
        scan_code,
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

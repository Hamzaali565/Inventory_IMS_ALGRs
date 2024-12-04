import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const get_item_to_sale = asyncHandler(async (req, res) => {
  try {
    const { scan_code } = req.query;
    console.log(scan_code);

    if (!scan_code) throw new ApiError("scan code is required !!!");
    const item_detail = await query(
      "SELECT * FROM items WHERE scan_code = ?",
      scan_code
    );

    if (item_detail?.length === 0)
      throw new ApiError(404, "Item not found !!!");
    console.log(item_detail);

    let stock_detail = await query(
      `SELECT SUM(p_size_stock) AS total_stock FROM stock WHERE item_id = ? AND batch_status = ?`,
      [item_detail[0]?.item_id, true]
    );
    console.log("stock_detail", stock_detail);

    if (stock_detail[0]?.total_stock === null) {
      stock_detail = item_detail.map((items) => ({
        ...items,
        batch_no: "LP",
      }));
      res.status(200).json(new ApiResponse(200, { data: stock_detail }));
      return;
    }
    stock_detail = item_detail.map((items) => ({
      ...items,
      total_stock: stock_detail[0]?.total_stock,
    }));
    console.log("stock_detail", stock_detail);

    res.status(200).json(new ApiResponse(200, { data: stock_detail }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "internal server error");
  }
});

export { get_item_to_sale };

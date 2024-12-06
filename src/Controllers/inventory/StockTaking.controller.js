import { query } from "../../Database/database.config.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { asyncHandler } from "../../Utils/asyncHandler.js";

const stock_upload = asyncHandler(async (req, res) => {
  let connection;
  try {
    const { data } = req.body;
    console.log(data);

    if (!data || !Array.isArray(data) || data.length === 0)
      throw new ApiError(
        400,
        "Data is required, data should be array, data should have length !!"
      );
    data.map((item, index) => {
      const {
        item_name,
        item_id,
        batch_no,
        batch_qty,
        input_type,
        location,
        location_id,
      } = item;
      if (
        ![
          item_name,
          item_id,
          batch_no,
          batch_qty,
          input_type,
          location,
          location_id,
        ].every(Boolean)
      )
        throw new ApiError(400, `Some Data missing at line no ${index + 1}`);
    });

    const values = data.flatMap((items) => [
      items.item_name,
      items.item_id,
      items.batch_qty,
      items.batch_no,
      items.input_type,
      req.user,
      items.location,
      items.location_id,
      items.p_size_status,
      items.p_size_qty,
      items.p_size_stock,
      items?.unit_id,
      items?.item_unit,
    ]);

    const placeholders = Array(data.length)
      .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)")
      .join(", ");

    const response = await query(
      `INSERT INTO stock (item_name, item_id, batch_qty, batch_no, input_type, c_user, location, location_id, p_size_status, p_size_qty, p_size_stock, unit_id, item_unit) 
       VALUES ${placeholders}`,
      values
    );

    await query("COMMIT");
    res.status(200).json(new ApiResponse(200, "Stock Uploaded to Location"));
  } catch (error) {
    if (connection) await query("ROLLBACK");
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "Internal server error !!!");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

const current_stock = asyncHandler(async (req, res) => {
  try {
    const response = await query(`SELECT * FROM stock WHERE batch_status = ?`, [
      true,
    ]);
    if (Array(response).length === 0)
      throw new ApiError(404, "No stock found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (Error instanceof ApiError) {
      throw error;
    }
    console.log("Error +", error);
    throw new ApiError(500, "Internal server error !!");
  }
});

const previous_stock = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate } = req?.query;
    if (!fromDate || !toDate) throw new ApiError("Both dates are required !!!");
    let f_date = moment(toDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"); // 2024-12-24 00:00:00
    let t_date = moment(fromDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");
    const response = await query(
      `SELECT * FROM previous_stock WHERE c_date >= ? AND c_date <= ?`,
      [f_date, t_date]
    );
    if (response.length === 0) throw new ApiError(404, "No Data Found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Internal server error !!!");
  }
});

export { stock_upload, current_stock, previous_stock };

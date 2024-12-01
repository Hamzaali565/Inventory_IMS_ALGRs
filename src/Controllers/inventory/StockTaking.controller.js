import { query } from "../../Database/database.config.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { asyncHandler } from "../../Utils/asyncHandler.js";

const stock_upload = asyncHandler(async (req, res) => {
  let connection;
  try {
    const { data } = req.body;

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
      "hamza",
      items.location,
      items.location_id,
      items.p_size_status,
      items.p_size_qty,
      items.p_size_stock,
    ]);

    const placeholders = Array(data.length)
      .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    const response = await query(
      `INSERT INTO stock (item_name, item_id, batch_qty, batch_no, input_type, c_user, location, location_id, p_size_status, p_size_qty, p_size_stock) 
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

export { stock_upload };

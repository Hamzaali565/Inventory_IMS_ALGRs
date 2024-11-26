import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const create_po = asyncHandler(async (req, res) => {
  try {
    const { po_date, supplier_name, supplier_id, data } = req.body;
    if (![po_date, supplier_name, supplier_id, data].every(Boolean))
      throw new ApiError(400, "All Parameters are required !!!");
    console.log(req.body);

    if (!data || !Array.isArray(data) || !Array(data.length === 0))
      throw new ApiError(
        400,
        "Data is a required field, data should be JSON, with atleast one index !!!!"
      );
    data.map((item, index) => {
      const {
        item_id,
        item_name,
        qty,
        charges,
        amount,
        location,
        location_id,
      } = item;
      if (
        ![
          item_id,
          item_name,
          qty,
          charges,
          amount,
          location,
          location_id,
        ].every(Boolean)
      )
        throw new ApiError(400, `some data missing at line ${index + 1}`);
    });
    const createMaster = await query(
      `INSERT INTO po_master (po_date, supplier_name, supplier_id, c_user)
         VALUES (?, ?, ?, ?)`,
      [po_date, supplier_name, supplier_id, "Hamza"]
    );

    console.log("createMaster", createMaster);

    const insertedData = await query(
      `SELECT * FROM po_master WHERE po_no = ?`,
      [createMaster?.insertId]
    );

    let fomattedData = data.map((items) => ({
      ...items,
      po_no: insertedData[0]?.po_no,
    }));
    console.log("fomattedData", fomattedData);

    const values = fomattedData.flatMap((items) => [
      items.po_no,
      items.item_name,
      items.item_id,
      items.qty,
      items.charges,
      items.amount,
      items.location,
      items.location_id,
    ]);

    const placeholders = Array(data.length)
      .fill("(?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    const create_child_po = await query(
      `INSERT INTO po_child (po_no, item_name, item_id, qty, charges, amount, location, location_id) VALUES ${placeholders}`,
      values
    );
    res.status(200).json(new ApiResponse(200, "PO created successfully !!!"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "Internal server error !!!");
  }
});

export { create_po };

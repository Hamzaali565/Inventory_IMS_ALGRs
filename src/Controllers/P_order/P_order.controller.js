import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const create_po = asyncHandler(async (req, res) => {
  try {
    const { po_date, supplier_name, supplier_id, data, location, location_id } =
      req.body;
    console.log(req.body);
    if (
      ![po_date, supplier_name, supplier_id, data, location, location_id].every(
        Boolean
      )
    )
      throw new ApiError(400, "All Parameters are required !!!");

    if (!data || !Array.isArray(data) || !Array(data.length === 0))
      throw new ApiError(
        400,
        "Data is a required field, data should be JSON, with atleast one index !!!!"
      );
    data.map((item, index) => {
      const { item_id, item_name, qty, charges, amount } = item;
      if (![item_id, item_name, qty, charges, amount].every(Boolean))
        throw new ApiError(400, `some data missing at line ${index + 1}`);
    });
    const createMaster = await query(
      `INSERT INTO po_master (po_date, supplier_name, supplier_id, c_user, location, location_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
      [po_date, supplier_name, supplier_id, "Hamza", location, location_id]
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
    ]);

    const placeholders = Array(data.length)
      .fill("(?, ?, ?, ?, ?, ?)")
      .join(", ");

    const create_child_po = await query(
      `INSERT INTO po_child (po_no, item_name, item_id, qty, charges, amount) VALUES ${placeholders}`,
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

const retrieved_summary = asyncHandler(async (req, res) => {
  try {
    const response = await query(
      `SELECT po_no, supplier_name, c_date FROM po_master`
    );
    if (!Array(response === 0)) throw new ApiError(404, "No Data Found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "Internal server error !!!");
  }
});

const retrieved_detail = asyncHandler(async (req, res, next) => {
  try {
    const { po_no } = req.query;
    if (!po_no)
      throw new ApiError(400, "PO No. is required to proceed this query !!!");
    const po_master = new Promise(async (resolve, reject) => {
      try {
        const response = await query(
          `SELECT * FROM po_master WHERE po_no = ?`,
          [po_no]
        );
        if (response.length !== 0) {
          resolve(response);
        } else {
          reject("No Data found");
        }
      } catch (error) {
        reject(error); // Reject with the error from the query
      }
    });

    const po_child = new Promise(async (resolve, reject) => {
      try {
        const response = await query(`SELECT * FROM po_child WHERE po_no = ?`, [
          po_no,
        ]);
        if (response.length !== 0) {
          resolve(response);
        } else {
          reject("No Data found");
        }
      } catch (error) {
        reject(error); // Reject with the error from the query
      }
    });

    Promise.all([po_master, po_child])
      .then(([po_master, po_child]) => {
        res
          .status(200)
          .json(new ApiResponse(200, { data: { po_master, po_child } }));
      })
      .catch((error) => {
        // throw new ApiError(400, error);
        // console.log(error);
        next(new ApiError(400, error));
      });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server error !!!");
  }
});

export { create_po, retrieved_summary, retrieved_detail };

import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const create_po = asyncHandler(async (req, res) => {
  try {
    const { po_date, supplier_name, supplier_id, data, location, location_id } =
      req.body;
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

    const insertedData = await query(
      `SELECT * FROM po_master WHERE po_no = ?`,
      [createMaster?.insertId]
    );

    let fomattedData = data.map((items) => ({
      ...items,
      po_no: insertedData[0]?.po_no,
    }));

    const values = fomattedData.flatMap((items) => [
      items?.po_no,
      items?.item_name,
      items?.item_id,
      items?.qty,
      items?.charges,
      items?.amount,
      items?.p_size_status,
      items?.p_size_qty,
      items?.item_unit,
      items?.unit_id,
    ]);

    const placeholders = Array(data.length)
      .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    const create_child_po = await query(
      `INSERT INTO po_child (po_no, item_name, item_id, qty, charges, amount, p_size_status, p_size_qty, item_unit, unit_id) VALUES ${placeholders}`,
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

const update_po = asyncHandler(async (req, res, next) => {
  try {
    const {
      po_no,
      po_date,
      supplier_name,
      supplier_id,
      data,
      location,
      location_id,
    } = req.body;
    if (
      ![
        po_no,
        po_date,
        supplier_name,
        supplier_id,
        data,
        location,
        location_id,
      ].every(Boolean)
    )
      throw new ApiError(400, "All parameters are required !!!");
    if (!data || !Array.isArray(data) || !Array(data.length === 0))
      throw new ApiError(
        400,
        "Data is required field, it should be array and it should not be empty !!!"
      );

    data.map((item, index) => {
      const { item_id, item_name, qty, charges, amount } = item;
      if (![item_id, item_name, qty, charges, amount].every(Boolean))
        throw new ApiError(400, `some data missing at line ${index + 1}`);
    });

    const check_transaction = await query(
      `SELECT grn_transaction FROM po_master WHERE po_no = ?`,
      [po_no]
    );
    if (check_transaction[0].grn_transaction === 1)
      throw new ApiError(
        400,
        "GRN transaction is proceed on this purchase order, unable to update.!!!"
      );

    const deletedrows = await query(`DELETE FROM po_child WHERE po_no = ?`, [
      po_no,
    ]);
    console.log(deletedrows);
    if (deletedrows.affectedRows === 0)
      throw new ApiError(
        400,
        "Unable to delete previous Data, please try later"
      );

    const update_po_master = new Promise(async (resolve, reject) => {
      try {
        await query(
          `
            UPDATE po_master
            set po_date = ?, supplier_name = ?, supplier_id = ?, location = ?, location_id = ?, u_user = ?
            WHERE po_no = ?
            `,
          [
            po_date,
            supplier_name,
            supplier_id,
            location,
            location_id,
            "Hamza",
            po_no,
          ]
        );

        resolve("PO Master updated");
      } catch (error) {
        reject(error);
      }
    });

    const update_po_child = new Promise(async (resolve, reject) => {
      try {
        let formattedData = data.map((items) => ({
          ...items,
          po_no,
        }));
        formattedData = formattedData.flatMap((items) => [
          items.po_no,
          items.item_name,
          items.item_id,
          items.qty,
          items.charges,
          items.amount,
          items?.p_size_status,
          items?.p_size_qty,
          items?.item_unit,
          items?.unit_id,
        ]);

        const placeholders = Array(data.length)
          .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .join(", ");

        await query(
          `INSERT INTO po_child (po_no, item_name, item_id, qty, charges, amount, p_size_status, p_size_qty, item_unit, unit_id) VALUES ${placeholders}`,
          formattedData
        );
        resolve("PO_ child Updated !!!");
      } catch (error) {
        reject(error);
      }
    });

    Promise.all([update_po_master, update_po_child])
      .then(() => {
        res
          .status(200)
          .json(new ApiResponse(200, "PO Updated Successfully !!!"));
      })
      .catch((error) => {
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

const sorted_po = asyncHandler(async (req, res) => {
  try {
    const { po_no } = req.query;
    if (!po_no) throw new ApiError(400, "po_no is required !!!");
    const get_authentic_po = await query(
      `SELECT * FROM po_master WHERE po_no = ? AND po_completed = ?`,
      [po_no, false]
    );

    if (get_authentic_po.length === 0)
      throw new ApiError(400, "All items are released !!!");
    const grn_transaction_check = await query(
      `SELECT * FROM grn WHERE po_no = ? ORDER BY grn_no DESC`,
      [po_no]
    );
    console.log("get_authentic_po", grn_transaction_check);
    if (grn_transaction_check.length === 0) {
      const po_child = await query(`SELECT * FROM po_child WHERE po_no = ?`, [
        po_no,
      ]);
      res.status(200).json(new ApiResponse(200, { data: po_child }));
      return;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "internal server error");
  }
});

const po_to_grn = asyncHandler(async (req, res) => {
  try {
    const response = await query(
      `SELECT po_no, supplier_name, c_date FROM po_master WHERE po_completed = ?`,
      [false]
    );
    if (response.length === 0) throw new ApiError(404, "No data found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server error !!!");
  }
});

export {
  create_po,
  retrieved_summary,
  retrieved_detail,
  update_po,
  po_to_grn,
  sorted_po,
};

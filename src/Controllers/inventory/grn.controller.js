import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { ApiError } from "../../Utils/ApiError.js";
import { query } from "../../Database/database.config.js";

const create_grn = asyncHandler(async (req, res, next) => {
  let connection;
  try {
    const {
      grn_date,
      bill_no,
      remarks,
      po_no,
      location,
      supplier_name,
      supplier_id,
      location_id,
      grnDetails,
    } = req.body;
    let data = grnDetails;
    console.log("data", data);

    if (!po_no || !grn_date)
      throw new ApiError(400, "All parameters are required !!!");

    if (!data || !Array.isArray(data) || data.length === 0)
      throw new ApiError(
        400,
        "Data is a required field, data should be array, data should contain atleast one object !!!"
      );

    console.log(data);

    const find_remaining = await query(
      `SELECT *, (qty - release_qty) AS remaining_qty FROM po_child WHERE po_no = ?`,
      [po_no]
    );
    console.log("Original find_remaining:", find_remaining);
    const check_grn_completion = find_remaining.every(
      (findRem) => findRem.remaining_qty === 0
    );
    // Filter `find_remaining` based on `item_id` availability in `data`
    if (!check_grn_completion) {
      const filtered_remaining = find_remaining.filter((remainingItem) =>
        data.some((dataItem) => dataItem.item_id === remainingItem.item_id)
      );
      console.log("Filtered Remaining Data:", filtered_remaining);
      data.forEach((dataItem) => {
        const matchingRemaining = find_remaining.find(
          (remainingItem) => remainingItem.item_id === dataItem.item_id
        );
        if (!matchingRemaining) {
          throw new Error(
            `Item ID ${dataItem.item_id} not found in remaining stock!`
          );
        }

        // Check if r_qty exceeds remaining_qty
        if (dataItem.r_qty > matchingRemaining.remaining_qty) {
          throw new Error(
            `Received quantity (r_qty: ${dataItem.r_qty}) exceeds remaining quantity (remaining_qty: ${matchingRemaining.remaining_qty}) for item ID: ${dataItem.item_id}.`
          );
        }
      });

      console.log("All quantities are valid.");
    } else {
      throw new ApiError(400, "This transaction is completed !!!");
    }

    data.map((items, index) => {
      const {
        item_id,
        item_name,
        unit_id,
        item_unit,
        t_qty,
        r_qty,
        charges,
        amount,
        p_size_status,
        p_size_qty,
        po_no,
        batch_no,
        batch_qty,
        p_size_stock,
      } = items;

      if (
        ![
          item_id,
          item_name,
          unit_id,
          item_unit,
          t_qty,
          r_qty,
          charges,
          amount,
          po_no,
          batch_no,
          batch_qty,
        ].every(Boolean)
      )
        throw new ApiError(400, `Sone data miss at line no ${index + 1}`);
    });
    let master_grn = await query(
      `INSERT INTO grn_master(grn_date, bill_no, remarks, c_user, location, location_id, supplier_name, supplier_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        grn_date,
        bill_no,
        remarks,
        "Hamza",
        location,
        location_id,
        supplier_name,
        supplier_id,
      ]
    );
    let grn_no = master_grn.insertId;

    let dataRes = data.map((items) => ({
      ...items,
      grn_no,
      location,
      location_id,
    }));

    const values = dataRes.flatMap((items) => [
      items?.grn_no,
      items?.item_id,
      items?.item_name,
      items?.unit_id,
      items?.item_unit,
      items?.t_qty,
      items?.r_qty,
      items?.p_qty,
      items?.charges,
      items?.amount,
      items?.p_size_status,
      items?.p_size_qty,
      items?.po_no,
      items?.batch_no,
    ]);
    const placeholders = Array(dataRes.length)
      .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    // get po_child of grn_status false an push in authentic_po

    const grn_child = new Promise(async (resolve, reject) => {
      try {
        await query(
          `INSERT INTO grn (grn_no, item_id, item_name, unit_id, item_unit, t_qty,
        r_qty, p_qty, charges, amount, p_size_status, p_size_qty, po_no, batch_no) 
        VALUES ${placeholders}`,
          values
        );
        resolve("Response Created");
      } catch (error) {
        reject(error);
      }
    });

    const stock_values = dataRes.flatMap((items) => [
      items.item_name,
      items.item_id,
      items.batch_qty,
      items.batch_no,
      "Good Recipt Note",
      "hamza",
      items.location,
      items.location_id,
      items.p_size_status,
      items.p_size_qty,
      items.p_size_stock,
      items.item_unit,
      items.unit_id,
      grn_no,
    ]);

    const stock_placeholder = Array(dataRes.length)
      .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    const update_stock = new Promise(async (resolve, reject) => {
      try {
        await query(
          `INSERT INTO stock (item_name, item_id, batch_qty, batch_no, input_type,
               c_user, location, location_id, p_size_status, p_size_qty, p_size_stock,
               item_unit, unit_id, grn_no)
               VALUES ${stock_placeholder}`,
          stock_values
        );
        resolve("Stock added successfully !!!");
      } catch (error) {
        reject("Insert stock failed", error);
      }
    });

    const update_grn_status = async () => {
      try {
        const promises = dataRes.map((items) =>
          query(
            `UPDATE po_child SET grn_status = ?, release_qty = release_qty + ? WHERE item_id = ? AND po_no = ?`,
            [true, items?.r_qty, items?.item_id, po_no]
          )
        );
        await Promise.all(promises);
        return "GRN COMPLETED !!!";
      } catch (error) {
        throw new Error("Failed to update GRN status: " + error.message);
      }
    };

    Promise.all([grn_child, update_stock, update_grn_status()]);

    // const find_complete_po = await query(
    //   `SELECT * FROM po_child
    //    WHERE po_no = ?
    //      AND release_qty = qty`,
    //   [po_no]
    // );

    let find_complete_po = await query(
      `SELECT * FROM po_child
       WHERE po_no = ? `,
      [po_no]
    );
    find_complete_po = find_complete_po.every(
      (items) => items?.release_qty === items?.qty
    );
    console.log("find_complete_po", find_complete_po);

    const updateGrnCompleted = async () => {
      if (find_complete_po) {
        await query(`UPDATE grn SET grn_completed = ? WHERE po_no = ?`, [
          true,
          po_no,
        ]);
        return "GRN Completed";
      }
      return "GRN not completed yet";
    };

    const updatePoCompleted = async () => {
      if (find_complete_po) {
        await query(
          `UPDATE po_master SET po_completed = ?, grn_transaction = ? WHERE po_no = ?`,
          [true, true, po_no]
        );
        return "PO Completed";
      } else {
        await query(
          `UPDATE po_master SET grn_transaction = ? WHERE po_no = ?`,
          [true, po_no]
        );
        return "GRN Transaction set to true";
      }
    };

    const createSupplierLedger = async () => {
      const find_last_grn = await query(
        `SELECT * FROM grn 
       WHERE po_no = ? 
         AND grn_no = (SELECT MAX(grn_no) FROM grn WHERE po_no = ?)`,
        [po_no, po_no]
      );

      const payable = find_last_grn.reduce(
        (sum, item) => sum + (item?.amount || 0),
        0
      );

      await query(
        `INSERT INTO supplier_ledger (grn_no, supplier_name, supplier_id, payable, c_user) VALUES (?, ?, ?, ?, ?)`,
        [grn_no, supplier_name, supplier_id, payable, "hamza"]
      );
      return "Supplier Ledger Created";
    };

    await Promise.all([
      updateGrnCompleted(),
      updatePoCompleted(),
      createSupplierLedger(),
    ])
      .then(() => {
        console.log("update completed");
        res
          .status(200)
          .json(new ApiResponse(200, { data: "Data saved Successfully" }));
      })
      .catch((error) => {
        console.log("update failed");
        next(new ApiError(400, error));
      });
  } catch (error) {
    await query("ROLLBACK");
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

export { create_grn };

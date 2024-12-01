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
      data,
    } = req.body;
    if (!po_no || grn_date)
      throw new ApiError(400, "All parameters are required !!!");
    const find_last_entery = await query(
      `SELECT * from grn WHERE po_no = ? ORDER BY grn_no DESC`,
      [po_no]
    );
    console.log(find_last_entery);
    if (find_last_entery.length === 0) {
      if (!data || !Array.isArray(data) || data.length === 0)
        throw new ApiError(
          400,
          "Data is a required field, data should be array, data should contain atleast one object !!!"
        );
      data.map((items, index) => {
        const {
          item_id,
          item_name,
          unit_id,
          item_unit,
          t_qty,
          r_qty,
          p_qty,
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
            p_qty,
            charges,
            amount,
            p_size_status,
            p_size_qty,
            po_no,
            batch_no,
            batch_qty,
            p_size_stock,
          ].every(Boolean)
        )
          throw new ApiError(400, `Sone data miss at line no ${index + 1}`);
      });
      let master_grn = await query(
        `INSERT INTO grn_master(grn_date, bill_no, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          grn_date,
          bill_no,
          remarks,
          "Hamza",
          location,
          supplier_name,
          supplier_id,
          location_id,
        ]
      );

      let grn_no = master_grn[0]?.grn_no;

      data = data.map((items) => ({
        ...items,
        grn_no,
        location: items?.location,
        location_id: items?.location_id,
      }));

      console.log("formatted Data", data);

      const values = data.flatMap((items) => [
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
      const placeholders = Array(data.length)
        .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");

      const grn_child = new Promise(async (resolve, reject) => {
        try {
          await query(
            `INSERT INTO grn (item_id, item_name, unit_id, item_unit, t_qty,
        r_qty, p_qty, charges, amount, p_size_status, p_size_qty, po_no, batch_no) 
        VALUES ${placeholders}`,
            values
          );
          resolve("Response Created");
        } catch (error) {
          reject(error);
        }
      });

      let check_all_qty = data?.every((items) => items?.t_qty === items?.r_qty);

      const update_grn_completed = new Promise(async (resolve, reject) => {
        if (check_all_qty === true) {
          await query(`SET grn UPDATE grn_completed = ? where po_no = ?`, [
            true,
            po_no,
          ]);
          resolve("Grn Completed");
        } else if (check_all_qty === false) {
          resolve("GRN is not completed yet !!!");
        }
        try {
        } catch (error) {
          reject("Update grn_completed failed");
        }
      });

      const update_po_completed = new Promise(async (resolve, reject) => {
        if (check_all_qty === true) {
          await query(
            `SET po_master UPDATE po_completed = ?, grn_transaction = ? where po_no = ?`,
            [true, true, po_no]
          );
          resolve("po Completed");
        } else if (check_all_qty === false) {
          await query(`UPDATE po_master SET grn_transaction = ? WHERE po_no`, [
            true,
            po_no,
          ]);
          resolve("Grn Tansaction set to true !!!");
        }
        try {
        } catch (error) {
          reject("Update po_completed failed");
        }
      });

      const stock_values = data.flatMap((items) => [
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

      const stock_placeholder = Array(data.length)
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
          reject("Insert stock failed");
        }
      });

      Promise.all([
        grn_child,
        update_grn_completed,
        update_po_completed,
        update_stock,
      ])
        .then(async () => {
          await query("COMMIT");
          res
            .status(200)
            .json(new ApiResponse(200, { data: "Data saved Successfully" }));
        })
        .catch((error) => {
          next(new ApiError(400, error));
        });
    }
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

export { create_grn };

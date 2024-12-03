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
    let find_last_entery = await query(
      `SELECT * FROM grn 
       WHERE po_no = ? 
         AND grn_no = (SELECT MAX(grn_no) FROM grn WHERE po_no = ?)`,
      [po_no, po_no]
    );
    let AuthenticData = [];
    if (find_last_entery.length !== 0) {
      find_last_entery = find_last_entery.filter(
        (items) => !(items?.t_qty === items?.r_qty)
      );
      console.log("find_last_entery", find_last_entery);

      find_last_entery.forEach((items) => {
        let find_current_pendings = data.find(
          (IRQ) => IRQ?.id === items?.id && IRQ?.r_qty > items?.p_qty
        );
        console.log("find_current_pendings", find_current_pendings);

        if (find_current_pendings)
          throw new ApiError(
            400,
            `Recieved quantity is greater than pending quantity at line !!!`
          );
        let findData = data?.find((DataObj) => DataObj?.id === items?.id);
        console.log("findData", findData);

        if (findData) {
          // let iPush = [];
          findData.p_qty = findData?.p_qty - findData?.r_qty;
          AuthenticData.push(findData);

          console.log("AuthenticData", AuthenticData);
        } else {
          throw new ApiError(
            400,
            "This Transaction is completed Or this is transactional PO kindly refresh page and try!!!"
          );
        }
      });
    }

    if (find_last_entery.length !== 0) {
      console.log("find_last_entery lol");
      data = AuthenticData.map(({ id, grn_no, ...rest }) => rest);
      console.log("new data", data);
    }

    if (!data || !Array.isArray(data) || data.length === 0)
      throw new ApiError(
        400,
        "Data is a required field, data should be array, data should contain atleast one object !!!"
      );

    console.log(data);

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

    console.log("formatted Data", dataRes);

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

    console.log("I am DataRes 😎", dataRes);

    // let check_all_qty = dataRes?.every(
    //   (items) => items?.t_qty === items?.r_qty
    // );

    // console.log("check complete is :", check_all_qty);

    // const update_grn_completed = new Promise(async (resolve, reject) => {
    //   try {
    //     if (check_all_qty === true) {
    //       console.log("i am grn completed");

    //       await query(`SET grn UPDATE grn_completed = ? where po_no = ?`, [
    //         true,
    //         po_no,
    //       ]);
    //       resolve("Grn Completed");
    //     } else if (check_all_qty === false) {
    //       resolve("GRN is not completed yet !!!");
    //       console.log("i am not grn completed");
    //     }
    //   } catch (error) {
    //     console.log("i am not rejected");
    //     reject("Update grn_completed failed", error);
    //   }
    // });

    // const update_po_completed = new Promise(async (resolve, reject) => {
    //   if (check_all_qty === true) {
    //     console.log(" update po_completed");
    //     await query(
    //       `SET po_master UPDATE po_completed = ?, grn_transaction = ? WHERE po_no = ?`,
    //       [true, true, po_no]
    //     );
    //     resolve("po Completed");
    //   } else if (check_all_qty === false) {
    //     await query(
    //       `UPDATE po_master SET grn_transaction = ? WHERE po_no = ?`,
    //       [true, po_no]
    //     );
    //     console.log("i was here");
    //     resolve("Grn Tansaction set to true !!!");
    //   }
    //   try {
    //   } catch (error) {
    //     reject("Update po_completed failed", error);
    //   }
    // });

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

    Promise.all([grn_child, update_stock]);

    const find_last_grn = await query(
      `SELECT * FROM grn 
       WHERE po_no = ? 
         AND grn_no = (SELECT MAX(grn_no) FROM grn WHERE po_no = ?)`,
      [po_no, po_no]
    );

    let check_all_qty = find_last_grn?.every((items) => items?.p_qty === 0);

    const updateGrnCompleted = async () => {
      if (check_all_qty) {
        await query(`UPDATE grn SET grn_completed = ? WHERE po_no = ?`, [
          true,
          po_no,
        ]);
        return "GRN Completed";
      }
      return "GRN not completed yet";
    };

    const updatePoCompleted = async () => {
      if (check_all_qty) {
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
      const payable = find_last_grn.reduce(
        (sum, item) => sum + (item?.amount || 0),
        0
      );

      await query(
        `INSERT INTO supplier_ledger (grn_no, supplier_name, supplier_id, payable) VALUES (?, ?, ?, ?)`,
        [grn_no, supplier_name, supplier_id, payable]
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

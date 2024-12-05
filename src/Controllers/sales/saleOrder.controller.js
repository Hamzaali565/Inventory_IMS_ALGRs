import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const get_item_to_sale = asyncHandler(async (req, res) => {
  try {
    const { scan_code } = req.query;

    if (!scan_code) throw new ApiError("scan code is required !!!");
    const item_detail = await query(
      "SELECT * FROM items WHERE scan_code = ?",
      scan_code
    );

    if (item_detail?.length === 0)
      throw new ApiError(404, "Item not found !!!");

    let stock_detail = await query(
      `SELECT SUM(p_size_stock) AS total_stock FROM stock WHERE item_id = ? AND batch_status = ?`,
      [item_detail[0]?.item_id, true]
    );

    if (stock_detail[0]?.total_stock === null) {
      stock_detail = item_detail.map((items) => ({
        ...items,
        batch_no: "Loc_P",
      }));
      res.status(200).json(new ApiResponse(200, { data: stock_detail }));
      return;
    }
    stock_detail = item_detail.map((items) => ({
      ...items,
      total_stock: stock_detail[0]?.total_stock,
    }));

    res.status(200).json(new ApiResponse(200, { data: stock_detail }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "internal server error");
  }
});

const create_sale_order = asyncHandler(async (req, res, next) => {
  try {
    const { data, totalPrice, totalPurchase } = req.body;
    if (![data, totalPrice, totalPurchase].every(Boolean))
      throw new ApiError(400, "All parameters are required !!!");
    if (!Array.isArray(data) || data.length === 0)
      throw new ApiError(
        404,
        "Data should be array with atleast one row/index !!!"
      );

    let lp_items = data.filter((items) => items.batch_no === "Loc_P");
    console.log("lp_items", lp_items);

    let dataRecieveFromUser = data.filter(
      (items) => items?.batch_no !== "Loc_P"
    );
    console.log("dataRecieveFromUser", dataRecieveFromUser);

    let itemIds = data.map((items) => items?.item_id);

    let placeholders = itemIds.map(() => "?").join(",");

    const dataBase = await query(
      `SELECT * FROM stock WHERE item_id IN (${placeholders}) AND batch_status = ?`,
      [...itemIds, true]
    );
    // console.log(dataBase);

    const updateStock = (dataBase, dataRecieveFromUser) => {
      let updatedDataBase = [...dataBase]; // Clone the dataBase array
      let originalStockData = []; // To keep track of the original stock before modification

      // Save the original stock data before reducing
      updatedDataBase.forEach((dbItem) => {
        originalStockData.push({
          item_id: dbItem.item_id,
          batch_no: dbItem.batch_no,
          p_size_stock: dbItem.p_size_stock, // Store original stock
        });
      });

      // Validate if the requested d_qty exceeds total available stock
      dataRecieveFromUser.forEach((userItem) => {
        let totalStockAvailable = updatedDataBase
          .filter((dbItem) => dbItem.item_id === userItem.item_id)
          .reduce((acc, dbItem) => acc + dbItem.p_size_stock, 0);

        if (userItem.d_qty > totalStockAvailable) {
          throw new Error(
            `Cannot reduce ${userItem.d_qty} items. Only ${totalStockAvailable} items are available.`
          );
        }
      });

      // Iterate over each item in dataRecieveFromUser to reduce stock
      dataRecieveFromUser.forEach((userItem) => {
        let remainingStockToReduce = userItem.d_qty; // Use d_qty instead of p_size_stock

        // Iterate over dataBase and reduce stock, irrespective of batch_no
        updatedDataBase = updatedDataBase.map((dbItem) => {
          if (
            dbItem.item_id === userItem.item_id &&
            remainingStockToReduce > 0
          ) {
            // If the batch has enough stock to reduce
            if (remainingStockToReduce >= dbItem.p_size_stock) {
              remainingStockToReduce -= dbItem.p_size_stock;
              dbItem.p_size_stock = 0; // All stock from this batch is reduced
            } else {
              // If the batch has less stock than needed to reduce, reduce it partially
              dbItem.p_size_stock -= remainingStockToReduce;
              remainingStockToReduce = 0; // No more stock needs to be reduced
            }
          }
          return dbItem;
        });
      });

      // After updating the stock, calculate the issued_qty
      updatedDataBase = updatedDataBase.map((dbItem) => {
        // Find the corresponding original stock data
        const originalItem = originalStockData.find(
          (item) =>
            item.item_id === dbItem.item_id && item.batch_no === dbItem.batch_no
        );

        // If original stock data is found, calculate the issued_qty
        if (originalItem) {
          const issuedQty = originalItem.p_size_stock - dbItem.p_size_stock;
          return { ...dbItem, issued_qty: issuedQty }; // Add the issued_qty dynamically
        }
        return dbItem;
      });

      // Filter affected batches (issued_qty > 0)
      const affectedBatches = updatedDataBase.filter(
        (dbItem) => dbItem.issued_qty > 0
      );

      return affectedBatches;
    };

    const updatedDataBase = updateStock(dataBase, dataRecieveFromUser);

    console.log("updatedDataBase", updatedDataBase);

    if (updatedDataBase.length !== 0) {
      const update_stock_table = async () => {
        try {
          const promises = updatedDataBase.map((items) =>
            query(
              `UPDATE stock SET p_size_stock = p_size_stock - ? WHERE id = ?`,
              [items?.issued_qty, items?.id]
            )
          );
          await Promise.all(promises);
          return "STOCK UPDATED COMPLETED !!!";
        } catch (error) {
          throw new Error("Failed to update stock table: " + error.message);
        }
      };
      await update_stock_table().catch((error) => {
        throw new ApiError(400, "Internal server error !!!");
      });

      // master
      let create_invoice = await query(
        `INSERT INTO invoice_master(c_user, total_charges, total_expense) VALUES (?, ?, ?)`,
        ["Hamza", totalPrice, totalPurchase]
      );

      let invoice_no = create_invoice?.insertId;
      console.log("invoice_no", invoice_no);

      const values = updatedDataBase.flatMap((items) => [
        items?.item_name,
        items?.item_id,
        items?.grn_no,
        items?.unit_id,
        items?.item_unit,
        items?.batch_no,
        items?.po_no,
        items?.issued_qty,
        invoice_no,
        "Hamza",
      ]);
      const placeholders = Array(dataRes.length)
        .fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");

      // get po_child of grn_status false an push in authentic_po

      const invoice_child = async () => {
        try {
          await query(
            `INSERT INTO invoice_child (item_name, item_id, grn_no, unit_id, item_unit, batch_no, po_no, issued_qty, invoice_no, c_user) 
          VALUES ${placeholders}`,
            values
          );
          return "Invoice Child Created";
        } catch (error) {
          throw new Error("Failed to create invoice master !!!!", error);
        }
      };

      const values_of_LP = lp_items.flatMap((items) => [
        items?.item_name,
        items?.item_id,
        items?.unit_id,
        items?.item_unit,
        items?.d_qty,
        invoice_no,
        "Hamza",
      ]);
      const placeholders_of_local_purchasing = Array(dataRes.length)
        .fill("(?, ?, ?, ?, ?, ?, ?)")
        .join(", ");

      const local_purchases = async () => {
        try {
          await query(
            `INSERT INTO local_purchasing (item_name, item_id, unit_id, item_unit, d_qty, invoice_no, c_user) 
          VALUES ${placeholders_of_local_purchasing}`,
            values_of_LP
          );
          return "Response Created";
        } catch (error) {
          throw new Error("Local purchasing failed", error);
        }
      };

      const update_stock_batch_status = async () => {
        try {
          const promises = updatedDataBase.map((items) =>
            query(
              `UPDATE stock SET batch_status = ? WHERE item_id = ? AND p_size_qty = ?`,
              [false, items?.id, 0]
            )
          );
          await Promise.all(promises);
          console.log("promises", promises);
          return "batch status !!!";
        } catch (error) {
          throw new Error("Failed to update GRN status: " + error.message);
        }
      };

      await Promise.all([
        invoice_child(),
        local_purchases(),
        update_stock_batch_status(),
      ]).catch((error) => {
        throw new Error("error of last promise", error);
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "Internal server error !!!");
  }
});

export { get_item_to_sale, create_sale_order };

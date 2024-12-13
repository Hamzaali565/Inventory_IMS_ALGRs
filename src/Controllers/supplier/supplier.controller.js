import moment from "moment";
import { query } from "../../Database/database.config.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { asyncHandler } from "../../Utils/asyncHandler.js";

const create_supplier = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    if (![name, phone].every(Boolean))
      throw new ApiError(400, "All parameters are required !!!");
    const response = await query(
      `INSERT INTO suppliers (name, email, phone, status) VALUES ('${name}', '${email}', '${phone}', '${
        status || 0
      }')`
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Supplier added successfully !!!"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server error !!!");
  }
});

const retrieved_supplier = asyncHandler(async (req, res) => {
  try {
    const response = await query(`SELECT * FROM suppliers`);
    if (response.length === 0) throw new ApiError(404, "Data not found !!!");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: response },
          "Supplier retrieved successfully !!!"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server error !!!");
  }
});

const update_supplier = asyncHandler(async (req, res) => {
  try {
    const { id, name, email, phone, status } = req.body;
    console.log(req.body);

    if (!id)
      throw new ApiError(400, "Id is required to proceed this query !!!");
    const supplier_check = await query(`SELECT * FROM suppliers WHERE id = ?`, [
      id,
    ]);
    if (supplier_check.length === 0)
      throw new ApiError(404, "Supplier not found !!!");
    const response = await query(
      `UPDATE suppliers SET name = ?, email = ?, phone = ?, status = ? WHERE id = ?`,
      [
        name || supplier_check[0].name,
        email || supplier_check[0].email,
        phone || supplier_check[0].phone,
        status || false,
        id,
      ]
    );
    if (response.affectedRows === 0)
      throw new ApiError(400, "Data update failed !!!");
    res.status(200).json(new ApiResponse(200, "Data updated Successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server error !!!");
  }
});

const supplier_ledger = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate } = req?.query;
    console.log("req?.query", req.query);

    if (!fromDate || !toDate)
      throw new ApiError(404, "Both dates are required !!!");
    let f_date = moment(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"); // 2024-12-24 00:00:00
    let t_date = moment(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");
    console.log({ f_date, t_date, mesL: "sdajsd" });

    const response = await query(
      ` SELECT * 
       FROM supplier_ledger 
       WHERE completed = ? 
       AND c_date BETWEEN ? AND ?`,
      [false, f_date, t_date]
    );
    if (response.length === 0) throw new ApiError(404, "No Data Found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(500, "Internal server error !!!");
  }
});

const payment_false_grn = asyncHandler(async (req, res) => {
  try {
    const response = await query(
      `SELECT *, (payable - payed) AS difference
       FROM supplier_ledger
       WHERE (payable - payed) > 0 AND completed = ? AND grn_no != 0`,
      [false]
    );
    if (response.length === 0) throw new ApiError(404, "Data not found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log("Error ", error);
    throw new ApiError(500, "Internal server error", error);
  }
});

const payment_false_invoice = asyncHandler(async (req, res) => {
  try {
    const response = await query(
      `SELECT *, (payable - payed) AS difference
       FROM supplier_ledger
       WHERE (payable - payed) > 0 AND completed = ? AND grn_no = 0`,
      [false]
    );
    if (response.length === 0) throw new ApiError(404, "Data not found !!!");
    res.status(200).json(new ApiResponse(200, { data: response }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log("Error ", error);
    throw new ApiError(500, "Internal server error", error);
  }
});

const create_payment = asyncHandler(async (req, res) => {
  try {
    const {
      supplier_id,
      supplier_name,
      paying,
      payment_type,
      remarks,
      grn_no,
    } = req.body;

    if (
      ![supplier_id, supplier_name, paying, payment_type, grn_no].every(Boolean)
    )
      throw new ApiError(404, "All parameters are required !!!");
    const check_valid_payment = await query(
      `
        SELECT (payable - payed) AS difference
        FROM supplier_ledger
        WHERE (payable - payed) > 0 AND grn_no = ? AND completed = ?`,
      [grn_no, false]
    );
    if (check_valid_payment.length === 0)
      throw new ApiError(404, "Invalid request as payment is clear already!!!");
    if (paying > check_valid_payment[0]?.difference) {
      throw new ApiError(
        404,
        "You are paying greater than pending quantity!!!"
      );
    }
    // create supplier payment table
    const payment = async () => {
      try {
        await query(
          `INSERT INTO supplier_payment (grn_no, supplier_name, supplier_id, payment_type, amount, remarks, c_user) 
           VALUES(?, ?, ?, ?, ?, ?, ?)`,
          [
            grn_no,
            supplier_name,
            supplier_id,
            payment_type,
            paying,
            remarks,
            req?.user,
          ]
        );
        return "Payment table created !!!";
      } catch (error) {
        throw new Error("Payment Creation Failed");
      }
    };

    // add payed + paying in supplier ledger
    const update_paying_column = async () => {
      try {
        await query(
          `UPDATE supplier_ledger SET payed = payed + ? WHERE grn_no = ?`,
          [paying, grn_no]
        );
        return "Paying column updated !!!";
      } catch (error) {
        throw new Error("Paying column update failed !!!");
      }
    };

    await Promise.all([payment(), update_paying_column()]).catch((error) => {
      throw new Error("Promise failed ", error);
    });

    // check if payed payment === paying  set completed to true
    const check_complete_payment = await query(
      `SELECT * from supplier_ledger WHERE payable = payed AND grn_no = ?`,
      [grn_no]
    );
    if (check_complete_payment.length > 0) {
      await query(
        `UPDATE supplier_ledger SET completed = true WHERE grn_no = ?`,
        [grn_no]
      );
      res.status(200).json(new ApiResponse(200, "Payment completed !!!"));
      return;
    } else {
      res
        .status(200)
        .json(new ApiResponse(200, "Response without payment complete"));
      return;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(500, "Internal server error !!!");
  }
});

const create_payment_invoice = asyncHandler(async (req, res) => {
  try {
    const { supplier_id, supplier_name, paying, invoice_no, data } = req.body;
    console.log("req.body", req.body);

    if (![supplier_id, supplier_name, paying, invoice_no].every(Boolean))
      throw new ApiError(404, "All parameters are required !!!");
    // const check_valid_payment = await query(
    //   `
    //     SELECT (payable - payed) AS difference
    //     FROM supplier_ledger
    //     WHERE (payable - payed) > 0 AND id = ? AND completed = ?`,
    //   [id, false]
    // );
    // if (check_valid_payment.length === 0)
    //   throw new ApiError(404, "Invalid request as payment is clear already!!!");
    // if (paying > check_valid_payment[0]?.difference) {
    //   throw new ApiError(
    //     404,
    //     "You are paying greater than pending quantity!!!"
    //   );
    // }
    // create supplier payment table
    const payment = async () => {
      try {
        await query(
          `INSERT INTO supplier_payment (grn_no ,invoice_no, supplier_name, supplier_id, payment_type, amount, remarks, c_user) 
           VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            0,
            invoice_no,
            supplier_name,
            supplier_id,
            "CASH",
            paying,
            "Against Local Purchasing",
            req?.user,
          ]
        );
        return "Payment table created !!!";
      } catch (error) {
        throw new Error("Payment Creation Failed");
      }
    };

    const update_lp_completion = async () => {
      try {
        const promises = data.map((items) =>
          query(
            `UPDATE local_purchasing SET completed = true WHERE item_id = ? AND invoice_no = ?`,
            [items?.item_id, items?.invoice_no]
          )
        );
        await Promise.all(promises);
        return "LP COMPLETED !!!";
      } catch (error) {
        throw new Error("Failed to update GRN status: " + error.message);
      }
    };

    // add payed + paying in supplier ledger
    // const update_paying_column = async () => {
    //   try {
    //     await query(
    //       `UPDATE supplier_ledger SET payed = payed + ? WHERE id = ?`,
    //       [paying, id]
    //     );
    //     return "Paying column updated !!!";
    //   } catch (error) {
    //     throw new Error("Paying column update failed !!!");
    //   }
    // };

    await Promise.all([payment(), update_lp_completion()]).catch((error) => {
      throw new Error("Promise failed ", error);
    });

    // check if payed payment === paying  set completed to true
    // const check_complete_payment = await query(
    //   `SELECT * from supplier_ledger WHERE payable = payed AND id = ?`,
    //   [id]
    // );
    // if (check_complete_payment.length > 0) {
    //   await query(`UPDATE supplier_ledger SET completed = true WHERE id = ?`, [
    //     id,
    //   ]);
    res.status(200).json(new ApiResponse(200, "Payment completed !!!"));
    return;
    // } else {
    //   res
    //     .status(200)
    //     .json(new ApiResponse(200, "Response without payment complete"));
    //   return;
    // }
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(error);

      throw error;
    }
    console.log(error);
    throw new ApiError(500, "Internal server error !!!");
  }
});

const return_lp_items_to_supplier = asyncHandler(async (req, res) => {
  try {
    const { data, supplier_name, supplier_id } = req.body;
    if (
      !supplier_name ||
      !supplier_id ||
      !data ||
      !Array.isArray(data) ||
      data.length === 0
    )
      throw new ApiError(404, "All parameters are required !!!");
    let itemIds = data.map((items) => items?.item_id);
    let placeholders = itemIds.map(() => "?").join(",");

    const check_current_status = await query(
      `SELECT *, (d_qty - a_qty) AS remaining_qty 
       FROM local_purchasing 
       WHERE completed = false AND d_qty != a_qty AND invoice_no = ?`,
      [data[0].invoice_no]
    );
    console.log("check_current_status", check_current_status);
    const newData = check_current_status
      .map((items) => {
        const find_valid_qty = data.find(
          (data_item) => data_item?.id === items?.id
        );

        if (!find_valid_qty) {
          return null;
        }

        if (find_valid_qty.a_qty > items.remaining_qty) {
          throw new Error(
            `Quantity mismatch: a_qty (${find_valid_qty.a_qty}) exceeds remaining_qty (${items.remaining_qty}) for ID: ${items.id}`
          );
        }

        return {
          ...find_valid_qty,
          remaining_qty: items.remaining_qty,
        };
      })
      .filter(Boolean);

    console.log("Filtered and Validated Data: ", newData);

    if (newData.length === 0) {
      throw new ApiError(
        404,
        "Transaction Alert, Refresh page and try again !!!"
      );
    }

    const dataBase = await query(
      `SELECT * FROM stock WHERE item_id IN (${placeholders}) AND batch_status = ?`,
      [...itemIds, true]
    );
    if (dataBase.length === 0) throw new ApiError(404, "No Stock Found !!!");
    let dataRecieveFromUser = data;
    const updateStock = (dataBase, dataRecieveFromUser) => {
      let updatedDataBase = [...dataBase]; // Clone the database
      let originalStockData = dataBase.map((dbItem) => ({ ...dbItem })); // Save original stock data

      // Validate if the requested d_qty exceeds total available stock
      dataRecieveFromUser.forEach((userItem) => {
        let totalStockAvailable = updatedDataBase
          .filter((dbItem) => dbItem.item_id === userItem.item_id)
          .reduce((acc, dbItem) => acc + dbItem.p_size_stock, 0);

        if (userItem.a_qty > totalStockAvailable) {
          throw new Error(
            `Cannot reduce ${userItem.a_qty} items. Only ${totalStockAvailable} items are available.`
          );
        }
      });

      // Reduce stock for each item in dataRecieveFromUser
      dataRecieveFromUser.forEach((userItem) => {
        let remainingStockToReduce = userItem.a_qty;

        // Iterate over batches, reduce stock while keeping it non-negative
        updatedDataBase = updatedDataBase.map((dbItem, index) => {
          if (
            dbItem.item_id === userItem.item_id &&
            remainingStockToReduce > 0
          ) {
            const stockToReduce = Math.min(
              dbItem.p_size_stock,
              remainingStockToReduce
            );
            dbItem.p_size_stock -= stockToReduce;
            remainingStockToReduce -= stockToReduce;
          }
          return dbItem;
        });
      });

      // Calculate issued_qty for all batches
      updatedDataBase = updatedDataBase.map((dbItem, index) => {
        const originalItem = originalStockData[index]; // Use index to ensure correct mapping

        if (originalItem) {
          const issuedQty = originalItem.p_size_stock - dbItem.p_size_stock;
          return { ...dbItem, issued_qty: issuedQty }; // Include issued_qty for all
        }
        return dbItem;
      });

      // Filter affected batches (issued_qty > 0)
      const affectedBatches = updatedDataBase.filter(
        (dbItem) => dbItem.issued_qty > 0
      );

      return affectedBatches;
    };

    let updatedDataBase = updateStock(dataBase, dataRecieveFromUser);

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

    const update_lp_completion = async () => {
      try {
        const promises = data.map((items) =>
          query(
            `UPDATE local_purchasing SET a_qty = a_qty + ? WHERE item_id = ? AND id = ?`,
            [items?.a_qty, items?.item_id, items?.id]
          )
        );
        await Promise.all(promises);
        return "Adjusted items added in local_puchasing !!!";
      } catch (error) {
        throw new Error("Failed to update local_purchasing: ", error.message);
      }
    };

    const detail_return_to_supplier = async () => {
      let formattedData = data.map((item) => ({
        ...item,
        supplier_name,
        supplier_id,
      }));

      const placeholders = Array(formattedData.length)
        .fill("(?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");

      formattedData = formattedData.flatMap((items) => [
        items.item_name,
        items.item_id,
        items?.item_unit,
        items?.unit_id,
        items.a_qty,
        items?.supplier_name,
        items?.supplier_id,
        req.user,
      ]);
      await query(
        `INSERT INTO lp_item_return(item_name, item_id, item_unit, unit_id, a_qty, supplier_name, supplier_id, c_user) VALUES ${placeholders}`,
        formattedData
      );
      return "LP item return completed !!!";
    };
    await Promise.all([
      update_stock_table(),
      update_lp_completion(),
      detail_return_to_supplier(),
    ]).catch((error) => {
      throw new Error(`promise failed with error ${error}`);
    });

    const update_stock_batch_status = async () => {
      try {
        console.log("updatedDataBase", updatedDataBase);
        const promises = updatedDataBase.map((items) =>
          query(
            `UPDATE stock SET batch_status = ? WHERE item_id = ? AND p_size_stock = ?`,
            [false, items?.item_id, 0]
          )
        );
        await Promise.all(promises);
        console.log("promises", promises);
        return "batch status !!!";
      } catch (error) {
        throw new Error("Failed to update GRN status: " + error.message);
      }
    };

    let update_completion = async () => {
      await query(
        `UPDATE local_purchasing SET completed = true WHERE id = ? AND d_qty = a_qty`,
        [data[0]?.id]
      );
      return "Completed true";
    };

    await Promise.all([update_stock_batch_status(), update_completion()])
      .then(() => {
        res.status(200).json(new ApiResponse(200, "Success"));
      })
      .catch((error) => {
        throw new Error(`Failed promise`);
      });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(500, `Internal server error !!! ${error.message}`);
  }
});

const get_supplier_payment = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate, supplier_id } = req?.query;
    console.log("req?.query", req.query);

    if (!fromDate || !toDate)
      throw new ApiError(404, "Both dates are required !!!");
    let f_date = moment(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"); // 2024-12-24 00:00:00
    let t_date = moment(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");
    console.log({ f_date, t_date });

    let response;
    if (supplier_id !== "0") {
      response = await query(
        ` SELECT * 
          FROM supplier_payment 
          WHERE supplier_id = ? AND c_date BETWEEN ? AND ?`,
        [supplier_id, f_date, t_date]
      );
      if (response.length === 0) throw new ApiError(404, "No Data Found !!!");
      res.status(200).json(new ApiResponse(200, { data: response }));
      return;
    } else {
      response = await query(
        ` SELECT * 
        FROM supplier_payment 
        WHERE c_date BETWEEN ? AND ?`,
        [f_date, t_date]
      );
      console.log("response", response);

      if (response.length === 0) throw new ApiError(404, "No Data Found !!!");
      res.status(200).json(new ApiResponse(200, { data: response }));
      return;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(500, `Internal server error !!! ${error.message}`);
  }
});

export {
  create_supplier,
  retrieved_supplier,
  update_supplier,
  supplier_ledger,
  payment_false_grn,
  create_payment,
  payment_false_invoice,
  create_payment_invoice,
  return_lp_items_to_supplier,
  get_supplier_payment,
};

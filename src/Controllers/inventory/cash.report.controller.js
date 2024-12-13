import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";
import moment from "moment";

const cashReport = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate, supplier_id } = req?.query;
    console.log("req?.query", req.query);

    if (!fromDate || !toDate)
      throw new ApiError(404, "Both dates are required !!!");
    let f_date = moment(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"); // 2024-12-24 00:00:00
    let t_date = moment(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const total_purchasing = new Promise(async (resolve, reject) => {
      const purchasing = await query(
        `SELECT IFNULL(SUM(amount), 0) as total_purchasing from grn WHERE c_date BETWEEN ? AND ?`,
        [f_date, t_date]
      );
      if (purchasing) {
        resolve(purchasing[0]);
        return;
      } else {
        reject("Failed to retreive data of purchasing !!!");
      }
    });

    const total_sale = new Promise(async (resolve, reject) => {
      const sale = await query(
        `SELECT IFNULL(SUM(total_charges), 0) as total_sale, IFNULL(SUM(r_amount),0) as total_receive, 
        IFNULL(SUM(total_expense),0) as total_expense from invoice_master WHERE c_date BETWEEN ? AND ?`,
        [f_date, t_date]
      );
      if (sale) {
        resolve(sale[0]);
        return;
      } else {
        reject("Failed to retreive data total sale!!!");
      }
    });

    const total_refund = new Promise(async (resolve, reject) => {
      const refund = await query(
        `SELECT IFNULL(SUM(refund_amount), 0) as total_refund FROM master_refund WHERE c_date BETWEEN ? AND ?`,
        [f_date, t_date]
      );
      if (refund) {
        resolve(refund[0]);
        return;
      } else {
        reject("Failed to retreive data total sale !!!");
      }
    });

    const total_payment_to_supplier = new Promise(async (resolve, reject) => {
      const payment = await query(
        `SELECT IFNULL(SUM(amount), 0) as total_payment_to_supplier FROM supplier_payment WHERE c_date BETWEEN ? AND ?`,
        [f_date, t_date]
      );
      if (payment) {
        resolve(payment[0]);
        return;
      } else {
        reject("Failed to retreive data total payment to supplier !!!");
      }
    });

    await Promise.all([
      total_purchasing,
      total_sale,
      total_refund,
      total_payment_to_supplier,
    ])
      .then((data) =>
        res.status(200).json(new ApiResponse(200, { data: data }))
      )
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(error);
    throw new ApiError(500, "Internal server error !!!");
  }
});

export { cashReport };

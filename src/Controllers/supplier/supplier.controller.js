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
       WHERE (payable - payed) > 0 AND completed = ?`,
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

export {
  create_supplier,
  retrieved_supplier,
  update_supplier,
  supplier_ledger,
  payment_false_grn,
  create_payment,
};

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const create_user = asyncHandler(async (req, res) => {
  try {
    const { user_id, cred } = req.body;
    if (![user_id, cred].every(Boolean))
      throw new ApiError(400, "All parameters are required !!!");
    let userI = user_id.toLowerCase();
    const user_check = await query(
      `SELECT user_id FROM user WHERE user_id = ?`,
      [userI]
    );
    if (user_check.length !== 0)
      throw new ApiError(400, "user Already Exists !!!");
    const hash = await bcrypt.hash(cred, 5);
    const response = await query(
      `INSERT INTO user(user_id, cred) VALUES(?, ?)`,
      [userI, hash]
    );
    if (response.insertId) {
      res
        .status(200)
        .json(new ApiResponse(200, "User created successfully !!!"));
    } else {
      throw new ApiError(400, "User creation failed !!!");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server Error !!!");
  }
});

const login_user = asyncHandler(async (req, res) => {
  try {
    const { user_id, cred } = req.body;
    if (![user_id, cred].every(Boolean))
      throw new ApiError(404, "All parameters are required !!!");
    let userI = user_id.toLowerCase();
    const user_check = await query(`SELECT * FROM user WHERE user_id = ?`, [
      userI,
    ]);
    const pass_check = await bcrypt.compare(cred, user_check[0].cred);
    if (!pass_check) throw new ApiError(400, "Invalid password !!!");
    const token = jwt.sign(
      {
        userI,
      },
      process.env.TOP_SECRET,
      { expiresIn: "1d" }
    );
    console.log("token", token);
    //     let cookies = req.cookies
    //   let cookiess = res.cookie
    res
      .cookie(token)
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: user_check, token },
          "User Login Successfully"
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

export { create_user, login_user };

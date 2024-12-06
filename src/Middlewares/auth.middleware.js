import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { query } from "../Database/database.config.js";
import jwt from "jsonwebtoken";

const auth_middleware = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.token;
    console.log(token);

    if (!token) throw new ApiError(404, "Token not found !!!");
    const decoded = jwt.decode(token, process.env.TOP_SECRET);

    if (!decoded) throw new ApiError(400, "Wrong token !!!");
    const user_check = await query(
      `SELECT user_id FROM user WHERE user_id = ?`,
      [decoded?.userI]
    );

    if (user_check.length === 0)
      throw new ApiError(404, "user not found invalid token !!!");
    req.user = user_check[0].user_id;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Un-authorized request !!!");
  }
});

export { auth_middleware };

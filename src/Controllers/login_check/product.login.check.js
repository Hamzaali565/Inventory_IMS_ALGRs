import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { ApiError } from "../../Utils/ApiError.js";
import { query } from "../../Database/database.config.js";
import jwt from "jsonwebtoken";

const login_check = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token)
      return res.status(401).json(ApiResponse(false, "Token not found !!!"));
    const decoded = jwt.verify(token, process.env.TOP_SECRET);

    if (!decoded) throw new ApiError(404, "Un-Authorized token !!!");
    const user = await query("SELECT user_id FROM user WHERE user_id = ?", [
      decoded.userI,
    ]);
    if (!user) throw new ApiError(404, "User not found !!!");
    res.status(200).json(new ApiResponse(200, { data: user }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "Un_authiorize request");
  }
});

export { login_check };

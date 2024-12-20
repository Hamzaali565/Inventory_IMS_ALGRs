import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";
// ###
const create_unit = asyncHandler(async (req, res) => {
  try {
    const { unit_name } = req.body;
    if (![unit_name].every(Boolean))
      throw new ApiError(400, "All parameters are required !!!");
    const response = await query(
      `INSERT INTO units (unit_name, c_user) VALUES ('${unit_name}', '${req.user}') `
    );
    res
      .status(200)
      .json(new ApiResponse(200, { data: response }, "Successfully created"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(error);
    throw new ApiError(400, "internal server error", [error]);
  }
});

/// ###
const get_unfiltered_units = asyncHandler(async (req, res) => {
  try {
    const response = await query(`SELECT * FROM units`);
    if (response.length === 0) throw new ApiError(404, "No data found");
    res
      .status(200)
      .json(new ApiResponse(200, { data: response }, "Successfully retrieved"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(error);
    throw new ApiError(400, "internal server error", [error]);
  }
});

/// ###
const update_unit = asyncHandler(async (req, res) => {
  try {
    let { unit_id } = req.query;
    let { unit_name } = req.body;
    if (![unit_id, unit_name].every(Boolean))
      throw new ApiError(400, "All parameters are required !!!");
    const response = await query(
      `UPDATE units SET unit_name = ? WHERE unit_id = ?`,
      [unit_name, unit_id]
    );
    if (response.affectedRows === 0) throw new ApiError(404, "No data updated");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: response },
          "data Updated Successfully !!!"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(error);
    throw new ApiError(400, "internal server error", [error]);
  }
});

export { create_unit, get_unfiltered_units, update_unit };

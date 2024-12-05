import { asyncHandler } from "../../Utils/asyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { query } from "../../Database/database.config.js";

const create_category = asyncHandler(async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name)
      throw new ApiError(400, "All parameters are required !!!");
    let c_user = req.user;
    const response = await query(
      `INSERT INTO category (category_name, c_user) VALUES ('${category_name}', '${c_user}')`
    );
    res
      .status(200)
      .json(new ApiResponse(200, { data: response }, "Successfully saved"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "Internal server error !!!");
  }
});

const retrieved_category = asyncHandler(async (req, res) => {
  try {
    const response = await query(`SELECT * FROM category`);
    if (response.length === 0) throw new ApiError(404, "No data found !!!");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: response },
          "Data retrieved successfully !!!"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "Internal server error !!!");
  }
});

const update_category = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;
    const { category_name } = req.body;
    console.log("id", id, "category_name", category_name);

    if (![id, category_name].every(Boolean))
      throw new ApiError(400, "Id is required to proceed query !!!");
    const id_check = await query(`SELECT * FROM category WHERE id = ?`, [id]);
    if (id_check.length === 0) throw new ApiError(404, "No data found");
    const response = await query(
      `UPDATE category SET category_name = ? WHERE id = ?`,
      [category_name, id]
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
    throw new ApiError(400, "Internal server error !!!");
  }
});

export { create_category, retrieved_category, update_category };

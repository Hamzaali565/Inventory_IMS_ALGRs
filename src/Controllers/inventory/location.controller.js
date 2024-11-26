import { query } from "../../Database/database.config.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { asyncHandler } from "../../Utils/asyncHandler.js";

// ###
const create_location = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) throw new ApiError(400, "Name field is required !!!");
    const response = await query(
      `INSERT INTO location (name) VALUES ('${name}')`
    );
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Data created successfully !!!"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);

    throw new ApiError(400, "Internal server error !!!");
  }
});

// ###
const retrieved_location = asyncHandler(async (req, res) => {
  try {
    const response = await query(`SELECT * FROM location`);
    if (response.length === 0) throw new ApiError(404, "No data found !!!");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: response },
          "Successfully retreived data !!!"
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

// ###
const update_location = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;
    const { name } = req.body;
    console.log("name ", name);

    if (!id) throw new ApiError(400, "ID field is required !!!");
    const check_location = await query(`SELECT * FROM location WHERE id = ?`, [
      id,
    ]);
    if (!check_location.length)
      throw new ApiError(404, "Location not found !!!");
    const response = await query(`UPDATE location SET name = ? WHERE id = ?`, [
      name || check_location[0].name,
      id,
    ]);
    if (response.affectedRows === 0)
      throw new ApiError(400, "Failed to update data please try again !!!");
    res.status(200).json(new ApiResponse(200, "Updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.log(error);
    throw new ApiError(400, "Internal server error !!!");
  }
});

export { create_location, retrieved_location, update_location };

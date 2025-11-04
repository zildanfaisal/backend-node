import { apiError, apiSuccess } from "../utils/response.js";
import {
  findUserById,
  updateUserNames,
  updateUserProfileImage,
} from "../models/userModel.js";
import path from "path";

export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user)
      return apiError(
        res,
        401,
        108,
        "Token tidak tidak valid atau kadaluwarsa"
      );

    return apiSuccess(res, "Sukses", {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_image: user.profile_image,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body || {};

    const updated = await updateUserNames(req.user.id, first_name, last_name);
    if (!updated)
      return apiError(
        res,
        401,
        108,
        "Token tidak tidak valid atau kadaluwarsa"
      );

    return apiSuccess(res, "Update Pofile berhasil", {
      email: updated.email,
      first_name: updated.first_name,
      last_name: updated.last_name,
      profile_image: updated.profile_image,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return apiError(res, 400, 102, "Format Image tidak sesuai");
    }

    const fileUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${path.basename(req.file.path)}`;
    const updated = await updateUserProfileImage(req.user.id, fileUrl);

    return apiSuccess(res, "Update Profile Image berhasil", {
      email: updated.email,
      first_name: updated.first_name,
      last_name: updated.last_name,
      profile_image: updated.profile_image,
    });
  } catch (err) {
    return next(err);
  }
};

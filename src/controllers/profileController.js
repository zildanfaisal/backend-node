import { apiError, apiSuccess } from "../utils/response.js";
import {
  findUserById,
  updateUserNames,
  updateUserProfileImage,
} from "../models/userModel.js";
import path from "path";
import fs from "fs";

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
    let fileUrl = null;

    if (req.file) {
      // Uploaded via multipart/form-data
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${path.basename(
        req.file.path
      )}`;
    } else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      // Raw binary upload
      const ct = (req.headers["content-type"] || "").toLowerCase();
      const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/octet-stream", // some clients send this in binary mode
      ];
      if (!allowed.includes(ct)) {
        return apiError(res, 400, 102, "Format Image tidak sesuai");
      }

      const extMap = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
      };
      const ext = extMap[ct] || ".jpg";
      const filename = `upload-${Date.now()}${ext}`;
      const uploadDir = path.resolve("uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.body);
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    } else {
      return apiError(res, 400, 102, "Format Image tidak sesuai");
    }

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

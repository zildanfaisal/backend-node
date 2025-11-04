import pool from "../config/db.js";
import { apiSuccess } from "../utils/response.js";

export const getBanners = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT banner_name, banner_image, description FROM banners ORDER BY id ASC"
    );
    return apiSuccess(res, "Sukses", rows);
  } catch (err) {
    return next(err);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT service_code, service_name, service_icon, service_tariff::numeric AS service_tariff
       FROM services
       ORDER BY service_name ASC`
    );
    return apiSuccess(res, "Sukses", rows);
  } catch (err) {
    return next(err);
  }
};

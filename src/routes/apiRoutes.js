import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import {
  getProfile,
  updateProfile,
  updateProfileImage,
} from "../controllers/profileController.js";
import { getBanners, getServices } from "../controllers/contentController.js";
import { getBalance, topUp } from "../controllers/walletController.js";
import {
  createPayment,
  getHistory,
} from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// File upload setup
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
  ]; // allow common formats
  if (!allowed.includes(file.mimetype))
    return cb(new Error("Format Image tidak sesuai"));
  cb(null, true);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // max 5MB

// Middleware: accept either multipart/form-data (multer) OR raw binary image
const binaryOrMultipartUpload = (req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.startsWith("multipart/form-data")) {
    return upload.single("file")(req, res, next);
  }
  // For binary uploads, parse raw body up to 5MB
  return express.raw({ type: () => true, limit: "5mb" })(req, res, (err) => {
    if (err) return next(err);
    return next();
  });
};

// Public endpoints
router.post("/registration", registerUser);
router.post("/login", loginUser);
router.get("/banner", getBanners);

// Authenticated endpoints
router.get("/profile", protect, getProfile);
router.put("/profile/update", protect, updateProfile);
router.put(
  "/profile/image",
  protect,
  binaryOrMultipartUpload,
  updateProfileImage
);

router.get("/services", protect, getServices);
router.get("/balance", protect, getBalance);
router.post("/topup", protect, topUp);
router.post("/transaction", protect, createPayment);
router.get("/transaction/history", protect, getHistory);

export default router;

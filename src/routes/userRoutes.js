import express from "express";
import {
  getUsers,
  registerUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/", registerUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;

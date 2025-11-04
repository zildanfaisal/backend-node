import express from "express";
import helmet from "helmet";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

// Middlewares Global
app.use(helmet());
app.use(cors());
app.use(express.json());
// Static for uploaded files
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api/users", userRoutes); // legacy
app.use("/api/auth", authRoutes); // legacy
// Assignment API endpoints mounted at root
app.use("/", apiRoutes);

// Swagger Docs
try {
  const openapi = JSON.parse(
    fs.readFileSync(path.resolve("src/docs/openapi.json"), "utf8")
  );
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.get("/docs-json", (req, res) => res.json(openapi));
} catch (e) {
  console.warn("Swagger docs not loaded:", e?.message || e);
}

// Error Handling Middleware
app.use(errorHandler);

export default app;

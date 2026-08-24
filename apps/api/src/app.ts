import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { identityRouter } from "./modules/identity/identity.routes.js";
import { catalogueRouter } from "./modules/catalogue/catalogue.routes.js";
import { bookingRouter } from "./modules/booking/booking.routes.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";
import { accessRouter } from "./modules/access/access.routes.js";
import { debugRouter } from "./modules/debug/debug.routes.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

export const app = express();

// Security & utility middleware
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "DAIH Modular API",
  });
});

// Modular Routes mount
app.use("/api/v1/identity", identityRouter);
app.use("/api/v1/catalogue", catalogueRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/access", accessRouter);
app.use("/api/v1/debug", debugRouter);

// Centralized error handler
app.use(errorHandler);

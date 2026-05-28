import { Application } from "express";
import v1ProductRoutes from "./modules/v1/product/product.routes";
import v1ReservationRoutes from "./modules/v1/reservation/reservation.routes";

const API_V1 = "/api/v1";

export const registerRoutes = (app: Application): void => {
  app.use(`${API_V1}/products`, v1ProductRoutes);
  app.use(`${API_V1}/reservations`, v1ReservationRoutes);
};

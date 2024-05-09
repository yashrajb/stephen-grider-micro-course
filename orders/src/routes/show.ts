import express, { Request, Response } from "express";
import { NotAuthorizedError, NotFoundError } from "@ybtickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.get("/api/tickets/:orderId", async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId).populate("ticket");

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  return res.status(201).send(order);
});

export { router as showOrderRouter };

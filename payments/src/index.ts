import mongoose from "mongoose";
import { natsWrapper } from "./nats-wrapper";
import { app } from "./app";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
const start = async () => {
  console.log("in start");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    const natsClient = natsWrapper.client;
    natsClient.on("close", () => {
      console.log("NATS connection closed!");

      process.exit();
    });
    process.on("SIGINT", () => natsClient.close());
    process.on("SIGTERM", () => natsClient.close());

    new OrderCreatedListener(natsClient).listen();
    new OrderCancelledListener(natsClient).listen();

    await mongoose.connect(process.env.MONGO_URI);

    // we are putting close, SIGINT, SIGTERM callback in index.ts.
    // because, putting process.exit will exit whole program

    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();

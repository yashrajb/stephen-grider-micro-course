import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listener/order-created-listener";
const start = async () => {
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

    // we are putting close, SIGINT, SIGTERM callback in index.ts.
    // because, putting process.exit will exit whole program

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();

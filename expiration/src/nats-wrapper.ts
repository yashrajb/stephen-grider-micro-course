import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATs Client before connecting");
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });



    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        return resolve(true);
      });

      this.client.on("error", (err) => {
        return reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
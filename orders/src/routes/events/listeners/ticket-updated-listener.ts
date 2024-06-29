import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@ybtickets/common";
import { Ticket } from "../../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    const exisitngTicket = await Ticket.findByEvent(data);

    if (!exisitngTicket) {
      throw new Error("Ticket not found");
    }

    exisitngTicket.set({ title, price });

    await exisitngTicket.save();

    msg.ack();
  }
}

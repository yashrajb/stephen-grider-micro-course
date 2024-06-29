import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@ybtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}

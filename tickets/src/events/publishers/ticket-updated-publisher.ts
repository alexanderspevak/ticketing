import { Publisher, Subjects, TicketUpdatedEvent } from '@spevaktickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
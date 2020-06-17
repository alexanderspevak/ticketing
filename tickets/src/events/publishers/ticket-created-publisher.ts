import { Publisher, Subjects, TicketCreatedEvent } from '@spevaktickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}


import nats, { Message, Stan } from 'node-nats-streaming'
import { randomBytes } from 'crypto'
import { Listener } from '../../../common/src/events/base-listener'
import { TicketCreatedEvent } from '../../../common/src/events/ticket-created-event'
import {Subjects} from '../../../common/src/events/subjects'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
  queGroupName = 'tickets-service';

  onMessage (data: TicketCreatedEvent['data'], msg: Message) {
    console.log('EventData', data)

    msg.ack()
  }
}
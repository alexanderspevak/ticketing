import { Publisher, OrderCreatedEvent, Subjects } from '@spevaktickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
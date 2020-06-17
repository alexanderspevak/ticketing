import { Publisher, OrderCancelledEvent, Subjects } from '@spevaktickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
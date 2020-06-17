import { Subjects, Publisher, PaymentCreatedEvent } from '@spevaktickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  subject: Subjects.PaymentCreated=Subjects.PaymentCreated
}
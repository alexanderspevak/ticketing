import { Message } from 'node-nats-streaming'
import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus, PaymentCreatedEvent } from '@spevaktickets/common'
import { Order } from '../../models/orders'
import { queueGroupName } from './queue-group-name'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'


export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName = queueGroupName

  async onMessage(data:PaymentCreatedEvent['data'], msg: Message){
    const order = await Order.findById(data.orderId)

    if(!order){
      throw new Error('order not found')
    }

    order.set({
      status: OrderStatus.Complete
    })

    await order.save()

    msg.ack();
  }
}
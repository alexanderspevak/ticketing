import express, { Request, Response } from 'express'
import { requireAuth, validateRequest, NotAuthorizedError, OrderStatus, BadRequestError, NotFoundError } from '@spevaktickets/common'
import { body } from 'express-validator'
import { Order } from '../models/order'
import mongoose from 'mongoose'
import  { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/payments', requireAuth, [
  body('token')
    .not()
    .isEmpty()
    .withMessage('provide valid token'),
  body('orderId')
    .not()
    .isEmpty()
    .withMessage('provide valid orderId')
], validateRequest, async (req: Request, res: Response) => {
  const { token, orderId } = req.body

  const order = await Order.findById(orderId)

  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError('Order is already cancelled')
  }

  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price *100,
    source: token
  })

  const payment = Payment.build({
    orderId,
    stripeId: charge.id
  });

  await payment.save()

  await new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId
  })

  res.status(201).send({ id: payment.id})
})

export { router as createChargeRouter }
import express, { Request, Response, NextFunction } from 'express'
import { Ticket } from '../models/ticket'
import {
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError
} from '@spevaktickets/common'
import { body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'


const router = express.Router()

router.put('/api/tickets/:id', requireAuth, [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Valid price must be provided')
],
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      throw new NotFoundError()
    }


    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit reserved ticket')
    }


    ticket.set({
      title: req.body.title,
      price: req.body.price
    })

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })

    res.send(ticket)
  })

export { router as updateTicketRouter }

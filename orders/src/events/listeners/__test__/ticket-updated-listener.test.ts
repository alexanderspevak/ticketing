import { Message } from 'node-nats-streaming'
import { TicketUpdatedEvent } from '@spevaktickets/common'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/tickets'
import mongoose from 'mongoose'

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })

  await ticket.save()

  const data: TicketUpdatedEvent[ 'data' ] = {
    version: ticket.version +1,
    id: ticket.id,
    title: 'con',
    price: 999,
    userId: new mongoose.Types.ObjectId().toHexString()
  }
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(data.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks a message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('it does not call ack if the event has skipped version number',async (done)=>{
  const { listener, data, msg } = await setup()

  data.version = 10
  try{
    await listener.onMessage(data, msg)

  }catch(e){
  }

  expect(msg.ack).not.toHaveBeenCalled()
  return done()
})
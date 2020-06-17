import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose'
import { natsWrapper} from '../../nats-wrapper'
jest.mock('../../nats-wrapper')

it('returns 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signup())
    .send({
      title: 'asdfsafd',
      price: 20
    })
    .expect(404)
})


it('returns 404 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put('/api/tickets/')
    .send({
      title: 'asdfsafd',
      price: 20
    })
    .expect(404)
})

it('returns 401 if user does not own the ticket', async () => {
  const title = 'asdfsafsaf'
  const price = 20
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title, price })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({
      title,
      price
    })
    .expect(401)
})

it('returns 400 if user provides and invalid title or price', async () => {
  const title = 'asdfsafsaf'
  const price = 20
  const cookie = global.signup()

  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: '', price })
    .expect(400)

  await request(app)
    .post('/api/tickets').send({ price, title })
    .set('Cookie', cookie)
    .send({ title, price: -10 })
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const title = 'asdfsafsaf'
  const price = 20
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

   await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'sss', price: 10 })
    .expect(200)

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    
    
  expect(ticketResponse.body.title).toEqual('sss')
  expect(ticketResponse.body.price).toEqual(10)

})

it('publishes an event', async ()=>{
  const title = 'asdfsafsaf'
  const price = 20
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

   await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'sss', price: 10 })
    .expect(200)

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
  expect(natsWrapper.client.publish).toHaveBeenCalled()

})

it('rejects an edit if ticket is reserved', async ()=>{
  const title = 'asdfsafsaf'
  const price = 20
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201)

const ticket = await Ticket.findById(response.body.id)
ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()})
await ticket!.save()

   await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'sss', price: 10 })
    .expect(400)
})
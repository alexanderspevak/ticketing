import express, { Request, Response } from 'express'
import { requireAuth} from '@spevaktickets/common'
import { Order } from '../models/orders'
import mongoose from 'mongoose'

const router = express.Router();

router.get('/api/orders', async (req:Request, res: Response)=>{
const orders = await Order.find({
  userId: req.currentUser!.id
}).populate('ticket')

res.send(orders)
})

export { router as indexOrderRouter }
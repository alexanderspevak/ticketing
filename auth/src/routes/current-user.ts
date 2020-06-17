import express from 'express'
import { currentUser } from '@spevaktickets/common'
import mongoose from 'mongoose'

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  console.log('curent user connection',  mongoose.connection.readyState)
  
  res.send({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }
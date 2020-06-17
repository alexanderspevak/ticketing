import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {validateRequest, BadRequestError} from '@spevaktickets/common'
import { User } from '../models/users'
import { Password} from '../services/password'
import jwt from 'jsonwebtoken'

const router = express.Router();

router.post('/api/users/signin', [

  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must apply password')
],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if(!existingUser){
      throw  new BadRequestError('Invalid credentials')
    }

    const passwordMatch = await Password.compare(existingUser.password, password)
   
    if(!passwordMatch){
      throw new BadRequestError('Invalid Credentails')
    }


    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_KEY!)

    req.session = {
      jwt: userJwt
    } as any

    res.status(200).send(existingUser)

  }
)

    export { router as signinRouter }
import {Router, Request, Response} from 'express';

import {User} from '../models/User';
import * as c from '../../../../config/config';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {NextFunction} from 'connect';
import uuid4 from "uuid4"

import * as EmailValidator from 'email-validator';
import {config} from 'bluebird';

const router: Router = Router();


async function generatePassword(plainTextPassword: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User, reqID: {}): string {
  return jwt.sign(Object.assign({},user.short(), reqID), c.config.jwt.secret);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
      if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({message: 'No authorization headers.'});
  }

  const tokenBearer = req.headers.authorization.split(' ');
  if (tokenBearer.length != 2) {
    return res.status(401).send({message: 'Malformed token.'});
  }

  const token = tokenBearer[1];
  return jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
    }
    return next();
  });}
  catch(error)
{
    console.log(error)
}
}
const getReqID = () => {
    const id = uuid4()
    return {reqID: id}

}
export function logger(req: Request, res: Response, next: NextFunction) {
    try {
        const url = req.originalUrl
        if (!req.headers || !req.headers.authorization) {

console.log(new Date().toLocaleDateString()," Unauthenticated request ","Url: ",url)
     return next()
    }
  
    const tokenBearer = req.headers.authorization.split(' ');
    if (tokenBearer.length != 2) {
        console.log("Invalid token ", tokenBearer," Url: ",url)
      return next()
    }
  
    const token = tokenBearer[1];
    return jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
        
        if (err) {
          console.log("Token error: ",new Date().toLocaleDateString(), " URL: ",url)
          console.log(token, err)
          return next()
      }

      const {email, reqID} = decoded
      
      console.log(new Date().toLocaleDateString()," Request ", reqID, "User: ",email, "URL: ",url)
      return next();
    });}
    catch(error)
  {
      console.log(error)
      return
  }
  }
router.get('/verification',
    requireAuth,
    async (req: Request, res: Response) => {

try {      
    
    return res.status(200).send({auth: true, message: 'Authenticated.'});
}
      catch(error)
{
    console.log(error)
}
    });

router.post('/login', async (req: Request, res: Response) => {
try
    {  const email = req.body.email;
  const password = req.body.password;

  if (!email || !EmailValidator.validate(email)) {
    return res.status(400).send({auth: false, message: 'Email is required or malformed.'});
  }

  if (!password) {
    return res.status(400).send({auth: false, message: 'Password is required.'});
  }

  const user = await User.findByPk(email);
  if (!user) {
    return res.status(401).send({auth: false, message: 'User was not found..'});
  }

  const authValid = await comparePasswords(password, user.passwordHash);

  if (!authValid) {
    return res.status(401).send({auth: false, message: 'Password was invalid.'});
  }
  
  const reqID = getReqID()
  const jwt = generateJWT(user,reqID);
  console.log(user.email," initiated login with request ID: ",reqID.reqID)
  return res.status(200).send({auth: true, token: jwt, user: user.short().email});
}
catch(error)
{
    console.log(error)
}
});


router.post('/', async (req: Request, res: Response) => {
 try { const email = req.body.email;
  const plainTextPassword = req.body.password;

  if (!email || !EmailValidator.validate(email)) {
    return res.status(400).send({auth: false, message: 'Email is missing or malformed.'});
  }

  if (!plainTextPassword) {
    return res.status(400).send({auth: false, message: 'Password is required.'});
  }

  const user = await User.findByPk(email);
  if (user) {
    return res.status(422).send({auth: false, message: 'User already exists.'});
  }

  const generatedHash = await generatePassword(plainTextPassword);
  const newUser = await new User({
    email: email,
    passwordHash: generatedHash,
  });

  const savedUser = await newUser.save();
  const reqID = getReqID()
  const jwt = generateJWT(savedUser,reqID);
  
 
  return res.status(201).send({token: jwt, user: savedUser.short().email});}

  catch(error)
{
    console.log(error)
}
});

router.get('/', async (req: Request, res: Response) => {
  res.send('auth');
});

export const AuthRouter: Router = router;

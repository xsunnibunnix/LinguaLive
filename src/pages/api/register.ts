import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    console.log('Connected to the MongoDB database');
  } catch (error) {
    console.log(error);
  }

  if (req.method === 'POST') {
    const { newUser } = req.body;
    const { username, email, password } = newUser;
    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });

    if (emailExists || usernameExists) {
      return res.status(400).json('User already exists');
    };

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ username, email, password: hashedPassword });
      return res.status(200).json(true);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }

}
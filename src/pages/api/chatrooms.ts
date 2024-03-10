import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from "@/lib/dbConnect";
import Chatroom from "./../../../models/Chatroom";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // query the database here and add new chatroom
  try {
    await dbConnect();
    console.log('Connected to the MongoDB database');
  } catch (error) {
    console.log(error);
  }
  // await dbConnect()
  // .then(() => "Connected to MongoDB Database")
  // .catch((error) => {
  //   error: 'Connection Failed...!';
  // })

  if (req.method === 'POST') {
    const { name, language } = req.body;
    // check if room name exists first
    const roomNameExists = await Chatroom.findOne({ name });
    if (roomNameExists) {
      return res.status(400).json(null);
    }
    const chatroom = await Chatroom.create({ name, language });
    res.status(201).json(chatroom.id)

  } else {
    // Fetch list of all chatrooms from database
    const chatrooms = await Chatroom.find({});
    return res.status(200).json(chatrooms);
  }

}
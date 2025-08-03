import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use(express.static('public'))
app.use(cookieParser())
app.use("/uploads", express.static("uploads"));

export {app};
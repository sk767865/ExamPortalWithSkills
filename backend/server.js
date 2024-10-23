import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser"
import cors from "cors";
import dotenv from 'dotenv';
import router from './routes/router.js';
import fileUpload from 'express-fileupload';

const app = express();

app.use(fileUpload());

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
.then(() => {
  console.log('Connected to Cosmos DB');
})
.catch((err) => {
  console.error('Error connecting to Cosmos DB', err);
});

app.use("/api", router)

app.get('/', (req, res) => {
  res.send('Server up!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
























import express from "express"
import path  from "path"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import bodyParser from 'body-parser';
import  cors from 'cors';

const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const corsOptions = {
  origin: '*', // dominio permitido
};
  
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname,'public')))


export default app
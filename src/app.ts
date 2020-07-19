import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { createConnection } from 'typeorm';
import productRouter from './routes/product_routes';

const port = 4000;
const env_site = 'dev';

console.log( "Setting up express server...");
const app = express();

console.log( "Setting up database connection...");
createConnection().catch( err => {
  console.error( "Database connection failed!");
  console.error( err);
});

console.log( "Setting up middlewares...");
app.use( cors());
app.use( express.json());
app.use( morgan( env_site));

console.log( "Loading routes...");
app.use( productRouter);

app.listen( port, err => {
  if (err) {
    return console.error( err);
  }
  return console.log( `Server is listening on ${port}`);
});
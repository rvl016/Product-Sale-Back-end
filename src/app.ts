import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { connectToDatabase } from './utils/connect_database';

import productRouter from './routes/product_routes';
import saleRouter from './routes/sale_routes';

const port = 4000;
const env_site = 'dev';

export const startServer = async () => {
  console.log( "Setting up express server...");
  const app = express();

  console.log( "Setting up database connection...");
  await connectToDatabase();

  console.log( "Setting up middlewares...");
  app.use( cors());
  app.use( express.json());
  app.use( morgan( env_site));

  console.log( "Loading routes...");
  app.use( productRouter);
  app.use( saleRouter);

  app.listen( port, err => {
    if (err) {
      return console.error( err);
    }
    return console.log( `Server is listening on ${port}`);
  });
}

startServer();
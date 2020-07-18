import express from 'express';

const app = express();
const port = 4000;

app.get( '/', (req, res) => {
  res.send( 'Product Sale App is working!');
});

app.listen( port, err => {
  if (err) {
    return console.error( err);
  }
  return console.log( `server is listening on ${port}`);
});
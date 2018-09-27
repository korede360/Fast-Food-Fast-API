import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import init from './config/db/init';

import routes from './routes';

if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'test') {
  dotenv.load();
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

const port = process.env.PORT || 4500;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/register.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/history.html'));
});

app.get('order-food', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/order-food.html'));
});

app.get('order-manager', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/order-manager.html'));
});

app.use('/', routes);

app.listen(port, async () => {
  await console.log(`Server started on port ${port}.`);
  if (process.env.NODE_ENV === 'test') {
    const connString = 'postgres://bojshpfilkqszd:202908511f23c6effe50433613077d9e9f2d5ed73c28b3a8463f07b345b1bc1c@ec2-54-235-101-91.compute-1.amazonaws.com:5432/d7k2i2lhv289ll';
    await init(connString)
      .then(console.log('Connected to PostgresQL!'))
      .catch(err => console.error(err));
  } else {
    const connString = process.env.DATABASE_URL || 'postgresql://koredefashokun:Korede12@localhost/fast_food_fast';
    await init(connString)
      .then(console.log('Connected to PostgresQL!'))
      .catch(err => console.error(err));
  }
});


export default app;
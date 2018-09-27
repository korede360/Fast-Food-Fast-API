import { Router } from 'express';
import moment from 'moment';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import db from '../../../config/db';

const router = new Router();

const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
}

const comparePasswords = (password, hash) => {
  return bcrypt.compare(password, hash);
}

router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    res.status(400).json({
      success: false,
      message: 'Please fill out all required fields!'
    });
  } else if (!isValidEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Please make sure email is valid!'
    });
  } else if (password !== confirmPassword) {
    res.status(400).json({
      success: false,
      message: 'Please make sure the two passwords match.'
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const query = `INSERT INTO users(name, email, password, created_at, updated_at) VALUES($1, $2, $3, $4, $5) returning *`;
  const values = [
    name,
    email,
    hash,
    moment(new Date()),
    moment(new Date())
  ];
  try {
    const { rows } = await db.query(query, values);
    const payload = {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name
    }
    const token = await jwt.sign(payload, process.env.SECRET);
    res.status(201).json({
      success: true,
      id: rows[0].id,
      token
    });
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      res.status(400).send({
        success: false,
        message: 'User previously registered with given email.'
      });
    }
    res.status(400).json({
      success: false,
      message: 'An error has occured.',
      error
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Please enter your email and password correctly!'
    });
  } else if (!isValidEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }
  const query = 'SELECT * FROM users WHERE email = $1';
  try {
    const { rows } = await db.query(query, [email]);
    if (!rows[0]) {
      res.status(400).send({
        success: false,
        message: 'No users found with the provided credentials.'
      });
    }
    if (!comparePasswords(password, rows[0].password)) {
      res.status(400).send({
        success: false,
        message: 'Incorrect password!'
      });
    }
    const payload = {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name
    }
    const token = await jwt.sign(payload, process.env.SECRET);
    res.status(201).json({
      success: true,
      name: rows[0].name,
      id: rows[0].id,
      token
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'An error has occured.'
    });
  }
});


export default router;
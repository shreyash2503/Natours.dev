import express from 'express';
import { protect } from '../controllers/authController.js';
import { getCheckoutSession } from '../controllers/bookingsController.js';

const router = express.Router();


router.get('/checkout-session/:tourID', protect, getCheckoutSession);


export default router
import { Tour } from "../models/tourModel.js"
import Stripe from "stripe";
import { catchAsync } from "../utils/catchAsync.js";
import dotenv from 'dotenv';
dotenv.config({ path: '../config.env' })
const stripe = new Stripe('sk_test_51Mv0XESH4yaZ8NIUJMnkzaELhUfJpYP6rR7JbKphO0XkTL43hRoOI8cqoIozIdVT6DsGjA6UcG7UHwi2DSqJnlHp00htdP3QYJ');
export const getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);


    // 2). Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `${tour.name} Tour`
                    },
                    unit_amount: tour.price * 100,
                },
                quantity: 1,
            },

        ],
        mode: 'payment'

    })
    res.status(200).json({
        status: 'success',
        session
    })

})
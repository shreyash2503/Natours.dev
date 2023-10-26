import axios from "axios"
import { showAlert } from "./alerts";
import stripe from './index.js';

export const bookTour = async tourId => {
    try {
        const session = await axios(`http://localhost:9000/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session);
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (e) {
        console.log(e);
        showAlert('error', e);
    }

}






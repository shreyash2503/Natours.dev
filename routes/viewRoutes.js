import express from 'express';
const Router = express.Router();
import { getAccount, getLogin, getOverview, updateUserData } from '../controllers/viewsController.js';
import { getTour } from '../controllers/viewsController.js';
import { isLoggedIn, protect } from '../controllers/authController.js';
//* Template Rendering Routes
// Router.get('/', (req, res) => {
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user: 'jonas'
//     });

// });

Router.get('/', isLoggedIn, getOverview);
Router.get('/tours/:slug', isLoggedIn, getTour);
Router.get('/login', isLoggedIn, getLogin);
Router.get('/me', protect, getAccount);


Router.post('/submit-user-data', protect, updateUserData);




export default Router;
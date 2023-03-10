import express from 'express';
const Router = express.Router();
import { getLogin, getOverview } from '../controllers/viewsController.js';
import { getTour } from '../controllers/viewsController.js';
import { isLoggedIn } from '../controllers/authController.js';
//* Template Rendering Routes
// Router.get('/', (req, res) => {
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user: 'jonas'
//     });

// });

Router.use(isLoggedIn);
Router.get('/', getOverview);
Router.get('/tours/:slug', isLoggedIn, getTour);
Router.get('/login', getLogin);






export default Router;
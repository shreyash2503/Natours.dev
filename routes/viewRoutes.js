import express from 'express';
const Router = express.Router();
import { getOverview } from '../controllers/viewsController.js';
import { getTour } from '../controllers/viewsController.js';

//* Template Rendering Routes
// Router.get('/', (req, res) => {
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user: 'jonas'
//     });

// });


Router.get('/', getOverview);
Router.get('/tours/:slug', getTour);






export default Router;
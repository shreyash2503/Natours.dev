import express from 'express';
import { getAllUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { login, signUp } from '../controllers/authController.js';
//? Routes
const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', login);


Router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

Router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default Router;

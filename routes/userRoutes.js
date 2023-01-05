import express from 'express';
import { getAllUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/userController.js';



//? Routes
const Router = express.Router();

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
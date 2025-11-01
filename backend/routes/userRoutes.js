import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, getAllUsers, updateUserById, deleteUserById } from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/profile', auth, getUserProfile)
userRouter.put('/profile', auth, updateUserProfile)
userRouter.get('/all', getAllUsers)
userRouter.put('/:id', updateUserById)
userRouter.delete('/:id', deleteUserById)

export default userRouter;
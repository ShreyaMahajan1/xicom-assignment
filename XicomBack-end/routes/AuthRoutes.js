import { registerUser } from "../controller/AuthController.js"
import {registerUserPDF} from "../controller/AuthController.js"
import {registerUserImage} from "../controller/AuthController.js"
import express from "express";

const router = express.Router()

router.post('/register', registerUser)
router.post('/registerPDF', registerUserPDF)
router.post('/registerUserImage', registerUserImage)

export default router
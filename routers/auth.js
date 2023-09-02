import { requestBodyValidationMiddleware } from '../middlewares/requestBodyValidation.js';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { User } from '../schemas/mongooseSchemas.js';
import bcrypt from 'bcrypt';
import { config } from '../config.js';
import { jwtValidation, passwordAuthentication } from '../middlewares/authenticate.js';

let { saltRounds } = config.passwordEncryption;

const authRouter = express.Router();

authRouter.use(requestBodyValidationMiddleware);

authRouter.post("/header/get", passwordAuthentication, (req, res) => {
    let { username } = req.body;
    let JWT_SECRET = process.env.JWT_SECRET;

    let token = jsonwebtoken.sign({ username }, JWT_SECRET);
    req.logger.info(`Generating JWT for user: ${username}`)
    res.send({ token });
});

authRouter.post("/header/verify", jwtValidation, (req, res) => {

    res.send({ message: "JWT is Valid" });
});

authRouter.post("/register", async (req, res) => {
    let { username, password } = req.body;

    let user = new User();
    user.username = username;
    user.passwordHash = await bcrypt.hash(password, saltRounds);
    user.subscriptionStatus = 'ACTIVE';
    user.subscriptionTier = 'BASIC'
    user.createdAt = new Date().toISOString();

    let existingUser = await User.findOne({ username });
    if (existingUser) {
        req.logger.info(`User Already Exist: ${username}`)
        res.send({ error: "User already exists" });
        return
    }

    try {
        await user.save();
        req.logger.info(`User Registered Successfully: ${username}`);
        res.send({ message: "Successfully registered" });
    } catch (err) {
        req.logger.error(`Error occurred while saving user to DB for user: ${username} Error: ${err}`);
        res.status(500).send({ error: "Internal Server Error, Please try again" });
    }
});

export { authRouter };
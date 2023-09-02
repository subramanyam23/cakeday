import express from 'express';
import { config } from 'dotenv';
import { authRouter } from './routers/auth.js';
import { birthdayRouter } from './routers/birthday.js';
import mongoose from 'mongoose';
import { attachLogger } from './middlewares/attachLogger.js';
config();
import { startCron } from "./services/cronService.js"

let { PORT, MONGO_PASSWORD } = process.env;

const app = express();
app.use(attachLogger);
app.use(express.json());

app.get("/health", (_, res) => res.send("OK"));

app.use("/auth", authRouter);
app.use("/birthday", birthdayRouter);

app.listen(PORT, async () => {
    await mongoose.connect(process.env.MONGO_CONN_STRING);
    startCron();
    console.log(`Server is running on PORT ${PORT}`)
});
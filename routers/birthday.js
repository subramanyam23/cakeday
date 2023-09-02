import express from "express";
import { jwtValidation } from "../middlewares/authenticate.js";
import { requestBodyValidationMiddleware } from "../middlewares/requestBodyValidation.js";
import { Birthday } from "../schemas/mongooseSchemas.js";
import moment from "moment";

const birthdayRouter = express.Router();
birthdayRouter.use(jwtValidation);
birthdayRouter.use(requestBodyValidationMiddleware);

birthdayRouter.post('/add', async (req, res) => {
    let { date, month, birthYear, recipientName } = req.body;
    let { username } = req.authenticatedUser;
    
    let validDate = moment({ year: birthYear, day: date, month: month - 1 });
    if (!validDate.isValid()) {
        req.logger.error(`Invalid date detected while adding birthday: ${req.body}`);
        res.status(400).send({ message: "Invalid Date" });
        return;
    }

    let existingRecipient = await Birthday.findOne({ recipientName });
    if (existingRecipient) {
        req.logger.info(`Recipient already exists with name [${recipientName}] for user [${username}]`);
        res.send({ message: `Recipient with name [${recipientName}] already exists!` });
        return;
    }

    let birthday = new Birthday();
    Object.assign(birthday, req.body);
    birthday.username = username;
    
    try {
        await birthday.save();
        req.logger.info(`New birthday added for user: ${username}`);
        res.send({ message: "Birthday Added successfully" });
    } catch (err) {
        req.logger.error(`Error occurred while saving birthday to DB for user: ${username} Error: ${err}`);
        res.status(500).send({ error: "Internal Server Error, Please try again" });
    }
});

birthdayRouter.get('/list', async (req, res) => {
    let { username } = req.authenticatedUser;

    let birthdays = [];

    try {
        birthdays = await Birthday.find({ username });
        birthdays = birthdays.map(bd => {
            return {
                id: bd._id,
                recipientName: bd.recipientName,
                birthday: moment({ day: bd.date, month: bd.month - 1, year: bd.birthYear }).format(`DD-MM-YYYY`)
            }
        });
    } catch (err) {
        req.logger.error(`"Error while fetching the birthday list for user: ${username}, Error: ${err}`);
        res.send(`Internal server error, please try again later`);
        return;
    }

    req.logger.info(`Successfully retrieved the birthday list for user: ${username}`);
    res.send({ format: 'DD-MM-YYYY', username, birthdays });
});

birthdayRouter.post('/delete', async (req, res) => {
    let { username } = req.authenticatedUser;
    let { id } = req.body;
    let result;

    try {
        result = await Birthday.deleteOne({ _id: id, username });
    } catch (err) {
        req.logger.error(`Error while deleting the birthday with id: ${id}, Error: ${err}`);
        res.send({ message: "Please enter a valid birthday ID" });
        return;
    }

    if (result.deletedCount > 0) {
        req.logger.info(`Successfully deleted the birthday with id: ${id}`)
        res.send({ message: "Successfully deleted the birthday" });
        return;
    }

    req.logger.info(`No birthday found with id: ${id}`)
    res.send({ message: `No birthday found with id: ${id}` });
    
});

export { birthdayRouter }
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { Birthday, User } from '../schemas/mongooseSchemas.js';
import moment from 'moment';
import { config } from '../config.js';

async function sendReminders() {
    let today = moment().utcOffset('+05:30');
    let birthdays;
    console.log(`${today.toISOString()} Executing cron for sending reminders`);

    try {
        birthdays = await Birthday.find({ date: today.date(), month: today.month() + 1 });
    } catch (err) {
        console.error(`${today.toISOString()} Error while fetching the birthdays for today, Skipping sending reminders!`);
        return;
    }

    console.log(`${today.toISOString()} Count of birthdays today: ${birthdays.length}, Sending Reminders!`);

    for (let birthday of birthdays) {
        let subject = `Birthday Reminder: It's ${birthday.recipientName}'s birthday today!`;
        let message = `Greetings from Cake Day!\n\nIt's ${birthday.recipientName}'s birthday today! Make sure to wish them!\n\nRegards,\nCake Day.`
        await sendEmail(birthday.username, subject, message);
    }
}

async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `Cake Day ${process.env.EMAIL_USERNAME}`,
        to, subject, text
    };

    try {
        let sentMessageInfo = await transporter.sendMail(mailOptions);
        console.log(`${moment().utcOffset('+05:30').toISOString()} Successfully sent email to ${to}`);
    } catch (err) {
        console.log(`${moment().utcOffset('+05:30').toISOString()} Error occurred while sending email to ${to}, Error: ${err}`);
    }
}

function startCron() {
    cron.schedule(config.cron.reminders, sendReminders);
}

export { startCron };
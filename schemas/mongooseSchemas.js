import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    email: String,
    passwordHash: String,
    createdAt: Date,
    subscriptionStatus: String,
    subscriptionTier: String
});

const birthdaySchema = new Schema({
    recipientName: String,
    date: Number,
    month: Number,
    birthYear: Number,
    username: String
})

const User = mongoose.model('users', userSchema);
const Birthday = mongoose.model('birthdays', birthdaySchema);

export { User, Birthday };
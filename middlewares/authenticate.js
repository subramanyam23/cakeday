import { User } from "../schemas/mongooseSchemas.js";
import bcrypt from 'bcrypt';
import jsonwebtoken, { decode } from 'jsonwebtoken';

async function passwordAuthentication(req, res, next) {
    let { username, password } = req.body;

    let auth = await authenticate(username, password);

    if (auth) {
        req.logger.info(`Password Authentication successfull for user: ${username}`);
        next();
        return;
    }

    req.logger.info(`Password Authentication failed for user: ${username}`);
    res.status(401).send({ error: "Invalid username or password" });
}

function jwtValidation(req, res, next) {
    let token = req.get('Authorization');
    let decodedToken;
    try {
        decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        req.logger.info(`Error while verifying JWT: ${token} \n${err}`);
        res.status(401).send({ message: "Invalid JWT" });
        return;
    }

    req.logger.info(`User authenticated successfully with JWT: ${JSON.stringify(decodedToken)}`);
    req.authenticatedUser = decodedToken
    next();
}

async function authenticate(username, password) {
    let existingUser = await User.findOne({ username });
    if (!existingUser) return false;

    return bcrypt.compare(password, existingUser.passwordHash);
}

export { passwordAuthentication, jwtValidation };
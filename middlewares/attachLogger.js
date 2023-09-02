import { Logger } from "../logger/logger.js";

function attachLogger(req, _, next) {
    req.logger = new Logger(req.originalUrl, req.method);
    next();
}

export { attachLogger };
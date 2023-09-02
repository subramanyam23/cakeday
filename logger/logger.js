class Logger {
    apiPath;
    method;
    #loggingLevelLength = 10;

    constructor(apiPath, method) {
        this.apiPath = apiPath;
        this.method = method;
    }

    get #currentTime() {
        return new Date().toISOString();
    }

    info(message) {
        console.info(this.#buildLogMessage('info', message));
    }

    warn(message) {
        console.warn(this.#buildLogMessage('warn', message));
    }

    error(message) {
        console.error(this.#buildLogMessage('error', message));
    }

    #buildLogMessage(loggingLevel, message) {
        return `${this.#currentTime} ${this.#leftAlign(loggingLevel.toUpperCase())}: ${this.method} ${this.apiPath}: ${message}`;
    }

    #leftAlign(text) {
        let spacesToAdd = this.#loggingLevelLength - text.length;
        return text + ' '.repeat(spacesToAdd);
    }
}

export { Logger }
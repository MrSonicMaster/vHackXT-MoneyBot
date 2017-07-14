let chalk = require('chalk');

class Logger {
    constructor(logLevel) {
        this.logLevel = logLevel;
    }

    w(msg) {
        console.log(chalk.yellow('[w]') + ' ' + chalk.white(msg));
    }

    i(msg) {
        console.log(chalk.cyan('[i]') + ' ' + chalk.white(msg));
    }

    e(msg) {
        console.log(chalk.red('[e]') + ' ' + chalk.red(msg));
    }

    s(msg) {
        console.log(chalk.green('[s]') + ' ' + chalk.white(msg));
    }

    d(msg) {
        if (this.logLevel > 0) {
            console.log(chalk.white('[d]') + ' ' + chalk.white(msg));
        }
    }
}

module.exports = new Logger(0);
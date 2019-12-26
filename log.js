const chalk = require('chalk');

let instance = null;

function Log(level= 'INFO') {
    const LEVELS = {
        NONE: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4,
        TRACE: 5,
    };
    const _level = (LEVELS[level] != null) ? LEVELS[level] : LEVELS.INFO;
    this.getLevel = ()=> (_level);
}


Log.prototype.header = function(message) {if (this.getLevel() >= 1) console.log(chalk.bold.blue(message)); };
Log.prototype.error = function(message) {if (this.getLevel() >= 1) console.log(chalk.red(`[ERROR] ${message}`)); };
Log.prototype.warn = function(message) {if (this.getLevel() >= 2) console.log(chalk.yellow(`[WARN] ${message}`)); };
Log.prototype.info = function(message) {if (this.getLevel() >= 3) console.log(chalk.green(`[INFO] ${message}`)); };
Log.prototype.debug = function(message) {if (this.getLevel() >= 4) console.log(chalk.magenta(`[DEBUG] ${message}`)); };
Log.prototype.trace = function(message) {if (this.getLevel() >= 5) console.log(chalk.cyan(`[TRACE] ${message}`)); };

module.exports = (level) => {
    if (instance === null) instance = new Log(level);
    return instance;
};
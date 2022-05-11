const fs = require('fs');
const util = require('util');
const chalk = require('chalk');

const logDir = "./logs";
const monthToNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let startDate = {
    error: new Date(),
    warn: new Date(),
    info: new Date(),
    game: new Date(),
    debug: new Date(),
    all: new Date()
};
let logFile = {
    error: undefined,
    warn: undefined,
    info: undefined,
    game: undefined,
    debug: undefined,
    all: undefined
};
const levelColor = {
    error: chalk.redBright('error') + ":",
    warn: chalk.yellowBright('warn') + ": ",
    info: chalk.white('info') + ": ",
    game: chalk.greenBright('game') + ": ",
    debug: chalk.cyanBright('debug') + ":"
};
const levelSpace = {
    error: "error: ",
    warn: "warn:  ",
    info: "info:  ",
    game: "game:  ",
    debug: "debug: "
};

function getUTCObjectDate(date, format) {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth()+1;
    let day = date.getUTCDate();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = date.getUTCSeconds();
    let millisecond = date.getUTCMilliseconds();

    if (format == true) {
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }
        if (millisecond < 10) {
            millisecond = "0" + millisecond;
        }
        if (millisecond < 100) {
            millisecond = "0" + millisecond;
        }
    }
    return { year, month, day, hour, minute, second, millisecond }
}

function selectLogFile(date, level) {
    const { year, month, day, hour, minute, second, millisecond } = getUTCObjectDate(date, true);
    let monthName = monthToNames[date.getUTCMonth()];
    let yearPath = util.format("%s/%s", logDir, year);
    let monthPath = util.format("%s/%s/%s", logDir, year, monthName);
    let dayPath = util.format("%s/%s/%s/%s", logDir, year, monthName, day);

    if(!fs.existsSync(logDir)) {
        fs.mkdirSync(util.format(logDir),
            (error) => {
                if (error) console.log(error)
            }
        );
    }
    if(!fs.existsSync(yearPath)) {
        fs.mkdirSync(util.format(yearPath),
            (error) => {
                if (error) console.log(error)
            }
        );
    }
    if(!fs.existsSync(monthPath)) {
        fs.mkdirSync(util.format(monthPath),
            (error) => {
                if (error) console.log(error)
            }
        );
    }
    if(!fs.existsSync(dayPath)) {
        fs.mkdirSync(util.format(dayPath),
            (error) => {
                if (error) console.log(error)
            }
        );
    }

    let path = util.format("%s/%s/%s/%s/%s-%s-%s-%s.log", logDir, year, monthName, day, year, month, day, level);
    logFile[level] = fs.openSync(path, "as");
}

function log(data, level) {
    if (logFile[level] == undefined) selectLogFile(startDate[level], level);
    let currentDate = new Date();

    if (currentDate.getUTCDate() !== startDate[level].getUTCDate()) {
        startDate[level] = currentDate;
        fs.closeSync(logFile[level]);
        selectLogFile(startDate[level], level);
    }
    const { year, month, day, hour, minute, second, millisecond } = getUTCObjectDate(currentDate, true)
    // WRITE FILE
    let result = fs.writeSync(logFile[level], removeANSIFormatting(util.format("%s:%s:%s.%s GMT > %s%s\n", hour, minute, second, millisecond, levelSpace[level], data)));
    if(!result || result < 1) {
        console.log(util.format("%s:%s:%s.%s GMT > %s -", hour, minute, second, millisecond, "Error trying to write in " + logFile[level]))
    }
    // WRITE LOG
    console.log(util.format("%s:%s:%s.%s GMT > %s", hour, minute, second, millisecond, levelColor[level]), data)
    saveCombined({hour: hour, minute: minute, second: second, millisecond: millisecond, level: level, data: data})
};

function saveCombined(data) {
    const level = "all"
    if (logFile[level] == undefined) selectLogFile(startDate[level], level);
    let currentDate = new Date();

    if (currentDate.getUTCDate() !== startDate[level].getUTCDate()) {
        startDate[level] = currentDate;
        fs.closeSync(logFile[level]);
        selectLogFile(startDate[level], level);
    }
    const { year, month, day, hour, minute, second, millisecond } = getUTCObjectDate(currentDate, true)
    // WRITE FILE
    let result = fs.writeSync(logFile[level], removeANSIFormatting(util.format("%s:%s:%s.%s GMT > %s%s\n", data.hour, data.minute, data.second, data.millisecond, levelSpace[data.level], data.data)));
    if(!result || result < 1) {
        console.log(util.format("%s:%s:%s.%s GMT > %s -", hour, minute, second, millisecond, "Error trying to write in " + logFile[level]))
    }
}

function removeANSIFormatting(string) {
    return string.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

exports.error = function(data) {
    log(data, "error")
}
exports.warn = function(data) {
    log(data, "warn")
}
exports.info = function(data) {
    log(data, "info")
}
exports.game = function(data) {
    log(data, "game")
}
exports.debug = function(data) {
    log(data, "debug")
}
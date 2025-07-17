// middlewares/logger.js

/**
 * Middleware to log API requests with different colors based on the HTTP method.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
function requestLogger(req, res, next) {
    // ANSI escape codes for colors
    const colors = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",

        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m", // Lighter black

        bgBlack: "\x1b[40m",
        bgRed: "\x1b[41m",
        bgGreen: "\x1b[42m",
        bgYellow: "\x1b[43m",
        bgBlue: "\x1b[44m",
        bgMagenta: "\x1b[45m",
        bgCyan: "\x1b[46m",
        bgWhite: "\x1b[47m",
        bgGray: "\x1b[100m" // Lighter black background
    };

    let methodColor = colors.white; // Default color

    // Determine color based on HTTP method
    switch (req.method.toUpperCase()) {
        case 'GET':
            methodColor = colors.green;
            break;
        case 'POST':
            methodColor = colors.cyan;
            break;
        case 'PUT':
            methodColor = colors.yellow;
            break;
        case 'DELETE':
            methodColor = colors.red;
            break;
        case 'PATCH':
            methodColor = colors.magenta;
            break;
        case 'OPTIONS':
            methodColor = colors.blue;
            break;
        case 'HEAD':
            methodColor = colors.gray; // Using gray for HEAD
            break;
        default:
            methodColor = colors.white; // Fallback for other methods
            break;
    }

    // Log the request details with the chosen color
    console.log(`\n\n${methodColor}--- API Request ---`);
    console.log(`Method:    ${req.method}`);
    console.log(`URL:       ${req.originalUrl}`);
    console.log(`Timestamp: ${new Date().toISOString()}${colors.reset}`); // Reset color at the end
    next();
}

module.exports = requestLogger;

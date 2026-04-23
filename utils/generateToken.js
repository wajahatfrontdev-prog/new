const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            'JWT_SECRET environment variable is not configured. ' +
            'Please add JWT_SECRET to your .env file.'
        );
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = generateToken;

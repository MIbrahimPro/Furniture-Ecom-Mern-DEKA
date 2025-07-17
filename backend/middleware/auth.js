const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

// 1) If a token is present & valid, attach user info (id, username, role) to req.user, otherwise just call next()
async function attachUser(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.token;

    if (token) {
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(payload.id).select('_id username role');
            if (user) req.user = user;
        } catch (err) {
            // invalid token → skip attaching
        }
    }
    next();
}

// 2) Require a valid token & user: if ok, req.user is populated; otherwise 401
async function requireUser(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('_id username role');
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// 3) Require admin role: uses requireUser, then checks req.user.role === 'admin'
function requireAdmin(req, res, next) {
    // first ensure user is authenticated
    requireUser(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin privileges required' });
        }
        next();
    });
}

module.exports = {
    attachUser,
    requireUser,
    requireAdmin,
};

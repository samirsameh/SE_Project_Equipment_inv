const { getUser } = require('../utils/session');

const addUserToLocals = async (req, res, next) => {
    try {
        const user = await getUser(req);
        res.locals.user = user || { role: 'guest' };
        res.locals.isAdmin = user && user.role === 'admin';
        next();
    } catch (error) {
        console.error('Error in user middleware:', error);
        next(error);
    }
};

module.exports = { addUserToLocals }; 
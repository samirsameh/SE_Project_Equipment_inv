const db = require('../connectors/db');
const { getSessionToken } = require('../utils/session');

// Example using Express.js and middleware
function isAdmin (req, res, next) {
    if (req.user.role === 'admin') {
      next(); // Allow access to the route
    } else {
      res.status(403).json({ message: 'Forbidden' }); // Access denied
    }
  }



async function authMiddleware(req, res, next) {

    let result = await db.raw(`select exists (
    select * 
    from information_schema.tables 
    where table_schema = 'Equipments' 
    and table_name = 'users');`);
    let status = result.rows[0].exists;
    if (status == false) {
        return res.send("you need to create database table users in schema Equipments")
    }

    /*result = await db.raw(`select exists (
    select * 
    from information_schema.tables 
    where table_schema = 'Equipments' 
    and table_name = 'User');`);
    status = result.rows[0].exists;
    if (status == false) {
        return res.send("you need to create database table User in schema backendTutorial")
    }*/

    result = await db.raw(`select exists (
    select * 
    from information_schema.tables 
    where table_schema = 'Equipments' 
    and table_name = 'session');`);
    status = result.rows[0].exists;
    if (status == false) {
        return res.send("you need to create database table Session in schema Equipments")
    }

    const sessionToken = getSessionToken(req);
    //console.log(sessionToken)
    if (!sessionToken) {
        console.log("sesison token is null")
       
        return res.status(301).redirect('/');
    }
    // We then get the session of the user from our session map
    // that we set in the signinHandler
    const userSession = await db.select('*').from('Equipments.session').where('token', sessionToken).first();
    if (!userSession) {
        console.log("user session token is not found")
        // If the session token is not present in session map, return an unauthorized error
        return res.status(301).redirect('/');
    }
    // if the session has expired, return an unauthorized error, and delete the 
    // session from our map
    if (new Date() > userSession.expiresAt) {
        console.log("expired session");
        return res.status(301).redirect('/');
    }

    // If all checks have passed, we can consider the user authenticated
    next();
};


module.exports = { authMiddleware }

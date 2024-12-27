const db = require('../connectors/db');

function getSessionToken(req) {

    //console.log("cookie",req.headers.cookie);
    if (!req.headers.cookie) {
        return null
    }
    const cookies = req.headers.cookie.split(';')
        .map(function (cookie) { return cookie.trim() })
        .filter(function (cookie) { return cookie.includes('session_token') })
        .join('');

    const sessionToken = cookies.slice('session_token='.length);
    if (!sessionToken) {
        return null;
    }
    return sessionToken;
}

async function getUser(req) {

    const sessionToken = getSessionToken(req);
    if (!sessionToken) {
        console.log("no session token is found")
        return res.status(301).redirect('/');
    }

    // const user = await db.select('*')
    //   .from('backendTutorial.Session')
    //   .where('token', sessionToken)
    //   .innerJoin('backendTutorial.User', 'backendTutorial.Session.userId', 'backendTutorial.User.id')
    //   .first();

    const user = await db.select('*')
        .from({ s: 'Equipments.session' })
        .where('token', sessionToken)
        .innerJoin('Equipments.users as u', 's.user_id', 'u.user_id')
        .first();


    console.log('user =>', user)
    return user;
}


// Middleware to check admin role
async function authorizeAdmin(req, res, next) {
    try {
      // Get session token
      const sessionToken = getSessionToken(req);
      console.log('Session Token:', sessionToken); // Debug log

      if (!sessionToken) {
        return res.status(401).json({ message: 'No session token found' });
      }

      // Get user session from database
      const userSession = await db.select('*')
        .from('Equipments.session')
        .where('token', sessionToken)
        .first();
      
      console.log('User Session:', userSession); // Debug log

      if (!userSession) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      // Get user details
      const user = await db.raw(`
        SELECT * 
        FROM "Equipments".users 
        WHERE user_id = ? 
        LIMIT 1
    `, [userSession.user_id]);
    
    // Access the first result (if using Knex raw, it returns results inside `rows`)
    const userinfo = user.rows[0];
    

      console.log('User:', userinfo); // Debug log

      if (!userinfo) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (userinfo.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
      }

      // Attach the user to the request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Authorization failed', error: error.message });
    }
  }


  async function authorizeUser(req, res, next) {
    try {
      // Get session token
      const sessionToken = getSessionToken(req);
      console.log('Session Token:', sessionToken); // Debug log

      if (!sessionToken) {
        return res.status(401).json({ message: 'No session token found' });
      }

      // Get user session from database
      const userSession = await db.select('*')
        .from('Equipments.session')
        .where('token', sessionToken)
        .first();
      
      console.log('User Session:', userSession); // Debug log

      if (!userSession) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      // Get user details
      const user = await db.raw(`
        SELECT * 
        FROM "Equipments".users 
        WHERE user_id = ? 
        LIMIT 1
    `, [userSession.user_id]);
    
    let userinfo = user.rows[0];

      console.log('User:', userinfo); // Debug log

      if (!userinfo) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (userinfo.role !== 'user') {
        return res.status(403).json({ message: 'Forbidden: Users only' });
      }

      // Attach the user to the request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Authorization failed', error: error.message });
    }
  }

module.exports = { getSessionToken,getUser,authorizeAdmin,authorizeUser};

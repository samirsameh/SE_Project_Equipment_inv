const { v4 } = require('uuid');
const bcrypt = require('bcrypt')
const db = require('../../connectors/db');
const { getUser } = require('../../utils/session');

function handlePublicBackendApi(app) {

    // Register HTTP endpoint to create new user
    // register API
    app.post('/api/v1/users/new', async function(req, res) {
      try {
          const { email, username, password } = req.body;
  
          // Validate input
          if (!email || !username || !password) {
              return res.status(400).json({ message: 'All fields are required' });
          }
  
          // Check if user already exists
          const userExists = await db('Equipments.users').where('email', email).first();
          if (userExists) {
              return res.status(400).json({ message: 'User already exists' });
          }
  
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
  
          // Insert new user
          const [newUser] = await db('Equipments.users')
              .insert({
                  username,
                  email,
                  password: hashedPassword,
                  role: 'user'
              })
              .returning(['user_id', 'username', 'email']);
  
          return res.status(201).json({
              message: 'User registered successfully',
              user: newUser
          });
      } catch (error) {
          console.error('Error registering user:', error);
          return res.status(500).json({ message: 'Could not register user' });
      }
  });

    // Register HTTP endpoint to create new user
    // login API
    app.post('/api/v1/users/login', async function(req, res) {
      try {
          const { email, password } = req.body;
  
          if (!email) {
              return res.status(400).send('Email is required');
          }
          if (!password) {
              return res.status(400).send('Password is required');
          }
  
          // Find user in database
          const user = await db('Equipments.users')
              .where('email', email)
              .first();
  
          if (!user) {
              return res.status(400).send('User does not exist');
          }
  
          // Compare passwords
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
              return res.status(401).send("Password doesn't match");
          }
  
          // Generate session token
          const token = v4();
          const currentDateTime = new Date();
          const expiresAt = new Date(currentDateTime.getTime() + 18000000); // expire in 5 hours
  
          // Create session record
          await db.raw(`
            INSERT INTO "Equipments".session (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        `, [user.user_id, token, expiresAt]);
        
  
          // Set cookie and send response
          return res
              .cookie("session_token", token, { 
                  expires: expiresAt,
                  httpOnly: true // for security
              })
              .status(200)
              .json({
                  message: 'Login successful',
                  user: {
                      id: user.user_id,
                      email: user.email,
                      role: user.role
                  }
              });
  
      } catch (e) {
          console.error('Login error:', e);
          return res.status(500).send('Could not login user');
      }
  });

// view all equipment



};


module.exports = {handlePublicBackendApi};

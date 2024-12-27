const express = require('express');
const { getSessionToken, getUser, authorizeAdmin , authorizeUser } = require('../../utils/session');
const db = require('../../connectors/db');
const multer = require('multer');
const path = require('path');

function handlePrivateBackendApi(app)  {
  

  // Route to view all users (admins only)
  app.get('/api/v1/users/view', authorizeAdmin, async (req, res) => {
    try {
      // Direct database query within the route handler
      const users = await db.raw(`SELECT *
      FROM "Equipments".users 
      WHERE role = 'user';
      `);
      
      console.log('Users in route:', users.rows); // Debug log
      
      if (!users || users.length === 0) {
          return res.status(404).json({ message: 'No users found ' });
      }
      
      return res.status(200).json(users.rows);
      
  } catch (error) {
      console.error('Route error:', error);
      return res.status(500).json({ 
          message: 'Failed to fetch users', 
          error: error.message 
      });
  }
  });



   // Updating user details
  /* app.put('/api/v1/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, role } = req.body;

    if (!username && !email && !role) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    try {
      const updateFields = {};
      if (username) updateFields.username = username;
      if (email) updateFields.email = email;
      if (role) updateFields.role = role;

      const result = await db('Equipments.users')
        .where({ user_id: userId })
        .update(updateFields)
        .returning(['user_id', 'username', 'email', 'role']);

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully', user: result[0] });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });  */


  // New route for bulk updating user roles
  app.put('/api/v1/users/update', async (req, res) => {
    const updates = req.body; // Expecting an array of { user_id, role }

    try {
        for (const update of updates) {
            const userId = parseInt(update.user_id, 10); // Convert to integer
            const role = update.role;

            if (isNaN(userId) || !role) {
                return res.status(400).json({ message: `Invalid payload: ${JSON.stringify(update)}` });
            }

            await db('Equipments.users')
                .where({ user_id: userId })
                .update({ role });
        }

        res.status(200).json({ message: 'User roles updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





 // Deleting a user
 app.delete('/api/v1/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await db('Equipments.users').where({ user_id: userId }).first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db('Equipments.users').where({ user_id: userId }).del();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




  // Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/images/')); // Save images in the 'public/images' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to the filename
    }
});

const upload = multer({ storage });

// API endpoint
app.post('/api/v1/equipment/new', authorizeAdmin, upload.single('equipment_img'), async (req, res) => {
    const { equipment_name, rating, model_number, quantity, status, location, category_id, supplier_id } = req.body;

    try {
        // Path to the uploaded image
        const equipment_img = req.file ? `/images/${req.file.filename}` : null; // Save the relative path

        const purchase_date = new Date().toISOString();

        // Construct SQL query
        const query = `
            INSERT INTO "Equipments".equipments (equipment_name, equipment_img, rating, model_number, purchase_date, quantity, status, location, category_id, supplier_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *;
        `;

        const result = await db.raw(query, [equipment_name, equipment_img, rating, model_number, purchase_date, quantity, status, location, category_id, supplier_id]);

        const newEquipment = result.rows[0];
        res.status(201).json({ message: 'Equipment created successfully', equipment: newEquipment });
    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// updating equipment details
app.put('/api/v1/equipment/:id', authorizeAdmin, upload.single('equipment_img'), async (req, res) => {
    const { id } = req.params;
    const {
        equipment_name,
        rating,
        model_number,
        quantity,
        status,
        location,
        category_id,
        supplier_id
    } = req.body;

    try {
        // Path to the uploaded image
        const equipment_img = req.file ? `/images/${req.file.filename}` : null; // Save the relative path

        // Construct SQL query
        const query = `
            UPDATE "Equipments".equipments
            SET equipment_name = ?, equipment_img = ?, rating = ?, model_number = ?, quantity = ?, status = ?, location = ?, category_id = ?, supplier_id = ?
            WHERE equipment_id = ?
            RETURNING *;
        `;

        const result = await db.raw(query, [equipment_name, equipment_img, rating, model_number, quantity, status, location, category_id, supplier_id, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.status(200).json({ message: 'Equipment updated successfully', equipment: result.rows[0] });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get("/api/v1/equipment/view/search", async (req, res) => {
    try {
        const { equipmentname } = req.query;  // Note: using req.query instead of req.body for GET requests

        const equipmentResult = await db.raw(`
            SELECT e.*, c.category_name, s.supplier_name
            FROM "Equipments".Equipments e
            LEFT JOIN "Equipments".Categories c ON e.category_id = c.category_id
            LEFT JOIN "Equipments".Suppliers s ON e.supplier_id = s.supplier_id
            WHERE LOWER(e.equipment_name) LIKE LOWER(?);
        `, [`%${equipmentname}%`]);

        res.json({ 
            equipment: equipmentResult.rows 
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve equipment',
            error: error.message 
        });
    }
});

// view all equipment
app.get("/api/v1/equipment/view", async (req, res) => {
    try {
      const { category_name, supplier_name } = req.query; // Use req.query for GET requests
      
      let categoryId = null;
      let supplierId = null;
  
      // Retrieve category ID if category_name is provided
      if (category_name) {
        const categoryResult = await db.raw(
          `SELECT category_id 
           FROM "Equipments".Categories 
           WHERE category_name ILIKE ?`, 
          [`%${category_name}%`]
        );
        categoryId = categoryResult.rows.length > 0 ? categoryResult.rows[0].category_id : null;
      }
  
      // Retrieve supplier ID if supplier_name is provided
      if (supplier_name) {
        const supplierResult = await db.raw(
          `SELECT supplier_id 
           FROM "Equipments".Suppliers 
           WHERE supplier_name ILIKE ?`, 
          [`%${supplier_name}%`]
        );
        supplierId = supplierResult.rows.length > 0 ? supplierResult.rows[0].supplier_id : null;
      }
  
      // Handle case where neither filter is provided
      if (!category_name && !supplier_name) {
        return res.status(400).json({ message: 'Please provide at least one filter: category_name or supplier_name' });
      }
  
      // Fetch equipment based on filters
      const equipmentQuery = `
        SELECT e.*, c.category_name, s.supplier_name
        FROM "Equipments".Equipments e
        LEFT JOIN "Equipments".Categories c ON e.category_id = c.category_id
        LEFT JOIN "Equipments".Suppliers s ON e.supplier_id = s.supplier_id
        WHERE 
          (${categoryId !== null ? 'e.category_id = ?' : '1=1'}) AND
          (${supplierId !== null ? 'e.supplier_id = ?' : '1=1'})
      `;
  
      const equipmentParams = [];
      if (categoryId !== null) equipmentParams.push(categoryId);
      if (supplierId !== null) equipmentParams.push(supplierId);
  
      const equipmentResult = await db.raw(equipmentQuery, equipmentParams);
  
      // Return the equipment data
      res.json({ equipment: equipmentResult.rows });
  
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({ message: 'Failed to retrieve equipment', error: error.message });
    }
  });
  


// delete equipment
app.get('/api/v1/equipment/:id', authorizeAdmin, async function (req, res) {
  const { id } = req.params;

  try {
      const selectQuery = `
          SELECT e.*, c.category_name, s.supplier_name
          FROM "Equipments".Equipments e
          LEFT JOIN "Equipments".Categories c ON e.category_id = c.category_id
          LEFT JOIN "Equipments".Suppliers s ON e.supplier_id = s.supplier_id
          WHERE e.equipment_id = ?;
      `;
      const result = await db.raw(selectQuery, [id]);

      if (!result.rows || result.rows.length === 0) {
          return res.status(404).send('Equipment not found');
      }

      console.log({ equipment: result.rows[0] });
      res.json({ equipment: result.rows[0] }); // Return the first object only
  } catch (error) {
      console.error('Failed to execute query:', error);
      res.status(500).send('Failed to retrieve equipment due to an internal error');
  }
});




app.delete('/api/v1/equipment/:id' ,authorizeAdmin, async function(req , res) {
 
  const { id } = req.params;
  const deleteQuery = `DELETE FROM "Equipments".equipments WHERE equipment_id = ${id} RETURNING *;`;
  const result = await db.raw(deleteQuery);
  try {
  if (result.rowCount === 0) {
      res.status(404).send('Equipment not found');
  } else {
      res.status(200).json({
          message: 'Equipment deleted successfully',
          deletedEquipment: result.rows[0]
      });
  }
} catch (error) {
  console.error('Failed to execute query:', error);
  res.status(500).send('Failed to delete equipment due to an internal error');
} 


});

// view equipment rating
app.get('/api/v1/rating/:id' , async function(req , res) {
  const equipmentId = req.params.id;

  try {
      // Query to get ratings and comments for the specified equipment ID
      const querry = `
          SELECT r.rating_id, r.comment, r.score, u.username
FROM "Equipments".rating r
JOIN "Equipments".users u ON r.user_id = u.user_id
WHERE r.equipment_id = ${equipmentId} ;
      `;
      const result = await db.raw(querry);

      if (result.rows.length > 0) {
          res.status(200).json(result.rows);
      } else {
          res.status(404).json({ message: 'No ratings found for this equipment.' });
      }
  } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({ message: 'Internal server error' });
  }


});

//add rating 
app.post("/api/v1/rating/new",authorizeUser, async (req, res) => {
  const user = await getUser(req);
  const { equipment_id, score, comment } = req.body;

  // Validation
  if (!equipment_id || !score) {
    return res.status(400).json({
      message: "equipment id, and score are required.",
    });
  }

  if (score < 1 || score > 5) {
    return res.status(400).json({
      message: "Rating score must be between 1 and 5.",
    });
  }

  try {
    // Raw SQL query to insert rating
    const result = await db.raw(`
      INSERT INTO "Equipments".Rating (equipment_id, user_id, score, comment)
    VALUES (
        ${equipment_id}, 
        ${user.user_id}, 
        ${score}, 
        E'${comment}'
    )
    RETURNING *
   ` );

    res.status(201).json({
      message: "Rating added successfully",
      rating: result.rows[0], // Access the returned row
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({
      message: "Internal server error",
    });
  }


});

app.post("/api/v1/cart/new",authorizeUser, async (req, res) => {
  const user = await getUser(req);
      
  const { equipmentId, quantity } = req.body; // Extract equipment ID and quantity
  if (!equipmentId || !quantity || typeof equipmentId !== 'number' || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid equipment ID or quantity' });
  }
  const equipmentCheck = await db.raw(`
    SELECT * FROM "Equipments".equipments 
    WHERE equipment_id = ${equipmentId}
`);

if (equipmentCheck.rows.length === 0) {
    return res.status(404).json({ message: 'Equipment not found' });
}

  try {
  
    const insertResult = await db.raw(`
      INSERT INTO "Equipments".cart (
user_id,
          equipment_id,
          quantity
      ) VALUES (
${user.user_id},
          ${equipmentId},
          ${quantity}
      )
      RETURNING *
  `);
   
   res.status(201).json({
    message: 'Equipment added to cart successfully',
    cartItem: insertResult.rows[0]
});
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }


});



// delete equipment from cart
app.delete("/api/v1/cart/delete/:cart_id", async (req, res) => {

  const user = await getUser(req);
    try {
        const { cart_id} = req.params;

        if (!cart_id ) {
            return res.status(400).json({ message: 'cart_id is required' });
        }

        await db.raw(`
            DELETE FROM "Equipments".Cart
            WHERE cart_id = ? AND user_id = ?
        `, [cart_id, user.user_id]);

        res.json({ message: "Equipment removed from cart" });
    } catch (error) {
        console.error('Error deleting equipment from cart:', error);
        res.status(500).json({ message: 'Failed to remove from cart' });
    }
});

// make an order
app.post("/api/v1/order/new", async (req, res) => {
  try {
    const user = await getUser(req);
const user_id = user.user_id;

      if (!user_id) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      // Retrieve user's cart
      const cartItemsResult = await db.raw(`
          SELECT * FROM "Equipments".Cart
          WHERE user_id = ?
      `, [user_id]);

      const cartItems = cartItemsResult.rows;

      if (!cartItems || cartItems.length === 0) {
          return res.status(400).json({ message: 'Cart is empty' });
      }

      // Insert into Orders table and get the order_id
      const orderResult = await db.raw(`
          INSERT INTO "Equipments".Orders (user_id, order_date)
         VALUES (?, CURRENT_TIMESTAMP)
        RETURNING order_id
        `, [user_id]);

      const order_id = orderResult.rows[0].order_id;

      // Process each cart item
      for (const item of cartItems) {
          const equipmentResult = await db.raw(`
              SELECT * FROM "Equipments".Equipments
              WHERE equipment_id = ?
          `, [item.equipment_id]);

          const equipment = equipmentResult.rows[0];

          if (!equipment) {
              return res.status(404).json({ message: `Equipment ${equipment.equipment_name} not found` });
          }

          if (equipment.quantity < item.quantity) {
              return res.status(400).json({ message: `Insufficient stock for equipment ${equipment.equipment_name}` });
          }

          // Insert into EquipmentOrder table
          await db.raw(`
              INSERT INTO "Equipments".EquipmentOrder (order_id, equipment_id, quantity)
              VALUES (?, ?, ?)
          `, [order_id, item.equipment_id, item.quantity]);

          // Update the equipment quantity
          await db.raw(`
              UPDATE "Equipments".Equipments
              SET quantity = quantity - ?
              WHERE equipment_id = ?
          `, [item.quantity, item.equipment_id]);
      }

      // Clear the user's cart
      await db.raw(`
          DELETE FROM "Equipments".Cart
          WHERE user_id = ?
      `, [user_id]);

      res.status(201).json({ message: 'Order created successfully' });
  } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/search', async (req, res) => {
    res.render('search');
});

app.get('/users', authorizeAdmin, async (req, res) => {
    res.render('users');
});

app.get('/equipment', async (req, res) => {
    res.render('equipment');
});

app.get('/cart', async (req, res) => {
    res.render('cart');
});

app.get('/editequipments', authorizeAdmin, async (req, res) => {
    try {
        // Fetch the user data from the database
        const users = await db.select('*').from('Equipments.users'); // Adjust the query as needed

        // Render the editEquipments view and pass the user data
        res.render('editEquipments', { emp: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/v1/cart/update', async (req, res) => {
    const updates = req.body; // Expecting an array of { cartId, equipmentId, quantity }
    const user = await getUser(req);
    const user_id = user.user_id;

    try {
        for (const update of updates) {
            const { cartId, equipmentId, quantity } = update;

            // Update the cart with the new quantity
            await db.raw(`update "Equipments".cart set "quantity" = ${quantity} where "cart_id" = ${cartId} and "user_id" = ${user_id};`);
        }

        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




};



module.exports = {handlePrivateBackendApi};

const db = require('../../connectors/db');
const { getSessionToken , getUser } = require('../../utils/session');


function handlePrivateFrontEndView(app) {

    app.get('/dashboard' , async (req , res) => {
        
        const user = await getUser(req);
        console.log('user info' , user)
        if(user.role == "admin" ){
            return res.render('search');
        }
        // role of customer
        return res.render('search' , {name : user.name});
    });




    app.get('/users' , async (req , res) => {
        let result;
        try{
            result = await db.raw(`select * from "Equipments".users`)
        }catch(error){
            console.log("error message",error.message);
            result = error.message;
        }
        console.log("employee" , result.rows);
        return res.render('Users' , {emp : result.rows});
    });

    // create new Employee page
    app.get('/addEmployee' , (req , res) => {    
        return res.render('add');
    });

     // create new Employee page
     app.get('/search', async (req, res) => {
        res.render('search');
    });



    app.get('/equipments' , (req , res) => {    
        return res.render('equipments');
    });

    app.get('/addequipments' , (req , res) => {    
        return res.render('addequipment');
    });

    app.get('/editequipments' , async(req , res) => {    
    
        return res.render('editEquipments' );
     
    });

    app.get('/deleteequipments' , async(req , res) => {    
    
        return res.render('delete' );
     
    });

    app.get('/rating', async (req, res) => {
        const equipmentId = req.query.equipmentId; // Extract the equipmentId from the query parameters
        console.log("Received equipmentId:", equipmentId);
    
        const query = `
            SELECT r.rating_id, r.comment, r.score, u.username ,r.equipment_id
            FROM "Equipments".rating r
            JOIN "Equipments".users u ON r.user_id = u.user_id
            WHERE r.equipment_id = ${equipmentId};
        `;

        try {
            const result = await db.raw(query);
    
            // Pass the results to the template using the key "emp"
            return res.render('rating', { emp: result.rows , equipmentId } );
        } catch (error) {
            console.error("Error fetching ratings:", error);
            return res.status(500).send("Error fetching ratings");
        }
    });
    
    

    app.get('/cart', async (req, res) => {
        const user = await getUser(req);
        
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const user_id = user.user_id;
    
        try {
            // Retrieve user's cart with equipment details
            const cartItemsResult = await db.raw(`
                SELECT c.*, e.equipment_name, e.model_number, c.quantity ,c.cart_id
                FROM "Equipments".Cart c
                JOIN "Equipments".Equipments e ON c.equipment_id = e.equipment_id
                WHERE c.user_id = ?
            `, [user_id]);
    
            console.log("Cart Items:", cartItemsResult.rows); // Debug log
    
            return res.render('cart', { emp: cartItemsResult.rows });
        } catch (error) {
            console.error('Error fetching cart items:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

}  
  
module.exports = {handlePrivateFrontEndView};
  
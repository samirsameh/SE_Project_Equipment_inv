


INSERT into "Equipments".users (username, email, password, role) VALUES
('admin', 'admin', '$2b$10$Q8b2RmPpCnz5hORI.q2QwuoRoPgRVHhLhIMHQGFimHiK6pbyuNYmC', 'admin'); /*  user admin and password : 123 */


-- Insert Initial Data into Categories
INSERT INTO "Equipments".Categories (category_name) VALUES 
('Mechanical'),
('Electrical'),
('Civil'),
('General');

-- Insert Initial Data into Suppliers
INSERT INTO "Equipments".Suppliers (supplier_name, contact_info, address) VALUES 
('Supplier A', '123-456-7890', '123 Industrial Park'),
('Supplier B', '987-654-3210', '456 Commercial Lane');


INSERT INTO "Equipments".Equipments (equipment_name, equipment_img, rating, model_number, purchase_date, quantity, status, location, category_id, supplier_id) VALUES 
('Lathe Machine', 'https://firstmold.com/wp-content/uploads/2024/08/lathe-featured-image.jpg', 5, 1001, '2023-01-15', 10, 'Available', 'Workshop 1', 1, 1),
('Drill Press', 'https://m.media-amazon.com/images/I/713-kkZmrNL._AC_SL1500_.jpg', 4, 2001, '2022-05-20', 5, 'In Use', 'Workshop 2', 1, 2),
('Multimeter', 'https://m.media-amazon.com/images/I/71XoeLBrd-L._SL1500_.jpg', 5, 3001, '2023-03-12', 15, 'Available', 'Lab 1', 2, 1),
('Welding Machine', 'https://images-cdn.ubuy.com.sa/6666f318de90880465037916-s7-powerful-200amp-arc-stick-welder-for.jpg', 5, 5001, '2022-10-10', 3, 'Available', 'Workshop 3', 1, 2);



INSERT INTO "Equipments".Rating (user_id, equipment_id, comment, score) VALUES 
(1, 2, 'Great performance for precision machining.', 5),
(1, 3, 'Durable but requires frequent maintenance.', 4),
(1, 4, 'Accurate readings, very reliable.', 5);




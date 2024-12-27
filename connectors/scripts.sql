-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "Equipments";

-- Users Table
CREATE TABLE IF NOT EXISTS "Equipments".Users (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS "Equipments".Categories (
    category_id SERIAL PRIMARY KEY,
    category_name TEXT NOT NULL
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS "Equipments".Suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    contact_info TEXT,
    address TEXT
);

-- Equipments Table
CREATE TABLE IF NOT EXISTS "Equipments".Equipments (
    equipment_id SERIAL PRIMARY KEY,
    equipment_name TEXT NOT NULL,
    equipment_img TEXT,
    rating INTEGER NOT NULL DEFAULT 5,
    model_number INTEGER,
    purchase_date DATE,
    quantity INTEGER NOT NULL,
    status TEXT,
    location TEXT,
    category_id INTEGER REFERENCES "Equipments".Categories(category_id),
    supplier_id INTEGER REFERENCES "Equipments".Suppliers(supplier_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS "Equipments".Orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "Equipments".Users(user_id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Table
CREATE TABLE IF NOT EXISTS "Equipments".Cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "Equipments".Users(user_id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES "Equipments".Equipments(equipment_id) ON DELETE CASCADE,
    quantity INTEGER
);

-- Rating Table
CREATE TABLE IF NOT EXISTS "Equipments".Rating (
    rating_id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES "Equipments".Equipments(equipment_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES "Equipments".Users(user_id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EquipmentOrder Table
CREATE TABLE IF NOT EXISTS "Equipments".EquipmentOrder (
    order_id INTEGER REFERENCES "Equipments".Orders(order_id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES "Equipments".Equipments(equipment_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, equipment_id)
);

-- Session Table
CREATE TABLE IF NOT EXISTS "Equipments".Session (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);


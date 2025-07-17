// scripts/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config();
const connectDB = require('../config/db');

const Theme = require('../models/Theme');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const GeneralInfo = require('../models/GeneralInfo');
const Order = require('../models/Order'); // Assuming you have an Order model now

// Helper function to ensure forward slashes for web paths
const toWebPath = (p) => p.replace(/\\/g, '/');

async function seed() {
    await connectDB();

    // Clear out existing data
    await Promise.all([
        Theme.deleteMany(),
        Category.deleteMany(),
        Product.deleteMany(),
        User.deleteMany(),
        GeneralInfo.deleteMany(),
        Order.deleteMany(), // Clear orders as well
    ]);

    // --- Themes ---
    const themesData = [
        {
            name: 'Modern',
            image: toWebPath(path.join('uploads', 'theme', 'modern-theme.jpg')),
            color: '#8d8f8dff',
            description: 'Sleek, minimalist, and contemporary designs',
        },
        {
            name: 'Wooden',
            image: toWebPath(path.join('uploads', 'theme', 'wooden-theme.jpg')),
            color: '#8B4513',
            description: 'Warm, natural, and rustic wooden aesthetics',
        },
        {
            name: 'Industrial',
            image: toWebPath(path.join('uploads', 'theme', 'industrial-theme.jpg')),
            color: '#4B4B4B',
            description: 'Raw, edgy, and functional designs with metal and concrete elements',
        },
        {
            name: 'Scandinavian',
            image: toWebPath(path.join('uploads', 'theme', 'scandinavian-theme.jpg')),
            color: '#538787',
            description: 'Simple, functional, and bright designs with natural materials',
        },
    ];
    const themes = await Theme.insertMany(themesData);
    console.log(`Inserted ${themes.length} themes`);

    // --- Categories ---
    const categoriesData = [
        {
            name: 'Lightings',
            icon: toWebPath(path.join('uploads', 'category', 'lightings-icon.png')),
            description: 'Illuminating solutions for every space',
        },
        {
            name: 'Chairs',
            icon: toWebPath(path.join('uploads', 'category', 'chairs-icon.png')),
            image: toWebPath(path.join('uploads', 'category', 'chairs.png')),
            description: 'Comfortable and stylish seating options',
        },
        {
            name: 'Coffee Tables',
            icon: toWebPath(path.join('uploads', 'category', 'coffee-tables-icon.png')),
            description: 'Central pieces for your living room',
        },
        {
            name: 'Tables',
            icon: toWebPath(path.join('uploads', 'category', 'tables-icon.png')),
            description: 'Versatile surfaces for dining, working, and more',
        },
        {
            name: 'Sofas',
            icon: toWebPath(path.join('uploads', 'category', 'sofas-icon.png')),
            description: 'Cozy and spacious seating for relaxation',
        },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${categories.length} categories`);

    // --- Products ---
const productsData = [
    // Lightings (4 products, varying themes)
    {
        name: 'Modern Pendant Lamp',
        description: 'Sleek geometric pendant lamp for modern interiors.',
        price: 89.99,
        images: [toWebPath(path.join('uploads', 'products', 'p1.png'))],
        category: categories.find(c => c.name === 'Lightings')._id,
        theme: themes.find(t => t.name === 'Modern')._id,
        brand: 'Luminosity',
        color: '#000000', // Matte Black
        dimensions: { width: 30, height: 40, depth: 30 },
        weight: 1500,
    },
    {
        name: 'Industrial Wall Sconce',
        description: 'Rustic metal wall sconce with exposed bulb.',
        price: 65.00,
        images: [toWebPath(path.join('uploads', 'products', 'p2.png'))],
        category: categories.find(c => c.name === 'Lightings')._id,
        theme: themes.find(t => t.name === 'Industrial')._id,
        brand: 'Urban Glow',
        color: '#CD7F32', // Bronze
        dimensions: { width: 15, height: 25, depth: 20 },
        weight: 800,
    },
    {
        name: 'Scandinavian Floor Lamp',
        description: 'Minimalist wooden floor lamp with a fabric shade.',
        price: 120.00,
        images: [toWebPath(path.join('uploads', 'products', 'p3.png'))],
        category: categories.find(c => c.name === 'Lightings')._id,
        theme: themes.find(t => t.name === 'Scandinavian')._id,
        brand: 'Nordic Light',
        color: '#D4AF37', // Light Wood (Approximation, often a light yellowish-brown)
        dimensions: { width: 40, height: 150, depth: 40 },
        weight: 3500,
    },
    {
        name: 'Wooden Table Lamp',
        description: 'Hand-carved wooden base table lamp with linen shade.',
        price: 75.50,
        images: [toWebPath(path.join('uploads', 'products', 'p4.png'))],
        category: categories.find(c => c.name === 'Lightings')._id,
        theme: themes.find(t => t.name === 'Wooden')._id,
        brand: 'Forest Glow',
        color: '#A88756', // Natural Wood (Approximation, a medium brown)
        dimensions: { width: 25, height: 35, depth: 25 },
        weight: 1200,
    },

    // Chairs (4 products, varying themes)
    {
        name: 'Modern Dining Chair',
        description: 'Ergonomic dining chair with a minimalist design.',
        price: 99.00,
        images: [toWebPath(path.join('uploads', 'products', 'p5.png'))],
        category: categories.find(c => c.name === 'Chairs')._id,
        theme: themes.find(t => t.name === 'Modern')._id,
        brand: 'ComfortZone',
        color: '#808080', // Grey
        dimensions: { width: 50, height: 85, depth: 55 },
        weight: 6000,
    },
    {
        name: 'Industrial Bar Stool',
        description: 'Adjustable height bar stool with metal frame and wooden seat.',
        price: 75.00,
        images: [toWebPath(path.join('uploads', 'products', 'p6.png')),toWebPath(path.join('uploads', 'products', 'p3.png')),toWebPath(path.join('uploads', 'products', 'p5.png')),toWebPath(path.join('uploads', 'products', 'p2.png'))],
        category: categories.find(c => c.name === 'Chairs')._id,
        theme: themes.find(t => t.name === 'Industrial')._id,
        brand: 'Factory Furnish',
        color: '#36454F', // Dark Metal (Charcoal grey/almost black)
        dimensions: { width: 40, height: 75, depth: 40 },
        weight: 5000,
    },
    {
        name: 'Scandinavian Armchair',
        description: 'Cozy armchair with clean lines and a comfortable cushion.',
        price: 249.99,
        images: [toWebPath(path.join('uploads', 'products', 'p7.png'))],
        category: categories.find(c => c.name === 'Chairs')._id,
        theme: themes.find(t => t.name === 'Scandinavian')._id,
        brand: 'Hygge Home',
        color: '#D3D3D3', // Light Grey
        dimensions: { width: 70, height: 80, depth: 75 },
        weight: 15000,
    },
    {
        name: 'Wooden Rocking Chair',
        description: 'Classic wooden rocking chair for relaxation.',
        price: 180.00,
        images: [toWebPath(path.join('uploads', 'products', 'p8.png'))],
        category: categories.find(c => c.name === 'Chairs')._id,
        theme: themes.find(t => t.name === 'Wooden')._id,
        brand: 'Timber Tales',
        color: '#A52A2A', // Cherry Wood (Approximation, reddish-brown)
        dimensions: { width: 60, height: 90, depth: 95 },
        weight: 10000,
    },

    // Coffee Tables (4 products, varying themes)
    {
        name: 'Modern Glass Coffee Table',
        description: 'Sleek glass top coffee table with chrome legs.',
        price: 150.00,
        images: [toWebPath(path.join('uploads', 'products', 'p9.png'))],
        category: categories.find(c => c.name === 'Coffee Tables')._id,
        theme: themes.find(t => t.name === 'Modern')._id,
        brand: 'Chic Living',
        color: '#FFFFFF', // Clear Glass (Represented as white for transparency)
        dimensions: { width: 100, height: 40, depth: 60 },
        weight: 20000,
    },
    {
        name: 'Industrial Coffee Table',
        description: 'Reclaimed wood and steel coffee table with rustic appeal.',
        price: 220.00,
        images: [toWebPath(path.join('uploads', 'products', 'p10.png')),toWebPath(path.join('uploads', 'products', 'p13.png')),toWebPath(path.join('uploads', 'products', 'p15.png')),toWebPath(path.join('uploads', 'products', 'p12.png'))],
        category: categories.find(c => c.name === 'Coffee Tables')._id,
        theme: themes.find(t => t.name === 'Industrial')._id,
        brand: 'Ironwood Designs',
        color: '#5C4033', // Dark Wood/Black Metal (Approximation, a very dark brown)
        dimensions: { width: 110, height: 45, depth: 70 },
        weight: 35000,
    },
    {
        name: 'Scandinavian Coffee Table',
        description: 'Simple and elegant coffee table with tapered legs.',
        price: 130.00,
        images: [toWebPath(path.join('uploads', 'products', 'p11.png'))],
        category: categories.find(c => c.name === 'Coffee Tables')._id,
        theme: themes.find(t => t.name === 'Scandinavian')._id,
        brand: 'Fjord Furniture',
        color: '#F5F5DC', // White/Light Wood (Approximation, a creamy white)
        dimensions: { width: 90, height: 40, depth: 50 },
        weight: 12000,
    },
    {
        name: 'Wooden Storage Coffee Table',
        description: 'Solid wood coffee table with hidden storage compartment.',
        price: 250.00,
        images: [toWebPath(path.join('uploads', 'products', 'p12.png'))],
        category: categories.find(c => c.name === 'Coffee Tables')._id,
        theme: themes.find(t => t.name === 'Wooden')._id,
        brand: 'Rustic Reclaims',
        color: '#A0522D', // Oak (Approximation, a medium reddish-brown)
        dimensions: { width: 120, height: 45, depth: 60 },
        weight: 40000,
    },

    // Tables (4 products, varying themes)
    {
        name: 'Modern Extendable Dining Table',
        description: 'Sleek dining table that extends for more guests.',
        price: 450.00,
        images: [toWebPath(path.join('uploads', 'products', 'p13.png'))],
        category: categories.find(c => c.name === 'Tables')._id,
        theme: themes.find(t => t.name === 'Modern')._id,
        brand: 'Urban Elegance',
        color: '#F8F8F8', // Gloss White (Approximation, off-white)
        dimensions: { width: 140, height: 75, depth: 80 },
        weight: 50000,
    },
    {
        name: 'Industrial Console Table',
        description: 'Narrow console table with a metal frame and raw wood top.',
        price: 180.00,
        images: [toWebPath(path.join('uploads', 'products', 'p14.png'))],
        category: categories.find(c => c.name === 'Tables')._id,
        theme: themes.find(t => t.name === 'Industrial')._id,
        brand: 'Forge & Wood',
        color: '#2F4F4F', // Black/Natural Wood (Dark Slate Gray for black metal, with wood tones implicit)
        dimensions: { width: 110, height: 80, depth: 30 },
        weight: 25000,
    },
    {
        name: 'Scandinavian Study Desk',
        description: 'Minimalist study desk with a simple drawer.',
        price: 200.00,
        images: [toWebPath(path.join('uploads', 'products', 'p15.png'))],
        category: categories.find(c => c.name === 'Tables')._id,
        theme: themes.find(t => t.name === 'Scandinavian')._id,
        brand: 'WorkFlow',
        color: '#F5F5DC', // White/Light Wood (Approximation, a creamy white)
        dimensions: { width: 120, height: 75, depth: 60 },
        weight: 22000,
    },
    {
        name: 'Wooden Side Table',
        description: 'Solid wood side table, perfect for small spaces.',
        price: 85.00,
        images: [toWebPath(path.join('uploads', 'products', 'p16.png'))],
        category: categories.find(c => c.name === 'Tables')._id,
        theme: themes.find(t => t.name === 'Wooden')._id,
        brand: 'Timber Accents',
        color: '#CD853F', // Pine (Approximation, a light brownish-yellow)
        dimensions: { width: 40, height: 50, depth: 40 },
        weight: 7000,
    },

    // Sofas (4 products, varying themes)
    {
        name: 'Modern Sectional Sofa',
        description: 'Large, comfortable sectional sofa for contemporary living rooms.',
        price: 1200.00,
        images: [toWebPath(path.join('uploads', 'products', 'p17.png')),toWebPath(path.join('uploads', 'products', 'p13.png')),toWebPath(path.join('uploads', 'products', 'p15.png')),toWebPath(path.join('uploads', 'products', 'p12.png'))],
        category: categories.find(c => c.name === 'Sofas')._id,
        theme: themes.find(t => t.name === 'Modern')._id,
        brand: 'Lounge Lux',
        color: '#36454F', // Charcoal Grey
        dimensions: { width: 280, height: 80, depth: 160 },
        weight: 80000,
    },
    {
        name: 'Industrial Leather Sofa',
        description: 'Distressed leather sofa with a metal frame, robust and stylish.',
        price: 950.00,
        images: [toWebPath(path.join('uploads', 'products', 'p18.png')),toWebPath(path.join('uploads', 'products', 'p13.png')),toWebPath(path.join('uploads', 'products', 'p15.png')),toWebPath(path.join('uploads', 'products', 'p12.png'))],
        category: categories.find(c => c.name === 'Sofas')._id,
        theme: themes.find(t => t.name === 'Industrial')._id,
        brand: 'Rugged Comfort',
        color: '#8B4513', // Cognac (Saddle Brown approximation)
        dimensions: { width: 220, height: 75, depth: 90 },
        weight: 70000,
    },
    {
        name: 'Scandinavian 3-Seater Sofa',
        description: 'Light and airy 3-seater sofa with wooden legs.',
        price: 800.00,
        images: [toWebPath(path.join('uploads', 'products', 'p19.png')),toWebPath(path.join('uploads', 'products', 'p13.png')),toWebPath(path.join('uploads', 'products', 'p15.png')),toWebPath(path.join('uploads', 'products', 'p12.png'))],
        category: categories.find(c => c.name === 'Sofas')._id,
        theme: themes.find(t => t.name === 'Scandinavian')._id,
        brand: 'Pure Living',
        color: '#F5F5DC', // Beige (Approximation, a light creamy color)
        dimensions: { width: 200, height: 70, depth: 85 },
        weight: 60000,
    },
    {
        name: 'Wooden Frame Sofa',
        description: 'Comfortable sofa with a visible solid wood frame and plush cushions.',
        price: 750.00,
        images: [toWebPath(path.join('uploads', 'products', 'p20.png'))],
        category: categories.find(c => c.name === 'Sofas')._id,
        theme: themes.find(t => t.name === 'Wooden')._id,
        brand: 'Nature\'s Rest',
        color: '#228B22', // Forest Green
        dimensions: { width: 210, height: 80, depth: 90 },
        weight: 65000,
    },
];
    const products = await Product.insertMany(productsData);
    console.log(`Inserted ${products.length} products`);

    // --- Users ---
    const usersData = [
        {
            username: 'admin',
            email: 'admin@admin.com',
            password: bcrypt.hashSync('pswd1', 10),
            addresses: [
                {
                    title: 'Office',
                    street: '10 Admin Way',
                    city: 'Central City',
                    state: 'CA',
                    zip: '90210',
                    country: 'USA',
                },
            ],
            role: 'admin',
        },
        {
            username: 'johndoe',
            email: 'john@example.com',
            password: bcrypt.hashSync('UserPass123', 10),
            addresses: [
                {
                    title: 'Home',
                    street: '123 Main St',
                    city: 'Metropolis',
                    state: 'NY',
                    zip: '10001',
                    country: 'USA',
                },
            ],
            role: 'user',
        },
        {
            username: 'janedoe',
            email: 'jane@example.com',
            password: bcrypt.hashSync('UserPass123', 10),
            addresses: [
                {
                    title: 'Apartment',
                    street: '456 Oak Ave',
                    city: 'Gotham',
                    state: 'NJ',
                    zip: '07001',
                    country: 'USA',
                },
            ],
            role: 'user',
        },
        {
            username: 'peterparker',
            email: 'peter@example.com',
            password: bcrypt.hashSync('UserPass123', 10),
            addresses: [
                {
                    title: 'Home',
                    street: '789 Spider Lane',
                    city: 'Queens',
                    state: 'NY',
                    zip: '11101',
                    country: 'USA',
                },
            ],
            role: 'user',
        },
        {
            username: 'maryjane',
            email: 'mary@example.com',
            password: bcrypt.hashSync('UserPass123', 10),
            addresses: [
                {
                    title: 'Studio',
                    street: '101 Web St',
                    city: 'Brooklyn',
                    state: 'NY',
                    zip: '11201',
                    country: 'USA',
                },
            ],
            role: 'user',
        },
    ];
    const users = await User.insertMany(usersData);
    console.log(`Inserted ${users.length} users`);

    // --- General Info ---
    const infoData = {
        contactEmail: 'support@example.com',
        contactPhone: '+1-800-123-4567',
        address: {
            title: 'Head Office',
            street: '123 Main St',
            city: 'Metropolis',
            state: 'NY',
            zip: '10001',
            country: 'USA',
        },
    };
    const info = await GeneralInfo.create(infoData);
    console.log(`Inserted GeneralInfo: ${info._id}`);

    // --- Orders ---
    const ordersData = [
        {
            user: users.find(u => u.username === 'johndoe')._id,
            items: [
                {
                    product: products.find(p => p.name === 'Modern Pendant Lamp')._id,
                    name: 'Modern Pendant Lamp',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 2,
                    price: 89.99,
                },
                {
                    // FIX: Changed 'Scandinavian Dining Table' to 'Scandinavian Study Desk'
                    product: products.find(p => p.name === 'Scandinavian Study Desk')._id,
                    name: 'Scandinavian Study Desk',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 1,
                    price: 200.00,
                },
            ],
            shippingAddress: {
                title: 'Home',
                street: '123 Main St',
                city: 'Metropolis',
                state: 'NY',
                zip: '10001',
                country: 'USA',
            },
            paymentMethod: 'card',
            status: 'delivered',
            totalPrice: 2 * 89.99 + 1 * 200.00,
        },
        {
            user: users.find(u => u.username === 'janedoe')._id,
            items: [
                {
                    product: products.find(p => p.name === 'Industrial Bar Stool')._id,
                    name: 'Industrial Bar Stool',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 3,
                    price: 75.00,
                },
            ],
            shippingAddress: {
                title: 'Apartment',
                street: '456 Oak Ave',
                city: 'Gotham',
                state: 'NJ',
                zip: '07001',
                country: 'USA',
            },
            paymentMethod: 'paypal',
            status: 'shipped',
            totalPrice: 3 * 75.00,
        },
        {
            user: users.find(u => u.username === 'peterparker')._id,
            items: [
                {
                    product: products.find(p => p.name === 'Modern Sectional Sofa')._id,
                    name: 'Modern Sectional Sofa',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 1,
                    price: 1200.00,
                },
                {
                    product: products.find(p => p.name === 'Modern Glass Coffee Table')._id,
                    name: 'Modern Glass Coffee Table',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 1,
                    price: 150.00,
                },
            ],
            shippingAddress: {
                title: 'Home',
                street: '789 Spider Lane',
                city: 'Queens',
                state: 'NY',
                zip: '11101',
                country: 'USA',
            },
            paymentMethod: 'cod',
            status: 'pending',
            totalPrice: 1 * 1200.00 + 1 * 150.00,
        },
        {
            user: users.find(u => u.username === 'maryjane')._id,
            items: [
                {
                    product: products.find(p => p.name === 'Scandinavian Floor Lamp')._id,
                    name: 'Scandinavian Floor Lamp',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 1,
                    price: 120.00,
                },
                {
                    product: products.find(p => p.name === 'Scandinavian Armchair')._id,
                    name: 'Scandinavian Armchair',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 2,
                    price: 249.99,
                },
            ],
            shippingAddress: {
                title: 'Studio',
                street: '101 Web St',
                city: 'Brooklyn',
                state: 'NY',
                zip: '11201',
                country: 'USA',
            },
            paymentMethod: 'card',
            status: 'processing',
            totalPrice: 1 * 120.00 + 2 * 249.99,
        },
        {
            user: users.find(u => u.username === 'johndoe')._id,
            items: [
                {
                    product: products.find(p => p.name === 'Wooden Rocking Chair')._id,
                    name: 'Wooden Rocking Chair',
                    image: toWebPath(path.join('uploads', 'orders', 'p1.png')),
                    quantity: 1,
                    price: 180.00,
                },
            ],
            shippingAddress: {
                title: 'Home',
                street: '123 Main St',
                city: 'Metropolis',
                state: 'NY',
                zip: '10001',
                country: 'USA',
            },
            paymentMethod: 'paypal',
            status: 'delivered',
            totalPrice: 1 * 180.00,
        },
    ];

    const orders = await Order.insertMany(ordersData);
    console.log(`Inserted ${orders.length} orders`);

    console.log('✅ Database seeding complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
});
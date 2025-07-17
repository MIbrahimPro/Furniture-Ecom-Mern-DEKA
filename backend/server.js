
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
var cors = require('cors')

const requestLogger = require("./middleware/logger");

const themeRoutes = require('./routes/themeRoutes');
const menuRoutes = require('./routes/menuRoutes');
const generalInfoRoutes = require('./routes/generalInfoRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const adminThemeRoutes = require('./routes/admin/themeRoutes');
const adminCategoryRoutes = require('./routes/admin/categoryRoutes');
const adminProductRoutes = require('./routes/admin/productRoutes');
const adminOrderRoutes = require('./routes/admin/orderRoutes');
const adminInfoRoutes = require('./routes/admin/generalInfoRoutes');






dotenv.config();
connectDB();

const app = express();
app.use(requestLogger);
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// TODO: Mount your routes
app.use('/api/themes', themeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/info', generalInfoRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/themes', adminThemeRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/info', adminInfoRoutes);






app.get('*', (req, res) => {
    res.send('Hello from the backend!');
});
app.all('*', (req, res) => {
    res.send('wrong api');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});






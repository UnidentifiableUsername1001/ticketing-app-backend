require('dotenv').config();
const express = require('express');
const cors = require('cors');
const portfinder = require("portfinder");
const connectToDataBase = require('./config/db')
const app = express();
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

app.use(cors());
portfinder.basePort = process.env.PORT || 3000;

// connect to MongoDB
connectToDataBase().then(() => {
    console.log('Connected to DB');
}).catch((e) => console.error('Failed to connect to DB', e));

app.use(express.json());

// Route files
app.use('/api/auth', authRoutes);

app.use('/api/ticket', ticketRoutes);

app.use('/api/users', userRoutes);

app.use('/api/department', departmentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

portfinder.getPort((err, port) => {
    if (err) {
        console.error("Error finding available port: ", err);
    }

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});


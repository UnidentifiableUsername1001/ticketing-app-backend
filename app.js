import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import portfinder from 'portfinder';
import { connectToDataBase } from './config/db.js';
import { router as authRoutes } from './routes/authRoutes.js';
import { router as ticketRoutes } from './routes/ticketRoutes.js';
import { router as userRoutes } from './routes/userRoutes.js';
import { router as departmentRoutes } from './routes/departmentRoutes.js';
import { router as companyRoutes } from './routes/companyRoutes.js';

dotenv.config();
const app = express();

app.use(cors({
    origin: [
        'https://wisetickets.co.uk',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
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

app.use('/api/new', companyRoutes);

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


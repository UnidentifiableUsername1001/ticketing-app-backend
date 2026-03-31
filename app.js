require('dotenv').config();
const express = require('express');
const cors = require('cors');
const portfinder = require("portfinder");
const connectToDataBase = require('./models/db')
const app = express();
app.use("*", cors());
portfinder.basePort = process.env.PORT || 3000;

// connect to MongoDB
connectToDataBase().then(() => {
    console.log('Connect to DB');
}).catch((e) => console.error('Failed to connect to DB', e));

app.use(express.json());

// Route files

// Test route
app.get("/api/test", (req, res) => {
    res.send("Inside the server");
})

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


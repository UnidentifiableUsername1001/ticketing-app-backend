require('dotenv').config();
const mongoose = require('mongoose');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

let url = `${process.env.MONGO_URL}`;

async function connectToDataBase() {

    const client = await mongoose.connect(`${url}`);

    return client;

}

module.exports = connectToDataBase;
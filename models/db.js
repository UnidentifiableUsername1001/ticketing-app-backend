require('dotenv').config();
const mongoose = require('mongoose');

let url = `${process.env.MONGO_URL}`;

async function connectToDataBase() {

    const client = await mongoose.connect(`${url}`);

    return client;

}

module.exports = connectToDataBase;
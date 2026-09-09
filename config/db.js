import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(["1.1.1.1", "8.8.8.8"])
dotenv.config();

async function connectToDataBase() {

    const url = process.env.MONGO_URL
    const client = await mongoose.connect(`${url}`);

    return client;

}

export {
    connectToDataBase
};
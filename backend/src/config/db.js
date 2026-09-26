import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    if (env.isProduction) {
      throw new Error(`MongoDB connection failed in production: ${error.message}`);
    }

    console.warn(`MongoDB unavailable (${error.message}). Starting in-memory database for local development.`);
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memory = await MongoMemoryServer.create();
    await mongoose.connect(memory.getUri());
    console.log('In-memory MongoDB ready');
  }
}

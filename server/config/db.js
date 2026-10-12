const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose.
 * If local MongoDB is not running, seamlessly enables in-memory fallback
 * so the application can be tested immediately out of the box.
 */
const connectDB = async () => {
  const isServerless = Boolean(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const mongoUri = process.env.MONGO_URI;

  // In serverless without Atlas URI, immediately activate in-memory mode without delay
  if (isServerless && (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
    mongoose.set('bufferCommands', false);
    console.log(`⚡ Serverless Mode: Seamless In-Memory Database Mode is ACTIVE with preloaded sample products & demo accounts!`);
    return false;
  }

  try {
    const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/shopease';
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2000, // Fast 2s timeout for immediate fallback
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    // Disable Mongoose command buffering so queries fail fast instead of hanging 10 seconds
    mongoose.set('bufferCommands', false);

    console.log(`⚠️  Local MongoDB not running on 127.0.0.1:27017 (${error.message})`);
    console.log(`⚡ Seamless In-Memory Database Mode is ACTIVE with preloaded sample products & demo accounts!`);
    console.log(`   (When you connect a local MongoDB instance or MongoDB Atlas in .env, it will automatically use real MongoDB)`);
    return false;
  }
};

module.exports = connectDB;

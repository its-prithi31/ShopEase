const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const sampleProducts = require('./data/sampleProducts');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
  try {
    const isConnected = await connectDB();

    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.log('--------------------------------------------------');
      console.log('ℹ️  MongoDB is currently offline.');
      console.log('⚡ The application is running in Seamless In-Memory Mode.');
      console.log('   All sample products and demo accounts are ALREADY');
      console.log('   preloaded in memory. No database seeding is required!');
      console.log('--------------------------------------------------');
      console.log('👤 Admin Credentials:');
      console.log('   Email:    admin@shopease.com');
      console.log('   Password: admin123');
      console.log('👤 Customer Credentials:');
      console.log('   Email:    user@shopease.com');
      console.log('   Password: user123');
      console.log(`📦 Sample products preloaded: ${sampleProducts.length}`);
      console.log('--------------------------------------------------');
      console.log('💡 To use permanent MongoDB storage:');
      console.log('   1. Start local MongoDB (e.g. run "mongod"), OR');
      console.log('   2. Set a free MongoDB Atlas URI in server/.env:');
      console.log('      MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/shopease');
      console.log('--------------------------------------------------');
      process.exit(0);
    }

    // Clear existing data in real MongoDB
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create default Admin and Customer accounts
    await User.create({
      name: 'Admin User',
      email: 'admin@shopease.com',
      password: 'admin123',
      isAdmin: true,
    });

    await User.create({
      name: 'John Doe',
      email: 'user@shopease.com',
      password: 'user123',
      isAdmin: false,
    });

    // Insert sample products
    await Product.insertMany(sampleProducts);

    console.log('--------------------------------------------------');
    console.log('🎉 Sample data imported successfully into MongoDB!');
    console.log('--------------------------------------------------');
    console.log('👤 Admin Credentials:');
    console.log('   Email:    admin@shopease.com');
    console.log('   Password: admin123');
    console.log('👤 Customer Credentials:');
    console.log('   Email:    user@shopease.com');
    console.log('   Password: user123');
    console.log(`📦 Products added: ${sampleProducts.length}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const isConnected = await connectDB();

    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.log('ℹ️  MongoDB is offline. Nothing to destroy.');
      process.exit(0);
    }

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️  All MongoDB data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Destroy Data Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

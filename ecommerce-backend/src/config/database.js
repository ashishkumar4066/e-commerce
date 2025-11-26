const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Create in-memory MongoDB instance
    console.log('Starting in-memory MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect mongoose
    await mongoose.connect(uri);

    console.log('✅ MongoDB Memory Server started successfully');
    console.log(`📦 Database URI: ${uri}`);
    console.log('💾 Data stored in memory (will reset on restart)');

    return mongoServer;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB Memory Server stopped');
    }
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
};

module.exports = { connectDB, disconnectDB };

import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number; // 0 = disconnected, 1 = connected
};

const connection: ConnectionObject = {};

// DB connection
export async function dbConnect(): Promise<void> {
  // If already connected, skip re-connection
  if (connection.isConnected) {
    console.log('MongoDB is already connected. Connection status: ', connection.isConnected);
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
    connection.isConnected = db.connections[0].readyState;

    console.log('MongoDB connected successfully. Connection status: ', connection.isConnected);
  } catch (err) {
    console.error('MongoDB connection failed. ERROR:', err);
    process.exit(1);
  }
}

// Disconnect DB connection
export async function dbDisconnect(): Promise<void> {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;

    console.log('MongoDB disconnected successfully. Connection status: ', connection.isConnected);
  }
}

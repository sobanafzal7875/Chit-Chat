import mongoose from 'mongoose';

class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const mongoUri =
        process.env.MONGODB_URI ||
        process.env.MONGODB_URL ||
        process.env.DATABASE_URL ||
        process.env.MONGO_URI ||
        (process.env.NODE_ENV !== 'production' ? 'mongodb://localhost:27017/chit-chat' : undefined);

      if (!mongoUri) {
        throw new Error(
          'MongoDB connection string is missing. Set MONGODB_URI, MONGODB_URL, DATABASE_URL, or legacy MONGO_URI.'
        );
      }

      await mongoose.connect(mongoUri, {
        // Modern Mongoose doesn't need these options
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ MongoDB disconnected');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default DatabaseService;
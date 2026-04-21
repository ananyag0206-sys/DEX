import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Monitoring from './models/modelsMonitoring.js';

dotenv.config();

async function cleanupDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dex');
    console.log('✅ Connected to MongoDB');

    // Find and fix invalid records
    const invalidRecords = await Monitoring.find({
      $or: [
        { userId: { $exists: false } },
        { dbType: { $exists: false } },
        { analytics: { $elemMatch: { time: { $type: 'string' } } } }
      ]
    });

    console.log(`Found ${invalidRecords.length} invalid records to cleanup`);

    for (const record of invalidRecords) {
      console.log(`Cleaning up record: ${record.name || record._id}`);
      
      // Fix missing required fields
      if (!record.userId) {
        record.userId = 'unknown-user';
      }
      if (!record.dbType) {
        record.dbType = 'mongo';
      }
      
      // Fix string dates in analytics
      if (record.analytics && Array.isArray(record.analytics)) {
        record.analytics = record.analytics.map(analytic => ({
          ...analytic,
          time: typeof analytic.time === 'string' ? analytic.time : new Date(analytic.time).toLocaleString()
        }));
      }

      await record.save();
      console.log(`✅ Fixed record: ${record.name || record._id}`);
    }

    console.log('🎉 Database cleanup completed!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupDatabase();
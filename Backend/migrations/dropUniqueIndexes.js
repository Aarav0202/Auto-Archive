/**
 * Migration Script: Drop unique indexes on chassyNumber from vehicles collection
 * 
 * This script removes the unique constraint on chassyNumber that was causing
 * E11000 duplicate key errors when creating multiple vehicles with null chassyNumber
 * 
 * Run this before restarting your application:
 * node migrations/dropUniqueIndexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

async function dropIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop the problematic unique index on chassyNumber if it exists
    try {
      await db.collection('vehicles').dropIndex('chassyNumber_1');
      console.log('✓ Dropped unique index on chassyNumber');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('✓ chassyNumber_1 index does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Verify remaining indexes
    const collection = db.collection('vehicles');
    const indexes = await collection.listIndexes().toArray();
    console.log('\n✓ Remaining indexes on vehicles collection:');
    indexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.name)}`);
    });

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

dropIndexes();

// scripts/debug-migration.js
console.log('=== DEBUG SCRIPT STARTING ===');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Script arguments:', process.argv);

try {
  console.log('Testing imports...');
  
  // Test MongoDB import
  const { MongoClient, ObjectId } = await import('mongodb');
  console.log('✅ MongoDB imported successfully');
  
  // Test fs import
  const fs = await import('fs');
  console.log('✅ fs imported successfully');
  
  // Test environment variables
  console.log('Environment check:');
  console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
  
  if (process.env.MONGODB_URI) {
    console.log('- MONGODB_URI preview:', process.env.MONGODB_URI.substring(0, 20) + '...');
    
    // Test MongoDB connection
    console.log('Testing MongoDB connection...');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
      await client.connect();
      console.log('✅ Successfully connected to MongoDB');
      
      // List databases
      const adminDb = client.db().admin();
      const dbs = await adminDb.listDatabases();
      console.log('Available databases:', dbs.databases.map(db => db.name));
      
      // Check if required databases exist
      const hasTestDb = dbs.databases.some(db => db.name === 'test');
      const hasSpacedRepDb = dbs.databases.some(db => db.name === 'spaced_repetition');
      
      console.log('- test database exists:', hasTestDb);
      console.log('- spaced_repetition database exists:', hasSpacedRepDb);
      
      if (hasTestDb) {
        const testDb = client.db('test');
        const collections = await testDb.listCollections().toArray();
        console.log('test db collections:', collections.map(c => c.name));
        
        const usersCount = await testDb.collection('users').countDocuments();
        console.log('- users collection count:', usersCount);
      }
      
      if (hasSpacedRepDb) {
        const spacedRepDb = client.db('spaced_repetition');
        const collections = await spacedRepDb.listCollections().toArray();
        console.log('spaced_repetition db collections:', collections.map(c => c.name));
        
        const contentsCount = await spacedRepDb.collection('contents').countDocuments();
        console.log('- contents collection count:', contentsCount);
      }
      
      await client.close();
      console.log('✅ Connection closed successfully');
      
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
    }
  } else {
    console.log('❌ MONGODB_URI not set. Please set it with:');
    console.log('Windows: set MONGODB_URI="your_connection_string"');
    console.log('Linux/Mac: export MONGODB_URI="your_connection_string"');
  }
  
  console.log('=== DEBUG COMPLETED ===');
  
} catch (error) {
  console.error('❌ Error during debug:', error);
  console.error('Stack:', error.stack);
}

process.exit(0);
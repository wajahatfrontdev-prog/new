const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://icaredev02_db_user:icaredev02@cluster0.kalraci.mongodb.net/?appName=Cluster0';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Load models if necessary or just use mongoose.connection.collection
  const db = mongoose.connection.db;
  
  // Find asif@gmail.com user
  const user = await db.collection('users').findOne({ email: 'asif@gmail.com' });
  if (user) {
    console.log('Found user:', user);
    
    // Add testsOffered to user or laboratory profile
    // We don't know the exact schema, let's just push to testsOffered
    if (user.role === 'lab_technician' || user.role === 'laboratory') {
      await db.collection('users').updateOne(
        { email: 'asif@gmail.com' },
        { 
          $set: { 
            testsOffered: [
              "Complete Blood Count (CBC)",
              "Lipid Panel",
              "Thyroid Panel",
              "Hemoglobin A1C",
              "Comprehensive Metabolic Panel (CMP)"
            ] 
          } 
        }
      );
      console.log('Updated testsOffered for user directly in users collection');
    }
  } else {
    // maybe patients?
    console.log('User asif@gmail.com not found in users collection');
  }

  process.exit(0);
}

main().catch(console.error);

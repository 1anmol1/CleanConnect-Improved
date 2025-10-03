import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// --- THE FIX IS HERE ---
// This line now correctly loads the .env file from the root of your 'server' directory.
// It assumes your .env file is located at /server/.env
dotenv.config();

// Load models (ensure these paths are correct relative to the seeder.js file)
import User from '../models/User.js';
import Bin from '../models/Bin.js';
import Complaint from '../models/Complaint.js';
import Area from '../models/Area.js';

const connectDB = async () => {
  try {
    // This will now correctly find process.env.MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Bin.deleteMany();
    await Complaint.deleteMany();
    await Area.deleteMany();

    // --- Create Cities and Areas ---
    const areasToCreate = [
      { city: 'Pune', name: 'Kothrud' }, { city: 'Pune', name: 'Aundh' }, { city: 'Pune', name: 'Viman Nagar' },
      { city: 'Mumbai', name: 'Andheri' }, { city: 'Mumbai', name: 'Bandra' },
      { city: 'Kolhapur', name: 'Shahupuri' }, { city: 'Kolhapur', name: 'Rajarampuri' },
    ];
    await Area.insertMany(areasToCreate);
    console.log('Cities and Areas Imported!');

    // --- Create Users (WITH HASHED PASSWORDS) ---
    const usersToCreate = [
      // Citizens
      { 
        name: 'Anjali', email: 'citizen.pune@test.com', 
        password: await bcrypt.hash('password123', 10), 
        role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '123 Kothrud Lane', location: 'Kothrud, Pune'
      },
      { 
        name: 'Rohan', email: 'citizen.kop@test.com', 
        password: await bcrypt.hash('password123', 10), 
        role: 'Citizen', city: 'Kolhapur', area: 'Shahupuri', addressLine: '456 Shahupuri Road', location: 'Shahupuri, Kolhapur'
      },
      // Workers
      { 
        name: 'Suresh', email: 'worker.pune@test.com', workerId: 'WKR-PUNE-01', 
        password: await bcrypt.hash('password123', 10), 
        role: 'Worker', city: 'Pune', area: 'Kothrud'
      },
      { 
        name: 'Amit', email: 'worker.mumbai@test.com', workerId: 'WKR-MUM-01', 
        password: await bcrypt.hash('password123', 10), 
        role: 'Worker', city: 'Mumbai', area: 'Andheri'
      },
      // Officers
      { 
        name: 'Priya', email: 'officer.pune@test.com', 
        password: await bcrypt.hash('password123', 10), 
        role: 'Officer', city: 'Pune'
      },
      { 
        name: 'Vikram', email: 'officer.mumbai@test.com', 
        password: await bcrypt.hash('password123', 10), 
        role: 'Officer', city: 'Mumbai'
      },
    ];
    await User.insertMany(usersToCreate);
    console.log('Users Imported!');

    // --- Create Bins ---
    const binsToCreate = [
        { binId: 'PUNE-KTD-01', location: { type: 'Point', coordinates: [73.8076, 18.5074] }, city: 'Pune', area: 'Kothrud', status: 'Half-Full' },
        { binId: 'MUM-AND-01', location: { type: 'Point', coordinates: [72.8681, 19.1197] }, city: 'Mumbai', area: 'Andheri', status: 'Full' },
    ];
    await Bin.insertMany(binsToCreate);
    console.log('Bins Imported!');

    console.log('Data Import Complete!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Bin.deleteMany();
    await Complaint.deleteMany();
    await Area.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Main function to connect to DB and run import/destroy
const run = async () => {
  try {
    await connectDB();
    if (process.argv[2] === '--delete') {
      await destroyData();
    } else {
      await importData();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

run();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Load models
import User from '../models/User.js';
import Bin from '../models/Bin.js';
import Complaint from '../models/Complaint.js';
import Area from '../models/Area.js';

const connectDB = async () => {
  try {
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
      { name: 'Anjali', email: 'citizen.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '123 Kothrud Lane', location: 'Kothrud, Pune' },
      { name: 'Rohan', email: 'citizen.kop@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Kolhapur', area: 'Shahupuri', addressLine: '456 Shahupuri Road', location: 'Shahupuri, Kolhapur' },
      { name: 'Suresh', email: 'worker.pune@test.com', workerId: 'WKR-PUNE-01', password: await bcrypt.hash('password123', 10), role: 'Worker', city: 'Pune', area: 'Kothrud' },
      { name: 'Amit', email: 'worker.mumbai@test.com', workerId: 'WKR-MUM-01', password: await bcrypt.hash('password123', 10), role: 'Worker', city: 'Mumbai', area: 'Andheri' },
      { name: 'Priya', email: 'officer.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Officer', city: 'Pune' },
      { name: 'Vikram', email: 'officer.mumbai@test.com', password: await bcrypt.hash('password123', 10), role: 'Officer', city: 'Mumbai' },
    ];
    await User.insertMany(usersToCreate);
    console.log('Users Imported!');

    // --- THE FIX: Create all 10 Kothrud Bins ---
    const binsToCreate = [
        { binId: "PUNE-KTD-01", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.8041, 18.5074] }, fillLevel: 95, status: "Full" },
        { binId: "PUNE-KTD-02", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.8012, 18.5099] }, fillLevel: 96, status: "Full" },
        { binId: "PUNE-KTD-03", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.7985, 18.5055] }, fillLevel: 96, status: "Half-Full" },
        { binId: "PUNE-KTD-04", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.8088, 18.5123] }, fillLevel: 45, status: "Empty" },
        { binId: "PUNE-KTD-05", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.7921, 18.4988] }, fillLevel: 25, status: "Empty" },
        { binId: "PUNE-KTD-06", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.8115, 18.5021] }, fillLevel: 98, status: "Full" },
        { binId: "PUNE-KTD-07", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.7889, 18.5145] }, fillLevel: 60, status: "Empty" },
        { binId: "PUNE-KTD-08", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.8050, 18.4965] }, fillLevel: 30, status: "Empty" },
        { binId: "PUNE-KTD-09", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.8155, 18.5085] }, fillLevel: 88, status: "Half-Full" },
        { binId: "PUNE-KTD-10", area: "Kothrud", city: 'Pune', location: { type: 'Point', coordinates: [73.7953, 18.5112] }, fillLevel: 55, status: "Empty" },
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
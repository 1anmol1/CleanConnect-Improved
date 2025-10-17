// Import the necessary libraries.
// 'mongoose' is for interacting with your MongoDB database.
import mongoose from 'mongoose';
// 'dotenv' is for loading your secret environment variables (like the database URI).
import dotenv from 'dotenv';
// 'bcryptjs' is for securely encrypting the user passwords before saving them.
import bcrypt from 'bcryptjs';

// Load the environment variables from your .env file in the 'server' directory.
dotenv.config();

// Import all the data models (the blueprints for your database collections).
import User from '../models/User.js';
import Bin from '../models/Bin.js';
import Complaint from '../models/Complaint.js';
import Area from '../models/Area.js';

// This function establishes the connection to your MongoDB Atlas database.
const connectDB = async () => {
  try {
    // It reads the connection string from your .env file.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, it logs an error and stops the script.
    console.error(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};

// This is the main function for importing data. It runs with 'npm run data:import'.
const importData = async () => {
  try {
    // Step 1: Clear out all existing data from the collections to ensure a fresh start.
    await User.deleteMany();
    await Bin.deleteMany();
    await Complaint.deleteMany();
    await Area.deleteMany();
    console.log('Previous data cleared...');

    // Step 2: Create and insert the list of cities and their areas.
    const areasToCreate = [
      { city: 'Pune', name: 'Kothrud' }, { city: 'Pune', name: 'Aundh' }, { city: 'Pune', name: 'Viman Nagar' },
      { city: 'Mumbai', name: 'Andheri' }, { city: 'Mumbai', name: 'Bandra' },
      { city: 'Kolhapur', name: 'Shahupuri' }, { city: 'Kolhapur', name: 'Rajarampuri' },
    ];
    await Area.insertMany(areasToCreate);
    console.log('Cities and Areas Imported!');

    // Step 3: Create the user data with securely hashed passwords.
    // MODIFIED: All users are now in Pune and Kothrud for easier testing.
    const usersToCreate = [
      // Citizens all in Kothrud, Pune
      { name: 'Anjali', email: 'citizen.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '123 Kothrud Lane', location: 'Kothrud, Pune' },
      { name: 'Rohan', email: 'rohan.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '456 Kothrud Road', location: 'Kothrud, Pune' },
      { name: 'Aditya', email: 'aditya.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '101 Kothrud High Street', location: 'Kothrud, Pune' },
      { name: 'Yogesh', email: 'yogesh.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '202 Kothrud West', location: 'Kothrud, Pune' },
      { name: 'Shravani', email: 'shravani.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '303 Kothrud Road', location: 'Kothrud, Pune' },
      { name: 'Raj', email: 'raj.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '404 Kothrud Lane', location: 'Kothrud, Pune' },

      // Workers all in Kothrud, Pune
      { name: 'Suresh', email: 'worker.pune@test.com', workerId: 'WKR-PUNE-01', password: await bcrypt.hash('password123', 10), role: 'Worker', city: 'Pune', area: 'Kothrud', liveLocation: { type: 'Point', coordinates: [73.79, 18.515]}},
      { name: 'Rakesh', email: 'rakesh.pune@test.com', workerId: 'WKR-PUNE-02', password: await bcrypt.hash('password123', 10), role: 'Worker', city: 'Pune', area: 'Kothrud' },
      { name: 'Amit', email: 'amit.pune@test.com', workerId: 'WKR-PUNE-03', password: await bcrypt.hash('password123', 10), role: 'Worker', city: 'Pune', area: 'Kothrud', liveLocation: { type: 'Point', coordinates: [73.80, 18.51]}},
      
      // Officers
      { name: 'Priya', email: 'officer.pune@test.com', password: await bcrypt.hash('password123', 10), role: 'Officer', city: 'Pune' },
      { name: 'Vikram', email: 'officer.mumbai@test.com', password: await bcrypt.hash('password123', 10), role: 'Officer', city: 'Mumbai' },
    ];
    await User.insertMany(usersToCreate);
    console.log('Users Imported!');

    // Step 4: Define the primary "Smart Bins" (parent bins).
    const parentBinsData = [
        { binId: "PUNE-KTD-01", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.8041, 18.5074] }, fillLevel: 55, status: "Half-Full" },
        { binId: "PUNE-KTD-02", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.8012, 18.5099] }, fillLevel: 96, status: "Full" },
        { binId: "PUNE-KTD-03", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.7985, 18.5055] }, fillLevel: 75, status: "Half-Full" },
        { binId: "PUNE-KTD-04", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.8088, 18.5123] }, fillLevel: 45, status: "Empty" },
        { binId: "PUNE-KTD-05", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.7921, 18.4988] }, fillLevel: 25, status: "Empty" },
        { binId: "PUNE-KTD-06", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.8115, 18.5021] }, fillLevel: 98, status: "Full" },
        { binId: "PUNE-KTD-07", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.7889, 18.5145] }, fillLevel: 60, status: "Empty" },
        { binId: "PUNE-KTD-08", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.8050, 18.4965] }, fillLevel: 30, status: "Empty" },
        { binId: "PUNE-KTD-09", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.8155, 18.5085] }, fillLevel: 88, status: "Half-Full" },
        { binId: "PUNE-KTD-10", area: "Kothrud", city: 'Pune', isSmartBin: true, location: { type: 'Point', coordinates: [73.7953, 18.5112] }, fillLevel: 55, status: "Empty" },
        { binId: 'MUM-AND-01', area: 'Andheri', city: 'Mumbai', isSmartBin: true, location: { type: 'Point', coordinates: [72.8681, 19.1197] }, status: 'Full' },
    ];
    
    // Insert the parent bins into the database first and get the created documents back.
    const createdParentBins = await Bin.insertMany(parentBinsData);
    console.log('Parent Smart Bins Imported!');

    // Step 5: Loop through each created parent bin to generate its children.
    const childBinsToCreate = [];
    for (const parent of createdParentBins) {
        const getChildId = (suffix) => {
            const parts = parent.binId.split('-');
            if (parts.length < 3) return `${parent.binId.toLowerCase()}-${suffix}`;
            const prefix = `${parts[0].slice(0, 1)}${parts[1].slice(0, 3)}`.toLowerCase();
            const number = parts[2];
            return `${prefix}${number}-${suffix}`;
        };
        
        childBinsToCreate.push({
            binId: getChildId('a'),
            isSmartBin: false,
            parentBin: parent._id,
            city: parent.city,
            area: parent.area,
            location: {
                type: 'Point',
                coordinates: [parent.location.coordinates[0] + 0.0005, parent.location.coordinates[1] + 0.0005],
            },
            manualFillLevel: Math.floor(Math.random() * 61) + 20,
            lastManualUpdate: new Date(),
        });
        childBinsToCreate.push({
            binId: getChildId('b'),
            isSmartBin: false,
            parentBin: parent._id,
            city: parent.city,
            area: parent.area,
            location: {
                type: 'Point',
                coordinates: [parent.location.coordinates[0] - 0.0005, parent.location.coordinates[1] - 0.0005],
            },
            manualFillLevel: Math.floor(Math.random() * 61) + 20,
            lastManualUpdate: new Date(),
        });
    }

    await Bin.insertMany(childBinsToCreate);
    console.log(`${childBinsToCreate.length} Child Bins Imported!`);

    console.log('Data Import Complete!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

// This function is for wiping the database. It runs with 'npm run data:destroy'.
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
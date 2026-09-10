const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_db';

<<<<<<< HEAD
const eventSchema = new mongoose.Schema({
    eventId: { type: Number, unique: true },
    title: String,
    price: Number,
    location: String,
    available: Number
});

const Event = mongoose.model('Event', eventSchema);

const initDb = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');
        
        // Seed initial data if empty
        const count = await Event.countDocuments();
        if (count === 0) {
            await Event.insertMany([
                { eventId: 1, title: 'Tech Conference 2026', price: 150, location: 'San Francisco', available: 100 },
                { eventId: 2, title: 'Music Festival', price: 75, location: 'Austin', available: 500 },
                { eventId: 3, title: 'AI Workshop', price: 0, location: 'Online', available: 1000 }
            ]);
            console.log('Database seeded with initial events.');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = { Event, initDb };
=======
const internshipSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    isForeignCompany: { type: Boolean, default: false },
    location: { type: String, required: true },
    workMode: { type: String, default: 'Onsite' },
    eligibleApplicants: { type: String, default: 'Open to all candidates' },
    stipend: { type: String, default: 'Competitive' },
    stipendCurrency: { type: String, default: 'LKR' },
    duration: { type: String, default: '6 Months' },
    country: { type: String, default: 'Sri Lanka' },
    city: { type: String, default: 'Colombo' },
    verified: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    available: { type: Number, required: true },
    capacity: { type: Number, required: true },
    date: { type: String },
    skills: [String],
    description: { type: String, required: true },
    website: { type: String, default: '' },
    companyEmail: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    isVerifiedCompany: { type: Boolean, default: true }
}, { timestamps: true });

const Internship = mongoose.model('Internship', internshipSchema);
let ready = false;

const initDb = async (seedData = []) => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        ready = true;
        console.log('MongoDB connected successfully.');

        const count = await Internship.countDocuments();
        if (count === 0 && seedData.length > 0) {
            await Internship.insertMany(seedData);
            console.log(`Database seeded with ${seedData.length} initial internships.`);
        } else if (seedData.length > 0) {
            // Update any existing records missing official website
            for (const item of seedData) {
                await Internship.updateOne(
                    { id: item.id },
                    { $set: { 
                        website: item.website || '',
                        companyEmail: item.companyEmail || '',
                        companyPhone: item.companyPhone || '',
                        isVerifiedCompany: true
                    } }
                );
            }
        }
        return true;
    } catch (error) {
        ready = false;
        console.warn('MongoDB unavailable. Event/Internship service will use in-memory state for this run.');
        return false;
    }
};

module.exports = { Internship, initDb, isReady: () => ready };

>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b

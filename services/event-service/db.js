const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_db';

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
    description: { type: String, required: true }
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
        }
        return true;
    } catch (error) {
        ready = false;
        console.warn('MongoDB unavailable. Event/Internship service will use in-memory state for this run.');
        return false;
    }
};

module.exports = { Internship, initDb, isReady: () => ready };


const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_db';

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

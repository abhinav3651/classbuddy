import SeminarHall from './models/SeminarHall.js';

const seedSeminarHall = async () => {
    try {
        // Check if seminar hall already exists
        const existingHall = await SeminarHall.findOne();
        
        if (!existingHall) {
            // Create the default seminar hall
            const seminarHall = new SeminarHall({
                name: 'Main Seminar Hall',
                capacity: 100,
                isAvailable: true
            });
            
            await seminarHall.save();
            console.log('Seminar hall seeded successfully');
        } else {
            console.log('Seminar hall already exists');
        }
    } catch (error) {
        console.error('Error seeding seminar hall:', error);
    }
};

export default seedSeminarHall; 
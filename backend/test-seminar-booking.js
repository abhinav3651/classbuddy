import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testSeminarBooking() {
    try {
        // 1. Create a student booking
        console.log('Testing student booking...');
        const studentBooking = await fetch(`${API_URL}/seminar/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: '65f3f3d8b52dff083f48d123',
                userType: 'student',
                date: '2024-03-25',
                startTime: '10:00',
                endTime: '12:00',
                purpose: 'Student Technical Seminar'
            })
        });
        const studentResult = await studentBooking.json();
        console.log('Student booking result:', studentResult);

        // 2. Create a teacher booking for the same slot
        console.log('\nTesting teacher booking for same slot...');
        const teacherBooking = await fetch(`${API_URL}/seminar/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: '65f3f3d8b52dff083f48d124',
                userType: 'teacher',
                date: '2024-03-25',
                startTime: '10:00',
                endTime: '12:00',
                purpose: 'Teacher Workshop'
            })
        });
        const teacherResult = await teacherBooking.json();
        console.log('Teacher booking result:', teacherResult);

        // 3. Get all bookings
        console.log('\nGetting all bookings...');
        const bookings = await fetch(`${API_URL}/seminar/bookings`);
        const bookingsList = await bookings.json();
        console.log('All bookings:', bookingsList);

    } catch (error) {
        console.error('Error testing seminar booking:', error);
    }
}

testSeminarBooking(); 
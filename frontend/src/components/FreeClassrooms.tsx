import React, { useState } from 'react';
import axios from 'axios';

interface Classroom {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  department: string;
}

const FreeClassrooms: React.FC = () => {
  const [day, setDay] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [freeClassrooms, setFreeClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:5000/api/classrooms/free`, {
        params: { day, time }
      });
      setFreeClassrooms(response.data);
    } catch (err) {
      setError('Failed to fetch free classrooms. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Find Free Classrooms</h2>
      
      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a day</option>
              {days.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Find Free Classrooms'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {freeClassrooms.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Classrooms:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeClassrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold">{classroom.name}</h4>
                <p className="text-gray-600">Type: {classroom.type}</p>
                <p className="text-gray-600">Capacity: {classroom.capacity}</p>
                <p className="text-gray-600">Department: {classroom.department}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center">
          {loading ? 'Searching for free classrooms...' : 'No free classrooms found for the selected time.'}
        </p>
      )}
    </div>
  );
};

export default FreeClassrooms; 
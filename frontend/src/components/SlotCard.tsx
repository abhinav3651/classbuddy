import React from 'react';
import { Clock, MapPin, BookOpen } from 'lucide-react';
import { TimeSlot, SlotRequest } from '../types';

interface SlotCardProps {
  item: TimeSlot | SlotRequest;
  type: 'availability' | 'request';
  onAction?: (id: string, action?: string) => void;
}

const SlotCard: React.FC<SlotCardProps> = ({ item, type, onAction }) => {
  // Determine if the item is a TimeSlot or SlotRequest
  const isTimeSlot = 'isAvailable' in item;
  const isRequest = 'status' in item;
  
  // Extract common properties
  const { _id, startTime, endTime, subject } = item;
  
  // Get status-specific styling
  const getStatusStyle = () => {
    if (isTimeSlot) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        statusText: 'Available',
      };
    }
    
    if (isRequest) {
      const request = item as SlotRequest;
      switch (request.status) {
        case 'pending':
          return {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            borderColor: 'border-yellow-200',
            statusText: 'Pending',
          };
        case 'accepted':
          return {
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-200',
            statusText: 'Accepted',
          };
        case 'rejected':
          return {
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: 'border-red-200',
            statusText: 'Rejected',
          };
        default:
          return {
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            borderColor: 'border-gray-200',
            statusText: 'Unknown',
          };
      }
    }
    
    return {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      statusText: 'Unknown',
    };
  };
  
  const { bgColor, textColor, borderColor, statusText } = getStatusStyle();
  
  return (
    <div className={`rounded-lg shadow-sm border ${borderColor} overflow-hidden transition-all duration-200 hover:shadow-md`}>
      <div className={`${bgColor} px-4 py-2 flex justify-between items-center`}>
        <div className="flex items-center">
          <Clock size={16} className={textColor} />
          <span className={`ml-2 font-medium ${textColor}`}>
            {startTime} - {endTime}
          </span>
        </div>
        <span className={`text-sm font-semibold ${textColor} px-2 py-1 rounded-full`}>
          {statusText}
        </span>
      </div>
      
      <div className="p-4 bg-white">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{subject}</h3>
          
          {isRequest && (
            <p className="text-sm text-gray-600 mt-1">
              {(item as SlotRequest).studentName}
            </p>
          )}
          
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <MapPin size={14} className="mr-1" />
            <span>{isRequest ? 'Room 101' : 'Available Room'}</span>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-gray-600">
            <BookOpen size={14} className="mr-1" />
            <span>
              {isTimeSlot ? (item as TimeSlot).subject : (item as SlotRequest).subject}
            </span>
          </div>
        </div>
        
        {type === 'availability' && isTimeSlot && (
          <button
            onClick={() => onAction && onAction(_id)}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors duration-200"
          >
            Request Slot
          </button>
        )}
        
        {type === 'request' && isRequest && (item as SlotRequest).status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onAction && onAction(_id, 'accept')}
              className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors duration-200"
            >
              Accept
            </button>
            <button
              onClick={() => onAction && onAction(_id, 'reject')}
              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors duration-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotCard;
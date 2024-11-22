import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
const StarRatings = ({ rating, onChange }) => {
  const handleClick = (value) => {
    onChange(value);
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <span
          key={starValue}
          onClick={() => handleClick(starValue)}
          style={{
            cursor: 'pointer',
           
            padding: '2px',
          }}
        >
          <FaStar
            size={20} // Adjust size if needed
            color={starValue <= rating ? 'green' : 'yellow'} // Yellow for filled, white for empty stars
           
          />
        </span>
      ))}
    </div>
  );
};
export default StarRatings;

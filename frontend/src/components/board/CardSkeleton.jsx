import React from 'react';

const CardSkeleton = () => {
  return (
    <div 
      className="animate-pulse"
      style={{
        backgroundColor: '#22272b', // Dark mode card background
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 1px 1px #091e4240',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '8px'
      }}
    >
      <div style={{ height: '12px', width: '80%', backgroundColor: '#323940', borderRadius: '4px' }}></div>
      <div style={{ height: '12px', width: '50%', backgroundColor: '#323940', borderRadius: '4px' }}></div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <div style={{ height: '16px', width: '32px', backgroundColor: '#323940', borderRadius: '4px' }}></div>
        <div style={{ height: '16px', width: '16px', backgroundColor: '#323940', borderRadius: '50%' }}></div>
      </div>
    </div>
  );
};

export default CardSkeleton;

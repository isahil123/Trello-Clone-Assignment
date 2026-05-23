import React from 'react';

const PlaceholderView = ({ viewName }) => {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.icon}>{viewName === 'Timeline' ? '☷' : '📍'}</div>
        <h2 style={styles.title}>{viewName} View</h2>
        <p style={styles.text}>
          This is a placeholder for the {viewName} view. 
          A fully interactive {viewName.toLowerCase()} requires additional specialized libraries.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '48px',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  box: {
    backgroundColor: '#22272b',
    borderRadius: '8px',
    padding: '48px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    maxWidth: '500px',
    textAlign: 'center',
    color: '#b6c2cf',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
    color: '#579dff',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#CECFD2',
    fontSize: '24px',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#9fadbc',
  }
};

export default PlaceholderView;

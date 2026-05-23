import React from 'react';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744626753-1fa7603a4b69?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000&auto=format&fit=crop'
];

const GRADIENTS = [
  'linear-gradient(to bottom right, #664182, #b05c93)',
  'linear-gradient(to bottom right, #0079bf, #5067c5)',
  'linear-gradient(to bottom right, #519839, #0079bf)',
  'linear-gradient(to bottom right, #d29034, #d29034)',
  'linear-gradient(to bottom right, #b04632, #b04632)',
  'linear-gradient(to bottom right, #89609e, #89609e)'
];

const BackgroundMenu = ({ showMenu, setShowMenu, boardId, currentBackground, onUpdate }) => {
  if (!showMenu) return null;

  const handleSetBackground = async (bg) => {
    try {
      const res = await apiClient.patch(`/boards/${boardId}`, { background: bg });
      onUpdate(res.data.data);
      setShowMenu(false);
    } catch (err) {
      toast.error('Failed to update background');
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      backgroundColor: '#282e33',
      borderRadius: '8px',
      boxShadow: '0 8px 16px -4px rgba(0,0,0,0.5), 0 0 0 1px hsla(0,0%,100%,0.08)',
      width: '320px',
      zIndex: 100,
      padding: '12px',
      color: '#b6c2cf'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Board Background</h3>
        <button 
          onClick={() => setShowMenu(false)}
          style={{ background: 'none', border: 'none', color: '#9fadbc', cursor: 'pointer', fontSize: '16px' }}
        >✕</button>
      </div>

      <div>
        <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#9fadbc', marginBottom: '8px' }}>Photos</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {UNSPLASH_IMAGES.map((img, i) => (
            <div 
              key={i}
              onClick={() => handleSetBackground(img)}
              style={{
                height: '64px',
                borderRadius: '4px',
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                border: currentBackground === img ? '2px solid #579dff' : 'none'
              }}
            />
          ))}
        </div>

        <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#9fadbc', marginBottom: '8px' }}>Colors</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {GRADIENTS.map((grad, i) => (
            <div 
              key={i}
              onClick={() => handleSetBackground(grad)}
              style={{
                height: '40px',
                borderRadius: '4px',
                background: grad,
                cursor: 'pointer',
                border: currentBackground === grad ? '2px solid #579dff' : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundMenu;

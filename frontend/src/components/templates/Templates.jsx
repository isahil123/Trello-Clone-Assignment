import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast as hotToast } from 'react-hot-toast';
import apiClient from '../../api/client';
import AppSidebar from '../layout/AppSidebar';
import './Templates.css';

const mockCategories = [
  { id: 'c1', name: 'Business', color: '#1f845a', icon: '💼' },
  { id: 'c2', name: 'Design', color: '#e774bb', icon: '🎨' },
  { id: 'c3', name: 'Education', color: '#f5cd47', icon: '🎓' },
  { id: 'c4', name: 'Engineering', color: '#9f8fef', icon: '⚙️' },
  { id: 'c5', name: 'Marketing', color: '#6cc3e0', icon: '📈' },
  { id: 'c6', name: 'Project Management', color: '#f5cd47', icon: '📋' },
  { id: 'c7', name: 'Remote Work', color: '#579dff', icon: '🏠' },
];

const mockNewTemplates = [
  {
    id: 't1',
    title: 'My Tasks | Trello',
    author: 'Trello Team',
    description: 'Track all your to-dos in your own, private Trello board.',
    color: 'linear-gradient(135deg, #f87168, #fea362)',
    image: '/images/mytasks.png',
    category: 'c1',
    copies: '0',
    views: '4'
  },
  {
    id: 't2',
    title: 'New Hire Onboarding',
    author: 'Trello Team',
    description: 'Help new employees start strong with this onboarding template.',
    color: 'linear-gradient(135deg, #4bce97, #216e4e)',
    image: '/images/onboarding.png',
    category: 'c1',
    copies: '18.3K',
    views: '131.3K'
  },
  {
    id: 't3',
    title: 'Tier List',
    author: 'Trello Engineering Team',
    description: 'Use this template to create a tier list for anything you want. A tier list is a way to rank items in a category from best to...',
    color: 'linear-gradient(135deg, #579dff, #0c66e4)',
    image: '/images/tierlist.png',
    category: 'c2',
    copies: '2.9K',
    views: '23.3K'
  }
];

const Templates = ({ onBoardCreated }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredTemplates = mockNewTemplates.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && t.category !== selectedCategory) return false;
    return true;
  });

  const handleUseTemplate = async (template) => {
    try {
      setError(null);
      hotToast(`Creating board from ${template.title}...`);
      const response = await apiClient.post('/boards', { title: template.title });
      const newBoard = response.data.data;
      if (onBoardCreated) onBoardCreated(newBoard);
      setTimeout(() => navigate(`/b/${newBoard.id}`), 500);
    } catch (err) {
      console.error('Failed to create board from template:', err);
      setError(`Could not create board from template "${template.title}". Please try again.`);
      hotToast.error('Failed to create board.');
    }
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar />

      <div className="templates-content-area">
        <div className="templates-container">
          
          {error && (
            <div style={{ backgroundColor: '#ef5c48', color: '#fff', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' }}>
              {error}
            </div>
          )}

          {/* Featured Categories */}
          <div className="templates-header-row">
            <h2 className="templates-header">Featured categories</h2>
            <div className="templates-search-box">
              <input 
                type="text" 
                placeholder="Find template" 
                className="templates-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <span style={{color: '#9fadbc', fontSize: '14px'}}>🔍</span>
            </div>
          </div>

          <div className="templates-categories-grid">
            {mockCategories.map(cat => (
              <div 
                key={cat.id} 
                className="templates-category-item" 
                style={{
                  border: selectedCategory === cat.id ? `2px solid ${cat.color}` : 'none',
                  backgroundColor: selectedCategory === cat.id ? 'hsla(0,0%,100%,0.08)' : 'transparent'
                }}
                onClick={() => setSelectedCategory(prev => prev === cat.id ? null : cat.id)}
              >
                <div className="templates-category-icon" style={{backgroundColor: cat.color}}>
                  <span style={{fontSize: '32px'}}>{cat.icon}</span>
                </div>
                <span className="templates-category-name">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* New and notable templates */}
          <h2 className="templates-header" style={{marginTop: '48px'}}>
            {selectedCategory || searchQuery ? 'Search Results' : <><span style={{marginRight: '8px'}}>✨</span> New and notable templates</>}
          </h2>

          <div className="templates-grid">
            {filteredTemplates.length > 0 ? filteredTemplates.map(tpl => (
              <div key={tpl.id} className="template-card" onClick={() => handleUseTemplate(tpl)}>
                <div className="template-image" style={{
                  background: tpl.image ? `url(${tpl.image}) center/cover no-repeat` : tpl.color
                }}>
                  {!tpl.image && (
                    <div className="template-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="9" height="9" rx="1" />
                        <rect x="13" y="2" width="9" height="9" rx="1" />
                        <rect x="2" y="13" width="9" height="9" rx="1" />
                        <rect x="13" y="13" width="9" height="9" rx="1" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="template-body">
                  <h3 className="template-title">{tpl.title}</h3>
                  <p className="template-author">by {tpl.author}</p>
                  <p className="template-description">{tpl.description}</p>
                  <div className="template-stats">
                    <span>📋 {tpl.copies}</span>
                    <span>👁 {tpl.views}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ color: '#9fadbc', gridColumn: '1 / -1', padding: '24px 0' }}>No templates found matching your criteria.</div>
            )}
          </div>

          {/* Business templates */}
          <div className="templates-header-row" style={{marginTop: '48px'}}>
            <h2 className="templates-header">
              <span style={{marginRight: '8px', color: '#579dff'}}>💼</span> Business
            </h2>
            <button className="templates-more-btn" onClick={() => hotToast("Loading more templates...")}>More templates for Business</button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Templates;

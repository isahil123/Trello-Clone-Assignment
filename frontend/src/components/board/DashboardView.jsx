import React from 'react';

const DashboardView = ({ lists }) => {
  const maxCards = Math.max(...lists.map(l => (l.cards || []).length), 10); // Minimum scale of 10

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>
      
      <div style={styles.chartWrapper}>
        <h3 style={styles.chartTitle}>Cards per list</h3>
        
        <div style={styles.chartContainer}>
          <div style={styles.yAxis}>
            <span>{Math.ceil(maxCards)}</span>
            <span>{Math.ceil(maxCards * 0.75)}</span>
            <span>{Math.ceil(maxCards * 0.5)}</span>
            <span>{Math.ceil(maxCards * 0.25)}</span>
            <span>0</span>
          </div>
          
          <div style={styles.barsContainer}>
            {/* Grid lines */}
            <div style={{ ...styles.gridLine, bottom: '100%' }}></div>
            <div style={{ ...styles.gridLine, bottom: '75%' }}></div>
            <div style={{ ...styles.gridLine, bottom: '50%' }}></div>
            <div style={{ ...styles.gridLine, bottom: '25%' }}></div>
            <div style={{ ...styles.gridLine, bottom: '0%' }}></div>

            {/* Bars */}
            {lists.map((list, idx) => {
              const cardCount = (list.cards || []).length;
              const heightPercent = (cardCount / maxCards) * 100;
              const colors = ['#e2b203', '#579dff', '#4bce97', '#ff8f73', '#9f8fef'];
              const barColor = colors[idx % colors.length];

              return (
                <div key={list.id} style={styles.barWrapper}>
                  <div 
                    style={{ 
                      ...styles.bar, 
                      height: `${heightPercent}%`,
                      backgroundColor: barColor
                    }}
                    title={`${list.title}: ${cardCount} cards`}
                  />
                  <div style={styles.barLabel}>{list.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    height: '100%',
    overflowY: 'auto',
    width: '100%',
    color: '#b6c2cf',
  },
  title: {
    margin: '0 0 24px 0',
    color: '#CECFD2',
    fontSize: '24px',
  },
  chartWrapper: {
    backgroundColor: '#22272b',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    maxWidth: '800px',
  },
  chartTitle: {
    margin: '0 0 32px 0',
    fontSize: '16px',
    color: '#CECFD2',
  },
  chartContainer: {
    display: 'flex',
    height: '300px',
    gap: '16px',
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: '24px', // Space for x-axis labels
    color: '#9fadbc',
    fontSize: '12px',
    textAlign: 'right',
    width: '24px',
  },
  barsContainer: {
    flexGrow: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: '24px', // Space for x-axis labels
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottom: '1px dashed rgba(159, 173, 188, 0.2)',
    zIndex: 0,
  },
  barWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    zIndex: 1,
    width: '60px',
  },
  bar: {
    width: '40px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: '12px',
    color: '#9fadbc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '80px',
    textAlign: 'center',
  }
};

export default DashboardView;

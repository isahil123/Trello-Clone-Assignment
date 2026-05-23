import React from 'react';

const TableView = ({ lists, boardMembers = [] }) => {
  const allCards = lists.flatMap(list => 
    (list.cards || []).map(card => ({
      ...card,
      listTitle: list.title
    }))
  );

  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Card Title</th>
              <th style={styles.th}>List</th>
              <th style={styles.th}>Due Date</th>
              <th style={styles.th}>Labels</th>
              <th style={styles.th}>Members</th>
            </tr>
          </thead>
          <tbody>
            {allCards.map(card => (
              <tr key={card.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong style={{ color: '#CECFD2' }}>{card.title}</strong>
                </td>
                <td style={styles.td}>{card.listTitle}</td>
                <td style={styles.td}>
                  {card.dueDate ? new Date(card.dueDate).toLocaleDateString() : '-'}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {card.labels?.map(l => (
                      <span key={l.id} style={{ ...styles.label, backgroundColor: l.label?.color || '#3b3f44' }}>
                        {l.label?.title || ''}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {card.members?.map(m => {
                      const user = boardMembers.find(bm => bm.userId === m.userId)?.user;
                      return (
                        <div key={m.id} style={styles.avatar} title={user?.name || 'User'}>
                          {(user?.name || 'U').charAt(0)}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
            {allCards.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#9fadbc' }}>
                  No cards found on this board.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  },
  tableWrapper: {
    backgroundColor: '#22272b',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#b6c2cf',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: '#1c2126',
    fontWeight: '600',
    borderBottom: '1px solid #091e4224',
  },
  tr: {
    borderBottom: '1px solid #091e4224',
  },
  td: {
    padding: '12px 16px',
  },
  label: {
    padding: '2px 8px',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#1d2125',
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#579dff',
    color: '#1d2125',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  }
};

export default TableView;

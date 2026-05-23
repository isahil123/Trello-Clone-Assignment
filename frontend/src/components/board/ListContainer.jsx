import React from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableList from './SortableList';

const ListContainer = ({ lists, boardId }) => {
  return (
    <div className="board-lists-container" style={{ display: 'flex', gap: '12px', height: '100%' }}>
      <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
        {lists.map((list, index) => (
          <SortableList key={list.id} list={list} cards={list.cards || []} boardId={boardId} index={index} />
        ))}
      </SortableContext>
    </div>
  );
};

export default ListContainer;

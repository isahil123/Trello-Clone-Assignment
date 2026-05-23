import { useEffect } from 'react';
import useBoardStore from '../store/useBoardStore';

const useKeyboardShortcuts = (handlers) => {
  const { activeCardId, setActiveCardId } = useBoardStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        if (activeCardId) {
          e.preventDefault();
          setActiveCardId(null);
        } else if (handlers.onEscape) {
          handlers.onEscape(e);
        }
      }

      if (e.key === 'n' && !activeCardId) {
        if (handlers.onAddList) {
          e.preventDefault();
          handlers.onAddList(e);
        }
      }

      if (e.key === '/') {
        if (handlers.onSearch) {
          e.preventDefault();
          handlers.onSearch(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardId, handlers]);
};

export default useKeyboardShortcuts;

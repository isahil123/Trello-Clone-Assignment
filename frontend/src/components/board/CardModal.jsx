import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useBoardData } from "../../api/queries";
import apiClient from "../../api/client";

import CardModalHeader from "./card-modal/CardModalHeader";
import CardModalDescription from "./card-modal/CardModalDescription";
import CardModalSidebar from "./card-modal/CardModalSidebar";

import "./card-modal/CardModal.css";

const CardModal = ({ card, boardId, onClose }) => {
  const [localCard, setLocalCard] = React.useState(card);

  React.useEffect(() => {
    setLocalCard(card);
  }, [card?.id]);
  const queryClient = useQueryClient();
  const { data: board } = useBoardData(boardId);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const activeTag = document.activeElement?.tagName;
        if (
          ["INPUT", "TEXTAREA"].includes(activeTag) ||
          document.activeElement?.isContentEditable
        ) {
          return;
        }
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!card || !board) return null;

  const boardLabels = board.labels || [];
  const boardMembers = (board.members || []).map((m) => m.user);

  const updateBoardCacheCard = (updater) => {
    queryClient.setQueryData(["board", boardId], (old) => {
      if (!old?.lists) return old;
      return {
        ...old,
        lists: old.lists.map((list) => ({
          ...list,
          cards: (list.cards || []).map((c) =>
            c.id === card.id ? updater(c) : c,
          ),
        })),
      };
    });
  };

  const handleArchive = async () => {
    setLocalCard((prev) => {
      const next = { ...prev, isArchived: !prev?.isArchived };
      updateBoardCacheCard(() => next);
      return next;
    });
    try {
      await apiClient.patch(`/cards/${card.id}/archive`, {
        isArchived: !card.isArchived,
      });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch (err) {
      toast.error("Failed to archive card");
    }
  };

  const handleLocalChange = (fields) => {
    setLocalCard((prev) => {
      const next = { ...prev, ...fields };
      updateBoardCacheCard(() => next);
      return next;
    });
  };

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        {card.coverImage ? (
          <div
            className="card-modal-cover"
            style={{
              backgroundImage: `url(${card.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "160px",
            }}
          />
        ) : (
          card.coverColor && (
            <div
              className="card-modal-cover"
              style={{ backgroundColor: card.coverColor }}
            />
          )
        )}

        <button className="card-modal-close" onClick={onClose}>
          ✕
        </button>

        <CardModalHeader
          card={localCard}
          boardId={boardId}
          onArchive={handleArchive}
        />

        <div className="card-modal-body">
          <div className="main-column">
            <CardModalDescription
              card={localCard}
              boardId={boardId}
              boardLabels={boardLabels}
              onLocalChange={handleLocalChange}
            />
          </div>

          <div className="side-column">
            <CardModalSidebar
              card={localCard}
              boardId={boardId}
              boardLabels={boardLabels}
              boardMembers={boardMembers}
              onLocalChange={handleLocalChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;

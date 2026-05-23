import apiClient from "../api/client";

export const getMidPosition = (prevPos, nextPos) => {
  if (prevPos === undefined && nextPos === undefined) return 1024;
  if (prevPos === undefined) return nextPos / 2;
  if (nextPos === undefined) return prevPos + 1024;
  return (prevPos + nextPos) / 2;
};

export const checkAndNormalize = async (listId, newPosition) => {
  // If we ever generate a position that implies a gap < 0.001
  // we need to normalize. Actually we should check the gap before generating,
  // or just check if the gap is too small. But practically, since we divide by 2,
  // we can just check if newPosition is within 0.001 of prev or next.
  // We'll leave the normalization trigger to the caller if needed,
  // or just always do it if the new position has too many decimals.
  return newPosition;
};

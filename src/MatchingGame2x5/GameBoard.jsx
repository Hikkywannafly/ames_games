import { memo, useCallback } from "react";
import Card from "./Card";
import styles from "./MatchingGame.module.css";

/**
 * GameBoard component for the matching game
 * @param {Object} props
 * @param {Array} props.imageCards - Array of image card objects
 * @param {Array} props.wordCards - Array of word card objects
 * @param {Object} props.selected - Currently selected card IDs
 * @param {Function} props.onCardClick - Callback function for card click events
 * @param {boolean} props.disabled - Whether the board is disabled (e.g., during animations)
 * @param {Function} props.onCardAnimationEnd - Handler for card animation end events
 * @returns {JSX.Element}
 */
function GameBoard({
  imageCards,
  wordCards,
  selected,
  onCardClick,
  disabled,
  onCardAnimationEnd,
}) {
  return (
    <main className={styles.gameBoard}>
      {/* Image Grid */}
      <div className={styles.gridImages} role="group" aria-label="Image cards">
        {imageCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selected.imageId === card.id}
            onClick={() => onCardClick(card.id, "image")}
            disabled={disabled}
            onAnimationEnd={onCardAnimationEnd}
          />
        ))}
      </div>

      {/* Word Grid */}
      <div className={styles.gridWords} role="group" aria-label="Word cards">
        {wordCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selected.wordId === card.id}
            onClick={() => onCardClick(card.id, "word")}
            disabled={disabled}
            onAnimationEnd={onCardAnimationEnd}
          />
        ))}
      </div>
    </main>
  );
}

// Memoize GameBoard to prevent re-renders when props haven't changed
export default memo(GameBoard);

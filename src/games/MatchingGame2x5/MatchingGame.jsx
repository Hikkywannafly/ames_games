import { useState, useEffect, useRef, useCallback } from "react";
import useSound from "use-sound";
import Header from "./Header";
import GameOverlay from "./GameOverlay";
import GameBoard from "./GameBoard";
import styles from "./MatchingGame.module.css";
import globalStyles from "../../common/style-global.module.css";
import { shuffleArray } from "../../helpers/shuffle";
import { masterItems } from "../../mocks/data";
// Import sound files - supports both .mp3 and .wav formats
// Sound files are located in src/common/sounds/matching2x5
let selectSfx = "";
let matchSfx = "";
let errorSfx = "";

try {
  // Try .wav first, fallback to .mp3
  selectSfx = new URL(
    "../../common/sounds/matching2x5/select.wav",
    import.meta.url
  ).href;
} catch {
  try {
    selectSfx = new URL(
      "../../common/sounds/matching2x5/select.mp3",
      import.meta.url
    ).href;
  } catch {
    selectSfx = "";
  }
}

try {
  matchSfx = new URL(
    "../../common/sounds/matching2x5/match.mp3",
    import.meta.url
  ).href;
} catch {
  try {
    matchSfx = new URL(
      "../../common/sounds/matching2x5/match.wav",
      import.meta.url
    ).href;
  } catch {
    matchSfx = "";
  }
}

try {
  // Try .wav first, fallback to .mp3
  errorSfx = new URL(
    "../../common/sounds/matching2x5/error.wav",
    import.meta.url
  ).href;
} catch {
  try {
    errorSfx = new URL(
      "../../common/sounds/matching2x5/error.mp3",
      import.meta.url
    ).href;
  } catch {
    errorSfx = "";
  }
}

/**
 * MatchingGame Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of items with {id, image, word} structure (default: masterItems from data.js)
 * @param {number} props.initialPairs - Number of image-word pairs to display (default: 5)
 * @param {number} props.timerLength - Game timer duration in seconds (default: 60)
 * @param {string} props.title - Game title to display (default: "Picture Match Fun!")
 * @returns {JSX.Element}
 */
export default function MatchingGame({
  data = masterItems,
  initialPairs = 5,
  timerLength = 60,
  title = "Picture Match Fun!",
}) {
  // State management
  const [deck, setDeck] = useState([]);
  const [imageCards, setImageCards] = useState([]);
  const [wordCards, setWordCards] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(timerLength);
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'verifying' | 'finished'
  const [selected, setSelected] = useState({});
  const [floatingScores, setFloatingScores] = useState([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0); // Track number of matched pairs
  const [isWin, setIsWin] = useState(false); // Track if player won (completed all matches)
  const [usedItemIds, setUsedItemIds] = useState([]); // Track IDs of items that have been matched

  // Refs
  const timerIntervalRef = useRef(null);
  const soundEnabledRef = useRef(false);
  const nextCardIdRef = useRef(initialPairs * 2); // Start after initial cards
  // const enteringCardsRef = useRef(new Set()); // Track cards currently entering

  // Sound hooks with graceful fallback
  const [playSelect] = useSound(selectSfx || "", {
    volume: 0.4,
    soundEnabled: soundEnabledRef.current,
  });
  const [playMatch] = useSound(matchSfx || "", {
    volume: 0.5,
    soundEnabled: soundEnabledRef.current,
  });
  const [playError] = useSound(errorSfx || "", {
    volume: 0.5,
    soundEnabled: soundEnabledRef.current,
  });

  // Initialize game
  const initializeGame = useCallback(() => {
    // Enable sound on user gesture
    soundEnabledRef.current = true;

    // Select random items
    const shuffledMaster = shuffleArray(data);
    const selectedItems = shuffledMaster.slice(0, initialPairs);
    setDeck(selectedItems);

    // Create image cards (shuffled)
    const shuffledImages = shuffleArray(
      selectedItems.map((item, idx) => ({
        id: idx,
        originalId: item.id,
        type: "image",
        content: item.word,
        image: item.image,
        matched: false,
        error: false,
        replacing: false,
        entering: false,
      }))
    );

    // Create word cards (shuffled independently)
    const shuffledWords = shuffleArray(
      selectedItems.map((item, idx) => ({
        id: idx + initialPairs,
        originalId: item.id,
        type: "word",
        content: item.word,
        matched: false,
        error: false,
        replacing: false,
        entering: false,
      }))
    );

    setImageCards(shuffledImages);
    setWordCards(shuffledWords);
    setScore(0);
    setTimer(timerLength);
    setSelected({});
    setFloatingScores([]);
    setMatchedPairsCount(0);
    setIsWin(false);
    setUsedItemIds(
      selectedItems.map((item) => {
        return {
          ...item,
          id: item.id,
          match: false,
        };
      })
    ); // Track initial items as used
    setGameState("playing");

    // Start timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          setIsWin(false); // Time ran out - player lost
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1500);
  }, [data, initialPairs, timerLength]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle back to home (return to idle state)
  const handleBackToHome = useCallback(() => {
    console.log("🏠 Back to Home clicked - Resetting game to idle state");

    // Clear timer if running
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      console.log("✅ Timer cleared");
    }

    // Reset all state to initial values
    setDeck([]);
    setImageCards([]);
    setWordCards([]);
    setScore(0);
    setTimer(timerLength);
    setGameState("idle");
    setSelected({});
    setFloatingScores([]);
    setMatchedPairsCount(0);
    setIsWin(false);
    setUsedItemIds([]);

    console.log("✅ Game state reset to idle");
  }, [timerLength]);

  // Check for win condition whenever state changes
  useEffect(() => {
    if (gameState !== "playing") return;

    // Check if all items have been used and all cards are matched
    const allItemsUsed = usedItemIds.length >= data.length;
    const allCardsMatched =
      imageCards.length > 0 &&
      imageCards.every((c) => c.matched) &&
      wordCards.every((c) => c.matched);

    console.log("Win Check:", {
      allItemsUsed,
      allCardsMatched,
      usedItemIds,
      imageCards,
      wordCards,
    });

    if (allItemsUsed && allCardsMatched) {
      // All items matched - player wins!
      setTimeout(() => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        setIsWin(true);
        setGameState("finished");
      }, 1500);
    }
  }, [
    usedItemIds,
    usedItemIds.length,
    imageCards,
    wordCards,
    gameState,
    data.length,
  ]);

  // Handle card selection
  const handleCardClick = (cardId, type) => {
    if (gameState !== "playing" && gameState !== "verifying") return;
    if (gameState === "verifying") return;

    const card =
      type === "image"
        ? imageCards.find((c) => c.id === cardId)
        : wordCards.find((c) => c.id === cardId);

    if (!card || card.matched) return;

    // Play select sound
    if (selectSfx) {
      playSelect();
    }

    if (type === "image") {
      // Toggle image selection
      if (selected.imageId === cardId) {
        setSelected({ ...selected, imageId: undefined });
      } else {
        setSelected({ ...selected, imageId: cardId });
        // Check for match if word is also selected
        if (selected.wordId !== undefined) {
          checkMatch(cardId, selected.wordId);
        }
      }
    } else {
      // Toggle word selection
      if (selected.wordId === cardId) {
        setSelected({ ...selected, wordId: undefined });
      } else {
        setSelected({ ...selected, wordId: cardId });
        // Check for match if image is also selected
        if (selected.imageId !== undefined) {
          checkMatch(selected.imageId, cardId);
        }
      }
    }
  };

  // Check if selected cards match
  const checkMatch = (imageId, wordId) => {
    setGameState("verifying");

    const imageCard = imageCards.find((c) => c.id === imageId);
    const wordCard = wordCards.find((c) => c.id === wordId);

    if (!imageCard || !wordCard) {
      setGameState("playing");
      return;
    }

    const isMatch = imageCard.originalId === wordCard.originalId;

    if (isMatch) {
      // Correct match!
      // const matchScore = 50 + Math.floor(timer / 2);
      const newMatchedPairsCount = matchedPairsCount + 1;
      const matchScore = 50;
      setScore((prev) => prev + matchScore);

      // Increment matched pairs count
      // setMatchedPairsCount((prev) => prev + 1);
      setMatchedPairsCount(newMatchedPairsCount);

      // Play match sound
      if (matchSfx) {
        playMatch();
      }

      setUsedItemIds((prev) =>
        prev.map((item) =>
          item.id === imageCard.originalId ? { ...item, match: true } : item
        )
      );

      // Create floating score animation
      const floatingId = `${Date.now()}-${Math.random()}`;
      setFloatingScores((prev) => [
        ...prev,
        {
          id: floatingId,
          score: matchScore,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        },
      ]);

      // Remove floating score after animation
      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((fs) => fs.id !== floatingId));
      }, 1500);

      // Helper to update card state
      const updateCardState = (cardId, state) => {
        const updateFn = (prev) => {
          return prev.map((c) => (c.id === cardId ? { ...c, ...state } : c));
        };
        return updateFn;
      };

      // Immediately mark as matched
      setImageCards(updateCardState(imageId, { matched: true }));
      setWordCards(updateCardState(wordId, { matched: true }));
      // Clear selection
      setSelected({});

      setTimeout(() => {
        triggerReplaceAnimation(imageCard.originalId);
      }, 480);

      // Return to playing state
      setTimeout(() => setGameState("playing"), 300);
    } else {
      // Incorrect match
      if (errorSfx) {
        playError();
      }

      // Helper to update card state
      const updateCardState = (cardId, state) => (prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...state } : c));

      // Show error animation
      setImageCards(updateCardState(imageId, { error: true }));
      setWordCards(updateCardState(wordId, { error: true }));

      // Remove error state and selection after showing error
      setTimeout(() => {
        setImageCards(updateCardState(imageId, { error: false }));
        setWordCards(updateCardState(wordId, { error: false }));
        setSelected({});
        setGameState("playing");
      }, 800);
    }
  };

  const executeCardReplacement = useCallback(
    (matchedOriginalId) => {
      const availableItems = data.filter(
        (item) => !usedItemIds.some((used) => used.id === item.id)
      );

      // 1) Fade-out old cards (visual only)
      if (availableItems.length === 0) {
        const unusedMatches = usedItemIds.filter((it) => !it.match);
        if (unusedMatches.length !== 0) {
          const getItem =
            unusedMatches.find((it) => it.id === matchedOriginalId) ||
            unusedMatches[0];
          if (getItem) {
            setImageCards((prev) =>
              prev.map((c) =>
                c.originalId === matchedOriginalId
                  ? { ...c, replacing: false }
                  : c
              )
            );
            setWordCards((prev) =>
              prev.map((c) =>
                c.originalId === matchedOriginalId
                  ? { ...c, replacing: false }
                  : c
              )
            );
          }
        }
      } else {
        setImageCards((prev) =>
          prev.map((c) =>
            c.originalId === matchedOriginalId ? { ...c, replacing: true } : c
          )
        );
        setWordCards((prev) =>
          prev.map((c) =>
            c.originalId === matchedOriginalId ? { ...c, replacing: true } : c
          )
        );
      }

      // 2) After fade-out duration -> do atomic replace (remove old then insert new), then shuffle
      setTimeout(() => {
        // ---------- choose item ----------
        // if no available items -> try reuse from usedItemIds where match===false
        if (availableItems.length === 0) {
          const unusedMatches = usedItemIds.filter((it) => !it.match);
          if (unusedMatches.length === 0) {
            // nothing to replace with
            return;
          }
          // find the reused item by original id (match original behavior)
          const getItem =
            unusedMatches.find((it) => it.id === matchedOriginalId) ||
            unusedMatches[0];

          if (!getItem) return;

          const uniqueBase = Date.now();
          const newImageCard = {
            id: `${getItem.id}-img-${uniqueBase}`,
            originalId: getItem.id,
            type: "image",
            content: getItem.word,
            image: getItem.image,
            matched: true,
            error: false,
            replacing: false,
            entering: false,
          };
          const newWordCard = {
            id: `${getItem.id}-word-${uniqueBase}`,
            originalId: getItem.id,
            type: "word",
            content: getItem.word,
            matched: true,
            error: false,
            replacing: false,
            entering: false,
          };

          // setImageCards((prev) => {
          //   return prev.map((c) =>
          //     c.originalId === matchedOriginalId ? newImageCard : c
          //   );
          // });

          // setWordCards((prev) => {
          //   return prev.map((c) =>
          //     c.originalId === matchedOriginalId ? newWordCard : c
          //   );
          // });

          setImageCards((prev) => {
            const shuffle = prev.map((c) =>
              c.originalId === matchedOriginalId ? newImageCard : c
            );
            return shuffleArray(shuffle);
          });

          setWordCards((prev) => {
            const shuffle = prev.map((c) =>
              c.originalId === matchedOriginalId ? newWordCard : c
            );
            return shuffleArray(shuffle);
          });

          // mark reused item as used (if you track usedItemIds)
          setUsedItemIds((prev) =>
            prev.map((u) => (u.id === getItem.id ? { ...u, match: true } : u))
          );
        } else {
          // ---------- have available items -> pick new ----------
          const newItem =
            availableItems[Math.floor(Math.random() * availableItems.length)];
          if (!newItem) return;

          // add to usedItemIds (match:false)
          setUsedItemIds((prev) => [
            ...prev,
            { ...newItem, id: newItem.id, match: false },
          ]);

          // create unique ids (use timestamp + random to be safe)
          const uniqueBase = `${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`;
          const newImageCard = {
            id: `img-${uniqueBase}`,
            originalId: newItem.id,
            type: "image",
            content: newItem.word,
            image: newItem.image,
            matched: false,

            error: false,
            replacing: false,
            entering: true,
          };
          const newWordCard = {
            id: `word-${uniqueBase}`,
            originalId: newItem.id,
            type: "word",
            content: newItem.word,
            matched: false,

            error: false,
            replacing: false,
            entering: true,
          };

          setImageCards((prev) => {
            const shuffle = prev.map((c) =>
              c.originalId === matchedOriginalId ? newImageCard : c
            );
            return shuffleArray(shuffle);
          });

          setWordCards((prev) => {
            const shuffle = prev.map((c) =>
              c.originalId === matchedOriginalId ? newWordCard : c
            );
            return shuffleArray(shuffle);
          });
        }

        // 3) cleanup entering after fade-in completes
        setTimeout(() => {
          setImageCards((prev) =>
            prev.map((c) => (c.entering ? { ...c, entering: false } : c))
          );
          setWordCards((prev) =>
            prev.map((c) => (c.entering ? { ...c, entering: false } : c))
          );
        }, 500); // match your CSS fade-in duration
      }, 300); // match your CSS fade-out duration
    },
    // include everything that function reads
    [data, usedItemIds, shuffleArray] // adjust deps (see notes)
  );

  const triggerReplaceAnimation = (matchedOriginalId) => {
    executeCardReplacement(matchedOriginalId);
  };

  // Test

  // Handle animation end events from Card components
  const handleCardAnimationEnd = useCallback((event, cardId, cardType) => {
    if (event.animationName !== "fadeInScale") return;

    // Entering animation completed - clean up entering state
    const setCards = cardType === "image" ? setImageCards : setWordCards;

    setCards((prev) => {
      const index = prev.findIndex((c) => c.id === cardId);
      if (index === -1) return prev;
      const newCards = [...prev];
      newCards[index] = { ...newCards[index], entering: false };
      return newCards;
    });

    // Remove this card from entering tracking
    // enteringCardsRef.current.delete(cardId);
  }, []);

  return (
    <div className={`${styles.gameContainer} ${globalStyles.backgroundBase}`}>
      {/* White modal card containing game content */}

      {gameState === "idle" && (
        <GameOverlay type="start" title={title} onStart={initializeGame} />
      )}

      {gameState !== "idle" && (
        <>
          <div className={styles.gameContent}>
            <h1
              className={styles.title}
              style={{
                textAlign: "center",
              }}
            >
              {title}
            </h1>

            {/* Game Header - always visible */}
            <Header
              score={score}
              timer={timer}
              onBackToHome={handleBackToHome}
            />

            {/* Game Board Container with relative positioning for overlay */}
            <div className={styles.gameBoardContainer}>
              {/* Game Over Overlay - shows inside game board */}
              {gameState === "finished" && (
                <GameOverlay
                  type="end"
                  score={score}
                  maxScore={data.length * 50}
                  matchedPairs={matchedPairsCount}
                  totalPairs={data.length}
                  isWin={isWin}
                  onStart={initializeGame}
                  timeFinished={timerLength - timer}
                  onBackToHome={handleBackToHome}
                />
              )}

              {/* Game Board - always visible to show behind overlay */}
              <GameBoard
                imageCards={imageCards}
                wordCards={wordCards}
                selected={selected}
                onCardClick={handleCardClick}
                disabled={gameState === "verifying" || gameState === "finished"}
                onCardAnimationEnd={handleCardAnimationEnd}
              />
            </div>
          </div>
          {floatingScores.map((fs) => (
            <div
              key={fs.id}
              className={styles.floatingScore}
              style={{ left: fs.x, top: fs.y }}
              aria-live="polite"
            >
              +{fs.score}
            </div>
          ))}
        </>
      )}

      {/* Floating Scores */}
    </div>
  );
}

import { useEffect, useRef, memo } from "react";
import styles from "./WhackAMole.module.css";
import useGameLogic, {
  DEFAULT_GAME_CONFIG,
  DEFAULT_GAME_DATA,
} from "./useGameLogic";
import { StartGameScreen, EndGameScreen } from "../../common";
import globalStyles from "../../common/style-global.module.css";

export default function WhackAMole({
  gameData = DEFAULT_GAME_DATA,
  gameConfig = DEFAULT_GAME_CONFIG,
  onGameEnd = null,
}) {
  const containerRef = useRef(null);
  const moleRefs = useRef([]);

  const {
    score,
    timeLeft,
    targetContent,
    moles,
    hammerPos,
    feedback,
    isGameActive,
    pointPopups,
    gameReport,
    currentProgress,
    startGame,
    restartGame,
    backToHome,
    handleMoleHit,
    setHammerPos,
  } = useGameLogic(gameData, gameConfig);
  ``;
  useEffect(() => {
    if (gameReport && onGameEnd) onGameEnd(gameReport);
  }, [gameReport, onGameEnd]);

  useEffect(() => {
    const moveHammer = (e) => {
      const container = containerRef.current;
      if (!container) return;
      let x = 0,
        y = 0;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      const rect = container.getBoundingClientRect();
      setHammerPos({ x: `${x - rect.left}px`, y: `${y - rect.top}px` });
    };
    window.addEventListener("mousemove", moveHammer, { passive: true });
    window.addEventListener("touchmove", moveHammer, { passive: true });
    window.addEventListener("touchstart", moveHammer, { passive: true });
    return () => {
      window.removeEventListener("mousemove", moveHammer);
      window.removeEventListener("touchmove", moveHammer);
      window.removeEventListener("touchstart", moveHammer);
    };
  }, [setHammerPos]);

  const MoleCell = memo(({ mole, index }) => {
    const ans = mole?.content;
    const isUp = mole?.up || false;

    if (!ans) {
      return (
        <div className={styles.hole}>
          <div
            ref={(el) => (moleRefs.current[index] = el)}
            className={`${styles.mole} ${isUp ? styles.up : ""}`}
            data-id={index}
            data-content-id=""
            data-up={isUp}
            role="button"
            tabIndex={isUp ? 0 : -1}
            aria-label="Empty hole"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMoleHit(e, moleRefs, containerRef);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleMoleHit(e, moleRefs, containerRef);
              }
            }}
          >
            <div className={styles.moleEyes}>
              <div className={styles.eye} />
              <div className={styles.eye} />
            </div>
            <div className={styles.moleNose} />
          </div>
        </div>
      );
    }

    const displayMode = targetContent?.displayMode || "text_only";
    const showText =
      displayMode === "text_only" || displayMode === "text_and_image";
    const showImage =
      (displayMode === "image_only" || displayMode === "text_and_image") &&
      !!ans.image;

    return (
      <div className={styles.hole}>
        <div
          ref={(el) => (moleRefs.current[index] = el)}
          className={`${styles.mole} ${isUp ? styles.up : ""}`}
          data-id={index}
          data-content-id={ans.id}
          data-up={isUp}
          role="button"
          tabIndex={isUp ? 0 : -1}
          aria-label={`Answer: ${ans.text || ans.id}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMoleHit(e, moleRefs, containerRef);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMoleHit(e, moleRefs, containerRef);
            }
          }}
        >
          <div className={styles.moleEyes}>
            <div className={styles.eye} />
            <div className={styles.eye} />
          </div>
          <div className={styles.moleNose} />
          <div className={styles.wordBubble}>
            {showImage && <img src={ans.image} alt={ans.text || ans.id} />}
            {showText && <span>{ans.text || ""}</span>}
          </div>
        </div>
      </div>
    );
  });

  // const rows = [[0, 1], [2, 3]];

  return (
    <div
      ref={containerRef}
      // className={styles.gameContainer}
      className={`${styles.gameContainer} ${globalStyles.backgroundBase}`}
      onClick={(e) => {
        e.preventDefault();
        handleMoleHit(e, moleRefs, containerRef);
      }}
      role="main"
      aria-label="Whack-a-Quiz Game"
    >
      {!isGameActive && timeLeft === gameConfig.gameDuration && (
        <StartGameScreen
          onStartGame={startGame}
          title="Whack-a-Quiz!"
          description="Hit the mole with the correct answer
Be quick for more points!"
          buttonText="Start Game"
          buttonIcon="🚀"
          showFloatingMoles={true}
          floatingEmoji="🦫"
        />
      )}

      {!isGameActive && timeLeft < gameConfig.gameDuration && gameReport && (
        <EndGameScreen
          gameReport={gameReport}
          onPlayAgain={restartGame}
          onBackToHome={backToHome}
        />
      )}

      {isGameActive && (
        <>
          <div className={styles.headerPane}>
            <div>
              Score: <span>{score}</span>
            </div>
            <div>
              Time: <span>{timeLeft}</span>
            </div>
            {targetContent && (
              <div>
                Progress:{" "}
                <span>
                  {currentProgress.current}/{currentProgress.total}
                </span>
              </div>
            )}
          </div>

          <div className={styles.targetPane}>
            {targetContent ? (
              <div className={styles.targetContent}>
                {targetContent.promptImage && (
                  <img
                    src={targetContent.promptImage}
                    alt={targetContent.promptText || "Question image"}
                    className={styles.targetImage}
                  />
                )}
                {targetContent.promptText && (
                  <div className={styles.targetText}>
                    {targetContent.promptText}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.targetPlaceholder}>
                Pick the right answer!
              </div>
            )}
          </div>

          <div className={styles.playArea}>
            {moles.map((mole, i) => (
              <MoleCell key={i} mole={mole} index={i} />
            ))}
          </div>
        </>
      )}

      {pointPopups.map((p) => (
        <div
          key={p.id}
          className={styles.pointPopup}
          style={{ left: p.left, top: p.top }}
        >
          +{p.points}
        </div>
      ))}

      <div
        className={`${styles.hammer} ${feedback.hammerHit ? styles.hit : ""}`}
        style={{ left: hammerPos.x, top: hammerPos.y }}
      />
      <div
        className={`${styles.feedback} ${feedback.show ? styles.show : ""}`}
        style={{ color: feedback.color }}
      >
        {feedback.text}
      </div>
    </div>
  );
}

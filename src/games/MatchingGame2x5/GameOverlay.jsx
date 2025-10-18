import { EndGameScreen, StartGameScreen } from "../../common";
import styles from "./MatchingGame.module.css";

/**
 * GameOverlay component for the matching game
 * @param {Object} props
 * @param {string} props.type - Overlay type ("start" | "end")
 * @param {string} props.title - Overlay title
 * @param {number} props.score - Final score (for end screen)
 * @param {number} props.maxScore - Maximum possible score (for end screen)
 * @param {number} props.matchedPairs - Number of matched pairs (for end screen)
 * @param {number} props.totalPairs - Total number of pairs in the game (for end screen)
 * @param {boolean} props.isWin - Whether the player won (completed all matches) or lost (time ran out)
 * @param {Function} props.onStart - Callback when start button clicked
 * @returns {JSX.Element}
 */
export default function GameOverlay({
  type,
  title,
  score,
  maxScore,
  matchedPairs,
  totalPairs,
  isWin,
  onStart,
  timeFinished,
  onBackToHome,
}) {
  if (type === "start") {
    return (
      // <div className={styles.startGame}>
      //   <div className={styles.overlayHeader}>
      //     <h1 className={styles.title}>{title || "Picture Match Fun!"}</h1>
      //     <h2 className={styles.modalTitle}>Ready to Play?</h2>
      //   </div>

      //   <button className={styles.startButton} onClick={onStart}>
      //     Start Game
      //   </button>
      // </div>
      <StartGameScreen
        onStartGame={onStart}
        title={title}
        description="Ready to Play?"
        buttonText="Start Game"
        buttonIcon="🚀"
        showFloatingMoles={false}
        floatingEmoji="🦫"
      />
    );
  }

  if (type === "end") {
    const scorePercentage =
      maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Determine result message
    const resultMessage = isWin ? "Perfect!" : "Time's Up!";

    const resultEmoji = isWin ? "🎉" : matchedPairs === 0 ? "😔" : "⏰";

    const resultTextSuggestion = isWin
      ? "Congratulations! You got them all correct! 🏆"
      : "Good try! Keep practicing and you'll do even better! 💪✨";
    const gameReport = {
      finalScore: score,
      totalQuestions: totalPairs,
      correctAnswers: matchedPairs,
      accuracy: scorePercentage,
      timeUsed: timeFinished,
    };
    return (
      // <div
      //   className={styles.gameOverOverlay}
      //   style={{
      //     background: !isWin ? "#ff5722bf" : "#4caf50cc",
      //   }}
      // >
      //   <div className={styles.gameOverContent}>
      //     <div className={styles.gameOverHeader}>
      //       <span className={styles.partyEmoji}>{resultEmoji}</span>
      //       <h2
      //         className={`${styles.gameOverTitle} ${
      //           isWin ? styles.win : styles.lose
      //         }`}
      //       >
      //         {resultMessage}
      //       </h2>
      //       {/* <span className={styles.partyEmoji}>{resultEmoji}</span> */}
      //     </div>
      //     <p className={styles.resultSuggestion}>{resultTextSuggestion}</p>

      //     <div className={styles.scoreStats}>
      //       <span className={styles.scoreLabel}>Final score:</span>
      //       <span className={styles.userScore}>{score}</span>
      //     </div>

      //     <div className={styles.statsContainer}>
      //       <div className={styles.matchedStats}>
      //         <span className={styles.matchedLabel}>Questions:</span>
      //         <span className={styles.matchedValue}>{totalPairs || 0}</span>
      //       </div>
      //       <div className={styles.matchedStats}>
      //         <span className={styles.matchedLabel}>Correct:</span>
      //         <span className={styles.matchedValue}>{matchedPairs || 0}</span>
      //       </div>
      //       <div className={styles.matchedStats}>
      //         <span className={styles.matchedLabel}>Accurancy:</span>
      //         <span className={styles.matchedValue}>
      //           {scorePercentage || 0}%
      //         </span>
      //       </div>
      //       <div className={styles.matchedStats}>
      //         <span className={styles.matchedLabel}>Time:</span>
      //         <span className={styles.matchedValue}>{timeFinished || 0}s</span>
      //       </div>

      //       {/* <div className={styles.scoreStats}>
      //         <span className={styles.scoreLabel}>Your Score</span>
      //         <div className={styles.scoreComparison}>
      //           <span className={styles.userScore}>{score}</span>
      //           <span className={styles.scoreDivider}>/</span>
      //           <span className={styles.maxScore}>{maxScore}</span>
      //         </div>
      //         <div className={styles.scorePercentage}>
      //           {scorePercentage}% Complete
      //         </div>
      //       </div> */}
      //     </div>

      //     <button className={styles.playAgainButton} onClick={onStart}>
      //       Play Again
      //     </button>
      //   </div>
      // </div>
      <EndGameScreen
        gameReport={gameReport}
        onPlayAgain={onStart}
        onBackToHome={onBackToHome}
        modal={true}
      />
    );
  }

  return null;
}

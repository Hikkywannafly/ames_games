import styles from "./MatchingGame4x3.module.css";
import { EndGameScreen, StartGameScreen } from "../../common";
import useGameLogic from "./useGameLogic";
import globalStyles from "../../common/style-global.module.css";

export default function MatchingGame4x3({ gameData, config }) {
  const {
    score,
    isStarted,
    startGame,
    handleSelect,
    board,
    homeBack,
    moves,
    timeLeft,
    selected,
    wrongPair,
    correctPair,
    isEnded,
  } = useGameLogic(gameData, config);

  return (
    <div className={`${globalStyles.backgroundBase} ${styles.gameContainer}`}>
      {!isStarted ? (
        <StartGameScreen
          title="Match-a-Roo!"
          description="Match the cards with the correct pairs! 
          Be quick to earn more points!"
          onStartGame={startGame}
          floatingEmoji=""
        />
      ) : (
        <>
          <h1 className={styles.title}>Match-a-Roo!</h1>

          <div className={styles.uiPanel}>
            <div className={`${styles.uiCard} ${styles.scoreCard}`}>
              <div className={styles.label}>Score</div>
              <div className={styles.value}>{score}</div>
            </div>
            <div className={`${styles.uiCard} ${styles.movesCard}`}>
              <div className={styles.label}>Moves</div>
              <div className={styles.value}>{moves}</div>
            </div>
            <div className={`${styles.uiCard} ${styles.timeCard}`}>
              <div className={styles.label}>Time</div>
              <div className={styles.value}>{timeLeft}</div>
            </div>
          </div>

          <div className={styles.board}>
            {board.map((card, index) => {
              const isSelected = selected.includes(index);
              const isWrong = wrongPair.includes(index);
              const isCorrect = correctPair.includes(index);

              return (
                <div
                  key={index}
                  className={`${styles.card} 
                    ${isSelected ? styles.selected : ""} 
                    ${isWrong ? styles.wrong : ""} 
                    ${isCorrect ? styles.correct : ""}`}
                  onClick={() => handleSelect(index)}
                >
                  {card.type === "image" && card.image ? (
                    <img
                      src={card.image}
                      alt={card.pair}
                      className={styles.imageCard}
                    />
                  ) : (
                    <span className={styles.word}>{card.word}</span>
                  )}
                </div>
              );
            })}
          </div>

          {isEnded && (
            <EndGameScreen
              gameReport={{
                finalScore: score,
                totalQuestions: 6,
                correctAnswers: 6,
                accuracy: 100,
                timeUsed: config.totalTime - timeLeft,
              }}
              onPlayAgain={startGame}
              onBackToHome={homeBack}
              customMessages={{
                victoryTitle: "🎉 Awesome!",
                victoryMessage: "You nailed all pairs! 🏆",
                defeatTitle: "⏰ Time's Up!",
                defeatMessage: "Don't worry, try again! 💪",
              }}
              showStats={true}
            />
          )}
        </>
      )}
    </div>
  );
}

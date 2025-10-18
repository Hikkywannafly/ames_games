import styles from "../whack-a-mole/WhackAMole.module.css";
import ButtonGame from "./ButtonGame";

/**
 * EndGameScreen - Reusable end game screen component
 * @param {Object} props
 * @param {Object} props.gameReport - Game report data
 * @param {number} props.gameReport.finalScore - Final score
 * @param {number} props.gameReport.totalQuestions - Total questions answered
 * @param {number} props.gameReport.correctAnswers - Number of correct answers
 * @param {number} props.gameReport.accuracy - Accuracy percentage (0-100)
 * @param {number} props.gameReport.timeUsed - Time used in seconds
 * @param {Function} props.onPlayAgain - Callback when play again button is clicked
 * @param {Function} props.onBackToHome - Callback when back to home button is clicked
 * @param {Object} props.customMessages - Custom victory/defeat messages
 * @param {string} props.customMessages.victoryTitle - Victory title (default: "🎉 Perfect!")
 * @param {string} props.customMessages.victoryMessage - Victory message
 * @param {string} props.customMessages.defeatTitle - Defeat title (default: "Time up!")
 * @param {string} props.customMessages.defeatMessage - Defeat message
 * @param {boolean} props.showStats - Show statistics grid (default: true)
 * @param {Object} props.buttonConfig - Button configuration
 */
export default function EndGameScreen({
    gameReport,
    onPlayAgain,
    onBackToHome,
    customMessages = {},
    showStats = true,
    buttonConfig = {}
}) {
    if (!gameReport) return null;

    const {
        finalScore,
        totalQuestions,
        correctAnswers,
        accuracy,
        timeUsed
    } = gameReport;

    const isPerfect = accuracy === 100;

    const messages = {
        victoryTitle: customMessages.victoryTitle || "🎉 Perfect!",
        victoryMessage: customMessages.victoryMessage || "Congratulations! You got them all correct! 🏆",
        defeatTitle: customMessages.defeatTitle || "Time up!",
        defeatMessage: customMessages.defeatMessage || "Good try! Keep practicing and you'll do even better! 💪✨"
    };

    const buttons = {
        playAgain: {
            text: buttonConfig.playAgainText || "Play Again",
            icon: buttonConfig.playAgainIcon || "🔄",
            show: buttonConfig.showPlayAgain !== false
        },
        backToHome: {
            text: buttonConfig.backToHomeText || "Back to Home",
            icon: buttonConfig.backToHomeIcon || "🏠",
            show: buttonConfig.showBackToHome !== false
        }
    };

    return (
        <div className={`${styles.endScreen} ${isPerfect ? styles.victory : styles.defeat}`}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {isPerfect ? messages.victoryTitle : messages.defeatTitle}
            </h1>
            <div style={{ fontSize: "1.25rem", marginBottom: "1.5rem", textAlign: "center" }}>
                {isPerfect ? (
                    <p style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#FFD700" }}>
                        {messages.victoryMessage}
                    </p>
                ) : (
                    <p style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#FFA726" }}>
                        {messages.defeatMessage}
                    </p>
                )}
                <p style={{ fontSize: "1.875rem", marginBottom: "1rem" }}>
                    Final score: <span style={{
                        color: isPerfect ? "#FFD700" : "#FFA726",
                        fontWeight: "bold"
                    }}>{finalScore}</span>
                </p>

                {showStats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <p className={styles.statLabel}>Questions:</p>
                            <p className={styles.statValue}>{totalQuestions}</p>
                        </div>
                        <div className={styles.statItem}>
                            <p className={styles.statLabel}>Correct:</p>
                            <p className={styles.statValue}>{correctAnswers}</p>
                        </div>
                        <div className={styles.statItem}>
                            <p className={styles.statLabel}>Accuracy:</p>
                            <p className={styles.statValue}>{accuracy}%</p>
                        </div>
                        <div className={styles.statItem}>
                            <p className={styles.statLabel}>Time:</p>
                            <p className={styles.statValue}>{timeUsed}s</p>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                {buttons.playAgain.show && onPlayAgain && (
                    <ButtonGame
                        onClick={onPlayAgain}
                        text={buttons.playAgain.text}
                        // icon={buttons.playAgain.icon}
                        variant="primary"
                    />
                )}
                {buttons.backToHome.show && onBackToHome && (
                    <ButtonGame
                        onClick={onBackToHome}
                        text={buttons.backToHome.text}
                        icon={buttons.backToHome.icon}
                        variant="primary"
                    />
                )}
            </div>
        </div>
    );
}

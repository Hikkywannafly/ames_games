// import styles from "../whack-a-mole/WhackAMole.module.css";
import styles from "./StartGameScreen.module.css";
import ButtonGame from "./ButtonGame";

/**
 * StartGameScreen - Reusable start screen component for games
 * @param {Object} props
 * @param {Function} props.onStartGame - Callback when start button is clicked
 * @param {string} props.title - Game title (default: "Whack-a-Quiz!")
 * @param {string} props.description - Game description
 * @param {string} props.buttonText - Start button text (default: "Start Game")
 * @param {string} props.buttonIcon - Start button icon (default: "🚀")
 * @param {boolean} props.showFloatingMoles - Show floating mole decorations (default: true)
 * @param {string} props.floatingEmoji - Emoji for floating decorations (default: "🦫")
 */
export default function StartGameScreen({
  onStartGame,
  title = "Whack-a-Quiz!",
  description = "Hit the mole with the correct answer\nBe quick for more points!",
  buttonText = "Start Game",
  buttonIcon = "🚀",

}) {
  return (
    <div className={styles.startScreen}>

      <div className={styles.titleContainer}>
        <h1 className={styles.gameTitle}>{title}</h1>
        <div className={styles.titleUnderline}></div>
      </div>
      <p className={styles.gameDescription}>
        {description.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            {index < description.split("\n").length - 1 && <br />}
          </span>
        ))}
      </p>
      <ButtonGame
        onClick={onStartGame}
        text={buttonText}
        icon={buttonIcon}
        variant="primary"
      />
    </div>
  );
}

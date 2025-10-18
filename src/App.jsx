import WhackAMole from "./whack-a-mole/WhackAMole";
import "./App.css";
import {
  DEFAULT_GAME_CONFIG,
  DEFAULT_GAME_DATA,
} from "./whack-a-mole/useGameLogic";
// import MatchingGame4x3 from "./matching-game-4x3/MatchingGame4x3";
// import {
//   DEFAULT_GAME_CONFIG,
//   DEFAULT_GAME_DATA,
// } from "./matching-game-4x3/useGameLogic";

function App() {
  const handleGameEnd = (gameReport) => {
    console.log("Game ended!", gameReport);
    // Here you can send the report to your backend
    console.log(
      `Game Over! Score: ${gameReport.finalScore}, Accuracy: ${gameReport.accuracy}%`
    );
  };

  return (
    <WhackAMole
      gameData={DEFAULT_GAME_DATA}
      gameConfig={DEFAULT_GAME_CONFIG}
      onGameEnd={handleGameEnd}
    />
    // <MatchingGame4x3
    // config={DEFAULT_GAME_CONFIG}
    // gameData={DEFAULT_GAME_DATA}
    // />
  );
}

export default App;

import WhackAMole from "./games/whack-a-mole/WhackAMole";
import {
  DEFAULT_GAME_DATA,
  DEFAULT_GAME_CONFIG,
} from "./games/whack-a-mole/useGameLogic";
import "./App.css";
import { Route, Routes } from "react-router";
import MatchingGame4x3 from "./games/MatchingGame4x3/page.jsx";
import MatchingGame from "./games/MatchingGame2x5/MatchingGame.jsx";

function App() {
  const handleGameEnd = (gameReport) => {
    console.log("Game ended!", gameReport);
    // Here you can send the report to your backend
    console.log(
      `Game Over! Score: ${gameReport.finalScore}, Accuracy: ${gameReport.accuracy}%`
    );
  };

  return (
    // <WhackAMole
    //   gameData={DEFAULT_GAME_DATA}
    //   gameConfig={DEFAULT_GAME_CONFIG}
    //   onGameEnd={handleGameEnd}
    // />
    <Routes>
      <Route
        index
        element={
          <WhackAMole
            gameData={DEFAULT_GAME_DATA}
            gameConfig={DEFAULT_GAME_CONFIG}
            onGameEnd={handleGameEnd}
          />
        }
      />
      <Route path="matchingame2x5" element={<MatchingGame />} />
      <Route
        path="matchingame4x3"
        element={
          <MatchingGame4x3
            gameData={DEFAULT_GAME_DATA_MATCHING_4x3}
            config={DEFAULT_GAME_CONFIG_MATCHING_4x3}
          />
        }
      />
    </Routes>
  );
}

export default App;

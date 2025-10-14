import WhackAMole from './whack-a-mole/WhackAMole'
import { DEFAULT_GAME_DATA, DEFAULT_GAME_CONFIG } from './whack-a-mole/useGameLogic'
import './App.css'

function App() {
  const handleGameEnd = (gameReport) => {
    console.log('Game ended!', gameReport);
    // Here you can send the report to your backend
    console.log(`Game Over! Score: ${gameReport.finalScore}, Accuracy: ${gameReport.accuracy}%`);
  };

  return (
    <WhackAMole
      gameData={DEFAULT_GAME_DATA}
      gameConfig={DEFAULT_GAME_CONFIG}
      onGameEnd={handleGameEnd}
    />
  );
}

export default App

import React from 'react';
import WhackAMole from '../whack-a-mole/WhackAMole';

// Example game data that could come from backend
const exampleGameData = [
    {
        word: "Apple",
        image: "https://placehold.co/200x200/FF0000/FFFFFF?text=🍎",
        question: "What fruit is this?"
    },
    {
        word: "Banana",
        image: "https://placehold.co/200x200/FFFF00/000000?text=🍌",
        question: "What fruit is this?"
    },
    {
        word: "Dog",
        image: "https://placehold.co/200x200/A52A2A/FFFFFF?text=🐕",
        question: "What animal is this?"
    },
    {
        word: "Cat",
        image: "https://placehold.co/200x200/808080/FFFFFF?text=🐱",
        question: "What animal is this?"
    },
    {
        word: "Sun",
        image: "https://placehold.co/200x200/FFD700/000000?text=☀️",
        question: "What celestial body is this?"
    },
    {
        word: "Moon",
        image: "https://placehold.co/200x200/F0E68C/000000?text=🌙",
        question: "What celestial body is this?"
    },
    // Example with text-only content
    {
        word: "Red",
        text: "Red",
        question: "What color is the apple?"
    },
    {
        word: "Yellow",
        text: "Yellow",
        question: "What color is the banana?"
    }
];

// Example game configuration
const exampleGameConfig = {
    moleCount: 5,
    gameDuration: 30, // 30 seconds
    roundDelayMs: 800,
    pointsPerCorrect: 100,
    bonusPointsPerSecond: 20,
    maxBonusTime: 5, // Max 5 seconds for bonus
};

export default function GameExample() {
    const handleGameEnd = (gameReport) => {
        console.log('Game ended!', gameReport);
        // Here you can send the report to your backend
        // fetch('/api/game-results', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(gameReport)
        // });
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <WhackAMole
                gameData={exampleGameData}
                gameConfig={exampleGameConfig}
                onGameEnd={handleGameEnd}
            />
        </div>
    );
}

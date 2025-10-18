import { useState, useEffect, useRef } from "react";

import correctSoundFile from "../../common/sounds/whalemole/correct.wav";
import wrongSoundFile from "../../common/sounds/whalemole/error.wav";
import matchSoundFile from "../../common/sounds/matching2x5/match.mp3";
import finalSoundFile from "../../common/sounds/whalemole/final.ogg";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function useGameLogic(gameData, config) {
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.totalTime);
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState([]);
  const [wrongPair, setWrongPair] = useState([]);
  const [correctPair, setCorrectPair] = useState([]);
  const [queue, setQueue] = useState([]);

  const timerRef = useRef(null);

  const correctSound = new Audio(
    /* @vite-ignore */ new URL(
      "../../common/sounds/whalemole/correct.wav",
      import.meta.url
    )
  );
  const wrongSound = new Audio(
    /* @vite-ignore */ new URL(
      "../../common/sounds/whalemole/error.wav",
      import.meta.url
    )
  );
  const matchSound = new Audio(
    /* @vite-ignore */ new URL(
      "../../common/sounds/matching2x5/match.mp3",
      import.meta.url
    )
  );
  const finalSound = new Audio(
    /* @vite-ignore */ new URL(
      "../../common/sounds/whalemole/final.ogg",
      import.meta.url
    )
  );

  correctSound.volume = 0.5;
  wrongSound.volume = 0.5;
  matchSound.volume = 0.5;
  finalSound.volume = 0.6;

  const endGame = () => {
    setIsEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const homeBack = () => {
    setIsStarted(false);
    setIsEnded(false);
    setBoard([]);
    setQueue([]);
    setSelected([]);
    setWrongPair([]);
    setCorrectPair([]);
    setScore(0);
    setMoves(0);
    setTimeLeft(config.totalTime);
  };

  const startGame = () => {
    const shuffled = shuffle(gameData);
    const first6 = shuffled.slice(0, 6);
    const rest = shuffled.slice(6);

    const initialBoard = shuffle(
      first6.flatMap((item) => [
        { type: "image", image: item.image, pair: item.text },
        { type: "word", word: item.text, pair: item.text },
      ])
    );

    setBoard(initialBoard);
    setQueue(rest);
    setSelected([]);
    setWrongPair([]);
    setCorrectPair([]);
    setScore(0);
    setMoves(0);
    setTimeLeft(config.totalTime);
    setIsStarted(true);
    setIsEnded(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelect = (index) => {
    if (!isStarted) return;
    if (selected.includes(index)) return;

    const newSelected = [...selected, index];
    setSelected(newSelected);
    correctSound.play();

    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      const [a, b] = newSelected;

      if (board[a].pair === board[b].pair && board[a].type !== board[b].type) {
        matchSound.play();
        setCorrectPair([a, b]);

        setTimeout(() => {
          setScore((prev) => prev + 1);
          let newBoard = board.filter((_, i) => i !== a && i !== b);

          if (queue.length > 0) {
            const [next, ...restQueue] = queue;
            const newPair = [
              { type: "image", image: next.image, pair: next.text },
              { type: "word", word: next.text, pair: next.text },
            ];
            newBoard = shuffle([...newBoard, ...newPair]);
            setQueue(restQueue);
          }

          setBoard(newBoard);
          setSelected([]);
          setCorrectPair([]);

          if (newBoard.length === 0) endGame();
        }, 600);
      } else {
        wrongSound.play();
        setWrongPair(newSelected);
        setTimeout(() => {
          setWrongPair([]);
          setSelected([]);
        }, 600);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isStarted,
    isEnded,
    score,
    moves,
    timeLeft,
    startGame,
    handleSelect,
    homeBack,
    board,
    selected,
    wrongPair,
    correctPair,
    queue,
  };
}

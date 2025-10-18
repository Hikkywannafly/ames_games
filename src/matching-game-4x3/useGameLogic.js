import { useState, useEffect, useRef } from "react";

import correctSoundFile from "../assets/correct.wav";
import wrongSoundFile from "../assets/error.wav";
import matchSoundFile from "../assets/match.wav";
import finalSoundFile from "../assets/final.ogg";

export const DEFAULT_GAME_DATA = [
  {
    text: "Apple",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
  },
  {
    text: "Banana",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
  },
  {
    text: "Strawberry",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/PerfectStrawberry.jpg",
  },
  {
    text: "Grape",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/Table_grapes_on_white.jpg",
  },
  {
    text: "Orange",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg",
  },
  {
    text: "Pineapple",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg",
  },
  {
    text: "Lemon",
    image: "https://cdn.britannica.com/84/188484-050-F27B0049/lemons-tree.jpg",
  },
  {
    text: "Water Melon",
    image:
      "https://thvnext.bing.com/th/id/OIP.1GQiZGpoPVXadfZCucNi2AHaFE?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
];

export const DEFAULT_GAME_CONFIG = {
  totalTime: 60,
};

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function useGameLogic(
  gameData = DEFAULT_GAME_DATA,
  config = DEFAULT_GAME_CONFIG
) {
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

  const correctSound = new Audio(correctSoundFile);
  const wrongSound = new Audio(wrongSoundFile);
  const matchSound = new Audio(matchSoundFile);
  const finalSound = new Audio(finalSoundFile);

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

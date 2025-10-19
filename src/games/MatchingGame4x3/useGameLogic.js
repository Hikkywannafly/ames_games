import { useCallback, useState, useEffect, useRef } from "react";
import useSound from "use-sound";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Load sound with fallback .wav -> .mp3 -> .ogg
const loadSound = (basePath, exts = [".wav", ".mp3", ".ogg"]) => {
  for (let ext of exts) {
    try {
      return new URL(`${basePath}${ext}`, import.meta.url).href;
    } catch {}
  }
  return "";
};

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
  const soundEnabledRef = useRef(false);
  // Load sound URLs
  const selectUrl = loadSound("../../common/sounds/matching2x5/select");
  const correctUrl = loadSound("../../common/sounds/whalemole/correct");
  const matchUrl = loadSound("../../common/sounds/matching4x3/match");
  const finalUrl = loadSound("../../common/sounds/matching2x5/final");
  const errorUrl = loadSound("../../common/sounds/whalemole/error");

  // useSound hooks
  const [playSelect] = useSound(selectUrl || "", { volume: 0.5, soundEnabled: soundEnabledRef.current });
  const [playCorrect] = useSound(correctUrl || "", { volume: 0.5, soundEnabled: soundEnabledRef.current });
  const [playMatch] = useSound(matchUrl || "", { volume: 0.6, soundEnabled: soundEnabledRef.current });
  const [playFinal] = useSound(finalUrl || "", { volume: 0.6, soundEnabled: soundEnabledRef.current });
  const [playWrong] = useSound(errorUrl || "", { volume: 0.5, soundEnabled: soundEnabledRef.current });

  const endGame = useCallback(() => {
    setIsEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    soundEnabledRef.current = true; 
    playFinal();
  }, [playFinal]);

  const homeBack = useCallback(() => {
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
  }, [config.totalTime]);

  const startGame = useCallback(() => {
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

    soundEnabledRef.current = true;
  }, [gameData, config.totalTime, endGame]);

  const handleSelect = useCallback(
    (index) => {
      if (!isStarted || selected.includes(index)) return;

      soundEnabledRef.current = true; 
      const newSelected = [...selected, index];
      setSelected(newSelected);
      playSelect();

      if (newSelected.length === 2) {
        setMoves((prev) => prev + 1);
        const [a, b] = newSelected;

        if (board[a].pair === board[b].pair && board[a].type !== board[b].type) {
          playMatch();
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

          playCorrect();
        } else {
          playWrong();
          setWrongPair(newSelected);
          setTimeout(() => {
            setWrongPair([]);
            setSelected([]);
          }, 600);
        }
      }
    },
    [board, isStarted, queue, selected, endGame, playCorrect, playMatch, playSelect, playWrong]
  );

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

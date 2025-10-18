import { useCallback, useState, useEffect, useRef } from "react";

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

  // Audio refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const matchSoundRef = useRef(null);
  const finalSoundRef = useRef(null);

  const initSounds = useCallback(() => {
    if (
      correctSoundRef.current &&
      wrongSoundRef.current &&
      matchSoundRef.current &&
      finalSoundRef.current
    )
      return;
    try {
      correctSoundRef.current = new Audio(
        new URL("../assets/correct.wav", import.meta.url).href
      );
      wrongSoundRef.current = new Audio(
        new URL("../assets/error.wav", import.meta.url).href
      );
      matchSoundRef.current = new Audio(
        new URL("../assets/match.wav", import.meta.url).href
      );
      finalSoundRef.current = new Audio(
        new URL("../assets/final.ogg", import.meta.url).href
      );

      correctSoundRef.current.volume = 0.5;
      wrongSoundRef.current.volume = 0.5;
      matchSoundRef.current.volume = 0.6;
      finalSoundRef.current.volume = 0.6;
    } catch (error) {
      console.error("Failed to load sounds:", error);
    }
  }, []);

  const endGame = useCallback(() => {
    setIsEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    finalSoundRef.current?.play();
  }, []);

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
    initSounds();

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
  }, [gameData, config.totalTime, endGame, initSounds]);

  const handleSelect = useCallback(
    (index) => {
      if (!isStarted) return;
      if (selected.includes(index)) return;

      const newSelected = [...selected, index];
      setSelected(newSelected);
      correctSoundRef.current?.play();

      if (newSelected.length === 2) {
        setMoves((prev) => prev + 1);
        const [a, b] = newSelected;

        if (
          board[a].pair === board[b].pair &&
          board[a].type !== board[b].type
        ) {
          matchSoundRef.current?.play();
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
          wrongSoundRef.current?.play();
          setWrongPair(newSelected);
          setTimeout(() => {
            setWrongPair([]);
            setSelected([]);
          }, 600);
        }
      }
    },
    [board, isStarted, queue, selected, endGame]
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

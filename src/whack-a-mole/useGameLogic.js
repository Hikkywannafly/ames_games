
import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_GAME_CONFIG = {
    moleCount: 4,
    gameDuration: 60,
    roundDelayMs: 500,
    pointsPerCorrect: 100,
    bonusPointsPerSecond: 10,
    maxBonusTime: 10,
};

export const DEFAULT_GAME_DATA = [
    {
        question: "What animal is in the picture?",
        questionImage: "https://upload.wikimedia.org/wikipedia/commons/2/26/YellowLabradorLooking_new.jpg",
        answers: ["Dog", "Cat", "Bird", "Fish"],
        correctAnswer: "Dog"
    },
    {
        question: "Which picture shows an apple?",
        answers: [
            { id: "apple", text: "Apple", image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg" },
            { id: "banana", text: "Banana", image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg" },
            { id: "orange", text: "Orange", image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg" },
            { id: "grape", text: "Grapes", image: "https://static.vecteezy.com/system/resources/thumbnails/007/697/457/small_2x/a-mouth-watering-isometric-icon-of-grapes-vector.jpg" }
        ],
        correctAnswer: { id: "apple", text: "Apple", image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg" }
    },
    {
        question: "What shape is this?",
        questionImage: "https://static.wikia.nocookie.net/scribblenauts/images/d/d1/Square.png/revision/latest?cb=20140813193140",
        answers: ["Square", "Circle", "Triangle", "Rectangle"],
        correctAnswer: "Square"
    },
    {
        question: "Which animal lives in water?",
        answers: [
            { id: "dog", text: "Dog", image: "https://upload.wikimedia.org/wikipedia/commons/2/26/YellowLabradorLooking_new.jpg" },
            { id: "cat", text: "Cat", image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg" },
            { id: "fish", text: "Fish", image: "https://www.shutterstock.com/image-vector/clownfish-vibrant-small-marine-fish-600nw-2488428137.jpg" },
            { id: "bird", text: "Bird", image: "https://upload.wikimedia.org/wikipedia/commons/3/32/House_sparrow04.jpg" }
        ],
        correctAnswer: { id: "fish", text: "Fish", image: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Goldfish3.jpg" }
    },
    {
        question: "What is the capital of Vietnam?",
        answers: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hue"],
        correctAnswer: "Hanoi"
    },
    {
        question: "Từ 'Cá' trong tiếng Anh là gì?",
        answers: ["Fish", "Frog", "Bird", "Duck"],
        correctAnswer: "Fish",
        questionImage: "https://www.shutterstock.com/image-vector/clownfish-vibrant-small-marine-fish-600nw-2488428137.jpg"
    },
];

const makeEmptyMoles = (n) => Array.from({ length: n }, () => ({ up: false, content: "" }));


function buildRoundOptions(gameData, moleCount, questionIndex) {

    if (questionIndex >= gameData.length) {
        return null;
    }

    const q = gameData[questionIndex];
    const correct = q.correctAnswer;
    const pool = q.answers ?? [];

    const isSame = (a, b) => {
        if (typeof a === 'string' && typeof b === 'string') {
            return a === b;
        }
        if (a && b && a.id && b.id) {
            return a.id === b.id;
        }
        return JSON.stringify(a) === JSON.stringify(b);
    };

    const distractors = pool.filter(a => !isSame(a, correct));

    let options = [correct];

    for (let i = 0; i < Math.min(moleCount - 1, distractors.length); i++) {
        options.push(distractors[i]);
    }

    while (options.length < moleCount) {
        options.push(null);
    }

    return { question: q, correct, options: options };
}

export default function useGameLogic(gameData = DEFAULT_GAME_DATA, gameConfig = DEFAULT_GAME_CONFIG) {
    const { moleCount, gameDuration, roundDelayMs, pointsPerCorrect, bonusPointsPerSecond, maxBonusTime } = gameConfig;

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameDuration);
    const [targetContent, setTargetContent] = useState(null);
    const [moles, setMoles] = useState(makeEmptyMoles(moleCount));
    const [isGameActive, setIsGameActive] = useState(false);
    const [feedback, setFeedback] = useState({ show: false, text: "", color: "", hammerHit: false });
    const [hammerPos, setHammerPos] = useState({ x: "50%", y: "50%" });
    const [pointPopups, setPointPopups] = useState([]);
    const [gameReport, setGameReport] = useState(null);
    const [currentProgress, setCurrentProgress] = useState({ current: 0, total: gameData.length });

    const gameTimerRef = useRef(null);
    const roundTimerRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const currentCorrectOptionRef = useRef(null);
    const isGameActiveRef = useRef(false);
    const totalQuestionsRef = useRef(0);
    const correctAnswersRef = useRef(0);
    const roundLockedRef = useRef(false);
    const lastClickTimeRef = useRef(0);
    const currentQuestionIndexRef = useRef(0);
    const CLICK_DEBOUNCE_MS = 50;

    const soundsReadyRef = useRef(false);
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);
    const popupTimeoutsRef = useRef(new Set());

    const initSounds = useCallback(async () => {
        if (soundsReadyRef.current) return;
        const Tone = (typeof window !== "undefined" && window.Tone) || null;
        if (!Tone) return;
        try {
            await Tone.start();
            correctSoundRef.current = new Tone.Synth({
                oscillator: { type: "triangle" },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
            }).toDestination();
            wrongSoundRef.current = new Tone.Synth({
                oscillator: { type: "square" },
                envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.5 },
            }).toDestination();
            soundsReadyRef.current = true;
        } catch {
            soundsReadyRef.current = false;
        }
    }, []);

    useEffect(() => {
        const currentPopupTimeouts = popupTimeoutsRef.current;
        return () => {
            if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
            if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
            // Clear all popup timeouts
            currentPopupTimeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
            currentPopupTimeouts.clear();
        };
    }, []);

    const endGameInternal = useCallback(() => {
        setIsGameActive(false);
        isGameActiveRef.current = false;
        if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        setMoles(prev => prev.map(m => ({ ...m, up: false })));

        // Generate game report
        const accuracy = totalQuestionsRef.current > 0 ? (correctAnswersRef.current / totalQuestionsRef.current) * 100 : 0;
        setGameReport({
            finalScore: score,
            totalQuestions: totalQuestionsRef.current,
            correctAnswers: correctAnswersRef.current,
            accuracy: Math.round(accuracy),
            gameDuration: gameDuration,
            timeUsed: gameDuration - timeLeft,
            isCompleted: currentQuestionIndexRef.current >= gameData.length
        });
    }, [score, timeLeft, gameDuration, gameData.length]);

    const updateGameTimer = useCallback(() => {
        setTimeLeft(prev => {
            const next = prev - 1;
            if (next <= 0) {
                endGameInternal();
                return 0;
            }
            return next;
        });
    }, [endGameInternal]);

    const nextRound = useCallback(() => {
        if (!isGameActiveRef.current) return;

        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);

        roundLockedRef.current = false;
        setMoles(makeEmptyMoles(moleCount));

        roundTimerRef.current = window.setTimeout(() => {
            if (!isGameActiveRef.current) return;
            roundLockedRef.current = false;

            // Check if all questions are completed
            if (currentQuestionIndexRef.current >= gameData.length) {
                endGameInternal();
                return;
            }

            const roundData = buildRoundOptions(gameData, moleCount, currentQuestionIndexRef.current);

            if (!roundData) {
                endGameInternal();
                return;
            }

            const { question, correct, options } = roundData;
            currentCorrectOptionRef.current = correct;
            setTargetContent(question);
            roundStartRef.current = Date.now();
            totalQuestionsRef.current++;
            setMoles(options.map(answer => ({ up: true, content: answer })));
            setCurrentProgress({ current: currentQuestionIndexRef.current + 1, total: gameData.length });
        }, roundDelayMs);
    }, [gameData, moleCount, roundDelayMs, endGameInternal]);

    const startGame = useCallback(() => {
        if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);

        initSounds();
        setIsGameActive(true);
        isGameActiveRef.current = true;
        setScore(0);
        setTimeLeft(gameDuration);
        setGameReport(null);
        totalQuestionsRef.current = 0;
        correctAnswersRef.current = 0;
        currentQuestionIndexRef.current = 0; // Reset question index
        setCurrentProgress({ current: 0, total: gameData.length });
        gameTimerRef.current = window.setInterval(updateGameTimer, 1000);
        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        roundTimerRef.current = window.setTimeout(nextRound, 100);
    }, [gameDuration, updateGameTimer, initSounds, nextRound, gameData.length]);

    const showFeedback = useCallback((text, color) => {
        setFeedback({ show: true, text, color, hammerHit: true });
        window.setTimeout(() => setFeedback({ show: false, text: "", color: "", hammerHit: false }), 500);
    }, []);

    const createPointPopup = useCallback((points, moleElement, containerElement) => {
        if (!moleElement || !containerElement) return;
        const id = Date.now() + Math.random();
        const moleRect = moleElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();
        const left = moleRect.left - containerRect.left + moleRect.width / 2 - 20;
        const top = moleRect.top - containerRect.top;
        setPointPopups(prev => [...prev, { id, points, left, top }]);

        const timeoutId = window.setTimeout(() => {
            setPointPopups(prev => prev.filter(p => p.id !== id));
            popupTimeoutsRef.current.delete(timeoutId);
        }, 1000);

        popupTimeoutsRef.current.add(timeoutId);
    }, []);

    const handleMoleHit = useCallback((e, moleRefs, containerRef) => {
        const now = Date.now();
        console.log('handleMoleHit called', {
            isGameActive: isGameActiveRef.current,
            roundLocked: roundLockedRef.current,
            timeSinceLastClick: now - lastClickTimeRef.current
        });

        if (now - lastClickTimeRef.current < CLICK_DEBOUNCE_MS) {
            console.log('Click debounced');
            return;
        }

        if (!isGameActiveRef.current || roundLockedRef.current) return;

        lastClickTimeRef.current = now;
        roundLockedRef.current = true;

        const target = e.target;

        let moleNode = target.closest('[data-up="true"]');
        if (!moleNode) {
            moleNode = target.closest('[data-id]');
        }
        if (!moleNode) {
            moleNode = target.closest('._mole_');
        }

        console.log('target:', target, 'moleNode:', moleNode);
        if (!moleNode) {
            console.log('No mole node found');
            roundLockedRef.current = false;
            return;
        }

        const idStr = moleNode.getAttribute('data-id');
        const hitContentStr = moleNode.getAttribute('data-content');
        if (!idStr) {
            roundLockedRef.current = false;
            return;
        }

        if (hitContentStr === '') {
            setFeedback(f => ({ ...f, hammerHit: true }));
            window.setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);
            showFeedback('❌', 'red');
            roundLockedRef.current = false;
            return;
        }

        setFeedback(f => ({ ...f, hammerHit: true }));
        window.setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);

        const timeTaken = (Date.now() - roundStartRef.current) / 1000;

        let hitContent;
        try {
            hitContent = JSON.parse(hitContentStr);
        } catch {
            hitContent = hitContentStr;
        }

        let isCorrect = false;
        const correctAnswer = currentCorrectOptionRef.current;

        if (typeof hitContent === 'string' && typeof correctAnswer === 'string') {
            isCorrect = hitContent === correctAnswer;
        } else if (typeof hitContent === 'object' && typeof correctAnswer === 'object') {
            // Use ID comparison if available, fallback to JSON for backward compatibility
            if (hitContent && correctAnswer && hitContent.id && correctAnswer.id) {
                isCorrect = hitContent.id === correctAnswer.id;
            } else {
                isCorrect = JSON.stringify(hitContent) === JSON.stringify(correctAnswer);
            }
        }

        if (isCorrect) {
            if (soundsReadyRef.current && correctSoundRef.current) {
                correctSoundRef.current.triggerAttackRelease('C5', '8n');
            }
            correctAnswersRef.current++;
            currentQuestionIndexRef.current++; // Move to next question
            const timeBonus = Math.max(0, maxBonusTime - timeTaken);
            const bonusPoints = Math.round(bonusPointsPerSecond * timeBonus);
            const totalPoints = pointsPerCorrect + bonusPoints;

            setScore(s => s + totalPoints);
            showFeedback('⭐', 'gold');
            createPointPopup(totalPoints, moleRefs.current[Number(idStr)], containerRef.current);
            setMoles(prev => prev.map(() => ({ up: false, content: null })));
            if (currentQuestionIndexRef.current >= gameData.length) {
                setTimeout(() => {
                    endGameInternal();
                }, 1000);
            } else {

                setTimeout(() => {
                    nextRound();
                }, 50);
            }
        } else {
            if (soundsReadyRef.current && wrongSoundRef.current) {
                wrongSoundRef.current.triggerAttackRelease('A2', '8n');
            }
            showFeedback('❌', 'red');
            setMoles(prev => prev.map((m, i) => (i === Number(idStr) ? { ...m, up: false } : m)));
            roundLockedRef.current = false;
        }
    }, [createPointPopup, showFeedback, pointsPerCorrect, bonusPointsPerSecond, maxBonusTime, nextRound, endGameInternal, gameData.length]);

    const restartGame = useCallback(() => startGame(), [startGame]);

    return {
        score,
        timeLeft,
        targetContent,
        moles,
        hammerPos,
        feedback,
        isGameActive,
        pointPopups,
        gameReport,
        currentProgress,
        startGame,
        restartGame,
        handleMoleHit,
        setHammerPos,
    };
}
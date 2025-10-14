
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
        question: "Con vật nào trong hình?",
        questionImage: "https://placehold.co/200x200/8B4513/FFFFFF?text=🐕+Dog",
        answers: ["Chó", "Mèo", "Chim", "Cá"],
        correctAnswer: "Chó"
    },

    {
        question: "Hình nào là quả táo?",
        answers: [
            { id: "apple", text: "Táo", image: "https://placehold.co/100x100/FF0000/FFFFFF?text=🍎+Apple" },
            { id: "banana", text: "Chuối", image: "https://placehold.co/100x100/FFFF00/000000?text=🍌+Banana" },
            { id: "orange", text: "Cam", image: "https://placehold.co/100x100/FFA500/FFFFFF?text=🍊+Orange" },
            { id: "grape", text: "Nho", image: "https://placehold.co/100x100/800080/FFFFFF?text=🍇+Grape" }
        ],
        correctAnswer: { id: "apple", text: "Táo", image: "https://placehold.co/100x100/FF0000/FFFFFF?text=🍎+Apple" }
    },
    {
        question: "Màu nào giống với hình?",
        questionImage: "https://placehold.co/200x200/FF0000/FFFFFF?text=RED",
        answers: [
            { id: "red", text: "Đỏ", image: "https://placehold.co/100x100/FF0000/FFFFFF?text=Red" },
            { id: "blue", text: "Xanh", image: "https://placehold.co/100x100/0000FF/FFFFFF?text=Blue" },
            { id: "yellow", text: "Vàng", image: "https://placehold.co/100x100/FFFF00/000000?text=Yellow" },
            { id: "green", text: "Xanh lá", image: "https://placehold.co/100x100/00FF00/000000?text=Green" }
        ],
        correctAnswer: { id: "red", text: "Đỏ", image: "https://placehold.co/100x100/FF0000/FFFFFF?text=Red" }
    },
    {
        question: "2 + 2 = ?",
        answers: ["3", "4", "5", "6"],
        correctAnswer: "4"
    },
    {
        question: "Hình dạng nào?",
        questionImage: "https://placehold.co/200x200/4169E1/FFFFFF?text=⬛+Square",
        answers: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"],
        correctAnswer: "Hình vuông"
    },
    {
        question: "Con vật nào sống dưới nước?",
        answers: [
            { id: "dog", text: "Chó", image: "https://placehold.co/100x100/8B4513/FFFFFF?text=🐕+Dog" },
            { id: "cat", text: "Mèo", image: "https://placehold.co/100x100/808080/FFFFFF?text=🐱+Cat" },
            { id: "fish", text: "Cá", image: "https://placehold.co/100x100/1E90FF/FFFFFF?text=🐟+Fish" },
            { id: "bird", text: "Chim", image: "https://placehold.co/100x100/87CEEB/000000?text=🐦+Bird" }
        ],
        correctAnswer: { id: "fish", text: "Cá", image: "https://placehold.co/100x100/1E90FF/FFFFFF?text=🐟+Fish" }
    },
    {
        question: "Thủ đô của Việt Nam là gì?",
        answers: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế"],
        correctAnswer: "Hà Nội"
    },
    {
        question: "Số nào trong hình?",
        questionImage: "https://placehold.co/200x200/32CD32/FFFFFF?text=5+FIVE",
        answers: [
            { id: "three", text: "3", image: "https://placehold.co/100x100/FF6347/FFFFFF?text=3" },
            { id: "four", text: "4", image: "https://placehold.co/100x100/FF8C00/FFFFFF?text=4" },
            { id: "five", text: "5", image: "https://placehold.co/100x100/32CD32/FFFFFF?text=5" },
            { id: "six", text: "6", image: "https://placehold.co/100x100/4169E1/FFFFFF?text=6" }
        ],
        correctAnswer: { id: "five", text: "5", image: "https://placehold.co/100x100/32CD32/FFFFFF?text=5" }
    }
];

const makeEmptyMoles = (n) => Array.from({ length: n }, () => ({ up: false, content: "" }));

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildRoundOptions(gameData, moleCount) {
    const q = gameData[Math.floor(Math.random() * gameData.length)];
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

    return { question: q, correct, options: shuffleArray(options) };
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

    const gameTimerRef = useRef(null);
    const roundTimerRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const currentCorrectOptionRef = useRef(null);
    const isGameActiveRef = useRef(false);
    const totalQuestionsRef = useRef(0);
    const correctAnswersRef = useRef(0);
    const roundLockedRef = useRef(false);

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
            timeUsed: gameDuration - timeLeft
        });
    }, [score, timeLeft, gameDuration]);

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
        roundLockedRef.current = false; // mở khóa trước round mới

        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        setMoles(makeEmptyMoles(moleCount));

        roundTimerRef.current = window.setTimeout(() => {
            if (!isGameActiveRef.current) return;
            const { question, correct, options } = buildRoundOptions(gameData, moleCount);
            currentCorrectOptionRef.current = correct;
            setTargetContent(question);
            roundStartRef.current = Date.now();
            totalQuestionsRef.current++;
            setMoles(options.map(answer => ({ up: true, content: answer })));
        }, roundDelayMs);
    }, [gameData, moleCount, roundDelayMs]);

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
        gameTimerRef.current = window.setInterval(updateGameTimer, 1000);
        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        roundTimerRef.current = window.setTimeout(nextRound, 100);
    }, [gameDuration, updateGameTimer, initSounds, nextRound]);

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
        console.log('handleMoleHit called', { isGameActive: isGameActiveRef.current, roundLocked: roundLockedRef.current });
        if (!isGameActiveRef.current || roundLockedRef.current) return;
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
            return;
        }

        const idStr = moleNode.getAttribute('data-id');
        const hitContentStr = moleNode.getAttribute('data-content');
        if (!idStr) return;

        if (hitContentStr === '') {
            setFeedback(f => ({ ...f, hammerHit: true }));
            window.setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);
            showFeedback('❌', 'red');
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
            const timeBonus = Math.max(0, maxBonusTime - timeTaken);
            const bonusPoints = Math.round(bonusPointsPerSecond * timeBonus);
            const totalPoints = pointsPerCorrect + bonusPoints;

            setScore(s => s + totalPoints);
            showFeedback('⭐', 'gold');
            createPointPopup(totalPoints, moleRefs.current[Number(idStr)], containerRef.current);
            setMoles(prev => prev.map(() => ({ up: false, content: null })));
            roundLockedRef.current = true; // khóa đến khi nextRound
            nextRound();
        } else {
            if (soundsReadyRef.current && wrongSoundRef.current) {
                wrongSoundRef.current.triggerAttackRelease('A2', '8n');
            }
            showFeedback('❌', 'red');
            setMoles(prev => prev.map((m, i) => (i === Number(idStr) ? { ...m, up: false } : m)));
        }
    }, [createPointPopup, showFeedback, pointsPerCorrect, bonusPointsPerSecond, maxBonusTime, nextRound]);

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
        startGame,
        restartGame,
        handleMoleHit,
        setHammerPos,
    };
}
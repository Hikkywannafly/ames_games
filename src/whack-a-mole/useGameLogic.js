import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
        id: "q_math_4plus4",
        type: "text_to_text",
        promptText: "4 + 4 = ?",
        promptImage: null,
        displayMode: "text_only",
        answers: [
            { id: "a1", text: "6" },
            { id: "a2", text: "7" },
            { id: "a3", text: "8" },
            { id: "a4", text: "9" },
        ],
        correctAnswerId: "a3",
        tags: ["math", "addition"],
    },


    {
        id: "q_img_dog",
        type: "image_to_text",
        promptText: "What animal is in the picture?",
        promptImage: "https://upload.wikimedia.org/wikipedia/commons/2/26/YellowLabradorLooking_new.jpg",
        displayMode: "text_only",
        answers: [
            { id: "dog", text: "Dog" },
            { id: "cat", text: "Cat" },
            { id: "bird", text: "Bird" },
            { id: "fish", text: "Fish" },
        ],
        correctAnswerId: "dog",
    },

    {
        id: "q_text_to_image_apple",
        type: "text_to_image",
        promptText: "Which picture shows an apple?",
        promptImage: null,
        displayMode: "image_only",
        answers: [
            { id: "apple", text: "Apple", image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg" },
            { id: "banana", text: "Banana", image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg" },
            { id: "orange", text: "Orange", image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg" },
            { id: "grape", text: "Grapes", image: "https://static.vecteezy.com/system/resources/thumbnails/007/697/457/small_2x/a-mouth-watering-isometric-icon-of-grapes-vector.jpg" },
        ],
        correctAnswerId: "apple",
    },
    {
        id: "q_image_to_image_shape",
        type: "image_to_text",
        promptText: "What shape is this?",
        promptImage: "https://static.vecteezy.com/system/resources/previews/043/231/957/non_2x/simple-square-shape-icon-vector.jpg",
        displayMode: "text_only",
        answers: [
            { id: "square", text: "Square", },
            { id: "circle", text: "Circle", },
            { id: "triangle", text: "Triangle", },
            { id: "rectangle", text: "Rectangle", },
        ],
        correctAnswerId: "square",
    },
    {
        id: "q_capital_vn",
        type: "text_to_text",
        promptText: "What is the capital of Vietnam?",
        promptImage: null,
        displayMode: "text_only",
        answers: [
            { id: "hn", text: "Hanoi" },
            { id: "hcm", text: "Ho Chi Minh City" },
            { id: "dn", text: "Da Nang" },
            { id: "hue", text: "Hue" },
        ],
        correctAnswerId: "hn",
    },
    {
        id: "q_vi_en_fish",
        type: "image_to_text",
        promptText: "Từ 'Cá' trong tiếng Anh là gì?",
        promptImage: "https://img.freepik.com/free-vector/hand-drawn-clown-fish-cartoon-illustration_23-2150683251.jpg?w=360",
        displayMode: "text_only",
        answers: [
            { id: "fish", text: "Fish" },
            { id: "frog", text: "Frog" },
            { id: "bird", text: "Bird" },
            { id: "duck", text: "Duck" },
        ],
        correctAnswerId: "fish",
    },
];

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};


const normalizeGameData = (data) => shuffleArray(data);

const makeEmptyMoles = (n) => Array.from({ length: n }, () => ({ up: false, content: null }));

function buildRoundOptions(gameData, moleCount, questionIndex) {
    if (questionIndex >= gameData.length) return null;

    const q = gameData[questionIndex];
    const answers = q.answers ?? [];
    const correctId = q.correctAnswerId;

    const correct = answers.find(a => a.id === correctId);
    const distractors = answers.filter(a => a.id !== correctId);

    let options = [];
    if (correct) options.push(correct);
    for (let i = 0; i < Math.min(moleCount - 1, distractors.length); i++) {
        options.push(distractors[i]);
    }

    while (options.length < moleCount) options.push(null);

    options = shuffleArray(options);

    return { question: q, correctId, options };
}

export default function useGameLogic(gameData = DEFAULT_GAME_DATA, gameConfig = DEFAULT_GAME_CONFIG) {
    // Chỉ shuffle một lần duy nhất khi gameData thay đổi
    const data = useMemo(() => normalizeGameData(gameData), [gameData]);
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
    const [currentProgress, setCurrentProgress] = useState({ current: 0, total: data.length });

    const gameTimerRef = useRef(null);
    const roundTimerRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const currentCorrectIdRef = useRef(null);
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

        const accuracy = totalQuestionsRef.current > 0
            ? (correctAnswersRef.current / totalQuestionsRef.current) * 100
            : 0;

        setGameReport({
            finalScore: score,
            totalQuestions: totalQuestionsRef.current,
            correctAnswers: correctAnswersRef.current,
            accuracy: Math.round(accuracy),
            gameDuration,
            timeUsed: gameDuration - timeLeft,
            isCompleted: currentQuestionIndexRef.current >= data.length
        });
    }, [score, timeLeft, gameDuration, data.length]);

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

            if (currentQuestionIndexRef.current >= data.length) {
                endGameInternal(); return;
            }
            const roundData = buildRoundOptions(data, moleCount, currentQuestionIndexRef.current);
            if (!roundData) { endGameInternal(); return; }

            const { question, correctId, options } = roundData;
            currentCorrectIdRef.current = correctId;
            setTargetContent(question);
            roundStartRef.current = Date.now();
            totalQuestionsRef.current++;
            setMoles(options.map(answer => ({ up: true, content: answer })));
            setCurrentProgress({ current: currentQuestionIndexRef.current + 1, total: data.length });
        }, roundDelayMs);
    }, [data, moleCount, roundDelayMs, endGameInternal]);

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
        currentQuestionIndexRef.current = 0;
        setCurrentProgress({ current: 0, total: data.length });
        gameTimerRef.current = window.setInterval(updateGameTimer, 1000);
        roundTimerRef.current = window.setTimeout(nextRound, 100);
    }, [gameDuration, updateGameTimer, initSounds, nextRound, data.length]);

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
        if (now - lastClickTimeRef.current < CLICK_DEBOUNCE_MS) return;
        if (!isGameActiveRef.current || roundLockedRef.current) return;

        lastClickTimeRef.current = now;
        roundLockedRef.current = true;

        let node = e.target.closest('[data-up="true"]');
        if (!node) node = e.target.closest('[data-id]');
        if (!node) node = e.target.closest('._mole_');
        if (!node) { roundLockedRef.current = false; return; }

        const idx = node.getAttribute('data-id');
        const ansId = node.getAttribute('data-content-id'); // so sánh theo ID
        if (ansId == null) {

            setFeedback(f => ({ ...f, hammerHit: true }));
            window.setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);
            showFeedback('❌', 'red');
            roundLockedRef.current = false;
            return;
        }

        setFeedback(f => ({ ...f, hammerHit: true }));
        window.setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);

        const timeTaken = (Date.now() - roundStartRef.current) / 1000;
        const isCorrect = ansId === currentCorrectIdRef.current;

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
            createPointPopup(totalPoints, moleRefs.current[Number(idx)], containerRef.current);
            setMoles(prev => prev.map(() => ({ up: false, content: null })));
        } else {
            if (soundsReadyRef.current && wrongSoundRef.current) {
                wrongSoundRef.current.triggerAttackRelease('A2', '8n');
            }
            showFeedback('❌', 'red');
            setMoles(prev => prev.map(() => ({ up: false, content: null })));
        }
        currentQuestionIndexRef.current++;
        if (currentQuestionIndexRef.current >= data.length) {
            setTimeout(() => endGameInternal(), 600);
        } else {
            setTimeout(() => nextRound(), 80);
        }
    }, [createPointPopup, showFeedback, pointsPerCorrect, bonusPointsPerSecond, maxBonusTime, nextRound, endGameInternal, data.length]);

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

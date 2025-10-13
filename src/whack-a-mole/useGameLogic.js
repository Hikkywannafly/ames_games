
import { useCallback, useEffect, useRef, useState } from "react";

const MOLE_COUNT = 5;
const GAME_DURATION = 60;
const ROUND_DELAY_MS = 500;


export const initialGameData = [
    { word: "Apple", image: "https://placehold.co/100x100/FF0000/FFFFFF?text=Apple" },
    { word: "Banana", image: "https://placehold.co/100x100/FFFF00/000000?text=Banana" },
    { word: "Carrot", image: "https://placehold.co/100x100/FFA500/FFFFFF?text=Carrot" },
    { word: "Dog", image: "https://placehold.co/100x100/A52A2A/FFFFFF?text=Dog" },
    { word: "Cat", image: "https://placehold.co/100x100/808080/FFFFFF?text=Cat" },
    { word: "Sun", image: "https://placehold.co/100x100/FFD700/000000?text=Sun" },
    { word: "Moon", image: "https://placehold.co/100x100/F0E68C/000000?text=Moon" },
    { word: "Star", image: "https://placehold.co/100x100/FFFF00/000000?text=Star" },
    { word: "House", image: "https://placehold.co/100x100/DEB887/000000?text=House" },
    { word: "Tree", image: "https://placehold.co/100x100/008000/FFFFFF?text=Tree" },
    { word: "Car", image: "https://placehold.co/100x100/0000FF/FFFFFF?text=Car" },
    { word: "Ball", image: "https://placehold.co/100x100/FF4500/FFFFFF?text=Ball" },
];

const makeEmptyMoles = (n = MOLE_COUNT) => Array.from({ length: n }, () => ({ up: false, word: "" }));

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildRoundWords(data) {
    const pool = [...data];
    const correctIdx = Math.floor(Math.random() * pool.length);
    const correct = pool.splice(correctIdx, 1)[0];
    const wrong = [];
    while (wrong.length < MOLE_COUNT - 1) {
        const ri = Math.floor(Math.random() * pool.length);
        wrong.push(pool.splice(ri, 1)[0].word);
    }
    return { correct, words: shuffleArray([correct.word, ...wrong]) };
}

export default function useGameLogic() {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [targetImage, setTargetImage] = useState("");
    const [moles, setMoles] = useState(makeEmptyMoles());
    const [isGameActive, setIsGameActive] = useState(false);
    const [feedback, setFeedback] = useState({ show: false, text: "", color: "", hammerHit: false });
    const [hammerPos, setHammerPos] = useState({ x: "50%", y: "50%" });
    const [pointPopups, setPointPopups] = useState([]);

    const gameTimerRef = useRef(null);
    const roundTimerRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const currentCorrectWordRef = useRef("");
    const isGameActiveRef = useRef(false);

    const soundsReadyRef = useRef(false);
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);

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
        } catch { }
    }, []);

    useEffect(() => {
        return () => {
            if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
            if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        };
    }, []);

    const endGameInternal = useCallback(() => {
        setIsGameActive(false);
        isGameActiveRef.current = false;
        if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        setMoles(prev => prev.map(m => ({ ...m, up: false })));
    }, []);

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

    function startGame() {
        if (gameTimerRef.current) window.clearInterval(gameTimerRef.current);
        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);

        initSounds();
        setIsGameActive(true);
        isGameActiveRef.current = true;
        setScore(0);
        setTimeLeft(GAME_DURATION);
        gameTimerRef.current = window.setInterval(updateGameTimer, 1000);
        window.setTimeout(() => nextRound(), 100);
    }

    function nextRound() {
        if (!isGameActiveRef.current) return;

        if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
        setMoles(makeEmptyMoles());

        roundTimerRef.current = window.setTimeout(() => {
            if (!isGameActiveRef.current) return;
            const { correct, words } = buildRoundWords(initialGameData);
            currentCorrectWordRef.current = correct.word;
            setTargetImage(correct.image);
            roundStartRef.current = Date.now();
            setMoles(words.map(w => ({ up: true, word: w })));
        }, ROUND_DELAY_MS);
    }

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
        window.setTimeout(() => setPointPopups(prev => prev.filter(p => p.id !== id)), 1000);
    }, []);

    const handleMoleHit = useCallback((e, moleRefs, containerRef) => {
        if (!isGameActiveRef.current) return;
        const target = e.target;
        const moleNode = target.closest('[data-up="true"]');
        if (!moleNode) return;

        const idStr = moleNode.getAttribute('data-id');
        const hitWord = moleNode.getAttribute('data-word');
        if (!idStr || !hitWord) return;

        setFeedback(f => ({ ...f, hammerHit: true }));
        window.setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);

        if (hitWord === currentCorrectWordRef.current) {
            if (soundsReadyRef.current && correctSoundRef.current) {
                correctSoundRef.current.triggerAttackRelease('C5', '8n');
            }
            const timeTaken = (Date.now() - roundStartRef.current) / 1000;
            const points = Math.max(10, 100 - Math.floor(timeTaken * 10));
            setScore(s => s + points);
            showFeedback('⭐', 'gold');
            createPointPopup(points, moleRefs.current[Number(idStr)], containerRef.current);
            setMoles(prev => prev.map(() => ({ up: false, word: '' })));
            nextRound();
        } else {
            if (soundsReadyRef.current && wrongSoundRef.current) {
                wrongSoundRef.current.triggerAttackRelease('A2', '8n');
            }
            showFeedback('❌', 'red');
            setMoles(prev => prev.map((m, i) => (i === Number(idStr) ? { ...m, up: false } : m)));
        }
    }, [createPointPopup, showFeedback]);

    const restartGame = useCallback(() => startGame(), []);

    return {
        score,
        timeLeft,
        targetImage,
        moles,
        hammerPos,
        feedback,
        isGameActive,
        pointPopups,
        startGame,
        restartGame,
        handleMoleHit,
        setHammerPos,
    };
}
import { useCallback, useEffect, useRef, useState } from 'react';

const initialGameData = [
    { word: 'Apple', image: 'https://placehold.co/100x100/FF0000/FFFFFF?text=Apple' },
    { word: 'Banana', image: 'https://placehold.co/100x100/FFFF00/000000?text=Banana' },
    { word: 'Carrot', image: 'https://placehold.co/100x100/FFA500/FFFFFF?text=Carrot' },
    { word: 'Dog', image: 'https://placehold.co/100x100/A52A2A/FFFFFF?text=Dog' },
    { word: 'Cat', image: 'https://placehold.co/100x100/808080/FFFFFF?text=Cat' },
    { word: 'Sun', image: 'https://placehold.co/100x100/FFD700/000000?text=Sun' },
    { word: 'Moon', image: 'https://placehold.co/100x100/F0E68C/000000?text=Moon' },
    { word: 'Star', image: 'https://placehold.co/100x100/FFFF00/000000?text=Star' },
    { word: 'House', image: 'https://placehold.co/100x100/DEB887/000000?text=House' },
    { word: 'Tree', image: 'https://placehold.co/100x100/008000/FFFFFF?text=Tree' },
    { word: 'Car', image: 'https://placehold.co/100x100/0000FF/FFFFFF?text=Car' },
    { word: 'Ball', image: 'https://placehold.co/100x100/FF4500/FFFFFF?text=Ball' }
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default function useGameLogic() {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [targetImage, setTargetImage] = useState('');
    const [moles, setMoles] = useState(Array(5).fill({ up: false, word: '' }));
    const [isGameActive, setIsGameActive] = useState(false);
    const [feedback, setFeedback] = useState({ show: false, text: '', color: '', hammerHit: false });
    const [hammerPos, setHammerPos] = useState({ x: '50%', y: '50%' });
    const [pointPopups, setPointPopups] = useState([]);

    const gameTimerRef = useRef(null);
    const roundTimerRef = useRef(null);
    const roundStartRef = useRef(Date.now());
    const currentCorrectWordRef = useRef('');
    const isGameActiveRef = useRef(false);
    const containerRef = useRef(null);

    // Sounds via Tone.js if available
    const soundsReadyRef = useRef(false);
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);

    const initSounds = useCallback(async () => {
        if (soundsReadyRef.current) return;
        if (typeof window !== 'undefined' && window.Tone) {
            try {
                await window.Tone.start();
                correctSoundRef.current = new window.Tone.Synth({
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
                }).toDestination();

                wrongSoundRef.current = new window.Tone.Synth({
                    oscillator: { type: 'square' },
                    envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.5 }
                }).toDestination();
                soundsReadyRef.current = true;
            } catch (e) {
                // user may block audio autoplay; ignore
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            clearInterval(gameTimerRef.current);
            clearTimeout(roundTimerRef.current);
        };
    }, []);

    const updateGameTimer = useCallback(() => {
        setTimeLeft(prev => {
            const next = prev - 1;
            if (next <= 0) {
                setIsGameActive(false);
                isGameActiveRef.current = false;
                clearInterval(gameTimerRef.current);
                clearTimeout(roundTimerRef.current);
                setMoles(prev => prev.map(m => ({ ...m, up: false })));
                return 0;
            }
            return next;
        });
    }, []);

    function startGame() {
        initSounds();
        setIsGameActive(true);
        isGameActiveRef.current = true;
        setScore(0);
        setTimeLeft(60);
        gameTimerRef.current = setInterval(updateGameTimer, 1000);
        setTimeout(() => nextRound(), 100);
    }

    function nextRound() {
        if (!isGameActiveRef.current) return;

        clearTimeout(roundTimerRef.current);
        setMoles(Array(5).fill({ up: false, word: '' }));

        roundTimerRef.current = setTimeout(() => {
            if (!isGameActiveRef.current) return;

            const availableData = [...initialGameData];
            const correctItemIndex = Math.floor(Math.random() * availableData.length);
            const correctItem = availableData.splice(correctItemIndex, 1)[0];
            currentCorrectWordRef.current = correctItem.word;
            setTargetImage(correctItem.image);

            const wrongWords = [];
            while (wrongWords.length < 4) {
                const randomIndex = Math.floor(Math.random() * availableData.length);
                wrongWords.push(availableData.splice(randomIndex, 1)[0].word);
            }

            const roundWords = [correctItem.word, ...wrongWords];
            shuffleArray(roundWords);

            const newMoles = roundWords.slice(0, 5).map(word => {
                return { up: true, word };
            });
            roundStartRef.current = Date.now();
            setMoles(newMoles.concat(Array(Math.max(0, 5 - newMoles.length)).fill({ up: false, word: '' })));
        }, 500);
    }

    const showFeedback = useCallback((text, color) => {
        setFeedback({ show: true, text, color, hammerHit: true });
        setTimeout(() => setFeedback({ show: false, text: '', color: '', hammerHit: false }), 500);
    }, []);

    const createPointPopup = useCallback((points, moleId) => {
        const popupId = Date.now() + Math.random();
        setPointPopups(prev => [...prev, { id: popupId, points, moleId }]);

        // Remove popup after animation completes
        setTimeout(() => {
            setPointPopups(prev => prev.filter(p => p.id !== popupId));
        }, 1000);
    }, []);

    const handleMoleHit = useCallback((e) => {
        if (!isGameActiveRef.current) return;

        // Find closest mole element that is currently up
        const moleNode = e.target.closest('.mole.up') || e.target.closest('[data-id]');
        if (!moleNode) return;

        const id = Number(moleNode.getAttribute('data-id'));
        if (!Number.isFinite(id)) return;

        const hitWord = moleNode.getAttribute('data-word');
        if (!hitWord) return;

        // trigger hammer animation briefly
        setFeedback(f => ({ ...f, hammerHit: true }));
        setTimeout(() => setFeedback(f => ({ ...f, hammerHit: false })), 150);

        if (hitWord === currentCorrectWordRef.current) {
            // Correct hit
            if (soundsReadyRef.current && correctSoundRef.current) {
                correctSoundRef.current.triggerAttackRelease('C5', '8n');
            }

            const timeTaken = (Date.now() - roundStartRef.current) / 1000;
            const points = Math.max(10, 100 - Math.floor(timeTaken * 10));
            setScore(s => s + points);
            showFeedback('⭐', 'gold');

            // Show point popup
            createPointPopup(points, id);

            // Remove all moles and start next round
            setMoles(prev => prev.map(() => ({ up: false, word: '' })));
            nextRound();
        } else {
            // Wrong hit
            if (soundsReadyRef.current && wrongSoundRef.current) {
                wrongSoundRef.current.triggerAttackRelease('A2', '8n');
            }
            showFeedback('❌', 'red');
            setMoles(prev => prev.map((m, i) => i === id ? { ...m, up: false } : m));
        }
    }, [showFeedback]);

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
        containerRef,
        startGame,
        restartGame,
        handleMoleHit,
        setHammerPos
    };
}

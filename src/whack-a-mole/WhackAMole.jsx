import React, { useEffect, useRef } from 'react';
import styles from './WhackAMole.module.css';
import useGameLogic from './useGameLogic';

export default function WhackAMole() {
    const containerRef = useRef(null);
    const moleRefs = useRef([]);

    const {
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
        setHammerPos
    } = useGameLogic();

    useEffect(() => {
        const moveHammer = (e) => {
            if (!containerRef.current) return;

            let x, y;
            if (e.touches) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = e.clientX;
                y = e.clientY;
            }

            const rect = containerRef.current.getBoundingClientRect();
            setHammerPos({ x: `${x - rect.left}px`, y: `${y - rect.top}px` });
        };

        window.addEventListener('mousemove', moveHammer);
        window.addEventListener('touchmove', moveHammer, { passive: true });
        window.addEventListener('touchstart', moveHammer, { passive: true });

        return () => {
            window.removeEventListener('mousemove', moveHammer);
            window.removeEventListener('touchmove', moveHammer);
            window.removeEventListener('touchstart', moveHammer);
        };
    }, [setHammerPos]);

    return (
        <div ref={containerRef} className={styles.gameContainer} onClick={handleMoleHit}>
            {/* Start Screen */}
            {!isGameActive && timeLeft === 60 && (
                <div className={styles.startScreen}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Whack-a-Word!</h1>
                    <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Hit the mole with the word that matches the picture. Be quick for more points!</p>
                    <button className={styles.startButton} onClick={startGame}>Start Game</button>
                </div>
            )}

            {/* End Screen */}
            {!isGameActive && timeLeft < 60 && (
                <div className={styles.endScreen}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Game Over!</h1>
                    <p style={{ fontSize: '1.875rem', marginBottom: '1.5rem' }}>Your final score is: <span>{score}</span></p>
                    <button className={styles.startButton} onClick={restartGame}>Play Again</button>
                </div>
            )}

            {/* Game UI */}
            <div className={styles.headerPane}>
                <div>Score: <span>{score}</span></div>
                <div>Time: <span>{timeLeft}</span></div>
            </div>

            <div className={styles.targetPane}>
                <img src={targetImage} alt="Target" className={styles.targetImage} />
            </div>

            {/* Game Area */}
            <div className={styles.playArea}>
                <div className={styles.row}>
                    <div className={styles.hole}>
                        <div
                            ref={el => moleRefs.current[0] = el}
                            className={`${styles.mole} ${moles[0]?.up ? styles.up : ''}`}
                            data-id="0"
                            data-word={moles[0]?.word || ''}
                        >
                            <div className={styles.moleEyes}>
                                <div className={styles.eye}></div>
                                <div className={styles.eye}></div>
                            </div>
                            <div className={styles.moleNose}></div>
                            <div className={styles.wordBubble}>{moles[0]?.word || ''}</div>
                        </div>
                    </div>
                    <div className={styles.hole}>
                        <div
                            ref={el => moleRefs.current[1] = el}
                            className={`${styles.mole} ${moles[1]?.up ? styles.up : ''}`}
                            data-id="1"
                            data-word={moles[1]?.word || ''}
                        >
                            <div className={styles.moleEyes}>
                                <div className={styles.eye}></div>
                                <div className={styles.eye}></div>
                            </div>
                            <div className={styles.moleNose}></div>
                            <div className={styles.wordBubble}>{moles[1]?.word || ''}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.rowCenter}>
                    <div className={styles.hole}>
                        <div
                            ref={el => moleRefs.current[2] = el}
                            className={`${styles.mole} ${moles[2]?.up ? styles.up : ''}`}
                            data-id="2"
                            data-word={moles[2]?.word || ''}
                        >
                            <div className={styles.moleEyes}>
                                <div className={styles.eye}></div>
                                <div className={styles.eye}></div>
                            </div>
                            <div className={styles.moleNose}></div>
                            <div className={styles.wordBubble}>{moles[2]?.word || ''}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.hole}>
                        <div
                            ref={el => moleRefs.current[3] = el}
                            className={`${styles.mole} ${moles[3]?.up ? styles.up : ''}`}
                            data-id="3"
                            data-word={moles[3]?.word || ''}
                        >
                            <div className={styles.moleEyes}>
                                <div className={styles.eye}></div>
                                <div className={styles.eye}></div>
                            </div>
                            <div className={styles.moleNose}></div>
                            <div className={styles.wordBubble}>{moles[3]?.word || ''}</div>
                        </div>
                    </div>
                    <div className={styles.hole}>
                        <div
                            ref={el => moleRefs.current[4] = el}
                            className={`${styles.mole} ${moles[4]?.up ? styles.up : ''}`}
                            data-id="4"
                            data-word={moles[4]?.word || ''}
                        >
                            <div className={styles.moleEyes}>
                                <div className={styles.eye}></div>
                                <div className={styles.eye}></div>
                            </div>
                            <div className={styles.moleNose}></div>
                            <div className={styles.wordBubble}>{moles[4]?.word || ''}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Point Popups */}
            {pointPopups.map(popup => {
                const moleEl = moleRefs.current[popup.moleId];
                const containerEl = containerRef.current;

                if (!moleEl || !containerEl) return null;

                const moleRect = moleEl.getBoundingClientRect();
                const containerRect = containerEl.getBoundingClientRect();

                const left = moleRect.left - containerRect.left + (moleRect.width / 2) - 20;
                const top = moleRect.top - containerRect.top;

                return (
                    <div
                        key={popup.id}
                        className={styles.pointPopup}
                        style={{ left: `${left}px`, top: `${top}px` }}
                    >
                        +{popup.points}
                    </div>
                );
            })}

            {/* Hammer */}
            <div
                className={`${styles.hammer} ${feedback.hammerHit ? styles.hit : ''}`}
                style={{ left: hammerPos.x, top: hammerPos.y }}
            />

            {/* Feedback */}
            <div
                className={`${styles.feedback} ${feedback.show ? styles.show : ''}`}
                style={{ color: feedback.color }}
            >
                {feedback.text}
            </div>
        </div>
    );
}

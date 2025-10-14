import { useEffect, useRef, memo } from "react";
import styles from "./WhackAMole.module.css";
import useGameLogic, { DEFAULT_GAME_DATA, DEFAULT_GAME_CONFIG } from "./useGameLogic";

export default function WhackAMole({
    gameData = DEFAULT_GAME_DATA,
    gameConfig = DEFAULT_GAME_CONFIG,
    onGameEnd = null
}) {
    const containerRef = useRef(null);
    const moleRefs = useRef([]);
    // const rafRef = useRef(null);

    const {
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
    } = useGameLogic(gameData, gameConfig);

    // Call onGameEnd callback when game ends
    useEffect(() => {
        if (gameReport && onGameEnd) {
            onGameEnd(gameReport);
        }
    }, [gameReport, onGameEnd]);


    useEffect(() => {
        const moveHammer = (e) => {
            const container = containerRef.current;
            if (!container) return;
            let x = 0, y = 0;
            if (e.touches && e.touches[0]) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
            else { x = e.clientX; y = e.clientY; }
            const rect = container.getBoundingClientRect();
            setHammerPos({ x: `${x - rect.left}px`, y: `${y - rect.top}px` });
        };

        window.addEventListener("mousemove", moveHammer, { passive: true });
        window.addEventListener("touchmove", moveHammer, { passive: true });
        window.addEventListener("touchstart", moveHammer, { passive: true });

        return () => {
            window.removeEventListener("mousemove", moveHammer);
            window.removeEventListener("touchmove", moveHammer);
            window.removeEventListener("touchstart", moveHammer);
        };
    }, [setHammerPos]);

    const MoleCell = memo(({ mole, index }) => {
        const content = mole?.content;
        const isUp = mole?.up || false;
        if (!content) {
            return (
                <div className={styles.hole}>
                    <div
                        ref={el => (moleRefs.current[index] = el)}
                        className={`${styles.mole} ${isUp ? styles.up : ""}`}
                        data-id={index}
                        data-content=""
                        data-up={isUp}
                        role="button"
                        tabIndex={isUp ? 0 : -1}
                        aria-label="Empty hole"
                        onClick={(e) => {
                            console.log('Empty hole clicked', index);
                            e.preventDefault();
                            e.stopPropagation();
                            handleMoleHit(e, moleRefs, containerRef);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleMoleHit(e, moleRefs, containerRef);
                            }
                        }}
                    >
                        <div className={styles.moleEyes}>
                            <div className={styles.eye} />
                            <div className={styles.eye} />
                        </div>
                        <div className={styles.moleNose} />
                    </div>
                </div>
            );
        }


        const isObject = content && typeof content === 'object';
        const displayText = isObject ? content.text : content;
        const displayImage = isObject ? content.image : null;
        const contentId = isObject ? content.id : content;

        return (
            <div className={styles.hole}>
                <div
                    ref={el => (moleRefs.current[index] = el)}
                    className={`${styles.mole} ${isUp ? styles.up : ""}`}
                    data-id={index}
                    data-content={isObject ? JSON.stringify(content) : (content || "")}
                    data-content-id={contentId}
                    data-up={isUp}
                    role="button"
                    tabIndex={isUp ? 0 : -1}
                    aria-label={`Answer: ${displayText}`}
                    onClick={(e) => {
                        console.log('Mole clicked', index, displayText);
                        e.preventDefault();
                        e.stopPropagation();
                        handleMoleHit(e, moleRefs, containerRef);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMoleHit(e, moleRefs, containerRef);
                        }
                    }}
                >
                    <div className={styles.moleEyes}>
                        <div className={styles.eye} />
                        <div className={styles.eye} />
                    </div>
                    <div className={styles.moleNose} />
                    <div className={styles.wordBubble}>
                        {displayImage && (
                            <img
                                src={displayImage}
                                alt={displayText}
                            />
                        )}
                        <span>{displayText || ""}</span>
                    </div>
                </div>
            </div>
        );
    });

    const rows = [[0, 1], [2, 3]]; // 2-2 layout for 4 answers

    return (
        <div
            ref={containerRef}
            className={styles.gameContainer}
            onClick={(e) => {
                console.log('Container clicked');
                e.preventDefault();
                handleMoleHit(e, moleRefs, containerRef);
            }}
            role="main"
            aria-label="Whack-a-Quiz Game"
        >
            {!isGameActive && timeLeft === gameConfig.gameDuration && (
                <div className={styles.startScreen}>
                    <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Whack-a-Quiz!</h1>
                    <p style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
                        Hit the mole with the word that matches the picture. Be quick for more points!
                    </p>
                    <button className={styles.startButton} onClick={startGame}>Start Game</button>
                </div>
            )}

            {!isGameActive && timeLeft < gameConfig.gameDuration && gameReport && (
                <div className={styles.endScreen}>
                    <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                        {gameReport.isCompleted ? "🎉 Completed!" : "Game Over!"}
                    </h1>
                    <div style={{ fontSize: "1.25rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        {gameReport.isCompleted ? (
                            <p style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#4CAF50" }}>
                                Congratulations! You have completed all the questions! 🏆
                            </p>
                        ) : null}
                        <p style={{ fontSize: "1.875rem", marginBottom: "1rem" }}>
                            Final score: <span style={{ color: "#4CAF50", fontWeight: "bold" }}>{gameReport.finalScore}</span>
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <p>Number of questions: {gameReport.totalQuestions}</p>
                                <p>Correct: {gameReport.correctAnswers}</p>
                            </div>
                            <div>
                                <p>Accuracy: {gameReport.accuracy}%</p>
                                <p>Time: {gameReport.timeUsed}s</p>
                            </div>
                        </div>
                    </div>
                    <button className={styles.startButton} onClick={restartGame}>Play Again</button>
                </div>
            )}

            <div className={styles.headerPane}>
                <div>Score: <span>{score}</span></div>
                <div>Time: <span>{timeLeft}</span></div>
                {isGameActive && targetContent && (
                    <div>Progress: <span>{currentProgress.current}/{currentProgress.total}</span></div>
                )}
            </div>

            <div className={styles.targetPane}>
                {targetContent ? (
                    <div className={styles.targetContent}>
                        {targetContent.questionImage && (
                            <img
                                src={targetContent.questionImage}
                                alt={targetContent.question}
                                className={styles.targetImage}
                            />
                        )}
                        <div className={styles.targetText}>
                            {targetContent.question}
                        </div>
                    </div>
                ) : (
                    <div className={styles.targetPlaceholder}>Pick the right word!</div>
                )}
            </div>

            <div className={styles.playArea}>
                <div className={styles.row}>
                    {rows[0].map(i => <MoleCell key={i} mole={moles[i]} index={i} />)}
                </div>
                <div className={styles.row}>
                    {rows[1].map(i => <MoleCell key={i} mole={moles[i]} index={i} />)}
                </div>
            </div>

            {pointPopups.map(p => (
                <div key={p.id} className={styles.pointPopup} style={{ left: p.left, top: p.top }}>
                    +{p.points}
                </div>
            ))}

            <div
                className={`${styles.hammer} ${feedback.hammerHit ? styles.hit : ""}`}
                style={{ left: hammerPos.x, top: hammerPos.y }}
            />

            <div className={`${styles.feedback} ${feedback.show ? styles.show : ""}`} style={{ color: feedback.color }}>
                {feedback.text}
            </div>
        </div>
    );
}
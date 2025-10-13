import { useEffect, useRef } from "react";
import styles from "./WhackAMole.module.css";
import useGameLogic from "./useGameLogic";

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
        setHammerPos,
    } = useGameLogic();


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

    const MoleCell = ({ index }) => (
        <div className={styles.hole}>
            <div
                ref={el => (moleRefs.current[index] = el)}
                className={`${styles.mole} ${moles[index]?.up ? styles.up : ""}`}
                data-id={index}
                data-word={moles[index]?.word || ""}
                data-up={moles[index]?.up || false}
            >
                <div className={styles.moleEyes}>
                    <div className={styles.eye} />
                    <div className={styles.eye} />
                </div>
                <div className={styles.moleNose} />
                <div className={styles.wordBubble}>{moles[index]?.word || ""}</div>
            </div>
        </div>
    );


    const rows = [[0, 1], [2], [3, 4]]; // 2-1-2 layout


    return (
        <div
            ref={containerRef}
            className={styles.gameContainer}
            onClick={(e) => handleMoleHit(e, moleRefs, containerRef)}
        >
            {!isGameActive && timeLeft === 60 && (
                <div className={styles.startScreen}>
                    <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Whack-a-Word!</h1>
                    <p style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
                        Hit the mole with the word that matches the picture. Be quick for more points!
                    </p>
                    <button className={styles.startButton} onClick={startGame}>Start Game</button>
                </div>
            )}


            {!isGameActive && timeLeft < 60 && (
                <div className={styles.endScreen}>
                    <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Game Over!</h1>
                    <p style={{ fontSize: "1.875rem", marginBottom: "1.5rem" }}>Your final score is: <span>{score}</span></p>
                    <button className={styles.startButton} onClick={restartGame}>Play Again</button>
                </div>
            )}


            <div className={styles.headerPane}>
                <div>Score: <span>{score}</span></div>
                <div>Time: <span>{timeLeft}</span></div>
            </div>


            <div className={styles.targetPane}>
                <img src={targetImage} alt="Target" className={styles.targetImage} />
            </div>


            <div className={styles.playArea}>
                <div className={styles.row}>
                    {rows[0].map(i => <MoleCell key={i} index={i} />)}
                </div>
                <div className={styles.rowCenter}>
                    {rows[1].map(i => <MoleCell key={i} index={i} />)}
                </div>
                <div className={styles.row}>
                    {rows[2].map(i => <MoleCell key={i} index={i} />)}
                </div>
            </div>


            {pointPopups.map(p => (
                <div key={p.id} className={styles.pointPopup} style={{ left: p.left, top: p.top }}>
                    +{p.points}
                </div>
            ))}


            <div className={`${styles.hammer} ${feedback.hammerHit ? styles.hit : ""}`} style={{ left: hammerPos.x, top: hammerPos.y }} />


            <div className={`${styles.feedback} ${feedback.show ? styles.show : ""}`} style={{ color: feedback.color }}>
                {feedback.text}
            </div>
        </div>
    );
}
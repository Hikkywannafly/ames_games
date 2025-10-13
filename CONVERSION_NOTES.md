# Whack-a-Word Game - React Conversion Notes

## Chuyển đổi từ vanilla HTML/JS sang React

### Các thay đổi chính đã thực hiện:

#### 1. **Hammer (Búa) - Fix hiển thị**
- **Vấn đề gốc**: Hammer không hiện vì event listeners chỉ trên container
- **Giải pháp**: 
  - Di chuyển `moveHammer` logic vào component `WhackAMole.jsx`
  - Sử dụng `window.addEventListener` cho `mousemove`, `touchmove`, `touchstart`
  - Thêm `containerRef` để tính position relative to game container
  - Export `setHammerPos` từ hook thay vì `moveHammer`

```jsx
// Trong WhackAMole.jsx
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
    // ... touch events
}, [setHammerPos]);
```

#### 2. **Start/End Screen Logic**
- **Thay đổi**: Sử dụng conditional rendering thay vì CSS classes
- **Game.html**: `startScreen.classList.add('hidden')`
- **React**: `{!isGameActive && timeLeft === 60 && <div>Start</div>}`
- **Lợi ích**: Logic rõ ràng hơn, không cần `.hidden` class

#### 3. **Mole Click Detection**
- **Vấn đề**: React không thể access `moles[id]?.word` trong callback (stale closure)
- **Giải pháp**: Thêm `data-word` attribute vào mole element
```jsx
<div data-id="0" data-word={moles[0]?.word || ''}>
```
- **handleMoleHit**: Lấy word từ `moleNode.getAttribute('data-word')`

#### 4. **Selector cho mole.up**
- **Game.html**: `e.target.closest('.mole.up')`
- **React**: Vẫn hoạt động vì CSS module giữ nguyên class `.mole` và `.up`
- Selector: `const moleNode = e.target.closest('.mole.up') || e.target.closest('[data-id]')`

#### 5. **CSS Module Classes**
- Đổi tên từ kebab-case sang camelCase:
  - `.mole-eyes` → `.moleEyes`
  - `.mole-nose` → `.moleNose`
  - `.word-bubble` → `.wordBubble`
- Nested selector: `.up .wordBubble` (CSS module compatible)

#### 6. **Feedback Color**
- **Game.html**: `feedbackEl.style.color = color`
- **React**: Thêm `color` vào state và apply inline style
```jsx
<div style={{ color: feedback.color }}>{feedback.text}</div>
```

#### 7. **Game State Management**
- Thêm `isGameActiveRef` để tránh stale closure issues
- `nextRound()` check `isGameActiveRef.current` instead of state
- Điều này fix bug moles không pop sau khi click đúng

### Files Structure:

```
src/whack-a-mole/
  ├── WhackAMole.jsx          # Main component (UI)
  ├── useGameLogic.js         # Game logic hook
  ├── WhackAMole.module.css   # Styles (CSS module)
  └── main.jsx                # Export entry
```

### Key Differences vs game.html:

| Feature | game.html | React Version |
|---------|-----------|---------------|
| Hammer movement | `window.addEventListener` in script | `useEffect` in component |
| Mole click | `mole.dataset.word` | `data-word` attribute |
| Screen toggle | `.classList.add('hidden')` | Conditional rendering |
| State | Global variables | React state + refs |
| Styling | Inline `<style>` | CSS Module |

### Testing Checklist:

- ✅ Hammer hiện và di chuyển theo chuột/touch
- ✅ Moles pop up với words
- ✅ Click đúng word → +points, next round
- ✅ Click sai word → mole ẩn, feedback ❌
- ✅ Timer countdown 60s
- ✅ Start screen hiện lúc đầu
- ✅ End screen hiện khi hết giờ
- ✅ Sounds (Tone.js) hoạt động
- ✅ Responsive mobile/desktop

### Running the game:

```bash
npm run dev
```

Game sẽ chạy tại http://localhost:5173

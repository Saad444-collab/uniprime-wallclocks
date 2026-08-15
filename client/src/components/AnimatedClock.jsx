import { useState, useEffect } from 'react';

export default function AnimatedClock() {
  const [time, setTime] = useState(new Date());
  const [size, setSize] = useState(280);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      setSize(window.innerWidth < 768 ? 200 : 280);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const center = size / 2;
  const radius = (size / 2) * 0.78;

  return (
    <div className="hero-clock relative mx-auto" style={{ width: size, height: size }}>
      {numbers.map((num) => {
        const angle = (num * 30 - 90) * (Math.PI / 180);
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return (
          <span
            key={num}
            className="clock-number"
            style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)', fontSize: size < 240 ? '12px' : '14px' }}
          >
            {num}
          </span>
        );
      })}

      <div className="hour-hand" style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}></div>
      <div className="minute-hand" style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}></div>
      <div className="second-hand" style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}></div>
      <div className="center-dot"></div>
    </div>
  );
}

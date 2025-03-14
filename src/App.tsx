import { FC, useEffect, useRef } from 'react';
import './App.css';
import GameOfLife from './components/GameOfLife';
import Vicsek from './components/Vicsek';

const App: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvasWidth = window.innerWidth * 0.8;
      const canvasHeight = 500;
      
      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
    }
  }, []);

  return (
    <div className="main-container">
      <h1 className="main-title">Cellular Automata & Particle Simulations</h1>

      <div className="simulations-container">
        <div className="simulation-panel game-of-life-panel">
          <GameOfLife />
        </div>

        <div className="simulation-panel vicsek-panel">
          <Vicsek />
        </div>
      </div>
    </div>
  );
};

export default App;
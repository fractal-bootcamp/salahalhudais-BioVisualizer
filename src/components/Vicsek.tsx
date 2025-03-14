import { FC, useState, useEffect, useRef } from 'react';
import '../App.css';

interface Particle {
  position: [number, number];
  direction: [number, number];
}

const Vicsek: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [radius, setRadius] = useState<number>(50);
  const [speed, setSpeed] = useState<number>(2);
  const [noise, setNoise] = useState<number>(0.1);
  
  const particlesRef = useRef<Particle[]>([]);
  const widthRef = useRef<number>(200);
  const heightRef = useRef<number>(200);

  const initializeParticles = (count: number, width: number, height: number): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      const angle = Math.random() * 2 * Math.PI;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      
      particles.push({
        position: [x, y],
        direction: [dx, dy]
      });
    }
    console.log(`Created ${particles.length} particles`);
    return particles;
  };

  // Find neighbors within radius
  const findNeighbors = (particles: Particle[], particle: Particle, radius: number): Particle[] => {
    return particles.filter(p => {
      if (p === particle) return false; // Skip the particle itself
      const dx = p.position[0] - particle.position[0];
      const dy = p.position[1] - particle.position[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  };

  const calculateAlignment = (neighbors: Particle[]): [number, number] => {
    if (neighbors.length === 0) return [0, 0];
    
    let sumX = 0;
    let sumY = 0;
    
    neighbors.forEach(neighbor => {
      sumX += neighbor.direction[0];
      sumY += neighbor.direction[1];
    });
    
    return [sumX / neighbors.length, sumY / neighbors.length];
  };

  const addNoiseAndNormalize = (direction: [number, number], noiseAmount: number): [number, number] => {
    if (direction[0] === 0 && direction[1] === 0) {
      const angle = Math.random() * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    }
    
    const noise: [number, number] = [
      (Math.random() * 2 - 1) * noiseAmount,
      (Math.random() * 2 - 1) * noiseAmount
    ];
    
    const noisyDirection: [number, number] = [
      direction[0] + noise[0],
      direction[1] + noise[1]
    ];
    
    const magnitude = Math.sqrt(noisyDirection[0] ** 2 + noisyDirection[1] ** 2);
    return [noisyDirection[0] / magnitude, noisyDirection[1] / magnitude];
  };

  useEffect(() => {
    if (canvasRef.current) {
      const containerWidth = canvasRef.current.parentElement?.clientWidth || 650;
      const availableWidth = containerWidth - 60;
      
      const width = availableWidth;
      const height = Math.min(600, width * 0.75);
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      // Update refs
      widthRef.current = width;
      heightRef.current = height;
      
      // Create initial particles
      particlesRef.current = initializeParticles(100, width, height);
      
      // Draw initial state
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        particlesRef.current.forEach(particle => {
          const [x, y] = particle.position;
          const [dx, dy] = particle.direction;
          
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#FF4500';
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dx * 20, y + dy * 20);
          ctx.strokeStyle = '#0066FF';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    }
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particlesRef.current.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      const width = widthRef.current;
      const height = heightRef.current;
      const currentRadius = radius;
      const currentSpeed = speed;
      const currentNoise = noise;
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, 0, width, height);
      
      const particles = particlesRef.current;
      const updatedParticles = particles.map(particle => {
        const neighbors = findNeighbors(particles, particle, currentRadius);
        
        const alignment = calculateAlignment(neighbors);
        
        const newDirection = addNoiseAndNormalize(alignment, currentNoise);
        
        const [x, y] = particle.position;
        const [dx, dy] = newDirection;
        
        let newX = x + dx * currentSpeed;
        let newY = y + dy * currentSpeed;
        
        if (newX < 0) newX += width;
        if (newX >= width) newX -= width;
        if (newY < 0) newY += height;
        if (newY >= height) newY -= height;
        
        return {
          position: [newX, newY] as [number, number],
          direction: newDirection
        };
      });
      
      particlesRef.current = updatedParticles;
      
      updatedParticles.forEach(particle => {
        const [x, y] = particle.position;
        const [dx, dy] = particle.direction;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * 20, y + dy * 20);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [radius, speed, noise]);

  return (
    <div className="vicsek-container">
      <div className="title">
        <h2>Vicsek Model Simulation</h2>
        <p>Watch particles align with their neighbors to create flocking behavior</p>
      </div>
      
      <div className="canvas-container">
        <canvas ref={canvasRef}></canvas>
      </div>
      
      <div className="controls">
        <div className="slider-control">
          <label>Interaction Radius: {radius}</label>
          <input 
            type="range" 
            min="10" max="100" 
            value={radius} 
            onChange={e => setRadius(Number(e.target.value))} 
          />
        </div>
        
        <div className="slider-control">
          <label>Speed: {speed}</label>
          <input 
            type="range" 
            min="1" max="5" step="0.1"
            value={speed} 
            onChange={e => setSpeed(Number(e.target.value))} 
          />
        </div>
        
        <div className="slider-control">
          <label>Noise: {noise.toFixed(2)}</label>
          <input 
            type="range" 
            min="0" max="0.5" step="0.01"
            value={noise} 
            onChange={e => setNoise(Number(e.target.value))} 
          />
        </div>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#2c3e50'}}></div>
          <span>Particle</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{backgroundColor: '#0066FF'}}></div>
          <span>Direction</span>
        </div>
      </div>
    </div>
  );
};

export default Vicsek;
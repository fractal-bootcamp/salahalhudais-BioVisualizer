import { FC, useState, useEffect, useRef } from 'react';

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
  
  // Use refs for particles and dimensions to avoid re-renders
  const particlesRef = useRef<Particle[]>([]);
  const widthRef = useRef<number>(200);
  const heightRef = useRef<number>(200);

  // Initialize particles function
  const initializeParticles = (count: number, width: number, height: number): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      // Create random position
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      // Create random direction (will be normalized)
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

  // Calculate alignment direction
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

  // Add noise and normalize direction
  const addNoiseAndNormalize = (direction: [number, number], noiseAmount: number): [number, number] => {
    // If direction is zero vector, create a random direction
    if (direction[0] === 0 && direction[1] === 0) {
      const angle = Math.random() * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    }
    
    // Add noise
    const noise: [number, number] = [
      (Math.random() * 2 - 1) * noiseAmount,
      (Math.random() * 2 - 1) * noiseAmount
    ];
    
    const noisyDirection: [number, number] = [
      direction[0] + noise[0],
      direction[1] + noise[1]
    ];
    
    // Normalize
    const magnitude = Math.sqrt(noisyDirection[0] ** 2 + noisyDirection[1] ** 2);
    return [noisyDirection[0] / magnitude, noisyDirection[1] / magnitude];
  };

  // Setup canvas and initial particles
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const width = window.innerWidth * 0.8;
      const height = 500;
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Update refs
      widthRef.current = width;
      heightRef.current = height;
      
      // Create initial particles
      particlesRef.current = initializeParticles(100, width, height);
      
      // Draw initial state
      const ctx = canvas.getContext('2d');
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
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      // Update particles based on Vicsek model
      const particles = particlesRef.current;
      const updatedParticles = particles.map(particle => {
        // Find neighbors
        const neighbors = findNeighbors(particles, particle, currentRadius);
        
        // Calculate alignment
        const alignment = calculateAlignment(neighbors);
        
        // Add noise and normalize
        const newDirection = addNoiseAndNormalize(alignment, currentNoise);
        
        // Update position
        const [x, y] = particle.position;
        const [dx, dy] = newDirection;
        
        // Apply movement
        let newX = x + dx * currentSpeed;
        let newY = y + dy * currentSpeed;
        
        // Wrap around edges
        if (newX < 0) newX += width;
        if (newX >= width) newX -= width;
        if (newY < 0) newY += height;
        if (newY >= height) newY -= height;
        
        return {
          position: [newX, newY] as [number, number],
          direction: newDirection
        };
      });
      
      // Update particles reference
      particlesRef.current = updatedParticles;
      
      // Draw updated particles
      updatedParticles.forEach(particle => {
        const [x, y] = particle.position;
        const [dx, dy] = particle.direction;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4500';
        ctx.fill();
        
        // Draw direction line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * 20, y + dy * 20);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      // Continue animation
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [radius, speed, noise]);

  return (
    <div className="vicsek-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Vicsek Model Simulation</h2>
      
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '2px solid #333',
          borderRadius: '4px',
          marginBottom: '20px'
        }}
      />
      
      <div style={{ width: '80%', maxWidth: '500px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Interaction Radius: {radius}
          </label>
          <input 
            type="range" 
            min="10" max="100" 
            value={radius} 
            onChange={e => setRadius(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Speed: {speed}
          </label>
          <input 
            type="range" 
            min="1" max="5" step="0.1"
            value={speed} 
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Noise: {noise.toFixed(2)}
          </label>
          <input 
            type="range" 
            min="0" max="0.5" step="0.01"
            value={noise} 
            onChange={e => setNoise(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Vicsek;
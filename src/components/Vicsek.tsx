import { FC, useState, useEffect, useRef } from 'react';

interface Particles {
  position: [number, number];
  direction: [number, number];
}

const particles: Particles[] = [];

const intiializeParticles = (count: number, width: number, height: number): Particles[] => {
  const newParticles: Particles[] = [];
  for (let i = 0; i < count; i++) {
    const position: [number, number] = [Math.random() * width, Math.random() * height];
    const direction: [number, number] = [Math.random() * 2 - 1, Math.random() * 2 - 1];
    newParticles.push({position, direction});
  }
  return newParticles;
}

const findNeighbors = (particles: Particles[], particle: Particles, radius: number): Particles[] => {
  return particles.filter(p => {
    const dx = p.position[0] - particle.position[0];
    const dy = p.position[1] - particle.position[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius;
  })
}

function calculateAlignment(neighbors: Particles[], particle: Particles): [number, number] {
  if (neighbors.length === 0) return particle.direction;

  const alignment = neighbors.reduce((accum, current) => {
    return [
      accum[0] + current.direction[0],
      accum[1] + current.direction[1]
    ]
  }, [0, 0])
  const normalizedAlignment: [number, number] = [alignment[0] / neighbors.length, alignment[1] / neighbors.length];
  return normalizedAlignment;
}

const addNoiseAndNormalize = (direction: [number, number]): [number, number] => {
  const noise = [Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05];
  const noisyDirection = [
    direction[0] + noise[0],
    direction[1] + noise[1]
  ]
  // normalize the noisy direction
  const magnitude = Math.sqrt(noisyDirection[0] ** 2 + noisyDirection[1] ** 2);
  return [noisyDirection[0] / magnitude, noisyDirection[1] / magnitude];
}

const updateParticle = (particle: Particles, speed: number) => {
  const [x, y] = particle.position;
  const [vx, vy] = particle.direction;
  const newPosition: [number, number] = [x + vx * speed, y + vy * speed];
  return {
    ...particle,
    position: newPosition
  }
}

const Vicsek: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particles[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [radius, setRadius] = useState<number>(50);
  const [speed, setSpeed] = useState<number>(2);

  useEffect(() => {
    const initializeParticles = () => {
      const newParticles = intiializeParticles(100, width, height);
      setParticles(newParticles);
    }
    initializeParticles();
  }, [width, height]);

  useEffect(() => {
    const updateParticles = () => {
      const newParticles = particles.map(particle => updateParticle(particle, speed));
      setParticles(newParticles);
    }
    updateParticles();
  }, [speed]);

  useEffect(() => {
    if (canvasRef.current) {
      setWidth(canvasRef.current.width = window.innerWidth * 0.8);
      setHeight(canvasRef.current.height = 500);
    }
  }, []);

  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      // Update particles (alignment, position, etc.)
      // Draw particles
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [particles]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default Vicsek;
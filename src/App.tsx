import { FC, useState, useEffect } from 'react'
import './App.css'

const numRows = 25;
const numCols = 35;

function countNeighbors(grid: number[][], x: number, y: number) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newX = x + i;
      const newY = y + j;
      // Skip the current cell itself
      if (i === 0 && j === 0) continue;
      // Check bounds
      if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
        count += grid[newX][newY];
      }
    }
  }
  return count;
}

// Counting Neighbors
// Function to check State of grid

function checkState(grid: number[][]) {
  // Create a new grid to store next state
  const newGrid = grid.map((row, x) => 
    row.map((cell, y) => {
      const neighbors = countNeighbors(grid, x, y);
      const current = grid[x][y];
      
      // Rules for Conway's Game of Life:
      // 1. Any live cell with 2 or 3 live neighbors survives
      // 2. Any dead cell with exactly 3 live neighbors becomes alive
      // 3. All other cells die or stay dead
      
      if (current === 1) {
        // Live cell survives if it has 2 or 3 neighbors
        return (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        // Dead cell becomes alive if it has exactly 3 neighbors
        return neighbors === 3 ? 1 : 0;
      }
    })
  );
  
  return newGrid;
}


// Generate Empty Grid
function generateEmptyGrid(numRows: number, numCols: number) {
  return Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => Math.random() > 0.7 ? 1 : 0)
  );
}
const App: FC = () => {
  const [grid, setGrid] = useState<number[][]>([]);

  useEffect(() => {
    setGrid(generateEmptyGrid(numRows, numCols));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(checkState(grid));
    }, 100);
    return () => clearInterval(interval);
  }, [grid]);

  return (
    <div className="grid">
      {grid.map((rows, i) => (
        <div key={i} className="row">
          {rows.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`cell ${cell ? 'alive' : 'dead'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default App

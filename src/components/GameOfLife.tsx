import { FC, useState, useEffect } from 'react'
import '../App.css'

const numRows = 25;
const numCols = 35;

function countNeighbors(grid: number[][], x: number, y: number) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newX = x + i;
      const newY = y + j;
      if (i === 0 && j === 0) continue;
      if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
        count += grid[newX][newY];
      }
    }
  }
  return count;
}


function checkState(grid: number[][]) {
  const newGrid = grid.map((row, x) =>
    row.map((cell, y) => {
      const neighbors = countNeighbors(grid, x, y);
      const current = grid[x][y];
      if (current === 1) {
        return (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        return neighbors === 3 ? 1 : 0;
      }
    })
  );

  return newGrid;
}


function generateEmptyGrid(numRows: number, numCols: number) {
  return Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => Math.random() > 0.7 ? 1 : 0)
  );
}
const GameOfLife: FC = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [prevGrid, setPrevGrid] = useState<number[][]>([]);
  const [running, setRunning] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const initialGrid = generateEmptyGrid(numRows, numCols);
    setGrid(initialGrid);
    setPrevGrid(initialGrid.map(row => [...row]));
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setGrid(g => {
        setPrevGrid(g.map(row => [...row]));
        const nextGrid = checkState(g);

        const isGridEmpty = nextGrid.every(row => row.every(cell => cell === 0));
        const isGridStable = JSON.stringify(g) === JSON.stringify(nextGrid);

        if (isGridEmpty || isGridStable) {
          clearInterval(interval);
          setRunning(false);

          if (isGridEmpty) {
            alert("All cells have died!");
          } else {
            alert("Grid has stabilized!");
          }
        }

        return nextGrid;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [running]);

  const toggleCell = (i: number, j: number) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[i][j] = newGrid[i][j] ? 0 : 1;
    setGrid(newGrid);
  };

  const getCellClass = (i: number, j: number) => {
    const current = grid[i][j];
    const previous = prevGrid[i] && prevGrid[i][j] ? prevGrid[i][j] : 0;

    if (current === 1 && previous === 0) return 'just-born';
    if (current === 0 && previous === 1) return 'just-died';
    if (current === 1) return 'alive';
    return 'dead';
  };

  return (
    <div
      className="container"
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
    >
      <div className="title">
        <h1>Conway's Game of Life</h1>
        <p>Click cells to toggle them or drag to draw patterns</p>
      </div>

      <div className="controls">
        <button onClick={() => setRunning(!running)}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button onClick={() => {
          setRunning(false);
          setGrid(generateEmptyGrid(numRows, numCols));
        }}>
          Reset
        </button>
        <button onClick={() => {
          setRunning(false);
          setGrid(Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => 0)
          ));
        }}>
          Clear
        </button>
      </div>

      <div className="grid">
        {grid.map((rows, i) => (
          <div key={i} className="row">
            {rows.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`cell ${getCellClass(i, j)}`}
                onClick={() => toggleCell(i, j)}
                onMouseOver={() => {
                  if (mouseDown) {
                    toggleCell(i, j);
                  }
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color alive"></div>
          <span style={{ color: "#000" }}>Alive</span>
        </div>
        <div className="legend-item">
          <div className="legend-color just-born"></div>
          <span style={{ color: "#000" }}>Just Born</span>
        </div>
        <div className="legend-item">
          <div className="legend-color just-died"></div>
          <span style={{ color: "#000" }}>Just Died</span>
        </div>
      </div>
    </div>
  )
}

export default GameOfLife

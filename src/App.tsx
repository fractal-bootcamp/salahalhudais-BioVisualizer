import { FC, useState } from 'react'
import './App.css'

const numRows = 25;
const numCols = 35;

const App: FC = () => {
  const [grid, setGrid] = useState<number[][]>([]);

  useEffect(() => {
    setGrid(generateEmptyGrid(numRows, numCols));
  }, []);

  return <div className="grid">{grid}</div>;
}

export default App

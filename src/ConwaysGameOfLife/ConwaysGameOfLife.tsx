import { useCallback, useState } from "react";
import PlayButton from "../assets/play-svgrepo-com.svg?react";
import PauseButton from "../assets/pause-svgrepo-com.svg?react";
import NextButton from "../assets/play-next-svgrepo-com.svg?react";
import ResetButton from "../assets/reset-svgrepo-com.svg?react";
import PlayXNumberButton from "../assets/play-stream-svgrepo-com.svg?react";
import styles from './ConwaysGameOfLife.module.css'

export default function ConwaysGameOfLife() {
  const { rowCount, columnCount } = { rowCount: 30, columnCount: 30 };
  const [playAmount, setPlayAmount] = useState("");
  const [tickInterval, setTickInterval] = useState(0);
  const [gameBoard, setGameBoard] = useState(
    new Array(rowCount)
      .fill(false)
      .map(() => new Array(columnCount).fill(false))
  );

  // If using a backend, hook up to backend with websocket, then look for messages like play, infinite play, and execute them
  // useEffect(() => {
  //   const websocket = new WebSocket("test")
  //   websocket.addEventListener('playOnce', () => {
  //     oneTick(gameBoard)
  //   })
  //   websocket.addEventListener('playXAmount', (event) => {
  //     const playAmount = JSON.parse(event.data)
  //     continuousTicks(playAmount)
  //   })
  //   return () => {
  //     websocket.close()
  //   }
  // }, [continuousTicks, gameBoard, oneTick])
  

  const neighborCount = useCallback(
    (
      rowPosition: number,
      columnPosition: number,
      board: boolean[][]
    ): number => {
      let neighborCount = 0;
      const down = rowPosition + 1;
      const up = rowPosition - 1;
      const left = columnPosition - 1;
      const right = columnPosition + 1;
      // first check down, then lower left, then lower right
      if (down < rowCount) {
        if (board[down][columnPosition]) {
          neighborCount += 1;
        }
        if (left >= 0 && board[down][left]) {
          neighborCount += 1;
        }
        if (right < columnCount && board[down][right]) {
          neighborCount += 1;
        }
      }
      // next, check left and right
      if (left >= 0 && board[rowPosition][left]) {
        neighborCount += 1;
      }
      if (right < columnCount && board[rowPosition][right]) {
        neighborCount += 1;
      }
      // lastly, check up, upper left, and upper right
      if (up >= 0) {
        if (board[up][columnPosition]) {
          neighborCount += 1;
        }
        if (left >= 0 && board[up][left]) {
          neighborCount += 1;
        }
        if (right < columnCount && board[up][right]) {
          neighborCount += 1;
        }
      }
      return neighborCount;
    },
    [columnCount, rowCount]
  );

  const oneTick = useCallback(
    (board: boolean[][]) => {
      // Deep copy is needed here
      const newBoard = JSON.parse(JSON.stringify(board));
      board.forEach((row, rowPosition: number) => {
        row.forEach((cell: boolean, columnPosition: number) => {
          // first, determine neighbor count
          const neighbors = neighborCount(rowPosition, columnPosition, board);
          // if living, check for underpopulation, over population.  If survival do nothing (neighbor === 3)
          if (cell === true) {
            // if fewer than 2 neighbors, turn living to false
            // if more than 3, turn living to false
            if (neighbors < 2 || neighbors > 3) {
              newBoard[rowPosition][columnPosition] = false;
            }
          } else {
            if (neighbors === 3) {
              newBoard[rowPosition][columnPosition] = true;
            }
          }
        });
      });
      return newBoard;
    },
    [neighborCount]
  );

  const continuousTicks = useCallback(
    (playAmount: number = 0) => {
      if (tickInterval) {
        clearInterval(tickInterval);
        setTickInterval(0);
        return;
      } else {
        let newBoard = gameBoard;
        let amountPlayed = 0;
        const interval = setInterval(() => {
          if (playAmount > 0) {
            if (playAmount === amountPlayed) {
              clearInterval(interval);
              setTickInterval(0);
              return;
            }
            amountPlayed++;
          }
          newBoard = oneTick(newBoard);
          setGameBoard(newBoard);
        }, 300);
        setTickInterval(interval);
      }
    },
    [gameBoard, oneTick, tickInterval]
  );

  // Long term depending on needed size and scale, consider moving to 2d offscreen canvas and pass to a web worker
  return (
    <div className={styles.conwaysGameOfLife} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: '10px' }}>
        <input
          data-testid="play-x-amount-input"
          placeholder="Play Amount"
          onChange={(event) => {
            setPlayAmount(event.target.value);
          }}
          style={{ height: "45px", width: '90px' }}
          type="number"
          min="1"
          step="1"
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e') {
              e.preventDefault()
            }
          }}
        ></input>
        <button
          data-testid="play-x-amount-button"
          disabled={playAmount?.length === 0 || parseInt(playAmount) <= 0}
          style={{
            cursor: playAmount?.length === 0 || parseInt(playAmount) <= 0 ? "not-allowed" : "default",
          }}
          onClick={() => {
            continuousTicks(parseInt(playAmount));
          }}
        >
          <PlayXNumberButton />
        </button>
      </div>
      <div style={{ display: "flex", gap: "10px", marginBottom: '10px' }}>
        <button
          data-testid="reset-button"
          onClick={() => {
            if (tickInterval) {
              clearInterval(tickInterval);
              setTickInterval(0);
            }
            setGameBoard(
              new Array(rowCount)
                .fill(false)
                .map(() => new Array(columnCount).fill(false))
            );
          }}
        >
          <ResetButton />
        </button>
        <button
        data-testid="single-tick-button"
          disabled={!!tickInterval}
          style={{ cursor: tickInterval ? "not-allowed" : "default" }}
          onClick={() => {
            setGameBoard(oneTick(gameBoard));
          }}
        >
          <NextButton />
        </button>
        <button
          data-testid="continuous-play-button"
          onClick={() => {
            continuousTicks();
          }}
        >
          {tickInterval ? <PauseButton /> : <PlayButton />}
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, 20px)`,
          background: "white",
          rowGap: "1px",
          columnGap: "1px",
          width: "fit-content",
          border: "solid 1px",
        }}
      >
        {[...Array(rowCount)].map((_, i) =>
          [...Array(columnCount)].map((_, j) => (
            <div
              data-testid={`${i} and ${j}`}
              key={`${i} and ${j}`}
              onClick={() => {
                const newValue = !gameBoard[i][j];
                setGameBoard((oldLiving) => {
                  oldLiving[i][j] = newValue;
                  // Shallow copy is fine here as it will trigger a render when react compares the array references
                  return Array.from(oldLiving);
                });
              }}
              style={{
                width: "20px",
                height: "20px",
                background: gameBoard[i][j] ? "grey" : "black",
              }}
            ></div>
          ))
        )}
      </div>
    </div>
  );
}

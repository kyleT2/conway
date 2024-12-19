import { render, Screen, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConwaysGameOfLife from './ConwaysGameOfLife';

const resetId = "reset-button"
const playXAmount = "play-x-amount-button"
const singleTick = "single-tick-button"

const checkBackground = (greyBackground: string[] = []): {greyCount: number, blackCount: number} => {
  let greyCount = 0
  let blackCount = 0
  for (let row = 0; row < 30; row++) {
    for (let column = 0; column < 30; column++) {
      const squareTestId = `${row} and ${column}`
      if (greyBackground.indexOf(squareTestId) >= 0) {
        greyCount++
        expect(screen.getByTestId(squareTestId)).toHaveStyle('background: grey');
      } else {
        blackCount++
        expect(screen.getByTestId(squareTestId)).toHaveStyle('background: black');
      }
    }
  }
  return {greyCount, blackCount}
}

describe('Conways Game Of Life Tests', () => {
  it('renders all back', () => {
    render(<ConwaysGameOfLife />);
    const {greyCount, blackCount} = checkBackground()
    expect(greyCount).toEqual(0)
    expect(blackCount).toEqual(900)
    expect(screen.getByTestId('0 and 0')).toBeInTheDocument();
  });

  it('changes background color when a square is clicked', async () => {
    render(<ConwaysGameOfLife />);
    await userEvent.click(screen.getByTestId('0 and 0'));
    const {greyCount, blackCount} = checkBackground(['0 and 0'])
    expect(greyCount).toEqual(1)
    expect(blackCount).toEqual(899)
  });

  it('changes background color when a square is clicked twice', async () => {
    render(<ConwaysGameOfLife />);
    await userEvent.click(screen.getByTestId('0 and 0'));
    await userEvent.click(screen.getByTestId('0 and 0'));
    expect(screen.getByTestId('0 and 0')).toHaveStyle('background: black');
  });

  it('reset button changes color back', async () => {
    render(<ConwaysGameOfLife />);
    await userEvent.click(screen.getByTestId('0 and 0'));
    let {greyCount, blackCount} = checkBackground(['0 and 0'])
    expect(greyCount).toEqual(1)
    expect(blackCount).toEqual(899)
    await userEvent.click(screen.getByTestId(resetId));
    ({greyCount, blackCount} = checkBackground())
    expect(greyCount).toEqual(0)
    expect(blackCount).toEqual(900)
  });

  it('clicking play works', async () => {
    render(<ConwaysGameOfLife />);
    await userEvent.click(screen.getByTestId('7 and 10'));
    await userEvent.click(screen.getByTestId('8 and 9'));
    await userEvent.click(screen.getByTestId('8 and 10'));
    await userEvent.click(screen.getByTestId('9 and 10'));
    await userEvent.click(screen.getByTestId('9 and 11'));
    await userEvent.click(screen.getByTestId(singleTick));
    const {greyCount, blackCount} = checkBackground(['7 and 9', '7 and 10', '8 and 9', '9 and 9', '9 and 10', '9 and 11'])
    expect(greyCount).toEqual(6)
    expect(blackCount).toEqual(894)
  });

  it('clicking play twice works', async () => {
    render(<ConwaysGameOfLife />);
    await userEvent.click(screen.getByTestId('7 and 10'));
    await userEvent.click(screen.getByTestId('8 and 9'));
    await userEvent.click(screen.getByTestId('8 and 10'));
    await userEvent.click(screen.getByTestId('9 and 10'));
    await userEvent.click(screen.getByTestId('9 and 11'));
    await userEvent.click(screen.getByTestId(singleTick));
    await userEvent.click(screen.getByTestId(singleTick));
    const {greyCount, blackCount} = checkBackground(['7 and 9', '7 and 10', '8 and 8', '8 and 11', '9 and 9', '9 and 10', '10 and 10'])
    expect(greyCount).toEqual(7)
    expect(blackCount).toEqual(893)
  });
});
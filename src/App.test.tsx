import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { DEFAULT_INPUT } from './data/examples';
import { useAppStore } from './store/useAppStore';

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ consented: false, input: DEFAULT_INPUT, result: null });
});

describe('application flow', () => {
  it('requires acknowledgement and completes an example assessment', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const continueButton = screen.getByRole('button', { name: /i understand.*continue/i });
    expect(continueButton).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    await user.click(continueButton);

    await user.click(screen.getByRole('link', { name: /build a risk scenario/i }));
    await user.click(screen.getByRole('button', { name: 'TEDDY-matched Stage 1' }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /build evidence scenario/i }));

    expect(screen.getAllByText(/evidence-based risk scenario/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/11.0%/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not your predicted probability/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptSection from './PromptSection';

describe('PromptSection Component', () => {
  it('renders input placeholder and initial state correctly', () => {
    render(
      <PromptSection
        prompt=""
        setPrompt={vi.fn()}
        onGenerate={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('QUERY CONSOLE')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox', { name: /natural language sql query input/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');

    const runBtn = screen.getByRole('button', { name: /run query/i });
    expect(runBtn).toBeDisabled();
  });

  it('allows user typing and triggers setPrompt', async () => {
    const user = userEvent.setup();
    const handleSetPrompt = vi.fn();

    render(
      <PromptSection
        prompt=""
        setPrompt={handleSetPrompt}
        onGenerate={vi.fn()}
        isLoading={false}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /natural language sql query input/i });
    await user.type(textarea, 'Show all users');

    expect(handleSetPrompt).toHaveBeenCalled();
  });

  it('calls onGenerate when Run Query button is clicked with non-empty prompt', async () => {
    const user = userEvent.setup();
    const handleGenerate = vi.fn();

    render(
      <PromptSection
        prompt="Show top products"
        setPrompt={vi.fn()}
        onGenerate={handleGenerate}
        isLoading={false}
      />
    );

    const runBtn = screen.getByRole('button', { name: /run query/i });
    expect(runBtn).not.toBeDisabled();
    await user.click(runBtn);

    expect(handleGenerate).toHaveBeenCalledTimes(1);
  });

  it('disables input and displays loading indicator when isLoading is true', () => {
    render(
      <PromptSection
        prompt="Show top products"
        setPrompt={vi.fn()}
        onGenerate={vi.fn()}
        isLoading={true}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /natural language sql query input/i });
    expect(textarea).toBeDisabled();

    const loadingBtn = screen.getByRole('button', { name: /synthesizing sql/i });
    expect(loadingBtn).toBeDisabled();
  });

  it('renders suggested sample query chips and updates prompt on click', async () => {
    const user = userEvent.setup();
    const handleSetPrompt = vi.fn();

    const mockSamples = [
      { id: '1', title: 'Top Customers', prompt: 'List top customers by spend' },
      { id: '2', title: 'Recent Orders', prompt: 'Show orders from last week' },
    ];

    render(
      <PromptSection
        prompt=""
        setPrompt={handleSetPrompt}
        onGenerate={vi.fn()}
        isLoading={false}
        samples={mockSamples}
      />
    );

    expect(screen.getByText('Suggested:')).toBeInTheDocument();
    const sampleBtn = screen.getByRole('button', { name: /top customers/i });
    expect(sampleBtn).toBeInTheDocument();

    await user.click(sampleBtn);
    expect(handleSetPrompt).toHaveBeenCalledWith('List top customers by spend');
  });

  it('shows follow-up banner and quick refinement chips when activeQuery exists', async () => {
    const user = userEvent.setup();
    const handleSetPrompt = vi.fn();
    const handleClearContext = vi.fn();

    const mockFollowUps = [
      { label: 'Filter Completed', prompt: 'Filter for completed orders only' },
    ];

    render(
      <PromptSection
        prompt=""
        setPrompt={handleSetPrompt}
        onGenerate={vi.fn()}
        isLoading={false}
        activeQuery={{ sql: 'SELECT * FROM orders', prompt: 'All orders' }}
        followUpSuggestions={mockFollowUps}
        onClearContext={handleClearContext}
      />
    );

    expect(screen.getByText(/Follow-Up Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Refining:\s*All orders/i)).toBeInTheDocument();

    const newThreadBtn = screen.getByRole('button', { name: /start fresh new query/i });
    await user.click(newThreadBtn);
    expect(handleClearContext).toHaveBeenCalledTimes(1);

    const refineChip = screen.getByRole('button', { name: /filter completed/i });
    await user.click(refineChip);
    expect(handleSetPrompt).toHaveBeenCalledWith('Filter for completed orders only');
  });
});

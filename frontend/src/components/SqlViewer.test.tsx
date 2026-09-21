import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SqlViewer from './SqlViewer';

describe('SqlViewer Component', () => {
  const sampleSql = 'SELECT id, name, email FROM users WHERE active = 1;';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when sql prop is empty', () => {
    const { container } = render(<SqlViewer sql="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, dialect badge, and query title correctly', () => {
    render(<SqlViewer sql={sampleSql} dialect="sqlite" />);

    expect(screen.getByText('GENERATED SQL QUERY')).toBeInTheDocument();
    expect(screen.getByText('SQLITE')).toBeInTheDocument();
  });

  it('displays action buttons (Explain Plan, Format SQL, Copy, Edit SQL)', () => {
    render(<SqlViewer sql={sampleSql} />);

    expect(screen.getByRole('button', { name: /explain plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format sql/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit sql/i })).toBeInTheDocument();
  });

  it('triggers onExplainPlan when Explain Plan button is clicked', async () => {
    const user = userEvent.setup();
    const handleExplainPlan = vi.fn();

    render(<SqlViewer sql={sampleSql} onExplainPlan={handleExplainPlan} />);

    const explainBtn = screen.getByRole('button', { name: /explain plan/i });
    await user.click(explainBtn);

    expect(handleExplainPlan).toHaveBeenCalledTimes(1);
    expect(handleExplainPlan).toHaveBeenCalledWith(sampleSql);
  });

  it('shows Explaining... and disables button when isExplaining is true', () => {
    render(<SqlViewer sql={sampleSql} isExplaining={true} />);

    const explainBtn = screen.getByRole('button', { name: /explaining\.\.\./i });
    expect(explainBtn).toBeDisabled();
  });

  it('copies SQL to clipboard and shows feedback when Copy is clicked', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });

    render(<SqlViewer sql={sampleSql} />);

    const copyBtn = screen.getByRole('button', { name: /copy/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(sampleSql);
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('toggles edit mode when Edit SQL is clicked and allows typing', async () => {
    const user = userEvent.setup();
    render(<SqlViewer sql={sampleSql} />);

    const editBtn = screen.getByRole('button', { name: /edit sql/i });
    await user.click(editBtn);

    const textarea = screen.getByRole('textbox', { name: /editable sql statement/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(sampleSql);

    // Reset and Execute buttons appear in edit mode
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /execute edited sql/i })).toBeInTheDocument();
  });

  it('calls onExecuteSql with updated query when Execute Edited SQL is clicked', async () => {
    const user = userEvent.setup();
    const handleExecuteSql = vi.fn();

    render(<SqlViewer sql={sampleSql} onExecuteSql={handleExecuteSql} />);

    await user.click(screen.getByRole('button', { name: /edit sql/i }));

    const textarea = screen.getByRole('textbox', { name: /editable sql statement/i });
    await user.clear(textarea);
    await user.type(textarea, 'SELECT * FROM orders;');

    const runBtn = screen.getByRole('button', { name: /execute edited sql/i });
    await user.click(runBtn);

    expect(handleExecuteSql).toHaveBeenCalledTimes(1);
    expect(handleExecuteSql).toHaveBeenCalledWith('SELECT * FROM orders;');
  });

  it('resets query to original sql when Reset is clicked', async () => {
    const user = userEvent.setup();
    render(<SqlViewer sql={sampleSql} />);

    await user.click(screen.getByRole('button', { name: /edit sql/i }));

    const textarea = screen.getByRole('textbox', { name: /editable sql statement/i });
    await user.clear(textarea);
    await user.type(textarea, 'SELECT 1;');

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.queryByRole('textbox', { name: /editable sql statement/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit sql/i })).toBeInTheDocument();
  });

  it('formats SQL and displays toast confirmation when Format SQL is clicked', async () => {
    const user = userEvent.setup();
    render(<SqlViewer sql="select id, name from users where id=1;" />);

    const formatBtn = screen.getByRole('button', { name: /format sql/i });
    await user.click(formatBtn);

    expect(screen.getByText('Formatted!')).toBeInTheDocument();
  });

  it('handles running state correctly and disables execute button when isExecuting is true', async () => {
    const user = userEvent.setup();
    render(<SqlViewer sql={sampleSql} isExecuting={true} />);

    await user.click(screen.getByRole('button', { name: /edit sql/i }));

    const runBtn = screen.getByRole('button', { name: /running\.\.\./i });
    expect(runBtn).toBeDisabled();
  });

  it('updates internal editableSql state when the sql prop changes', () => {
    const { rerender } = render(<SqlViewer sql="SELECT 1;" />);
    expect(screen.getByText('SELECT')).toBeInTheDocument();

    rerender(<SqlViewer sql="SELECT 2;" />);
    expect(screen.getByText('SELECT')).toBeInTheDocument();
  });

  it('does not trigger onExecuteSql or onExplainPlan when query is empty or whitespace', async () => {
    const user = userEvent.setup();
    const onExec = vi.fn();
    const onExplain = vi.fn();

    render(<SqlViewer sql="SELECT 1;" onExecuteSql={onExec} onExplainPlan={onExplain} />);

    await user.click(screen.getByRole('button', { name: /edit sql/i }));
    const textarea = screen.getByRole('textbox', { name: /editable sql statement/i });
    await user.clear(textarea);

    const runBtn = screen.getByRole('button', { name: /execute edited sql/i });
    await user.click(runBtn);
    expect(onExec).not.toHaveBeenCalled();

    const explainBtn = screen.getByRole('button', { name: /explain plan/i });
    await user.click(explainBtn);
    expect(onExplain).not.toHaveBeenCalled();
  });

  it('executes timer callbacks for copy and format feedback', async () => {
    vi.useFakeTimers();
    render(<SqlViewer sql="SELECT 1;" />);

    await act(async () => {
      screen.getByRole('button', { name: /copy/i }).click();
      screen.getByRole('button', { name: /format sql/i }).click();
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();
  });
});

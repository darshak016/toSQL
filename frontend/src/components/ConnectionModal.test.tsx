import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectionModal from './ConnectionModal';

describe('ConnectionModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentDbUrl: 'postgresql://user:pass@localhost:5432/testdb',
    onConnect: vi.fn(),
    isLoading: false,
    connectionError: null,
    onClearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when isOpen is false', () => {
    const { container } = render(<ConnectionModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, input field, and action buttons when open', () => {
    render(<ConnectionModal {...defaultProps} />);

    expect(screen.getByRole('dialog', { name: /database connection/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/database connection url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect database/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('displays connection error alert inside the modal when connectionError is passed', () => {
    const errorMsg = 'Failed to connect: could not translate host name "invalid-db.supabase.co" to address';
    render(<ConnectionModal {...defaultProps} connectionError={errorMsg} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Connection Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('calls onClearError when the dismiss button inside the error alert is clicked', async () => {
    const user = userEvent.setup();
    const handleClearError = vi.fn();
    render(
      <ConnectionModal
        {...defaultProps}
        connectionError="Connection timeout"
        onClearError={handleClearError}
      />
    );

    const dismissBtn = screen.getByRole('button', { name: /dismiss connection error/i });
    await user.click(dismissBtn);

    expect(handleClearError).toHaveBeenCalledTimes(1);
  });

  it('calls onClearError when user edits the input after an error occurred', async () => {
    const user = userEvent.setup();
    const handleClearError = vi.fn();
    render(
      <ConnectionModal
        {...defaultProps}
        connectionError="Connection refused"
        onClearError={handleClearError}
      />
    );

    const input = screen.getByLabelText(/database connection url/i);
    await user.type(input, 'x');

    expect(handleClearError).toHaveBeenCalled();
  });

  it('submits with cleaned postgresql URL when Connect Database is clicked', async () => {
    const user = userEvent.setup();
    const handleConnect = vi.fn();
    render(
      <ConnectionModal
        {...defaultProps}
        currentDbUrl=""
        onConnect={handleConnect}
      />
    );

    const input = screen.getByLabelText(/database connection url/i);
    await user.type(input, 'postgres://user:pass@host/db');

    const submitBtn = screen.getByRole('button', { name: /connect database/i });
    await user.click(submitBtn);

    expect(handleConnect).toHaveBeenCalledTimes(1);
    expect(handleConnect).toHaveBeenCalledWith('postgresql://user:pass@host/db', false);
  });

  it('disables submit button and shows spinner when isLoading is true', () => {
    render(<ConnectionModal {...defaultProps} isLoading={true} />);

    expect(screen.getByText(/connecting database\.\.\./i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /connecting database\.\.\./i });
    expect(submitBtn).toBeDisabled();
  });

  it('calls onClose when Cancel button or Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<ConnectionModal {...defaultProps} onClose={handleClose} />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

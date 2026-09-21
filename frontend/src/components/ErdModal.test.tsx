import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErdModal from './ErdModal';
import type { TableInfo } from '../types';

describe('ErdModal Component', () => {
  const mockTables: TableInfo[] = [
    {
      name: 'customers',
      columns: [
        { name: 'id', type: 'INTEGER', primary_key: true },
        { name: 'name', type: 'TEXT', primary_key: false },
      ],
      foreign_keys: [],
      row_count: 50,
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'INTEGER', primary_key: true },
        { name: 'customer_id', type: 'INTEGER', primary_key: false },
      ],
      foreign_keys: [
        { constrained_columns: ['customer_id'], referred_table: 'customers', referred_columns: ['id'] },
      ],
      row_count: 120,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when isOpen is false', () => {
    const { container } = render(
      <ErdModal isOpen={false} onClose={vi.fn()} tables={mockTables} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders empty state when no database tables exist', () => {
    const handleConnect = vi.fn();
    const handleClose = vi.fn();
    render(
      <ErdModal
        isOpen={true}
        onClose={handleClose}
        tables={[]}
        onOpenConnect={handleConnect}
      />
    );

    expect(screen.getByText('No Schema Graph Available')).toBeInTheDocument();
    expect(
      screen.getByText(/There is currently no active database connected/i)
    ).toBeInTheDocument();

    const connectBtn = screen.getByRole('button', { name: /connect database/i });
    expect(connectBtn).toBeInTheDocument();
  });

  it('triggers onOpenConnect and onClose when clicking Connect Database in empty state', async () => {
    const user = userEvent.setup();
    const handleConnect = vi.fn();
    const handleClose = vi.fn();
    render(
      <ErdModal
        isOpen={true}
        onClose={handleClose}
        tables={[]}
        onOpenConnect={handleConnect}
      />
    );

    const connectBtn = screen.getByRole('button', { name: /connect database/i });
    await user.click(connectBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConnect).toHaveBeenCalledTimes(1);
  });

  it('renders table cards and relationship summaries when tables are present', () => {
    render(
      <ErdModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
        databaseType="PostgreSQL"
      />
    );

    expect(screen.getAllByText('customers').length).toBeGreaterThan(0);
    expect(screen.getAllByText('orders').length).toBeGreaterThan(0);
    expect(screen.getByText('POSTGRESQL')).toBeInTheDocument();
  });

  it('shows filter empty state when search matches no tables', async () => {
    const user = userEvent.setup();
    render(
      <ErdModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
      />
    );

    const filterInput = screen.getByLabelText(/filter tables or columns/i);
    await user.type(filterInput, 'nonexistent_table');

    expect(screen.getByText('No matching tables or columns')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear filter/i });
    await user.click(clearBtn);

    expect(screen.getAllByText('customers').length).toBeGreaterThan(0);
  });

  it('handles closing on Escape and close button', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <ErdModal
        isOpen={true}
        onClose={handleClose}
        tables={mockTables}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close erd modal/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

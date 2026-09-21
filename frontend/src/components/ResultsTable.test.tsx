import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsTable from './ResultsTable';

describe('ResultsTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when columns are empty', () => {
    render(<ResultsTable columns={[]} rows={[]} />);
    expect(screen.getByText('No Output Yet')).toBeInTheDocument();
    expect(screen.getByText(/Submit a natural language query above/i)).toBeInTheDocument();
  });

  it('renders table headers and rows accurately', () => {
    const columns = ['id', 'customer_name', 'total_amount'];
    const rows = [
      [1, 'Alice', 150.5],
      [2, 'Bob', null],
    ];

    render(<ResultsTable columns={columns} rows={rows} />);

    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('customer_name')).toBeInTheDocument();
    expect(screen.getByText('total_amount')).toBeInTheDocument();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('150.5')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('null')).toBeInTheDocument();
    expect(screen.getByText(/Showing 2 records/i)).toBeInTheDocument();
  });

  it('filters rows based on search input', async () => {
    const user = userEvent.setup();
    const columns = ['name', 'city'];
    const rows = [
      ['Alice', 'New York'],
      ['Bob', 'London'],
      ['Charlie', 'Paris'],
    ];

    render(<ResultsTable columns={columns} rows={rows} />);

    const searchInput = screen.getByRole('textbox', { name: /search result rows/i });
    await user.type(searchInput, 'London');

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 record/i)).toBeInTheDocument();
  });

  it('shows empty filter message when search has no matches', async () => {
    const user = userEvent.setup();
    const columns = ['name'];
    const rows = [['Alice']];

    render(<ResultsTable columns={columns} rows={rows} />);

    const searchInput = screen.getByRole('textbox', { name: /search result rows/i });
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No records match filter criteria.')).toBeInTheDocument();
  });

  it('copies table as Markdown format to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const columns = ['id', 'name'];
    const rows = [[1, 'Alice']];

    render(<ResultsTable columns={columns} rows={rows} />);

    const copyBtn = screen.getByRole('button', { name: /copy md/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('| id | name |')
    );
    expect(screen.getByText('Copied MD!')).toBeInTheDocument();
  });

  it('handles CSV and JSON export button clicks', async () => {
    const user = userEvent.setup();
    const columns = ['id', 'name'];
    const rows = [[1, 'Alice']];

    const createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.fn();
    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ResultsTable columns={columns} rows={rows} />);

    const jsonBtn = screen.getByRole('button', { name: /export json/i });
    await user.click(jsonBtn);
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const csvBtn = screen.getByRole('button', { name: /export csv/i });
    await user.click(csvBtn);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
    expect(clickSpy).toHaveBeenCalledTimes(2);

    clickSpy.mockRestore();
  });

  it('navigates pages when more than 10 rows are present', async () => {
    const user = userEvent.setup();
    const columns = ['idx'];
    const rows = Array.from({ length: 15 }, (_, i) => [i + 1]);

    render(<ResultsTable columns={columns} rows={rows} />);

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('11')).not.toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /^next/i });
    await user.click(nextBtn);

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});

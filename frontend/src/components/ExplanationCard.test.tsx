import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExplanationCard from './ExplanationCard';

describe('ExplanationCard Component', () => {
  it('renders null when explanation is null or empty', () => {
    const { container } = render(<ExplanationCard explanation={null} />);
    expect(container.firstChild).toBeNull();

    const { container: emptyContainer } = render(<ExplanationCard explanation="" />);
    expect(emptyContainer.firstChild).toBeNull();
  });

  it('renders explanation text and header elements', () => {
    render(
      <ExplanationCard
        explanation="This query joins customers and orders to calculate spend."
        executionTimeMs={42}
        rowCount={15}
        selfHealed={true}
      />
    );

    expect(screen.getByText(/Query Synthesis & Logic Explanation/i)).toBeInTheDocument();
    expect(
      screen.getByText('This query joins customers and orders to calculate spend.')
    ).toBeInTheDocument();
    expect(screen.getByText('42 ms')).toBeInTheDocument();
    expect(screen.getByText('15 rows')).toBeInTheDocument();
    expect(screen.getByText(/Self-Healed AST/i)).toBeInTheDocument();
  });

  it('renders structured breakdown tags when breakdown prop is provided', () => {
    const breakdown = {
      tables_used: ['customers', 'orders'],
      joins: ['customers.id = orders.customer_id'],
      filters: ["status = 'completed'"],
      aggregations: ['SUM(total_amount)'],
      assumptions: ['Only completed orders are counted'],
    };

    render(
      <ExplanationCard
        explanation="Summary explanation."
        breakdown={breakdown}
      />
    );

    expect(screen.getByText('Tables Referenced')).toBeInTheDocument();
    expect(screen.getByText('customers')).toBeInTheDocument();
    expect(screen.getByText('orders')).toBeInTheDocument();

    expect(screen.getByText(/Joins & Relations/i)).toBeInTheDocument();
    expect(screen.getByText('customers.id = orders.customer_id')).toBeInTheDocument();

    expect(screen.getByText('Applied Filters')).toBeInTheDocument();
    expect(screen.getByText("status = 'completed'")).toBeInTheDocument();

    expect(screen.getByText('Aggregations')).toBeInTheDocument();
    expect(screen.getByText('SUM(total_amount)')).toBeInTheDocument();
  });

  it('renders and toggles schema pruning metadata popover when schemaPruning is enabled', async () => {
    const user = userEvent.setup();
    const schemaPruning = {
      is_pruned: true,
      total_tables: 20,
      retained_tables: ['customers', 'orders'],
      pruned_tables: ['logs', 'audit_events'],
      estimated_tokens_saved: 1250,
    };

    render(
      <ExplanationCard
        explanation="Optimized with pruned schema."
        schemaPruning={schemaPruning}
      />
    );

    const pruneBtn = screen.getByRole('button', { name: /pruned: 2\/20 tables/i });
    expect(pruneBtn).toBeInTheDocument();

    // Click to open details
    await user.click(pruneBtn);
    expect(screen.getByText(/Schema Token Optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/Retained in Prompt/i)).toBeInTheDocument();
    expect(screen.getByText('customers')).toBeInTheDocument();
    expect(screen.getByText('logs')).toBeInTheDocument();
  });
});

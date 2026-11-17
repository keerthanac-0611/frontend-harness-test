import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CustomerSearchResults from '../components/CustomerSearchResults.jsx';

describe('CustomerSearchResults', () => {
  it('lists matching names as plain non-clickable items', () => {
    render(
      <CustomerSearchResults
        customers={[
          { id: 1, first_name: 'Ana', last_name: 'Smith' },
          { id: 2, first_name: 'Daniel', last_name: 'Lee' },
        ]}
      />,
    );
    expect(screen.getByText('Matching customers')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Ana Smith', 'Daniel Lee']);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a no-match message for an empty list', () => {
    render(<CustomerSearchResults customers={[]} />);
    expect(screen.getByText('No customer found.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

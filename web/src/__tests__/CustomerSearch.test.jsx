import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CustomerSearch from '../components/CustomerSearch';
import { filterCustomersByName } from '../utils/customerSearch';

afterEach(cleanup);

describe('CustomerSearch', () => {
  it('has an accessible name and the requested placeholder', () => {
    render(<CustomerSearch value="" onChange={() => {}} />);

    const input = screen.getByRole('searchbox', {
      name: 'Search by customer name',
    });
    expect(screen.getByLabelText('Search by customer name')).toBe(input);
    expect(input.getAttribute('placeholder')).toBe('Search by customer name');
  });

  it('reports the entered string while leaving the value controlled by the parent', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CustomerSearch value="Ada" onChange={onChange} />,
    );
    const input = screen.getByRole('searchbox');

    expect(input.value).toBe('Ada');
    fireEvent.change(input, { target: { value: 'Grace' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Grace');
    expect(input.value).toBe('Ada');

    rerender(<CustomerSearch value="Grace" onChange={onChange} />);
    expect(input.value).toBe('Grace');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('gives each instance its own label association', () => {
    render(
      <>
        <CustomerSearch value="" onChange={() => {}} />
        <CustomerSearch value="" onChange={() => {}} />
      </>,
    );

    const inputs = screen.getAllByLabelText('Search by customer name');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });

  it('lets a parent filter its supplied array and own the displayed results', () => {
    const customers = [
      { id: 1, first_name: 'Ada', last_name: 'Lovelace' },
      { id: 2, first_name: 'Grace', last_name: 'Hopper' },
    ];

    function Host({ data }) {
      const [query, setQuery] = useState('');
      return (
        <>
          <CustomerSearch value={query} onChange={setQuery} />
          <ul>
            {filterCustomersByName(data, query).map((customer) => (
              <li key={customer.id}>
                {customer.first_name} {customer.last_name}
              </li>
            ))}
          </ul>
        </>
      );
    }

    const { rerender } = render(<Host data={customers} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: ' HOP ' },
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem').textContent).toBe('Grace Hopper');

    rerender(
      <Host data={[{ id: 3, first_name: 'New', last_name: 'Hopper' }]} />,
    );
    expect(screen.getByRole('listitem').textContent).toBe('New Hopper');
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: '' },
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });
});

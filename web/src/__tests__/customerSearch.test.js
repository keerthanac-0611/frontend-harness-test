import { describe, expect, it } from 'vitest';
import { filterCustomersByName } from '../utils/customerSearch';

const ada = Object.freeze({ id: 1, first_name: 'Ada', last_name: 'Lovelace' });
const grace = Object.freeze({ id: 2, first_name: 'Grace', last_name: 'Hopper' });
const customers = Object.freeze([ada, grace]);

describe('filterCustomersByName', () => {
  it.each([
    ['Ada', ada],
    ['Hopper', grace],
    ['Ada Lovelace', ada],
    ['ovel', ada],
    ['ce Hop', grace],
    ['gRaCe hOpPeR', grace],
    ['  ADA  ', ada],
    ['\t lovelace \n', ada],
  ])('matches first, last, full, or partial names for %j', (query, expected) => {
    expect(filterCustomersByName(customers, query)).toEqual([expected]);
  });

  it.each(['', '   ', '\t\n'])('returns all customers for blank query %j', (query) => {
    expect(filterCustomersByName(customers, query)).toEqual(customers);
  });

  it('returns an empty array when no names match', () => {
    expect(filterCustomersByName(customers, 'Unknown')).toEqual([]);
  });

  it('handles an empty supplied array', () => {
    expect(filterCustomersByName([], 'Ada')).toEqual([]);
    expect(filterCustomersByName([], '')).toEqual([]);
  });

  it('does not mutate the supplied array or records and preserves their order', () => {
    const snapshot = customers.map((customer) => ({ ...customer }));
    const result = filterCustomersByName(customers, 'a');

    expect(customers).toEqual(snapshot);
    expect(result).toEqual([ada, grace]);
    expect(result).not.toBe(customers);
    expect(result[0]).toBe(ada);
    expect(result[1]).toBe(grace);
    expect(filterCustomersByName(customers, 'Ada')).toEqual([ada]);
    expect(customers).toEqual(snapshot);
  });
});

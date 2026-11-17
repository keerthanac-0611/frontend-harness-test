import React, { useId } from 'react';

export default function CustomerSearch({ value, onChange }) {
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId}>Search by customer name</label>
      <input
        id={inputId}
        type="search"
        placeholder="Search by customer name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

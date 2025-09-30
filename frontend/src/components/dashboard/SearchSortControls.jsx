import React, { useState } from 'react';

export default function SearchSortControls({ onSearch, onSort }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch && onSearch(value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSort && onSort(value);
  };

  return (
    <div className="search-sort-controls">
      <input
        type="text"
        placeholder="Search candidates..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="sort-select"
      >
        <option value="score">Sort by Score</option>
        <option value="name">Sort by Name</option>
        <option value="completedAt">Sort by Date</option>
      </select>
    </div>
  );
}

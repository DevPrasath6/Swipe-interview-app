import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CandidateDetailDrawer from './CandidateDetailDrawer';
import SearchSortControls from './SearchSortControls';

export default function CandidatesTable() {
  const candidates = useSelector(state => state.candidates || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm)
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score; // Highest score first
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completedAt':
          return new Date(b.completedAt) - new Date(a.completedAt); // Most recent first
        default:
          return 0;
      }
    });
  }, [candidates, searchTerm, sortBy]);

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleCloseDrawer = () => {
    setSelectedCandidate(null);
  };

  if (candidates.length === 0) {
    return (
      <div className="candidates-table">
        <div className="candidates-header">
          <h2>Interviewer Dashboard</h2>
          <SearchSortControls
            onSearch={setSearchTerm}
            onSort={setSortBy}
          />
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <h3>No candidates yet</h3>
          <p>Candidates who complete the interview will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="candidates-header">
        <h2>Candidates ({candidates.length})</h2>
        <SearchSortControls
          onSearch={setSearchTerm}
          onSort={setSortBy}
        />
      </div>

      <div className="candidates-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Score</th>
              <th>Completed At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCandidates.map((candidate) => (
              <tr
                key={candidate.id}
                onClick={() => handleCandidateClick(candidate)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <strong>{candidate.name}</strong>
                </td>
                <td>{candidate.email}</td>
                <td>{candidate.phone}</td>
                <td>
                  <span className={`score-badge ${getScoreBadgeClass(candidate.score)}`}>
                    {candidate.score}/100
                  </span>
                </td>
                <td>{formatDate(candidate.completedAt)}</td>
                <td>
                  <span style={{
                    color: candidate.status === 'completed' ? '#28a745' : '#6c757d',
                    fontWeight: '600'
                  }}>
                    {candidate.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CandidateDetailDrawer
        candidate={selectedCandidate}
        onClose={handleCloseDrawer}
        open={!!selectedCandidate}
      />
    </div>
  );
}

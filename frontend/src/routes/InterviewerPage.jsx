import React from 'react';
import CandidatesTable from '../components/dashboard/CandidatesTable';
import SearchSortControls from '../components/dashboard/SearchSortControls';

export default function InterviewerPage() {
  return (
    <div className="dashboard">
      <div className="candidates-header">
        <h2>Interviewer Dashboard</h2>
        <SearchSortControls />
      </div>
      <CandidatesTable />
    </div>
  );
}

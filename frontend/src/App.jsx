import React, { useState, useEffect } from 'react';
import api from './api';
import CandidateForm from './components/CandidateForm';
import JobRequirementForm from './components/JobRequirementForm';
import CandidateList from './components/CandidateList';
import { LayoutDashboard } from 'lucide-react';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [displayCandidates, setDisplayCandidates] = useState([]);
  const [viewTitle, setViewTitle] = useState("All Candidates");
  const [loading, setLoading] = useState(false);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/candidates');
      setCandidates(res.data);
      setDisplayCandidates(res.data);
      setViewTitle("All Candidates");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleCandidateAdded = (newCandidate) => {
    fetchCandidates(); // Refresh list to get proper order and IDs
  };

  const handleBasicMatch = async (requirements) => {
    setLoading(true);
    try {
      const res = await api.post('/match', requirements);
      setDisplayCandidates(res.data);
      setViewTitle("Shortlisted Candidates (Basic Match)");
    } catch (err) {
      console.error(err);
      alert("Error performing basic match");
    } finally {
      setLoading(false);
    }
  };

  const handleAiShortlist = async (requirements) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/shortlist', requirements);
      setDisplayCandidates(res.data);
      setViewTitle("Shortlisted Candidates (AI Recommended)");
    } catch (err) {
      console.error(err);
      alert("Error performing AI match. Please check server logs and ensure OpenRouter API Key is set.");
    } finally {
      setLoading(false);
    }
  };

  const showAllCandidates = () => {
    setDisplayCandidates(candidates);
    setViewTitle("All Candidates");
  };

  return (
    <div className="app-container">
      <header className="mb-6 flex-between">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <LayoutDashboard className="text-primary" size={32} />
          <span className="title-gradient">Candidate Shortlisting System</span>
        </h1>
        {viewTitle !== "All Candidates" && (
          <button onClick={showAllCandidates} className="btn btn-outline">
            View All Candidates
          </button>
        )}
      </header>

      <div className="grid-2">
        <CandidateForm onCandidateAdded={handleCandidateAdded} />
        <JobRequirementForm 
          onMatch={handleBasicMatch} 
          onAiShortlist={handleAiShortlist} 
          loading={loading}
        />
      </div>

      <CandidateList candidates={displayCandidates} title={viewTitle} />
    </div>
  );
}

export default App;

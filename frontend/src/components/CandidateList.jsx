import React, { useState, useMemo } from 'react';
import CandidateCard from './CandidateCard';
import { Users, Search, Filter, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CandidateList = ({ candidates, title = "All Candidates" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [showChart, setShowChart] = useState(false);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill = skillFilter === '' || c.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
      return matchesSearch && matchesSkill;
    });
  }, [candidates, searchTerm, skillFilter]);

  const hasScores = candidates.some(c => c.matchScore !== undefined || c.aiScore !== undefined);

  const chartData = useMemo(() => {
    if (!hasScores) return [];
    return filteredCandidates.map(c => ({
      name: c.name,
      score: c.aiScore !== undefined ? c.aiScore : (c.matchScore !== undefined ? c.matchScore : 0)
    })).slice(0, 10); // Show top 10 in chart
  }, [filteredCandidates, hasScores]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Users size={24} className="text-primary" />
          <span className="title-gradient">{title}</span>
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '2rem', width: '200px' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Filter by skill..." 
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="input"
              style={{ paddingLeft: '2rem', width: '150px' }}
            />
          </div>
          {hasScores && (
            <button 
              className={`btn ${showChart ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowChart(!showChart)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <BarChart3 size={16} /> Chart
            </button>
          )}
        </div>
      </div>
      
      {showChart && hasScores && chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', height: '300px' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Top Candidates Scores</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 50 ? '#eab308' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {filteredCandidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          No candidates found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCandidates.map(candidate => (
            <CandidateCard key={candidate._id || candidate.name} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateList;

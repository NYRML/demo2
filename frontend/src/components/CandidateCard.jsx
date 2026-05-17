import React, { useState } from 'react';
import { Mail, Briefcase, Code, Star, MessageSquare } from 'lucide-react';
import api from '../api';

const CandidateCard = ({ candidate, requiredSkillsForQuestions = [] }) => {
  const [isSaved, setIsSaved] = useState(candidate.isSaved || false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const isMatchMode = candidate.matchScore !== undefined;
  const isAiMode = candidate.aiScore !== undefined;
  
  const score = isAiMode ? candidate.aiScore : (isMatchMode ? candidate.matchScore : null);
  
  let scoreClass = '';
  if (score !== null) {
    if (score >= 80) scoreClass = 'score-high';
    else if (score >= 50) scoreClass = 'score-med';
    else scoreClass = 'score-low';
  }

  const toggleSave = async () => {
    try {
      if (candidate._id) {
        await api.put(`/candidates/${candidate._id}/save`);
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Error saving candidate", err);
    }
  };

  const generateQuestions = async () => {
    if (showQuestions && questions.length > 0) {
      setShowQuestions(false);
      return;
    }
    
    setLoadingQuestions(true);
    setShowQuestions(true);
    try {
      const skillsToUse = requiredSkillsForQuestions.length > 0 ? requiredSkillsForQuestions : candidate.skills;
      const res = await api.post('/ai/questions', {
        candidate,
        requiredSkills: skillsToUse
      });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Error generating questions", err);
      setQuestions(["Failed to generate questions. Check API key."]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1rem', border: isSaved ? '1px solid #eab308' : '' }}>
      <div className="flex-between">
        <div>
          <h4 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {candidate.name}
            <button onClick={toggleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Star size={18} fill={isSaved ? "#eab308" : "none"} color={isSaved ? "#eab308" : "var(--text-secondary)"} />
            </button>
          </h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Mail size={14} /> {candidate.email}
          </div>
        </div>
        {score !== null && (
          <div className={`score-circle ${scoreClass}`}>
            {score}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <Code size={14} /> Skills
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {candidate.skills.map((skill, index) => {
            const isMatched = candidate.matchedSkillsList?.some(s => s.toLowerCase() === skill.toLowerCase());
            return (
              <span key={index} className={`badge ${isMatched ? 'badge-success' : ''}`}>
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <Briefcase size={14} /> Experience
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          {candidate.experience} years
        </div>
      </div>

      {candidate.projects && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Bio / Projects</div>
          <div style={{ fontSize: '0.875rem', backgroundColor: 'rgba(15, 23, 42, 0.3)', padding: '0.75rem', borderRadius: '8px' }}>
            {candidate.projects}
          </div>
        </div>
      )}

      {isAiMode && candidate.aiExplanation && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#8b5cf6', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            AI Recommendation
          </div>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            {candidate.aiExplanation}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button className="btn btn-outline" onClick={generateQuestions} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <MessageSquare size={16} /> {showQuestions && !loadingQuestions && questions.length > 0 ? "Hide Questions" : "Generate AI Interview Questions"}
        </button>
        
        {showQuestions && (
          <div style={{ marginTop: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '8px' }}>
            {loadingQuestions ? (
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Generating tailored questions...</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;

import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

const JobRequirementForm = ({ onMatch, onAiShortlist, loading }) => {
  const [data, setData] = useState({
    requiredSkills: '',
    minExperience: 0
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleMatch = (e) => {
    e.preventDefault();
    if (!data.requiredSkills) return;
    const skillsArray = data.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
    onMatch({ requiredSkills: skillsArray, minExperience: Number(data.minExperience) });
  };

  const handleAiShortlist = (e) => {
    e.preventDefault();
    if (!data.requiredSkills) return;
    const skillsArray = data.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
    onAiShortlist({ requiredSkills: skillsArray, minExperience: Number(data.minExperience) });
  };

  return (
    <div className="card">
      <h3 className="flex-between">
        <span className="title-gradient">Job Requirements</span>
        <Search size={20} className="text-primary" />
      </h3>
      
      <div className="grid-2 mt-4">
        <div className="form-group">
          <label className="form-label">Required Skills (comma separated)</label>
          <input 
            type="text" 
            name="requiredSkills" 
            value={data.requiredSkills} 
            onChange={handleChange} 
            className="form-input" 
            placeholder="e.g. React, Node.js" 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Minimum Experience (Years)</label>
          <input 
            type="number" 
            name="minExperience" 
            value={data.minExperience} 
            onChange={handleChange} 
            className="form-input" 
            min="0" 
            step="0.5" 
          />
        </div>
      </div>
      
      <div className="flex-between mt-4 gap-4">
        <button onClick={handleMatch} className="btn btn-outline" style={{ flex: 1 }} disabled={loading}>
          <Search size={16} /> Basic Match
        </button>
        <button onClick={handleAiShortlist} className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
          <Sparkles size={16} /> AI Shortlist
        </button>
      </div>
    </div>
  );
};

export default JobRequirementForm;

import React, { useState } from 'react';
import api from '../api';
import { UserPlus } from 'lucide-react';

const CandidateForm = ({ onCandidateAdded }) => {
  const formData = {
    name: '',
    email: '',
    skills: '',
    experience: '',
    projects: ''
  };
  const [data, setData] = useState(formData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/candidates', data);
      setMessage('Candidate added successfully!');
      setData(formData);
      if (onCandidateAdded) onCandidateAdded(response.data);
    } catch (err) {
      setMessage('Error adding candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="flex-between">
        <span className="title-gradient">Add Candidate</span>
        <UserPlus size={20} className="text-primary" />
      </h3>
      {message && (
        <div className={`mb-4 badge ${message.includes('Error') ? 'badge-warning' : 'badge-success'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" value={data.name} onChange={handleChange} className="form-input" required placeholder="e.g. Rahul Sharma" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" value={data.email} onChange={handleChange} className="form-input" required placeholder="e.g. rahul@example.com" />
          </div>
        </div>
        
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input type="text" name="skills" value={data.skills} onChange={handleChange} className="form-input" required placeholder="React, Node.js, MongoDB" />
          </div>
          <div className="form-group">
            <label className="form-label">Experience (Years)</label>
            <input type="number" name="experience" value={data.experience} onChange={handleChange} className="form-input" required min="0" step="0.5" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio / Projects</label>
          <textarea name="projects" value={data.projects} onChange={handleChange} className="form-input" rows="3" placeholder="Describe projects or bio..."></textarea>
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Adding...' : 'Add Candidate'}
        </button>
      </form>
    </div>
  );
};

export default CandidateForm;

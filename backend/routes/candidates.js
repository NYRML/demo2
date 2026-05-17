const express = require('express');
const Candidate = require('../models/Candidate');
const router = express.Router();

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add a new candidate
router.post('/', async (req, res) => {
  try {
    const { name, email, skills, experience, projects } = req.body;
    
    // Convert skills to array if it is a comma separated string
    let parsedSkills = skills;
    if (typeof skills === 'string') {
        parsedSkills = skills.split(',').map(s => s.trim()).filter(s => s);
    }

    const newCandidate = new Candidate({
      name,
      email,
      skills: parsedSkills,
      experience,
      projects
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json(savedCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Error adding candidate' });
  }
});

// Toggle save status
router.put('/:id/save', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    candidate.isSaved = !candidate.isSaved;
    await candidate.save();
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Error updating candidate' });
  }
});

module.exports = router;

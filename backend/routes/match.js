const express = require('express');
const Candidate = require('../models/Candidate');
const router = express.Router();

// Basic Matching Logic
router.post('/match', async (req, res) => {
  try {
    const { requiredSkills, minExperience } = req.body;
    
    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ error: "Please provide an array of requiredSkills" });
    }

    const minExp = minExperience || 0;
    
    // Convert required skills to lowercase for case-insensitive matching
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    const candidates = await Candidate.find();
    
    const matchedCandidates = candidates.map(candidate => {
      const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
      
      const matchedSkills = candidateSkillsLower.filter(skill => 
        requiredSkillsLower.includes(skill)
      );
      
      const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
      
      return {
        ...candidate._doc,
        matchScore: score,
        matchedSkillsList: candidate.skills.filter(s => requiredSkillsLower.includes(s.toLowerCase())),
        meetsExperience: candidate.experience >= minExp
      };
    })
    .filter(c => c.matchScore > 0) // Optional: only return those with > 0 score
    .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error during matching' });
  }
});

// AI-Based Candidate Suggestion
router.post('/ai/shortlist', async (req, res) => {
  try {
    const { requiredSkills, minExperience } = req.body;
    
    if (!requiredSkills || !Array.isArray(requiredSkills)) {
      return res.status(400).json({ error: "Please provide an array of requiredSkills" });
    }

    const candidates = await Candidate.find();
    
    const candidatesStr = candidates.map((c, index) => {
      return `${index + 1}. ${c.name} - Skills: ${c.skills.join(', ')} - Experience: ${c.experience} years - Bio: ${c.projects || 'N/A'}`;
    }).join('\n');

    const prompt = `
Job requires: ${requiredSkills.join(', ')} (${minExperience || 0}+ years experience)

Candidates:
${candidatesStr}

Rank the candidates based on how well they fit the job requirements. Provide a JSON array output.
Each item in the array must have:
- "name": candidate name
- "score": a number from 0 to 100
- "explanation": a concise explanation of why they got this score, highlighting their strengths and weaknesses regarding the job.

Return ONLY the JSON array and nothing else.
`;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: "OpenRouter API Key is missing in backend configuration." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert technical recruiter." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("OpenRouter API Error:", data);
        return res.status(500).json({ error: "Error from AI Service" });
    }

    const aiContent = data.choices[0].message.content;
    
    let aiRankings = [];
    try {
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            aiRankings = JSON.parse(jsonMatch[0]);
        } else {
            aiRankings = JSON.parse(aiContent);
        }
    } catch(e) {
        console.error("Failed to parse AI response:", aiContent);
        return res.status(500).json({ error: "AI returned malformed data." });
    }
    
    const finalResult = aiRankings.map(rank => {
       const candidateData = candidates.find(c => c.name.toLowerCase() === rank.name.toLowerCase());
       return {
          ...candidateData?._doc,
          aiScore: rank.score,
          aiExplanation: rank.explanation
       }
    }).filter(c => c._id); 

    res.json(finalResult);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error during AI shortlisting' });
  }
});

// AI-Generated Interview Questions
router.post('/ai/questions', async (req, res) => {
  try {
    const { candidate, requiredSkills } = req.body;

    if (!candidate || !requiredSkills) {
      return res.status(400).json({ error: "Candidate and requiredSkills are required" });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: "OpenRouter API Key is missing in backend configuration." });
    }

    const prompt = `
You are an expert technical interviewer.
Generate 3 tailored technical interview questions for the following candidate based on the job's required skills.

Candidate Profile:
Name: ${candidate.name}
Experience: ${candidate.experience} years
Skills: ${candidate.skills.join(', ')}
Bio: ${candidate.projects || 'N/A'}

Job Required Skills: ${requiredSkills.join(', ')}

Please output ONLY a JSON array of strings, where each string is an interview question.
Example output: ["Question 1?", "Question 2?", "Question 3?"]
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert technical interviewer." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return res.status(500).json({ error: "Error from AI Service" });
    }

    const aiContent = data.choices[0].message.content;
    
    let questions = [];
    try {
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
        } else {
            questions = JSON.parse(aiContent);
        }
    } catch(e) {
        console.error("Failed to parse AI response:", aiContent);
        questions = aiContent.split('\n').filter(q => q.trim().length > 0);
    }

    res.json({ questions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error during AI questions generation' });
  }
});

module.exports = router;

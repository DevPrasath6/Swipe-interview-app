// Resume parser controller
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs/promises';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

export const parseUpload = upload.single('resume');

export const parse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    // Parse based on file type
    if (fileExtension === 'pdf') {
      const dataBuffer = await fs.readFile(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (fileExtension === 'docx') {
      const result = await mammoth.extractRawText({ path: req.file.path });
      extractedText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX.' });
    }

    // Extract information using regex patterns
    const resumeData = extractResumeData(extractedText);

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('File cleanup warning:', cleanupError);
    }

    res.json({
      success: true,
      data: resumeData,
      filename: req.file.originalname,
      fileSize: req.file.size,
      extractedText: extractedText.substring(0, 500) + '...' // First 500 chars for debug
    });
  } catch (error) {
    console.error('Resume parse error:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
};

function extractResumeData(text) {
  const data = {
    name: '',
    email: '',
    phone: '',
    experience: [],
    skills: [],
    education: []
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    data.email = emailMatch[0];
  }

  // Extract phone number
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    data.phone = phoneMatch[0].trim();
  }

  // Extract name (usually at the beginning, before email/phone)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip if line contains email, phone, or common resume headers
    if (!line.match(emailRegex) && !line.match(phoneRegex) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum') &&
        line.length > 3 && line.length < 50 &&
        line.split(' ').length <= 4) {
      data.name = line;
      break;
    }
  }

  // Extract experience
  const experienceSection = extractSection(text, ['experience', 'work history', 'employment', 'professional experience']);
  if (experienceSection) {
    data.experience = parseExperience(experienceSection);
  }

  // Extract skills
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'technologies', 'competencies']);
  if (skillsSection) {
    data.skills = extractSkills(skillsSection);
  }

  // Extract education
  const educationSection = extractSection(text, ['education', 'academic background', 'qualification']);
  if (educationSection) {
    data.education = parseEducation(educationSection);
  }

  return data;
}

function extractSection(text, sectionHeaders) {
  const lowerText = text.toLowerCase();

  for (const header of sectionHeaders) {
    const headerIndex = lowerText.indexOf(header);
    if (headerIndex !== -1) {
      // Find the end of this section (next major section or end of text)
      const nextSectionRegex = /(education|experience|skills|projects|certifications|awards)/g;
      nextSectionRegex.lastIndex = headerIndex + header.length;
      const nextMatch = nextSectionRegex.exec(lowerText);

      const endIndex = nextMatch ? nextMatch.index : text.length;
      return text.substring(headerIndex + header.length, endIndex).trim();
    }
  }

  return null;
}

function parseExperience(sectionText) {
  const lines = sectionText.split('\n').map(line => line.trim()).filter(line => line.length > 10);
  const experiences = [];

  for (let i = 0; i < lines.length && experiences.length < 3; i++) {
    const line = lines[i];
    if (line.length > 20) {
      experiences.push({
        title: line.split(' at ')[0] || 'Position',
        company: line.split(' at ')[1]?.split(' ')[0] || 'Company',
        duration: extractDuration(line) || '2020-2023',
        description: line
      });
    }
  }

  return experiences;
}

function parseEducation(sectionText) {
  const lines = sectionText.split('\n').map(line => line.trim()).filter(line => line.length > 10);
  const education = [];

  for (let i = 0; i < lines.length && education.length < 2; i++) {
    const line = lines[i];
    if (line.length > 15) {
      education.push({
        degree: extractDegree(line) || 'Degree',
        institution: extractInstitution(line) || 'University',
        year: extractYear(line) || '2022'
      });
    }
  }

  return education;
}

function extractSkills(skillsText) {
  // Common skill separators and patterns
  const skillRegex = /([A-Za-z][A-Za-z\s\+\#\.\-]{2,20})/g;
  const matches = skillsText.match(skillRegex) || [];

  // Filter and clean skills
  const skills = matches
    .map(skill => skill.trim())
    .filter(skill => skill.length > 2 && skill.length < 25)
    .filter(skill => !skill.toLowerCase().match(/^(and|or|the|with|of|in|at|for|by)$/))
    .slice(0, 15); // Limit to 15 skills

  return [...new Set(skills)]; // Remove duplicates
}

function extractDuration(text) {
  const durationRegex = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/i;
  const match = text.match(durationRegex);
  return match ? match[0] : null;
}

function extractDegree(text) {
  const degreePatterns = [
    /bachelor[s]?\s*(of\s*)?([a-z\s]+)/i,
    /master[s]?\s*(of\s*)?([a-z\s]+)/i,
    /phd|doctorate/i,
    /b\.?s\.?|m\.?s\.?|ph\.?d\.?/i
  ];

  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return null;
}

function extractInstitution(text) {
  const institutionPatterns = [
    /university\s+of\s+[a-z\s]+/i,
    /[a-z\s]+\s+university/i,
    /[a-z\s]+\s+college/i,
    /[a-z\s]+\s+institute/i
  ];

  for (const pattern of institutionPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return null;
}

function extractYear(text) {
  const yearRegex = /\b(19|20)\d{2}\b/g;
  const matches = text.match(yearRegex);
  return matches ? matches[matches.length - 1] : null;
}

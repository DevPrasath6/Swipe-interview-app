// Text extraction utilities for resume parsing

/**
 * Extract email addresses from text
 */
export function extractEmails(text) {
  if (!text) return [];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];

  // Remove duplicates and sort by likelihood of being primary email
  const uniqueEmails = [...new Set(matches)];

  return uniqueEmails.sort((a, b) => {
    // Prefer emails that don't look like temporary or generic ones
    const tempPatterns = ['temp', 'test', 'sample', 'example', 'noreply', 'no-reply'];
    const aIsTemp = tempPatterns.some(pattern => a.toLowerCase().includes(pattern));
    const bIsTemp = tempPatterns.some(pattern => b.toLowerCase().includes(pattern));

    if (aIsTemp && !bIsTemp) return 1;
    if (!aIsTemp && bIsTemp) return -1;

    // Prefer shorter emails (usually personal)
    return a.length - b.length;
  });
}

/**
 * Extract phone numbers from text
 */
export function extractPhoneNumbers(text) {
  if (!text) return [];

  // Multiple regex patterns for different phone number formats
  const phonePatterns = [
    // US format: (123) 456-7890, 123-456-7890, 123.456.7890
    /\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    // International format: +1-234-567-8900, +1 234 567 8900
    /\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    // General international: +XX XXX XXX XXXX
    /\+[1-9]\d{1,14}/g,
    // Simple digit sequences (10-11 digits)
    /\b\d{10,11}\b/g
  ];

  const phoneNumbers = new Set();

  phonePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      // Clean up the phone number
      const cleaned = match.replace(/[^\d+]/g, '');
      if (cleaned.length >= 10 && cleaned.length <= 15) {
        phoneNumbers.add(match.trim());
      }
    });
  });

  return Array.from(phoneNumbers).sort((a, b) => {
    // Prefer numbers with formatting
    const aHasFormatting = /[-()\s.]/.test(a);
    const bHasFormatting = /[-()\s.]/.test(b);

    if (aHasFormatting && !bHasFormatting) return -1;
    if (!aHasFormatting && bHasFormatting) return 1;

    return a.length - b.length;
  });
}

/**
 * Extract names from text with improved heuristics
 */
export function extractNames(text) {
  if (!text) return [];

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const potentialNames = [];

  // Common name indicators
  const nameIndicators = ['name', 'candidate', 'applicant', 'resume of', 'cv of'];

  // Look through first 10 lines for names
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];

    // Skip lines that are clearly not names
    if (line.length > 50) continue;
    if (/^\d/.test(line)) continue; // Starts with number
    if (/@/.test(line)) continue; // Contains email
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(line)) continue; // Contains phone

    // Check for name indicators
    const lowerLine = line.toLowerCase();
    const hasNameIndicator = nameIndicators.some(indicator =>
      lowerLine.includes(indicator)
    );

    if (hasNameIndicator) {
      // Extract name after indicator
      const nameMatch = line.match(/(?:name|candidate|applicant|resume of|cv of)[\s:]*(.+)/i);
      if (nameMatch) {
        potentialNames.push({
          name: nameMatch[1].trim(),
          confidence: 0.9,
          source: 'indicator'
        });
      }
    }

    // Look for patterns that look like names (2-4 words, capitalized)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const isCapitalized = words.every(word =>
        /^[A-Z]/.test(word) && /^[A-Za-z'.-]+$/.test(word)
      );

      if (isCapitalized) {
        potentialNames.push({
          name: words.join(' '),
          confidence: i === 0 ? 0.8 : Math.max(0.3, 0.8 - i * 0.1),
          source: 'capitalization'
        });
      }
    }
  }

  // Sort by confidence and return unique names
  const uniqueNames = potentialNames
    .sort((a, b) => b.confidence - a.confidence)
    .map(item => item.name)
    .filter((name, index, array) => array.indexOf(name) === index);

  return uniqueNames;
}

/**
 * Extract skills from text
 */
export function extractSkills(text) {
  if (!text) return [];

  const skillKeywords = [
    // Programming Languages
    'javascript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'rust', 'typescript',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'objective-c',

    // Frontend Technologies
    'react', 'angular', 'vue', 'jquery', 'html', 'css', 'sass', 'less', 'bootstrap',
    'tailwind', 'webpack', 'vite', 'babel', 'jsx', 'tsx',

    // Backend Technologies
    'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails',
    'fastapi', 'nestjs', 'koa', 'hapi',

    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server',
    'dynamodb', 'cassandra', 'elasticsearch',

    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions',
    'terraform', 'ansible', 'vagrant', 'nginx', 'apache',

    // Tools & Others
    'git', 'svn', 'jira', 'confluence', 'slack', 'figma', 'photoshop', 'illustrator',
    'linux', 'windows', 'macos', 'agile', 'scrum', 'kanban'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = skillKeywords.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerText);
  });

  return foundSkills.sort();
}

/**
 * Extract education information
 */
export function extractEducation(text) {
  if (!text) return [];

  const educationKeywords = [
    'bachelor', 'master', 'phd', 'doctorate', 'degree', 'university', 'college',
    'institute', 'school', 'education', 'graduated', 'gpa', 'major', 'minor'
  ];

  const degreePatterns = [
    /bachelor(?:'?s)?(?:\s+of)?(?:\s+science)?(?:\s+in)?/gi,
    /master(?:'?s)?(?:\s+of)?(?:\s+science)?(?:\s+in)?/gi,
    /phd|ph\.d\.?|doctorate/gi,
    /b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|m\.?b\.?a\.?/gi
  ];

  const lines = text.split(/\r?\n/);
  const educationInfo = [];

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();

    // Check if line contains education keywords
    const hasEducationKeyword = educationKeywords.some(keyword =>
      lowerLine.includes(keyword)
    );

    if (hasEducationKeyword) {
      // Check for degree patterns
      degreePatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          educationInfo.push({
            line: line.trim(),
            lineNumber: index,
            type: 'degree'
          });
        }
      });
    }
  });

  return educationInfo;
}

/**
 * Extract work experience information
 */
export function extractExperience(text) {
  if (!text) return [];

  const experienceKeywords = [
    'experience', 'work', 'employment', 'career', 'position', 'role', 'job',
    'worked', 'developer', 'engineer', 'manager', 'analyst', 'consultant',
    'intern', 'internship', 'freelance', 'contract'
  ];

  const datePatterns = [
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi,
    /\b\d{4}\s*-\s*\d{4}/g,
    /\b\d{1,2}\/\d{4}/g,
    /\b(present|current|ongoing)/gi
  ];

  const lines = text.split(/\r?\n/);
  const experienceInfo = [];

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();

    // Check if line contains experience keywords or date patterns
    const hasExperienceKeyword = experienceKeywords.some(keyword =>
      lowerLine.includes(keyword)
    );

    const hasDatePattern = datePatterns.some(pattern => pattern.test(line));

    if (hasExperienceKeyword || hasDatePattern) {
      experienceInfo.push({
        line: line.trim(),
        lineNumber: index,
        type: hasDatePattern ? 'date_range' : 'experience'
      });
    }
  });

  return experienceInfo;
}

/**
 * Extract all relevant information from resume text
 */
export function extractAllInfo(text) {
  if (!text) {
    return {
      names: [],
      emails: [],
      phones: [],
      skills: [],
      education: [],
      experience: []
    };
  }

  return {
    names: extractNames(text),
    emails: extractEmails(text),
    phones: extractPhoneNumbers(text),
    skills: extractSkills(text),
    education: extractEducation(text),
    experience: extractExperience(text)
  };
}

/**
 * Get the most likely candidate information
 */
export function getBestCandidateInfo(extractedInfo) {
  const { names, emails, phones } = extractedInfo;

  return {
    name: names.length > 0 ? names[0] : '',
    email: emails.length > 0 ? emails[0] : '',
    phone: phones.length > 0 ? phones[0] : ''
  };
}

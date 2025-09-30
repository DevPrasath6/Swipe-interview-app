import { useState, useCallback } from 'react';
import parseResume from '../components/resumeUploader/resumeParser';

export default function useResumeParser() {
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  const parseFile = useCallback(async (file) => {
    if (!file) {
      setError('No file provided');
      return null;
    }

    setParsing(true);
    setError(null);
    setParsedData(null);

    try {
      const result = await parseResume(file);
      setParsedData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to parse resume';
      setError(errorMessage);
      console.error('Resume parsing error:', err);
      return null;
    } finally {
      setParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setParsing(false);
    setParsedData(null);
    setError(null);
  }, []);

  const validateParsedData = useCallback((data) => {
    if (!data) return { isValid: false, missingFields: ['name', 'email', 'phone'] };

    const missingFields = [];
    if (!data.name || data.name.trim() === '') missingFields.push('name');
    if (!data.email || data.email.trim() === '') missingFields.push('email');
    if (!data.phone || data.phone.trim() === '') missingFields.push('phone');

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }, []);

  return {
    parsing,
    parsedData,
    error,
    parseFile,
    reset,
    validateParsedData
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSpecificationSections,
  uploadSubmittal,
} from '@/services/submittal/SubmittalService.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { SpecSectionBO } from '@/types/bos/submittal/SpecSectionBO.ts';
import { ProgressStepBO } from '@/types/bos/progressLoader/ProgressStepBO.ts';
import { SubmittalFormData } from '@/types/common/SubmittalFormData.ts';
import { FormErrors } from '@/types/common/FormErrors.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { isValidPDF } from '@/helpers/validators/fileValidator.ts';
import { isValidTitle, isValidSpecSection } from '@/helpers/validators/submittalValidator.ts';
import Logger from '@/helpers/utilities/Logger.ts';

export function useSubmittal(projectId: string) {
  const navigate = useNavigate();
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const [formData, setFormData] = useState<SubmittalFormData>({
    title: '',
    specSection: '',
    description: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [specSections, setSpecSections] = useState<SpecSectionBO[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submittalId, setSubmittalId] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [currentStep, setCurrentStep] = useState<ProgressStepBO | null>(null);
  const [steps, setSteps] = useState<ProgressStepBO[]>([]);

  const [errors, setErrors] = useState<FormErrors>({
    title: null,
    specSection: null,
    files: null,
    general: null,
  });

  // SEQ: 2.1 - Call loadSpecificationSections()
  const loadSpecificationSections = useCallback(async () => {
    try {
      setIsLoadingSections(true);

      // SEQ: 2.4 - Call getSpecificationSections(projectId)
      const result = await getSpecificationSections(projectId);

      if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
        const divisions = result.data.divisions;
        const allSections: SpecSectionBO[] = [];

        if (divisions.mechanical) {
          divisions.mechanical.sections.forEach((section) => {
            allSections.push({
              number: section.number,
              title: section.title,
              divisionNumber: divisions.mechanical!.divisionNumber,
            });
          });
        }

        if (divisions.electrical) {
          divisions.electrical.sections.forEach((section) => {
            allSections.push({
              number: section.number,
              title: section.title,
              divisionNumber: divisions.electrical!.divisionNumber,
            });
          });
        }

        // SEQ: 2.30 - Call setSpecSections with sections array
        setSpecSections(allSections);
      } else {
        setErrors((prev) => ({ ...prev, general: result.message }));
      }
    } catch (error) {
      Logger.error('Unexpected error in loadSpecificationSections', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setErrors((prev) => ({ ...prev, general: 'Failed to load specification sections' }));
    } finally {
      setIsLoadingSections(false);
    }
  }, [projectId]);

  // SEQ: 1.25 - useEffect with dependencies [projectId]
  useEffect(() => {
    loadSpecificationSections();
  }, [loadSpecificationSections]);

  // SEQ: 3.2 - Call handleInputChange(field, value)
  const handleInputChange = useCallback((field: keyof SubmittalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null, general: null }));
  }, []);

  // SEQ: 6.2 - Call handleFileUpload(files)
  const handleFileUpload = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    let hasInvalidFile = false;

    Array.from(files).forEach((file) => {
      // SEQ: 6.4 - Call isValidPDF(file)
      if (isValidPDF(file)) {
        validFiles.push(file);
      } else {
        hasInvalidFile = true;
      }
    });

    if (hasInvalidFile) {
      setErrors((prev) => ({ ...prev, files: 'Only PDF files are accepted' }));
    } else {
      setErrors((prev) => ({ ...prev, files: null }));
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  // SEQ: 7.2 - Call handleRemoveFile(index)
  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, files: null }));
  }, []);

  const validateTitle = useCallback((): boolean => {
    if (!isValidTitle(formData.title)) {
      setErrors((prev) => ({ ...prev, title: 'Title must be at least 3 characters' }));
      return false;
    }
    return true;
  }, [formData.title]);

  const validateSpecSection = useCallback((): boolean => {
    if (!isValidSpecSection(formData.specSection)) {
      setErrors((prev) => ({ ...prev, specSection: 'Please select a specification section' }));
      return false;
    }
    return true;
  }, [formData.specSection]);

  const validateFiles = useCallback((): boolean => {
    if (uploadedFiles.length === 0) {
      setErrors((prev) => ({
        ...prev,
        files: 'Please upload at least one submittal document',
      }));
      return false;
    }
    return true;
  }, [uploadedFiles]);

  // SEQ: 8.3 - Call validateForm()
  const validateForm = useCallback((): boolean => {
    const isTitleValid = validateTitle();
    const isSpecSectionValid = validateSpecSection();
    const areFilesValid = validateFiles();

    return isTitleValid && isSpecSectionValid && areFilesValid;
  }, [validateTitle, validateSpecSection, validateFiles]);

  // SEQ: 9.20 - Call handleSSEStream(response)
  const handleSSEStream = useCallback(
    async (response: Response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      readerRef.current = reader;
      let eventType = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data:')) {
              const data = JSON.parse(line.substring(6));
              const camelCaseData = convertKeysToCamelCase<any>(data);

              if (eventType === 'created') {
                // SEQ: 9.31 - Call setSubmittalId(data.submittalId)
                setSubmittalId(camelCaseData.submittalId);
                setProgressPct(0);
              } else if (eventType === 'progress') {
                setProgressPct(camelCaseData.progressPct);
                // SEQ: 9.38 - Replace steps array with data.steps (incremental)
                setSteps(camelCaseData.steps);
                if (camelCaseData.steps.length > 0) {
                  setCurrentStep(camelCaseData.steps[camelCaseData.steps.length - 1]);
                }
              } else if (eventType === 'complete') {
                setProgressPct(100);
                setSteps(camelCaseData.steps);
                setIsAnalyzing(false);
                readerRef.current = null;
                // SEQ: 9.45 - Call navigate to results
                navigate(`/projects/${projectId}/submittal/${camelCaseData.submittalId}/results`);
              } else if (eventType === 'error') {
                setIsAnalyzing(false);
                setSteps(camelCaseData.steps || []);
                readerRef.current = null;
                setErrors((prev) => ({
                  ...prev,
                  general: camelCaseData.errorMessage || 'Analysis failed',
                }));
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          Logger.info('SSE stream cancelled by user');
        } else {
          Logger.error('Error reading SSE stream', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          setIsAnalyzing(false);
          setErrors((prev) => ({ ...prev, general: 'Failed to process submittal' }));
        }
        readerRef.current = null;
      }
    },
    [projectId, navigate]
  );

  // SEQ: 8.2 - Call handleSubmit()
  const handleSubmit = useCallback(async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setIsAnalyzing(true);
      setErrors({ title: null, specSection: null, files: null, general: null });

      const formDataToSend = new FormData();
      formDataToSend.append('project_id', projectId);
      formDataToSend.append('title', formData.title);
      // Extract just the section number from the formatted string (e.g., "16 05 00 - Title" -> "16 05 00")
      const specSectionNumber = formData.specSection.split(' - ')[0].trim();
      formDataToSend.append('spec_section', specSectionNumber);
      formDataToSend.append('description', formData.description);

      uploadedFiles.forEach((file) => {
        formDataToSend.append('files', file);
      });

      // SEQ: 9.10 - Call uploadSubmittal(formData)
      const response = await uploadSubmittal(formDataToSend);
      await handleSSEStream(response);
    } catch (error) {
      Logger.error('Unexpected error in handleSubmit', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsAnalyzing(false);
      setErrors((prev) => ({ ...prev, general: 'Failed to upload submittal' }));
    }
  }, [validateForm, projectId, formData, uploadedFiles, handleSSEStream]);

  // SEQ: 11.2 - Call handleContinueInBackground()
  const handleContinueInBackground = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel().catch((error) => {
        Logger.warn('Error cancelling SSE stream', { error: error.message });
      });
      readerRef.current = null;
    }

    setIsAnalyzing(false);
    navigate('/projects');
  }, [navigate]);

  const navigateBack = useCallback(() => {
    navigate(`/projects/${projectId}`);
  }, [projectId, navigate]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    // Must have title, spec section, and at least one file
    return (
      formData.title.trim() !== '' && formData.specSection.trim() !== '' && uploadedFiles.length > 0
    );
  }, [formData.title, formData.specSection, uploadedFiles.length]);

  return {
    formData,
    uploadedFiles,
    specSections,
    isLoadingSections,
    isAnalyzing,
    submittalId,
    progressPct,
    currentStep,
    steps,
    errors,
    isFormValid: isFormValid(),
    handleInputChange,
    handleFileUpload,
    handleRemoveFile,
    handleSubmit,
    handleContinueInBackground,
    navigateBack,
  };
}

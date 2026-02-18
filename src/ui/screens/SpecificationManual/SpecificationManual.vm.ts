import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProjectSetup,
  uploadSpecManual,
} from '@/services/specificationManual/SpecManualService.ts';
import { DivisionDocumentBO } from '@/types/bos/specificationManual/DivisionDocumentBO.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { isValidPDF } from '@/helpers/validators/fileValidator.ts';
import { isValidProjectName, isValidProjectType } from '@/helpers/validators/projectValidator.ts';
import Logger from '@/helpers/utilities/Logger.ts';

export function useSpecificationManual(projectId: string) {
  const navigate = useNavigate();
  const isNewProject = projectId === '0';

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [isDivisionBased, setIsDivisionBased] = useState(false);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [completeSpecFile, setCompleteSpecFile] = useState<File | null>(null);
  const [mechanicalDivisionFile, setMechanicalDivisionFile] = useState<File | null>(null);
  const [electricalDivisionFile, setElectricalDivisionFile] = useState<File | null>(null);
  const [existingMechanicalDoc, setExistingMechanicalDoc] = useState<DivisionDocumentBO | null>(
    null
  );
  const [existingElectricalDoc, setExistingElectricalDoc] = useState<DivisionDocumentBO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectNameError, setProjectNameError] = useState<string | null>(null);
  const [projectTypeError, setProjectTypeError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // SEQ: 2.2 - Call loadProjectSetup()
  const loadProjectSetup = useCallback(async () => {
    try {
          setIsLoading(true);

          // SEQ: 2.5 - Call getProjectSetup(projectId)
          const result = await getProjectSetup(projectId);

          if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
              const setupData = result.data;

              setProjectName(setupData.projectName);
              setProjectType(setupData.projectType);
              setIsDivisionBased(setupData.isDivisionBased);
              setSelectedDivisions(setupData.divisions.map((d) => d.divisionNumber));

              setupData.divisions.forEach((division) => {
          if (division.divisionNumber === '15' && division.documents.length > 0) {
            setExistingMechanicalDoc(division.documents[0]);
          }
          if (division.divisionNumber === '16' && division.documents.length > 0) {
            setExistingElectricalDoc(division.documents[0]);
          }
        });
      } else {
              setError(result.message);
      }
    } catch (error) {
          Logger.error('Unexpected error in loadProjectSetup', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setError('Failed to load project setup');
    } finally {
          setIsLoading(false);
    }
  }, [projectId]);

  // SEQ: 1.25 - useEffect with dependencies [projectId, isNewProject]
  useEffect(() => {
    if (!isNewProject) {
          loadProjectSetup();
    }
  }, [isNewProject, loadProjectSetup]);

  // SEQ: 3.2 - Call handleProjectNameChange(value)
  const handleProjectNameChange = useCallback((value: string) => {
      setProjectName(value);
      setProjectNameError(null);
      setError(null);
  }, []);

  // SEQ: 4.2 - Call handleProjectTypeChange(value)
  const handleProjectTypeChange = useCallback((value: string) => {
      setProjectType(value);
      setProjectTypeError(null);
      setError(null);
  }, []);

  // SEQ: 5.2 - Call handleDivisionBasedToggle()
  const handleDivisionBasedToggle = useCallback(() => {
      setIsDivisionBased((prev) => {
      const newValue = !prev;
      if (newValue) {
        setSelectedDivisions(['15', '16']);
      } else {
        setSelectedDivisions([]);
      }
      return newValue;
    });
      setFileError(null);
    setCompleteSpecFile(null);
    setMechanicalDivisionFile(null);
    setElectricalDivisionFile(null);
  }, []);

  // SEQ: 6.2 - Call handleDivisionSelection(divisions)
  const handleDivisionSelection = useCallback((divisions: string[]) => {
      setSelectedDivisions(divisions);
      setFileError(null);
  }, []);

  // SEQ: 7.2 - Call handleCompleteFileUpload(file)
  const handleCompleteFileUpload = useCallback((file: File) => {
      // SEQ: 7.3 - Call isValidPDF(file)
      if (isValidPDF(file)) {
          setCompleteSpecFile(file);
          setFileError(null);
    } else {
          setFileError('Only PDF files are accepted');
    }
  }, []);

  // SEQ: 8.3 - Call handleMechanicalFileUpload(file)
  const handleMechanicalFileUpload = useCallback((file: File) => {
      // SEQ: 8.4 - Call isValidPDF(file)
      if (isValidPDF(file)) {
          setMechanicalDivisionFile(file);
          setFileError(null);
    } else {
          setFileError('Only PDF files are accepted');
    }
  }, []);

  const handleElectricalFileUpload = useCallback((file: File) => {
      // SEQ: 8.4 - Call isValidPDF(file)
      if (isValidPDF(file)) {
          setElectricalDivisionFile(file);
          setFileError(null);
    } else {
          setFileError('Only PDF files are accepted');
    }
  }, []);

  // SEQ: 9.2 - Call handleRemoveFile(fileType)
  const handleRemoveFile = useCallback((fileType: string) => {
      if (fileType === 'complete') {
      setCompleteSpecFile(null);
    } else if (fileType === 'mechanical') {
      setMechanicalDivisionFile(null);
    } else if (fileType === 'electrical') {
      setElectricalDivisionFile(null);
    }
      setFileError(null);
  }, []);

  const isFieldDisabled = useCallback(() => !isNewProject, [isNewProject]);

  const isMechanicalUploadDisabled = useCallback(
    () => existingMechanicalDoc !== null,
    [existingMechanicalDoc]
  );

  const isElectricalUploadDisabled = useCallback(
    () => existingElectricalDoc !== null,
    [existingElectricalDoc]
  );

  const hasMechanicalDoc = useCallback(
    () => existingMechanicalDoc !== null,
    [existingMechanicalDoc]
  );

  const hasElectricalDoc = useCallback(
    () => existingElectricalDoc !== null,
    [existingElectricalDoc]
  );

  const validateProjectName = useCallback((): boolean => {
    if (!isValidProjectName(projectName)) {
      setProjectNameError('Project name must be at least 3 characters');
      return false;
    }
    return true;
  }, [projectName]);

  const validateProjectType = useCallback((): boolean => {
    if (!isValidProjectType(projectType)) {
      setProjectTypeError('Please select a valid project type');
      return false;
    }
    return true;
  }, [projectType]);

  const validateFiles = useCallback((): boolean => {
    if (!isDivisionBased) {
      if (!completeSpecFile) {
        setFileError('Please upload specification manual');
        return false;
      }
    } else {
      if (isNewProject) {
        if (!mechanicalDivisionFile && !electricalDivisionFile) {
          setFileError('Please upload at least one division document');
          return false;
        }
      } else {
        if (!mechanicalDivisionFile && !electricalDivisionFile) {
          setFileError('Please upload document for at least one division');
          return false;
        }
      }
    }
    return true;
  }, [
    isDivisionBased,
    completeSpecFile,
    mechanicalDivisionFile,
    electricalDivisionFile,
    isNewProject,
  ]);

  // SEQ: 10.3 - Call validateForm()
  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (isNewProject) {
      // SEQ: 10.5 - Call validateProjectName()
      isValid = validateProjectName() && validateProjectType() && validateFiles();
    } else {
      isValid = validateFiles();
    }

    return isValid;
  }, [isNewProject, validateProjectName, validateProjectType, validateFiles]);

  // SEQ: 10.2 - Call handleSubmit()
  const handleSubmit = useCallback(async () => {
    try {
          if (!validateForm()) {
              return;
      }

          setIsAnalyzing(true);

          const formData = new FormData();

          if (!isNewProject) {
              formData.append('project_id', projectId);
      } else {
              formData.append('project_name', projectName);
        formData.append('project_type', projectType);
      }

          if (!isDivisionBased) {
              formData.append('upload_mode', 'complete');
        if (completeSpecFile) {
          formData.append('specification_file', completeSpecFile);
        }
      } else {
              formData.append('upload_mode', 'division');
        if (mechanicalDivisionFile) {
          formData.append('mechanical_division_file', mechanicalDivisionFile);
        }
        if (electricalDivisionFile) {
          formData.append('electrical_division_file', electricalDivisionFile);
        }
      }

          // SEQ: 11.20 - Call uploadSpecManual(formData)
          const result = await uploadSpecManual(formData);

          if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
              const newProjectId = result.data.projectId;
              navigate(`/projects/${newProjectId}/submittal`);
      } else if (result.statusCode === ServiceResultStatusENUM.VALIDATION_ERROR) {
              setError(result.message);
      } else {
              setError(result.message);
      }
    } catch (error) {
          Logger.error('Unexpected error in handleSubmit', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setError('Failed to upload specification manual');
    } finally {
          setIsAnalyzing(false);
    }
  }, [
    validateForm,
    isNewProject,
    projectId,
    projectName,
    projectType,
    isDivisionBased,
    completeSpecFile,
    mechanicalDivisionFile,
    electricalDivisionFile,
    navigate,
  ]);

  const navigateBack = useCallback(() => {
      navigate('/projects');
  }, [navigate]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    // Must have project name and type
    if (!projectName.trim() || !projectType) {
      return false;
    }

    // Must have at least one specification document
    if (isDivisionBased) {
      // Division-based: at least one division file
      return mechanicalDivisionFile !== null || electricalDivisionFile !== null;
    } else {
      // Complete mode: must have complete spec file
      return completeSpecFile !== null;
    }
  }, [
    projectName,
    projectType,
    isDivisionBased,
    completeSpecFile,
    mechanicalDivisionFile,
    electricalDivisionFile,
  ]);

  return {
    isNewProject,
    projectName,
    projectType,
    isDivisionBased,
    selectedDivisions,
    completeSpecFile,
    mechanicalDivisionFile,
    electricalDivisionFile,
    existingMechanicalDoc,
    existingElectricalDoc,
    isLoading,
    isAnalyzing,
    error,
    projectNameError,
    projectTypeError,
    fileError,
    handleProjectNameChange,
    handleProjectTypeChange,
    handleDivisionBasedToggle,
    handleDivisionSelection,
    handleCompleteFileUpload,
    handleMechanicalFileUpload,
    handleElectricalFileUpload,
    handleRemoveFile,
    isFieldDisabled,
    isMechanicalUploadDisabled,
    isElectricalUploadDisabled,
    hasMechanicalDoc,
    hasElectricalDoc,
    isFormValid: isFormValid(),
    handleSubmit,
    navigateBack,
  };
}



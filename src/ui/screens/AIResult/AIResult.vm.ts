import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmittalResult } from '@/services/aiResult/AIResultService.ts';
import { SubmittalResultBO } from '@/types/bos/aiResult/SubmittalResultBO.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import Logger from '@/helpers/utilities/Logger.ts';

export function useAIResult(projectId: string, submittalId: string) {
  const navigate = useNavigate();

  const [resultData, setResultData] = useState<SubmittalResultBO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string>('');
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);

  // SEQ: 2.1 - Call loadSubmittalResult()
  const loadSubmittalResult = useCallback(async () => {
    try {
          setIsLoading(true);
          setError(null);

          // SEQ: 2.4 - Call getSubmittalResult(submittalId)
          const result = await getSubmittalResult(submittalId);

          if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
              setResultData(result.data as unknown as SubmittalResultBO);
      } else {
              setError(result.message);
      }
    } catch (error) {
          Logger.error('Unexpected error in loadSubmittalResult', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setError('Failed to load submittal result');
    } finally {
          setIsLoading(false);
    }
  }, [submittalId]);

  // SEQ: 1.20 - useEffect with dependencies [submittalId]
  useEffect(() => {
      loadSubmittalResult();
  }, [loadSubmittalResult]);

  // SEQ: 3.2 - Call handleViewSpecDocument(s3Url)
  const handleViewSpecDocument = useCallback((s3Url: string) => {
      setSelectedDocumentUrl(s3Url);
    setSelectedDocumentTitle('Specification Reference');
      setIsPDFViewerOpen(true);
  }, []);

  // SEQ: 4.2 - Call handleViewSubmittalDocument(s3Url)
  const handleViewSubmittalDocument = useCallback((s3Url: string) => {
      setSelectedDocumentUrl(s3Url);
    setSelectedDocumentTitle('Submittal Reference');
      setIsPDFViewerOpen(true);
  }, []);

  const handleClosePDFViewer = useCallback(() => {
      setIsPDFViewerOpen(false);
    setSelectedDocumentUrl(null);
    setSelectedDocumentTitle('');
  }, []);

  // SEQ: 7.2 - Call navigateToProjects()
  const navigateToProjects = useCallback(() => {
      navigate('/projects');
  }, [navigate]);

  // SEQ: 8.2 - Call navigateToNewSubmittal()
  const navigateToNewSubmittal = useCallback(() => {
      navigate(`/projects/${projectId}/submittal`);
  }, [projectId, navigate]);

  return {
    resultData,
    isLoading,
    error,
    selectedDocumentUrl,
    selectedDocumentTitle,
    isPDFViewerOpen,
    handleViewSpecDocument,
    handleViewSubmittalDocument,
    handleClosePDFViewer,
    navigateToProjects,
    navigateToNewSubmittal,
  };
}



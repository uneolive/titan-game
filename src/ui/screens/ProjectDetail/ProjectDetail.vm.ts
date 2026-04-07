import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteSpecificationManual,
  deleteSubmittal,
  getProjectDetails,
} from '@/services/projectDetail/ProjectDetailService.ts';
import {
  subscribeToSubmittalProgress,
  unsubscribeFromSubmittalProgress,
} from '@/services/aiResult/AIResultService.ts';
import { ProjectBO } from '@/types/bos/projects/ProjectBO.ts';
import { SpecificationDocumentBO } from '@/types/bos/projectDetail/SpecificationDocumentBO.ts';
import { SubmittalBO } from '@/types/bos/projectDetail/SubmittalBO.ts';
import { SubmittalProgressBO } from '@/types/bos/progressLoader/SubmittalProgressBO.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import Logger from '@/helpers/utilities/Logger.ts';

export function useProjectDetail(projectId: string) {
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectBO | null>(null);
  const [specificationDocuments, setSpecificationDocuments] = useState<SpecificationDocumentBO[]>(
    []
  );
  const [submittals, setSubmittals] = useState<SubmittalBO[]>([]);
  const [specificationDocumentsCount, setSpecificationDocumentsCount] = useState(0);
  const [submittalsCount, setSubmittalsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingSubmittalId, setIsDeletingSubmittalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize activeTab from URL hash or default to 'submittals'
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return hash === 'spec-manual' ? 'spec-manual' : 'submittals';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [showProgressPopup, setShowProgressPopup] = useState<string | null>(null);
  const [isNewSpecManualModalOpen, setIsNewSpecManualModalOpen] = useState(false);
  const [isNewSubmittalModalOpen, setIsNewSubmittalModalOpen] = useState(false);
  const [selectedResultSubmittalId, setSelectedResultSubmittalId] = useState<string | null>(null);
  const [pendingDeleteSpecDocumentId, setPendingDeleteSpecDocumentId] = useState<string | null>(null);
  const [isDeletingSpecDocumentId, setIsDeletingSpecDocumentId] = useState<string | null>(null);
  const [pendingDeleteSubmittalId, setPendingDeleteSubmittalId] = useState<string | null>(null);
  const [inProgressSubmittals, setInProgressSubmittals] = useState<
    Map<string, { eventSource: EventSource; progressData: SubmittalProgressBO }>
  >(new Map());

  const handleSubscribeToProgress = useCallback(
    (submittalId: string) => {
      // SEQ: 1.55 - Call subscribeToSubmittalProgress with submittalId and callbacks
      const eventSource = subscribeToSubmittalProgress(
        submittalId,
        (progressData) => {
          // SEQ: 2.7 - Update inProgressSubmittals Map with new progress data
          setInProgressSubmittals((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(submittalId);
            if (existing) {
              newMap.set(submittalId, { ...existing, progressData });
            }
            return newMap;
          });

          setSubmittals((prev) =>
            prev.map((s) =>
              s.submittalId === submittalId ? { ...s, progressPct: progressData.progressPct } : s
            )
          );
        },
        (completeData) => {
          // SEQ: 10.4 - Remove submittal from inProgressSubmittals Map
          setInProgressSubmittals((prev) => {
            const newMap = new Map(prev);
            newMap.delete(submittalId);
            return newMap;
          });

          setSubmittals((prev) =>
            prev.map((s) =>
              s.submittalId === submittalId
                ? { ...s, overallStatus: completeData.overallStatus, progressPct: 100 }
                : s
            )
          );

          // SEQ: 10.14 - Call navigateToSubmittalResults
          setShowProgressPopup((currentPopup) => {
            if (currentPopup === submittalId) {
              navigate(`/projects/${projectId}/submittal/${submittalId}/results`);
              return null;
            }
            return currentPopup;
          });
        },
        (errorMessage) => {
          setInProgressSubmittals((prev) => {
            const newMap = new Map(prev);
            newMap.delete(submittalId);
            return newMap;
          });

          setSubmittals((prev) =>
            prev.map((s) => (s.submittalId === submittalId ? { ...s, overallStatus: 'FAILED' } : s))
          );

          setShowProgressPopup((currentPopup) => {
            if (currentPopup === submittalId) {
              setError(errorMessage);
              return null;
            }
            return currentPopup;
          });
        }
      );

      setInProgressSubmittals((prev) => {
        const newMap = new Map(prev);
        newMap.set(submittalId, {
          eventSource,
          progressData: {
            submittalId,
            stepIndex: 0,
            stepName: '',
            stepDescription: '',
            status: 'IN_PROGRESS',
            progressPct: 0,
            steps: [],
          },
        });
        return newMap;
      });
    },
    [projectId, navigate]
  );

  // SEQ: 1.24 - Call loadProjectDetails()
  const loadProjectDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // SEQ: 1.28 - Call getProjectDetails(projectId)
      const result = await getProjectDetails(projectId);

      if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
        const data = result.data;

        setProject(data.project);
        setSpecificationDocuments(data.specificationDocuments);
        setSubmittals(data.submittals);
        setSpecificationDocumentsCount(data.specificationDocumentsCount);
        setSubmittalsCount(data.submittalsCount);

        // SEQ: 1.50 - Call subscribeToAllInProgressSubmittals()
        const inProgress = data.submittals.filter((s) => s.overallStatus === 'IN_PROGRESS');
        inProgress.forEach((submittal) => {
          handleSubscribeToProgress(submittal.submittalId);
        });
      } else if (result.statusCode === ServiceResultStatusENUM.UNAUTHORIZED) {
        setError('Unauthorized');
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      Logger.error('Unexpected error in loadProjectDetails', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, navigate, handleSubscribeToProgress]);

  // SEQ: 1.22 - useEffect with dependencies [projectId]
  useEffect(() => {
    loadProjectDetails();

    return () => {
      inProgressSubmittals.forEach(({ eventSource }) => {
        // SEQ: 12.5 - Call unsubscribeFromSubmittalProgress
        unsubscribeFromSubmittalProgress(eventSource);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // SEQ: 3.2 - Call handleTabChange(tab)
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Update URL hash to reflect active tab
    window.location.hash = tab;
  }, []);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'submittals' || hash === 'spec-manual') {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Set initial hash if not present
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = 'submittals';
    }
  }, []);

  useEffect(() => {
    if (!project || submittals.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('figmaModal') !== 'results') return;

    const requestedSubmittalId = params.get('figmaSubmittalId');
    const fallbackSubmittal = submittals.find((submittal) => submittal.overallStatus !== 'FAILED');
    const targetSubmittalId =
      requestedSubmittalId && submittals.some((submittal) => submittal.submittalId === requestedSubmittalId)
        ? requestedSubmittalId
        : fallbackSubmittal?.submittalId;

    if (targetSubmittalId) {
      setSelectedResultSubmittalId((current) => current ?? targetSubmittalId);
    }
  }, [project, submittals]);

  // SEQ: 4.2 - Call handleSpecDocumentClick(s3Url)
  const handleSpecDocumentClick = useCallback((s3Url: string, documentName?: string) => {
    setSelectedDocumentUrl(s3Url);
    setSelectedDocumentTitle(documentName ?? 'Specification Manual');
    setShowPDFViewer(true);
  }, []);

  const handleClosePDFViewer = useCallback(() => {
    setShowPDFViewer(false);
    setSelectedDocumentUrl(null);
    setSelectedDocumentTitle(null);
  }, []);

  // SEQ: 6.2 - Call handleNewSpecManual()
  const handleNewSpecManual = useCallback(() => {
    setIsNewSpecManualModalOpen(true);
  }, []);

  const handleCloseNewSpecManualModal = useCallback(() => {
    setIsNewSpecManualModalOpen(false);
  }, []);

  // SEQ: 6.3 - Call isNewSpecManualEnabled()
  const isNewSpecManualEnabled = useCallback(() => {
    return true;
  }, []);

  // SEQ: 7.2 - Call handleNewSubmittal()
  const handleNewSubmittal = useCallback(() => {
    setIsNewSubmittalModalOpen(true);
  }, []);

  const handleCloseNewSubmittalModal = useCallback(() => {
    setIsNewSubmittalModalOpen(false);
  }, []);

  const handleOpenResultModal = useCallback((submittalId: string) => {
    setSelectedResultSubmittalId(submittalId);
  }, []);

  const handleCloseResultModal = useCallback(() => {
    setSelectedResultSubmittalId(null);
  }, []);

  // SEQ: 8.2 / 9.2 - Call handleSubmittalClick(submittal)
  const handleSubmittalClick = useCallback(
    (submittal: SubmittalBO) => {
      if (submittal.overallStatus === 'IN_PROGRESS') {
        setShowProgressPopup(submittal.submittalId);
      } else if (submittal.overallStatus !== 'FAILED') {
        setSelectedResultSubmittalId(submittal.submittalId);
      }
    },
    []
  );

  const handleCloseProgressPopup = useCallback(() => {
    setShowProgressPopup(null);
  }, []);

  const isSubmittalDisabled = useCallback((status: string) => {
    return status === 'FAILED';
  }, []);

  const handleRequestDeleteSubmittal = useCallback((submittalId: string) => {
    setPendingDeleteSubmittalId(submittalId);
  }, []);

  const handleRequestDeleteSpecDocument = useCallback((documentId: string) => {
    setPendingDeleteSpecDocumentId(documentId);
  }, []);

  const handleCancelDeleteSubmittal = useCallback(() => {
    setPendingDeleteSubmittalId(null);
  }, []);

  const handleCancelDeleteSpecDocument = useCallback(() => {
    setPendingDeleteSpecDocumentId(null);
  }, []);

  const handleDeleteSubmittal = useCallback(
    async (submittalId: string) => {
      try {
        setIsDeletingSubmittalId(submittalId);
        setError(null);

        const result = await deleteSubmittal(submittalId);

        if (result.statusCode === ServiceResultStatusENUM.SUCCESS) {
          if (showProgressPopup === submittalId) {
            setShowProgressPopup(null);
          }
          if (selectedResultSubmittalId === submittalId) {
            setSelectedResultSubmittalId(null);
          }
          setPendingDeleteSubmittalId(null);
          await loadProjectDetails();
        } else {
          setError(result.message);
        }
      } catch (error) {
        Logger.error('Unexpected error in handleDeleteSubmittal', {
          submittalId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        setError('Failed to delete submittal');
      } finally {
        setIsDeletingSubmittalId(null);
      }
    },
    [loadProjectDetails, selectedResultSubmittalId, showProgressPopup]
  );

  const handleDeleteSpecDocument = useCallback(
    async (documentId: string) => {
      try {
        setIsDeletingSpecDocumentId(documentId);
        setError(null);

        const result = await deleteSpecificationManual(documentId);

        if (result.statusCode === ServiceResultStatusENUM.SUCCESS) {
          if (selectedDocumentUrl) {
            setShowPDFViewer(false);
            setSelectedDocumentUrl(null);
            setSelectedDocumentTitle(null);
          }
          setPendingDeleteSpecDocumentId(null);
          await loadProjectDetails();
        } else {
          setError(result.message);
        }
      } catch (error) {
        Logger.error('Unexpected error in handleDeleteSpecDocument', {
          documentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        setError('Failed to delete specification manual');
      } finally {
        setIsDeletingSpecDocumentId(null);
      }
    },
    [loadProjectDetails, selectedDocumentUrl]
  );

  const navigateBack = useCallback(() => {
    navigate('/projects');
  }, [navigate]);

  return {
    project,
    specificationDocuments,
    submittals,
    specificationDocumentsCount,
    submittalsCount,
    isLoading,
    error,
    isDeletingSubmittalId,
    activeTab,
    selectedDocumentUrl,
    selectedDocumentTitle,
    showPDFViewer,
    showProgressPopup,
    isNewSpecManualModalOpen,
    isNewSubmittalModalOpen,
    selectedResultSubmittalId,
    pendingDeleteSpecDocumentId,
    isDeletingSpecDocumentId,
    pendingDeleteSubmittalId,
    inProgressSubmittals,
    handleTabChange,
    handleSpecDocumentClick,
    handleClosePDFViewer,
    handleCloseProgressPopup,
    handleCloseNewSpecManualModal,
    handleCloseNewSubmittalModal,
    handleOpenResultModal,
    handleCloseResultModal,
    handleNewSpecManual,
    isNewSpecManualEnabled,
    handleNewSubmittal,
    handleSubmittalClick,
    handleRequestDeleteSubmittal,
    handleRequestDeleteSpecDocument,
    handleCancelDeleteSubmittal,
    handleCancelDeleteSpecDocument,
    handleDeleteSubmittal,
    handleDeleteSpecDocument,
    isSubmittalDisabled,
    navigateBack,
    refreshProjectDetails: loadProjectDetails,
  };
}

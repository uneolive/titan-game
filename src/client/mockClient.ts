import type { AxiosResponse } from 'axios';
import type { SubmittalProgressBO } from '@/types/bos/progressLoader/SubmittalProgressBO.ts';
import type { SubmittalCompleteBO } from '@/types/bos/progressLoader/SubmittalCompleteBO.ts';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestBody = object | FormData | null;

type SpecSectionRecord = {
  number: string;
  title: string;
  divisionNumber: 15 | 16;
  divisionName: 'Mechanical' | 'Electrical';
};

type SpecificationDocumentRecord = {
  documentId: string;
  documentName: string;
  documentTag: string;
  s3Url: string;
  date: string;
};

const DEFAULT_SPEC_PDF_URL = '/mock-specification-manual.pdf';
const AIR_TERMINAL_SPEC_PDF_URL =
  'https://www.lawa.org/sites/lawa/files/documents/23_36_00_Air%20Terminal%20Units%20%20Apr%202015.pdf';
const AUTOMATIC_TRANSFER_SWITCH_SPEC_PDF_URL =
  'https://www.cfpua.org/DocumentCenter/View/11891/26-36-23-AutomaticTransfer-Switches';
const FIRE_ALARM_SPEC_PDF_URL =
  'https://www.butlertech.org/wp-content/uploads/2024/01/28-31-00-FIRE-DETECTION-AND-ALARM.pdf';
const JOINT_SEALANT_SPEC_PDF_URL =
  'https://www.dow.com/documents/63/63-6205-01-architectural-specifications-section-07-92-00.pdf?iframe=true';
const CURTAIN_WALL_SPEC_PDF_URL =
  'https://www.kawneer.com/kawneer_files/products/1844%20-%20PG%20123%20Framing/Specifications/SPCD160EN_PG%20123%26reg%3B%20Framing%20-%20English/SPCD160EN.pdf';
const DOWNTOWN_SPEC_PDF_URL = AIR_TERMINAL_SPEC_PDF_URL;
const HARBOR_SPEC_PDF_URL = CURTAIN_WALL_SPEC_PDF_URL;
const MECHANICAL_SPEC_PDF_URL = AIR_TERMINAL_SPEC_PDF_URL;
const ELECTRICAL_SPEC_PDF_URL = '/pdf/division-16-electrical-spec.pdf';
const FIRE_SUBMITTAL_PDF_URL = '/pdf/fire-protection-submittal.pdf';
const MECHANICAL_SUBMITTAL_PDF_URL = '/pdf/mechanical-submittal.pdf';
const ELECTRICAL_SUBMITTAL_PDF_URL = '/pdf/electrical-submittal.pdf';
const ARCHITECTURAL_SUBMITTAL_PDF_URL = '/pdf/architectural-submittal.pdf';
const MOCK_PDF_URL = DEFAULT_SPEC_PDF_URL;
const NOW = '2026-04-01T12:00:00.000Z';

type ProjectRecord = {
  projectId: string;
  projectName: string;
  projectType: string;
  isDivisionBased: boolean;
  divisions: Array<{
    divisionNumber: string;
    divisionName: string;
    documents: Array<{
      documentId: string;
      documentName: string;
      documentTag: string;
    }>;
  }>;
  specificationDocuments: SpecificationDocumentRecord[];
  submittals: Array<{
    submittalId: string;
    submittalTitle: string;
    specSection: string;
    overallStatus: string;
    progressPct: number;
    date: string;
  }>;
};

type SubmittalResultRecord = {
  submittalTitle: string;
  specSection: string;
  overallStatus: string;
  complianceSummary: string;
  compliantCount: number;
  noncompliantCount: number;
  recommendation: string;
  findings: Array<{
    specRequirement: string;
    referenceValue: string;
    submittalValue: string;
    status: string;
    confidenceScore: number;
    reviewNotes: string;
    specReference: {
      s3Url: string;
    };
    submittalReference: {
      s3Url: string;
    };
  }>;
};

type BackgroundJob = {
  projectId: string;
  submittalId: string;
  finalResult: SubmittalResultRecord;
  steps: Array<{
    stepIndex: number;
    stepName: string;
    stepDescription: string;
    status: string;
    progressPct: number;
  }>;
  status: 'pending' | 'complete';
  timerId: ReturnType<typeof setTimeout> | null;
};

const projects = new Map<string, ProjectRecord>([
  [
    '101',
    {
      projectId: '101',
      projectName: 'Downtown Office Tower',
      projectType: 'Construction',
      isDivisionBased: false,
      divisions: [],
      specificationDocuments: [
        {
          documentId: 'doc-101-complete',
          documentName: 'Downtown Office Tower Full Specification Manual.pdf',
          documentTag: 'completemanual',
          s3Url: DEFAULT_SPEC_PDF_URL,
          date: '2026-03-21T15:30:00.000Z',
        },
      ],
      submittals: [
        {
          submittalId: 'sub-101-1',
          submittalTitle: 'Fire Alarm Control Panel',
          specSection: '28 31 00',
          overallStatus: 'COMPLIANT',
          progressPct: 100,
          date: '2026-03-24T09:00:00.000Z',
        },
        {
          submittalId: 'sub-101-2',
          submittalTitle: 'Variable Air Volume Boxes',
          specSection: '23 36 00',
          overallStatus: 'NON_COMPLIANT',
          progressPct: 100,
          date: '2026-03-25T10:15:00.000Z',
        },
      ],
    },
  ],
  [
    '102',
    {
      projectId: '102',
      projectName: 'Riverside Medical Center',
      projectType: 'Engineering',
      isDivisionBased: true,
      divisions: [
        {
          divisionNumber: '15',
          divisionName: 'Mechanical',
          documents: [
            {
              documentId: 'doc-102-15',
              documentName: 'Division 15 Mechanical.pdf',
              documentTag: 'division15',
            },
          ],
        },
        {
          divisionNumber: '16',
          divisionName: 'Electrical',
          documents: [
            {
              documentId: 'doc-102-16',
              documentName: 'Division 16 Electrical.pdf',
              documentTag: 'division16',
            },
          ],
        },
      ],
      specificationDocuments: [
        {
          documentId: 'doc-102-15',
          documentName: 'Division 15 Mechanical.pdf',
          documentTag: 'division15',
          s3Url: DEFAULT_SPEC_PDF_URL,
          date: '2026-03-18T14:45:00.000Z',
        },
        {
          documentId: 'doc-102-16',
          documentName: 'Division 16 Electrical.pdf',
          documentTag: 'division16',
          s3Url: DEFAULT_SPEC_PDF_URL,
          date: '2026-03-19T11:20:00.000Z',
        },
      ],
      submittals: [
        {
          submittalId: 'sub-102-1',
          submittalTitle: 'Generator Transfer Switch',
          specSection: '26 36 23',
          overallStatus: 'PARTIALLY_COMPLIANT',
          progressPct: 100,
          date: '2026-03-26T13:30:00.000Z',
        },
      ],
    },
  ],
  [
    '103',
    {
      projectId: '103',
      projectName: 'Harbor Point Residences',
      projectType: 'Architecture',
      isDivisionBased: false,
      divisions: [],
      specificationDocuments: [
        {
          documentId: 'doc-103-complete',
          documentName: 'Harbor Point Residences Full Specification Manual.pdf',
          documentTag: 'completemanual',
          s3Url: DEFAULT_SPEC_PDF_URL,
          date: '2026-03-15T08:10:00.000Z',
        },
      ],
      submittals: [
        {
          submittalId: 'sub-103-1',
          submittalTitle: 'Aluminum Window System',
          specSection: '08 44 13',
          overallStatus: 'COMPLIANT',
          progressPct: 100,
          date: '2026-03-27T14:05:00.000Z',
        },
        {
          submittalId: 'sub-103-2',
          submittalTitle: 'Acoustic Sealants',
          specSection: '07 92 00',
          overallStatus: 'PARTIALLY_COMPLIANT',
          progressPct: 100,
          date: '2026-03-28T10:40:00.000Z',
        },
      ],
    },
  ],
  [
    '104',
    {
      projectId: '104',
      projectName: 'North Valley Data Center',
      projectType: 'Construction',
      isDivisionBased: true,
      divisions: [
        {
          divisionNumber: '15',
          divisionName: 'Mechanical',
          documents: [
            {
              documentId: 'doc-104-15',
              documentName: 'Division 15 Mechanical.pdf',
              documentTag: 'division15',
            },
          ],
        },
        {
          divisionNumber: '16',
          divisionName: 'Electrical',
          documents: [
            {
              documentId: 'doc-104-16',
              documentName: 'Division 16 Electrical.pdf',
              documentTag: 'division16',
            },
          ],
        },
      ],
      specificationDocuments: [
        {
          documentId: 'doc-104-15',
          documentName: 'Division 15 Mechanical.pdf',
          documentTag: 'division15',
          s3Url: DEFAULT_SPEC_PDF_URL,
          date: '2026-03-22T09:30:00.000Z',
        },
        {
          documentId: 'doc-104-16',
          documentName: 'Division 16 Electrical.pdf',
          documentTag: 'division16',
          s3Url: DEFAULT_SPEC_PDF_URL,
          date: '2026-03-22T09:35:00.000Z',
        },
      ],
      submittals: [
        {
          submittalId: 'sub-104-1',
          submittalTitle: 'CRAC Unit Schedule',
          specSection: '23 81 00',
          overallStatus: 'COMPLIANT',
          progressPct: 100,
          date: '2026-03-29T11:20:00.000Z',
        },
        {
          submittalId: 'sub-104-2',
          submittalTitle: 'Busway Distribution System',
          specSection: '26 29 13',
          overallStatus: 'NON_COMPLIANT',
          progressPct: 100,
          date: '2026-03-30T16:45:00.000Z',
        },
        {
          submittalId: 'sub-104-3',
          submittalTitle: 'Fire Suppression Detection Panel',
          specSection: '28 31 00',
          overallStatus: 'COMPLIANT',
          progressPct: 100,
          date: '2026-03-31T08:55:00.000Z',
        },
      ],
    },
  ],
]);

const submittalResults = new Map<string, SubmittalResultRecord>([
  [
    'sub-101-1',
    {
      submittalTitle: 'Fire Alarm Control Panel',
      specSection: '28 31 00',
      overallStatus: 'COMPLIANT',
      complianceSummary:
        'The submitted fire alarm control panel package aligns with the core specification requirements for listing, voltage, and accessories.',
      compliantCount: 3,
      noncompliantCount: 0,
      recommendation: 'Approved as submitted.',
      findings: [
        {
          specRequirement: 'UL Listing',
          referenceValue: 'UL 864 listed control panel required.',
          submittalValue: 'Manufacturer cut sheet confirms UL 864 listing.',
          status: 'COMPLIANT',
          confidenceScore: 0.96,
          reviewNotes: 'Documentation clearly references the required listing.',
          specReference: { s3Url: DEFAULT_SPEC_PDF_URL },
          submittalReference: { s3Url: DEFAULT_SPEC_PDF_URL },
        },
        {
          specRequirement: 'Operating Voltage',
          referenceValue: '120 VAC primary power.',
          submittalValue: '120 VAC primary with integral charger.',
          status: 'COMPLIANT',
          confidenceScore: 0.93,
          reviewNotes: 'Voltage requirement is satisfied.',
          specReference: { s3Url: DEFAULT_SPEC_PDF_URL },
          submittalReference: { s3Url: DEFAULT_SPEC_PDF_URL },
        },
        {
          specRequirement: 'Battery Backup',
          referenceValue: '24-hour standby plus 5-minute alarm.',
          submittalValue: 'Battery calculations exceed standby duration.',
          status: 'COMPLIANT',
          confidenceScore: 0.91,
          reviewNotes: 'Battery sizing appears adequate.',
          specReference: { s3Url: DEFAULT_SPEC_PDF_URL },
          submittalReference: { s3Url: DEFAULT_SPEC_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-101-2',
    {
      submittalTitle: 'Variable Air Volume Boxes',
      specSection: '23 36 00',
      overallStatus: 'NON_COMPLIANT',
      complianceSummary:
        'The package meets airflow control intent, but it does not provide the specified insulation thickness or documented leakage performance.',
      compliantCount: 1,
      noncompliantCount: 2,
      recommendation: 'Revise and resubmit with compliant insulation and leakage data.',
      findings: [
        {
          specRequirement: 'Casing Leakage',
          referenceValue: 'Maximum 2 percent leakage at 6 in. w.g.',
          submittalValue: 'No leakage class submitted.',
          status: 'NON_COMPLIANT',
          confidenceScore: 0.88,
          reviewNotes: 'Required test data is missing.',
          specReference: { s3Url: DEFAULT_SPEC_PDF_URL },
          submittalReference: { s3Url: DEFAULT_SPEC_PDF_URL },
        },
        {
          specRequirement: 'Insulation Thickness',
          referenceValue: '1-inch dual-density insulation required.',
          submittalValue: '0.5-inch fiberglass insulation provided.',
          status: 'NON_COMPLIANT',
          confidenceScore: 0.95,
          reviewNotes: 'Provided insulation thickness is below spec.',
          specReference: { s3Url: DEFAULT_SPEC_PDF_URL },
          submittalReference: { s3Url: DEFAULT_SPEC_PDF_URL },
        },
        {
          specRequirement: 'Controls Interface',
          referenceValue: 'BACnet compatible actuator package.',
          submittalValue: 'BACnet MS/TP actuator listed.',
          status: 'COMPLIANT',
          confidenceScore: 0.9,
          reviewNotes: 'Controls interface meets the specified standard.',
          specReference: { s3Url: DEFAULT_SPEC_PDF_URL },
          submittalReference: { s3Url: DEFAULT_SPEC_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-102-1',
    {
      submittalTitle: 'Generator Transfer Switch',
      specSection: '26 36 23',
      overallStatus: 'PARTIALLY_COMPLIANT',
      complianceSummary:
        'The transfer switch submittal generally aligns with the specification, but the short-circuit withstand rating needs clarification.',
      compliantCount: 2,
      noncompliantCount: 1,
      recommendation: 'Clarify withstand rating and provide updated manufacturer data.',
      findings: [
        {
          specRequirement: 'Bypass Isolation',
          referenceValue: 'Bypass-isolation transfer switch required.',
          submittalValue: 'Submitted switch includes bypass isolation enclosure.',
          status: 'COMPLIANT',
          confidenceScore: 0.94,
          reviewNotes: 'Requirement is satisfied.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Short-Circuit Rating',
          referenceValue: '65 kA withstand and closing rating minimum.',
          submittalValue: '42 kA listed on current schedule.',
          status: 'NON_COMPLIANT',
          confidenceScore: 0.9,
          reviewNotes: 'Current rating appears below the required threshold.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Controller Display',
          referenceValue: 'Digital controller with event history.',
          submittalValue: 'Digital display and event log included.',
          status: 'COMPLIANT',
          confidenceScore: 0.92,
          reviewNotes: 'Feature is clearly shown in the literature.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-103-1',
    {
      submittalTitle: 'Aluminum Window System',
      specSection: '08 44 13',
      overallStatus: 'COMPLIANT',
      complianceSummary:
        'The window system submittal aligns with the specified performance requirements for thermal break construction, air infiltration, and finish.',
      compliantCount: 3,
      noncompliantCount: 0,
      recommendation: 'Approved as submitted.',
      findings: [
        {
          specRequirement: 'Thermal Break',
          referenceValue: 'Provide thermally broken aluminum framing.',
          submittalValue: 'Submitted framing system includes thermal strut separation.',
          status: 'COMPLIANT',
          confidenceScore: 0.95,
          reviewNotes: 'Thermal break construction is clearly documented.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Air Infiltration',
          referenceValue: 'Maximum air infiltration of 0.06 cfm/sf.',
          submittalValue: 'Test data indicates 0.04 cfm/sf.',
          status: 'COMPLIANT',
          confidenceScore: 0.93,
          reviewNotes: 'Reported performance exceeds the requirement.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Finish',
          referenceValue: 'Factory-applied fluoropolymer finish.',
          submittalValue: 'Manufacturer finish specified as 70% PVDF coating.',
          status: 'COMPLIANT',
          confidenceScore: 0.91,
          reviewNotes: 'Finish requirement is satisfied.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-103-2',
    {
      submittalTitle: 'Acoustic Sealants',
      specSection: '07 92 00',
      overallStatus: 'PARTIALLY_COMPLIANT',
      complianceSummary:
        'The submitted sealant meets the acoustic rating target, but the VOC documentation is incomplete for the specified low-emitting material requirement.',
      compliantCount: 2,
      noncompliantCount: 1,
      recommendation: 'Provide VOC compliance documentation and resubmit.',
      findings: [
        {
          specRequirement: 'Acoustic Performance',
          referenceValue: 'Sealant to maintain STC-rated partition performance.',
          submittalValue: 'Acoustical sealant listed for rated wall assemblies.',
          status: 'COMPLIANT',
          confidenceScore: 0.92,
          reviewNotes: 'Product literature supports acoustic use.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Low VOC',
          referenceValue: 'Provide low-emitting product documentation.',
          submittalValue: 'VOC documentation not included in package.',
          status: 'NON_COMPLIANT',
          confidenceScore: 0.89,
          reviewNotes: 'Required emissions documentation is missing.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Joint Movement',
          referenceValue: 'Minimum plus/minus 25 percent movement capability.',
          submittalValue: 'Product data indicates plus/minus 35 percent movement.',
          status: 'COMPLIANT',
          confidenceScore: 0.94,
          reviewNotes: 'Movement capability exceeds the specified minimum.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-104-1',
    {
      submittalTitle: 'CRAC Unit Schedule',
      specSection: '23 81 00',
      overallStatus: 'COMPLIANT',
      complianceSummary:
        'The CRAC unit submission meets cooling capacity, redundancy, and controls integration requirements for the data hall environment.',
      compliantCount: 3,
      noncompliantCount: 0,
      recommendation: 'Approved as submitted.',
      findings: [
        {
          specRequirement: 'Cooling Capacity',
          referenceValue: 'Minimum sensible capacity of 120 kW.',
          submittalValue: 'Submitted unit schedule lists 128 kW sensible capacity.',
          status: 'COMPLIANT',
          confidenceScore: 0.95,
          reviewNotes: 'Capacity meets the design requirement.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Redundancy',
          referenceValue: 'N+1 redundancy configuration required.',
          submittalValue: 'Schedule indicates N+1 arrangement across the room.',
          status: 'COMPLIANT',
          confidenceScore: 0.9,
          reviewNotes: 'Redundancy strategy is identified in the schedule.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'BMS Integration',
          referenceValue: 'Unit controls shall support BACnet/IP integration.',
          submittalValue: 'BACnet/IP gateway included as standard accessory.',
          status: 'COMPLIANT',
          confidenceScore: 0.91,
          reviewNotes: 'Controls integration requirement is addressed.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-104-2',
    {
      submittalTitle: 'Busway Distribution System',
      specSection: '26 29 13',
      overallStatus: 'NON_COMPLIANT',
      complianceSummary:
        'The busway package does not yet satisfy the specified short-circuit rating or feeder tap spacing requirements.',
      compliantCount: 1,
      noncompliantCount: 2,
      recommendation: 'Revise the busway selection and provide updated layout and rating data.',
      findings: [
        {
          specRequirement: 'Short-Circuit Rating',
          referenceValue: 'Minimum 65 kA short-circuit rating.',
          submittalValue: 'Current product literature lists 42 kA rating.',
          status: 'NON_COMPLIANT',
          confidenceScore: 0.96,
          reviewNotes: 'Available fault rating is below the specified minimum.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Tap Box Spacing',
          referenceValue: 'Provide plug-in units at 10 ft intervals maximum.',
          submittalValue: 'Tap-off spacing indicated at 20 ft intervals.',
          status: 'NON_COMPLIANT',
          confidenceScore: 0.87,
          reviewNotes: 'Tap spacing exceeds the specified maximum.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Copper Bus',
          referenceValue: 'Copper bus bars required.',
          submittalValue: 'Submitted system includes copper conductors.',
          status: 'COMPLIANT',
          confidenceScore: 0.93,
          reviewNotes: 'Conductor material matches the requirement.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
      ],
    },
  ],
  [
    'sub-104-3',
    {
      submittalTitle: 'Fire Suppression Detection Panel',
      specSection: '28 31 00',
      overallStatus: 'COMPLIANT',
      complianceSummary:
        'The fire suppression detection panel complies with monitoring, annunciation, and listed accessory requirements for the protected zones.',
      compliantCount: 3,
      noncompliantCount: 0,
      recommendation: 'Approved as submitted.',
      findings: [
        {
          specRequirement: 'System Monitoring',
          referenceValue: 'Panel shall monitor releasing circuits and supervisory devices.',
          submittalValue: 'Panel supports releasing, supervisory, and trouble monitoring.',
          status: 'COMPLIANT',
          confidenceScore: 0.94,
          reviewNotes: 'Monitoring scope is documented.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'Remote Annunciation',
          referenceValue: 'Provide remote annunciator at room entry.',
          submittalValue: 'Remote annunciator included as listed accessory.',
          status: 'COMPLIANT',
          confidenceScore: 0.92,
          reviewNotes: 'Annunciator is shown in the accessory schedule.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
        {
          specRequirement: 'UL Listing',
          referenceValue: 'Control equipment shall be UL listed.',
          submittalValue: 'Submitted panel is UL listed for releasing service.',
          status: 'COMPLIANT',
          confidenceScore: 0.95,
          reviewNotes: 'Listing is explicitly identified.',
          specReference: { s3Url: MOCK_PDF_URL },
          submittalReference: { s3Url: MOCK_PDF_URL },
        },
      ],
    },
  ],
]);

const projectSpecDocumentUrls: Record<string, Record<string, string>> = {
  '101': { completemanual: DOWNTOWN_SPEC_PDF_URL },
  '102': {
    division15: MECHANICAL_SPEC_PDF_URL,
    division16: ELECTRICAL_SPEC_PDF_URL,
  },
  '103': { completemanual: HARBOR_SPEC_PDF_URL },
  '104': {
    division15: MECHANICAL_SPEC_PDF_URL,
    division16: ELECTRICAL_SPEC_PDF_URL,
  },
};

const submittalDocumentContext: Record<string, { specUrl: string; submittalUrl: string }> = {
  'sub-101-1': { specUrl: FIRE_ALARM_SPEC_PDF_URL, submittalUrl: FIRE_SUBMITTAL_PDF_URL },
  'sub-101-2': { specUrl: AIR_TERMINAL_SPEC_PDF_URL, submittalUrl: MECHANICAL_SUBMITTAL_PDF_URL },
  'sub-102-1': {
    specUrl: AUTOMATIC_TRANSFER_SWITCH_SPEC_PDF_URL,
    submittalUrl: ELECTRICAL_SUBMITTAL_PDF_URL,
  },
  'sub-103-1': { specUrl: CURTAIN_WALL_SPEC_PDF_URL, submittalUrl: ARCHITECTURAL_SUBMITTAL_PDF_URL },
  'sub-103-2': { specUrl: JOINT_SEALANT_SPEC_PDF_URL, submittalUrl: ARCHITECTURAL_SUBMITTAL_PDF_URL },
  'sub-104-1': { specUrl: AIR_TERMINAL_SPEC_PDF_URL, submittalUrl: MECHANICAL_SUBMITTAL_PDF_URL },
  'sub-104-2': {
    specUrl: AUTOMATIC_TRANSFER_SWITCH_SPEC_PDF_URL,
    submittalUrl: ELECTRICAL_SUBMITTAL_PDF_URL,
  },
  'sub-104-3': { specUrl: FIRE_ALARM_SPEC_PDF_URL, submittalUrl: FIRE_SUBMITTAL_PDF_URL },
};

projects.forEach((project) => {
  const documentUrls = projectSpecDocumentUrls[project.projectId];
  project.specificationDocuments = project.specificationDocuments.map((document) => ({
    ...document,
    s3Url: documentUrls?.[document.documentTag] ?? document.s3Url,
  }));
});

submittalResults.forEach((result, submittalId) => {
  const context = submittalDocumentContext[submittalId];
  if (!context) return;

  result.findings = result.findings.map((finding) => ({
    ...finding,
    specReference: { s3Url: context.specUrl },
    submittalReference: { s3Url: context.submittalUrl },
  }));
});

const backgroundJobs = new Map<string, BackgroundJob>();
let nextProjectId = 105;
let nextSubmittalId = 200;

export const isMockApiEnabled = import.meta.env.DEV;

const sectionCatalog = {
  mechanical: [
    {
      number: '23 05 00',
      title: 'Common Work Results for HVAC',
      divisionNumber: 15,
      divisionName: 'Mechanical',
    },
    {
      number: '23 31 00',
      title: 'HVAC Ducts and Casings',
      divisionNumber: 15,
      divisionName: 'Mechanical',
    },
    {
      number: '23 36 00',
      title: 'Air Terminal Units',
      divisionNumber: 15,
      divisionName: 'Mechanical',
    },
    {
      number: '23 81 00',
      title: 'Decentralized Unitary HVAC Equipment',
      divisionNumber: 15,
      divisionName: 'Mechanical',
    },
  ] satisfies SpecSectionRecord[],
  electrical: [
    {
      number: '26 05 19',
      title: 'Low-Voltage Electrical Power Conductors and Cables',
      divisionNumber: 16,
      divisionName: 'Electrical',
    },
    {
      number: '26 28 16',
      title: 'Enclosed Switches and Circuit Breakers',
      divisionNumber: 16,
      divisionName: 'Electrical',
    },
    {
      number: '26 36 23',
      title: 'Automatic Transfer Switches',
      divisionNumber: 16,
      divisionName: 'Electrical',
    },
    {
      number: '28 31 00',
      title: 'Fire Detection and Alarm',
      divisionNumber: 16,
      divisionName: 'Electrical',
    },
  ] satisfies SpecSectionRecord[],
};

function buildDivisionSectionPayload(sections: SpecSectionRecord[]) {
  const grouped = sections.reduce<{
    mechanical: SpecSectionRecord[];
    electrical: SpecSectionRecord[];
  }>(
    (acc, section) => {
      if (section.divisionNumber === 15) {
        acc.mechanical.push(section);
      } else if (section.divisionNumber === 16) {
        acc.electrical.push(section);
      }

      return acc;
    },
    { mechanical: [], electrical: [] }
  );

  const uniqueByNumber = (items: SpecSectionRecord[]) =>
    items.filter(
      (item, index, array) => array.findIndex((candidate) => candidate.number === item.number) === index
    );

  const mechanicalSections = uniqueByNumber(grouped.mechanical);
  const electricalSections = uniqueByNumber(grouped.electrical);

  return {
    divisions: {
      mechanical:
        mechanicalSections.length > 0
          ? {
              division_number: 15,
              division_name: 'Mechanical',
              sections: mechanicalSections.map(({ number, title }) => ({ number, title })),
            }
          : null,
      electrical:
        electricalSections.length > 0
          ? {
              division_number: 16,
              division_name: 'Electrical',
              sections: electricalSections.map(({ number, title }) => ({ number, title })),
            }
          : null,
    },
  };
}

function makeAxiosResponse(data: unknown, status = 200): AxiosResponse<any> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function makeEnvelope(data: unknown, message = 'Success', code = 200) {
  return {
    status: 'success',
    code,
    message,
    data,
    request_id: 'mock-request-id',
    timestamp: NOW,
  };
}

function toSnakeProject(project: ProjectRecord) {
  return {
    project_id: project.projectId,
    project_name: project.projectName,
    project_type: project.projectType,
    submittals_count: project.submittals.length,
  };
}

function getProject(projectId: string): ProjectRecord {
  const project = projects.get(projectId);
  if (!project) {
    throw new Error(`Mock project ${projectId} not found`);
  }
  return project;
}

function sortProjects(items: ProjectRecord[], sortBy: string, sortOrder: string) {
  const direction = sortOrder === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    let left: string | number = a.projectName;
    let right: string | number = b.projectName;

    if (sortBy === 'project_type') {
      left = a.projectType;
      right = b.projectType;
    } else if (sortBy === 'submittals_count') {
      left = a.submittals.length;
      right = b.submittals.length;
    }

    if (left < right) return -1 * direction;
    if (left > right) return 1 * direction;
    return 0;
  });
}

function buildProjectDetails(projectId: string) {
  const project = getProject(projectId);

  return {
    project: {
      project_id: project.projectId,
      project_name: project.projectName,
      project_type: project.projectType,
    },
    specification_documents_count: project.specificationDocuments.length,
    submittals_count: project.submittals.length,
    specification_documents: project.specificationDocuments.map((document) => ({
      document_id: document.documentId,
      document_name: document.documentName,
      document_tag: document.documentTag,
      s3_url: document.s3Url,
      date: document.date,
    })),
    submittals: project.submittals.map((submittal) => ({
      submittal_id: submittal.submittalId,
      submittal_title: submittal.submittalTitle,
      spec_section: submittal.specSection,
      overall_status: submittal.overallStatus,
      progress_pct: submittal.progressPct,
      date: submittal.date,
    })),
  };
}

function buildProjectSetup(projectId: string) {
  const project = getProject(projectId);

  return makeEnvelope({
    project_name: project.projectName,
    project_type: project.projectType,
    is_division_based: project.isDivisionBased,
    divisions: project.divisions.map((division) => ({
      division_number: division.divisionNumber,
      division_name: division.divisionName,
      documents: division.documents.map((document) => ({
        document_id: document.documentId,
        document_name: document.documentName,
        document_tag: document.documentTag,
      })),
    })),
  });
}

function buildSpecSections(_projectId: string) {
  return makeEnvelope(
    buildDivisionSectionPayload([...sectionCatalog.mechanical, ...sectionCatalog.electrical])
  );
}

function createResultForSubmittal(title: string, specSection: string): SubmittalResultRecord {
  const compliant = specSection.startsWith('28') || specSection.startsWith('26');
  const overallStatus = compliant ? 'COMPLIANT' : 'PARTIALLY_COMPLIANT';

  return {
    submittalTitle: title,
    specSection,
    overallStatus,
    complianceSummary: compliant
      ? 'The submitted package aligns well with the selected specification section and includes the expected core product data.'
      : 'The submitted package generally aligns with the selected specification section, but one or more details still require clarification or revision.',
    compliantCount: compliant ? 2 : 1,
    noncompliantCount: compliant ? 0 : 1,
    recommendation: compliant
      ? 'Approved as submitted.'
      : 'Revise the noted item and resubmit for final review.',
    findings: [
      {
        specRequirement: 'Primary Product Requirement',
        referenceValue: `Section ${specSection} requires product data matching the scheduled item.`,
        submittalValue: `${title} literature was included in the uploaded package.`,
        status: 'COMPLIANT',
        confidenceScore: 0.92,
        reviewNotes: 'Base product data is present and appears aligned to the section.',
        specReference: { s3Url: MOCK_PDF_URL },
        submittalReference: { s3Url: MOCK_PDF_URL },
      },
      {
        specRequirement: 'Supporting Documentation',
        referenceValue: 'Provide all supporting certifications and performance notes.',
        submittalValue: compliant
          ? 'Supporting documentation appears complete.'
          : 'One supporting performance detail is still unclear in the package.',
        status: compliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        confidenceScore: compliant ? 0.9 : 0.84,
        reviewNotes: compliant
          ? 'No obvious gaps were found in the supporting documentation.'
          : 'Clarifying documentation would help resolve the remaining review item.',
        specReference: { s3Url: MOCK_PDF_URL },
        submittalReference: { s3Url: MOCK_PDF_URL },
      },
    ],
  };
}

function makeProgressSteps(submittalId: string) {
  return [
    {
      stepIndex: 1,
      stepName: 'Upload Received',
      stepDescription: 'The files were uploaded and queued for analysis.',
      status: 'COMPLETED',
      progressPct: 20,
    },
    {
      stepIndex: 2,
      stepName: 'Spec Matched',
      stepDescription: 'Relevant specification language was matched to the submittal.',
      status: 'COMPLETED',
      progressPct: 55,
    },
    {
      stepIndex: 3,
      stepName: 'AI Review',
      stepDescription: 'The comparison engine generated compliance findings.',
      status: 'COMPLETED',
      progressPct: 100,
    },
  ].map((step) => ({ ...step, submittalId }));
}

function completeBackgroundJob(submittalId: string) {
  const job = backgroundJobs.get(submittalId);
  if (!job || job.status === 'complete') return;

  const project = getProject(job.projectId);
  const target = project.submittals.find((item) => item.submittalId === submittalId);
  if (target) {
    target.overallStatus = job.finalResult.overallStatus;
    target.progressPct = 100;
  }

  submittalResults.set(submittalId, job.finalResult);
  job.status = 'complete';

  if (job.timerId) {
    clearTimeout(job.timerId);
    job.timerId = null;
  }
}

function scheduleBackgroundCompletion(submittalId: string) {
  const job = backgroundJobs.get(submittalId);
  if (!job || job.timerId) return;

  job.timerId = setTimeout(() => {
    completeBackgroundJob(submittalId);
  }, 4500);
}

function buildSubmittalUploadResponse(formData: FormData): Response {
  const projectId = String(formData.get('project_id') || '');
  const title = String(formData.get('title') || 'Untitled Submittal');
  const specSection = String(formData.get('spec_section') || '00 00 00');
  const submittalId = `sub-${nextSubmittalId++}`;
  const project = getProject(projectId);
  const finalResult = createResultForSubmittal(title, specSection);
  const steps = makeProgressSteps(submittalId);

  project.submittals.unshift({
    submittalId,
    submittalTitle: title,
    specSection,
    overallStatus: 'IN_PROGRESS',
    progressPct: 0,
    date: new Date().toISOString(),
  });

  backgroundJobs.set(submittalId, {
    projectId,
    submittalId,
    finalResult,
    steps,
    status: 'pending',
    timerId: null,
  });

  scheduleBackgroundCompletion(submittalId);

  let closed = false;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, payload: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
      };

      const run = async () => {
        send('created', { submittal_id: submittalId });

        for (const step of steps) {
          if (closed) return;
          await new Promise((resolve) => setTimeout(resolve, 700));
          send('progress', {
            submittal_id: submittalId,
            step_index: step.stepIndex,
            step_name: step.stepName,
            step_description: step.stepDescription,
            status: 'IN_PROGRESS',
            progress_pct: step.progressPct,
            steps: steps
              .filter((item) => item.stepIndex <= step.stepIndex)
              .map(({ submittalId: _ignored, ...item }) => item),
          });
        }

        if (closed) return;
        completeBackgroundJob(submittalId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        send('complete', {
          submittal_id: submittalId,
          status: 'COMPLETED',
          overall_status: finalResult.overallStatus,
          progress_pct: 100,
          message: 'Mock analysis complete',
          steps: steps.map(({ submittalId: _ignored, ...item }) => item),
        });
        controller.close();
      };

      void run();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

function handleSpecUpload(formData: FormData) {
  const existingProjectId = formData.get('project_id');
  const uploadMode = String(formData.get('upload_mode') || 'complete');
  const projectId = existingProjectId ? String(existingProjectId) : String(nextProjectId++);
  const isNewProject = !existingProjectId;
  const projectName = isNewProject
    ? String(formData.get('project_name') || `New Mock Project ${projectId}`)
    : getProject(projectId).projectName;
  const projectType = isNewProject
    ? String(formData.get('project_type') || 'Construction')
    : getProject(projectId).projectType;

  const project: ProjectRecord = isNewProject
    ? {
        projectId,
        projectName,
        projectType,
        isDivisionBased: uploadMode === 'division',
        divisions: [],
        specificationDocuments: [],
        submittals: [],
      }
    : getProject(projectId);

  if (uploadMode === 'complete') {
    project.isDivisionBased = false;
    project.divisions = [];
    project.specificationDocuments = [
      {
        documentId: `doc-${projectId}-complete`,
        documentName: 'Complete Specification Manual.pdf',
        documentTag: 'completemanual',
        s3Url: MOCK_PDF_URL,
        date: new Date().toISOString(),
      },
    ];
  } else {
    project.isDivisionBased = true;
    const divisions = [];
    const specDocs = [];

    if (formData.get('mechanical_division_file')) {
      divisions.push({
        divisionNumber: '15',
        divisionName: 'Mechanical',
        documents: [
          {
            documentId: `doc-${projectId}-15`,
            documentName: 'Division 15 Mechanical.pdf',
            documentTag: 'division15',
          },
        ],
      });
      specDocs.push({
        documentId: `doc-${projectId}-15`,
        documentName: 'Division 15 Mechanical.pdf',
        documentTag: 'division15',
        s3Url: MOCK_PDF_URL,
        date: new Date().toISOString(),
      });
    }

    if (formData.get('electrical_division_file')) {
      divisions.push({
        divisionNumber: '16',
        divisionName: 'Electrical',
        documents: [
          {
            documentId: `doc-${projectId}-16`,
            documentName: 'Division 16 Electrical.pdf',
            documentTag: 'division16',
          },
        ],
      });
      specDocs.push({
        documentId: `doc-${projectId}-16`,
        documentName: 'Division 16 Electrical.pdf',
        documentTag: 'division16',
        s3Url: MOCK_PDF_URL,
        date: new Date().toISOString(),
      });
    }

    project.divisions = divisions;
    project.specificationDocuments = specDocs;
  }

  projects.set(projectId, project);

  return makeAxiosResponse(makeEnvelope({ project_id: projectId }, 'Specification manual uploaded'));
}

export async function client(
  endpoint: string,
  body: RequestBody = null,
  method: HttpMethod = 'GET'
): Promise<AxiosResponse<any>> {
  const url = new URL(endpoint, 'http://localhost');
  const path = url.pathname;

  if (method === 'POST' && path === '/api/auth/login') {
    const email =
      body instanceof FormData
        ? String(body.get('email') || '')
        : String(((body as { email?: string } | null)?.email as string) || '');
    const [firstName = 'Demo', lastName = 'User'] = email
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

    return makeAxiosResponse(
      makeEnvelope({
        user: {
          user_id: 'mock-user-1',
          email,
          first_name: firstName,
          last_name: lastName || 'User',
        },
      }, 'Mock login successful')
    );
  }

  if (method === 'GET' && path === '/api/projects') {
    const sortBy = url.searchParams.get('sort_by') || 'project_name';
    const sortOrder = url.searchParams.get('sort_order') || 'asc';
    const sorted = sortProjects([...projects.values()], sortBy, sortOrder);

    return makeAxiosResponse(
      makeEnvelope({
        projects: sorted.map(toSnakeProject),
      })
    );
  }

  const projectDetailsMatch = path.match(/^\/api\/projects\/([^/]+)\/details$/);
  if (method === 'GET' && projectDetailsMatch) {
    return makeAxiosResponse(makeEnvelope(buildProjectDetails(projectDetailsMatch[1])));
  }

  const projectSetupMatch = path.match(/^\/api\/projects\/([^/]+)\/setup$/);
  if (method === 'GET' && projectSetupMatch) {
    return makeAxiosResponse(buildProjectSetup(projectSetupMatch[1]));
  }

  const projectSectionsMatch = path.match(/^\/api\/projects\/([^/]+)\/sections$/);
  if (method === 'GET' && projectSectionsMatch) {
    return makeAxiosResponse(buildSpecSections(projectSectionsMatch[1]));
  }

  if (method === 'POST' && path === '/api/spec-upload' && body instanceof FormData) {
    return handleSpecUpload(body);
  }

  const submittalResultMatch = path.match(/^\/api\/submittals\/([^/]+)\/result$/);
  if (method === 'GET' && submittalResultMatch) {
    const result = submittalResults.get(submittalResultMatch[1]);
    if (!result) {
      return makeAxiosResponse(makeEnvelope(null, 'Submittal result not found', 404), 404);
    }
    return makeAxiosResponse(makeEnvelope(result));
  }

  const submittalMatch = path.match(/^\/api\/submittals\/([^/]+)$/);
  if (method === 'DELETE' && submittalMatch) {
    const submittalId = submittalMatch[1];
    let removed = false;

    projects.forEach((project) => {
      const nextSubmittals = project.submittals.filter((submittal) => submittal.submittalId !== submittalId);
      if (nextSubmittals.length !== project.submittals.length) {
        project.submittals = nextSubmittals;
        removed = true;
      }
    });

    submittalResults.delete(submittalId);
    const job = backgroundJobs.get(submittalId);
    if (job?.timerId) {
      clearTimeout(job.timerId);
    }
    backgroundJobs.delete(submittalId);

    if (!removed) {
      return makeAxiosResponse(makeEnvelope(null, 'Submittal not found', 404), 404);
    }

    return makeAxiosResponse(makeEnvelope(null, 'Submittal deleted'));
  }

  const specificationDocumentMatch = path.match(/^\/api\/specification-documents\/([^/]+)$/);
  if (method === 'DELETE' && specificationDocumentMatch) {
    const documentId = specificationDocumentMatch[1];
    let removed = false;

    projects.forEach((project) => {
      const nextDocuments = project.specificationDocuments.filter(
        (document) => document.documentId !== documentId
      );

      if (nextDocuments.length !== project.specificationDocuments.length) {
        project.specificationDocuments = nextDocuments;
        project.divisions = project.divisions
          .map((division) => ({
            ...division,
            documents: division.documents.filter((document) => document.documentId !== documentId),
          }))
          .filter((division) => division.documents.length > 0);
        project.isDivisionBased =
          project.specificationDocuments.length > 0 &&
          project.specificationDocuments.every((document) => document.documentTag !== 'completemanual');
        removed = true;
      }
    });

    if (!removed) {
      return makeAxiosResponse(makeEnvelope(null, 'Specification manual not found', 404), 404);
    }

    return makeAxiosResponse(makeEnvelope(null, 'Specification manual deleted'));
  }

  const projectMatch = path.match(/^\/api\/projects\/([^/]+)$/);
  if (method === 'DELETE' && projectMatch) {
    const projectId = projectMatch[1];
    const project = projects.get(projectId);

    if (!project) {
      return makeAxiosResponse(makeEnvelope(null, 'Project not found', 404), 404);
    }

    project.submittals.forEach((submittal) => {
      submittalResults.delete(submittal.submittalId);
      const job = backgroundJobs.get(submittal.submittalId);
      if (job?.timerId) {
        clearTimeout(job.timerId);
      }
      backgroundJobs.delete(submittal.submittalId);
    });

    projects.delete(projectId);
    return makeAxiosResponse(makeEnvelope(null, 'Project deleted'));
  }

  throw new Error(`Unhandled mock endpoint: ${method} ${path}`);
}

export async function fetchSSE(
  endpoint: string,
  body: FormData,
  _signal?: AbortSignal
): Promise<Response> {
  const url = new URL(endpoint, 'http://localhost');

  if (url.pathname === '/api/submittal-assistant') {
    return buildSubmittalUploadResponse(body);
  }

  throw new Error(`Unhandled mock SSE endpoint: ${url.pathname}`);
}

export function subscribeToMockSubmittalProgress(
  submittalId: string,
  onProgress: (data: SubmittalProgressBO) => void,
  onComplete: (data: SubmittalCompleteBO) => void,
  onError: (error: string) => void
): EventSource {
  const job = backgroundJobs.get(submittalId);

  if (!job) {
    queueMicrotask(() => onError('Mock submittal progress not found'));
    return { close() {} } as EventSource;
  }

  if (job.status === 'complete') {
    queueMicrotask(() =>
      onComplete({
        submittalId,
        status: 'COMPLETED',
        overallStatus: job.finalResult.overallStatus,
        progressPct: 100,
        message: 'Mock analysis complete',
        steps: job.steps.map((step) => ({
          stepIndex: step.stepIndex,
          stepName: step.stepName,
          stepDescription: step.stepDescription,
          status: step.status,
          progressPct: step.progressPct,
        })),
      })
    );
    return { close() {} } as EventSource;
  }

  let closed = false;
  let stepIndex = 0;
  const intervalId = setInterval(() => {
    if (closed) return;

    stepIndex += 1;
    const currentSteps = job.steps.slice(0, stepIndex).map((step) => ({
      stepIndex: step.stepIndex,
      stepName: step.stepName,
      stepDescription: step.stepDescription,
      status: step.status,
      progressPct: step.progressPct,
    }));
    const currentStep = job.steps[Math.min(stepIndex - 1, job.steps.length - 1)];

    onProgress({
      submittalId,
      stepIndex: currentStep.stepIndex,
      stepName: currentStep.stepName,
      stepDescription: currentStep.stepDescription,
      status: 'IN_PROGRESS',
      progressPct: currentStep.progressPct,
      steps: currentSteps,
    });

    if (stepIndex >= job.steps.length) {
      clearInterval(intervalId);
      completeBackgroundJob(submittalId);
      onComplete({
        submittalId,
        status: 'COMPLETED',
        overallStatus: job.finalResult.overallStatus,
        progressPct: 100,
        message: 'Mock analysis complete',
        steps: currentSteps.map((step) => ({ ...step })),
      });
    }
  }, 900);

  return {
    close() {
      closed = true;
      clearInterval(intervalId);
    },
  } as EventSource;
}

import { AxiosResponse } from 'axios';
import Logger from '@/helpers/utilities/Logger.ts';

/**
 * Mock EventSource for testing SSE without backend
 * Simulates real-time progress updates for submittal analysis
 */
export class MockEventSource {
  private listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();
  private url: string;
  public readyState: number = 0; // 0 = CONNECTING, 1 = OPEN, 2 = CLOSED

  constructor(url: string) {
    this.url = url;
    Logger.info('Mock EventSource created', { url });

    // Simulate connection opening
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.simulateProgressEvents();
    }, 100);
  }

  addEventListener(event: string, callback: (event: MessageEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  close() {
    this.readyState = 2; // CLOSED
    Logger.info('Mock EventSource closed', { url: this.url });
  }

  private emit(eventType: string, data: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const event = new MessageEvent(eventType, {
        data: JSON.stringify(data),
      });
      listeners.forEach((callback) => callback(event));
    }
  }

  private simulateProgressEvents() {
    const steps = [
      {
        step_index: 0,
        step_name: 'Document Parsing',
        step_description: 'Parsing uploaded documents',
        status: 'COMPLETED',
        progress_pct: 25,
      },
      {
        step_index: 1,
        step_name: 'Section Identification',
        step_description: 'Identifying specification sections',
        status: 'COMPLETED',
        progress_pct: 50,
      },
      {
        step_index: 2,
        step_name: 'Requirements Comparison',
        step_description: 'Comparing against requirements',
        status: 'COMPLETED',
        progress_pct: 75,
      },
      {
        step_index: 3,
        step_name: 'Compliance Scoring',
        step_description: 'Calculating compliance scores',
        status: 'COMPLETED',
        progress_pct: 100,
      },
    ];

    // Extract submittalId from URL
    const submittalId = this.url.split('/submittals/')[1]?.split('/')[0] || 'mock-submittal-123';

    // Send progress events
    steps.forEach((step, index) => {
      setTimeout(
        () => {
          if (this.readyState === 2) return; // Don't send if closed

          this.emit('progress', {
            submittal_id: submittalId,
            ...step,
            steps: steps.slice(0, index + 1),
          });
        },
        1000 + index * 1500 // 1s, 2.5s, 4s, 5.5s
      );
    });

    // Send complete event
    setTimeout(() => {
      if (this.readyState === 2) return; // Don't send if closed

      this.emit('complete', {
        submittal_id: submittalId,
        status: 'COMPLETED',
        overall_status: 'COMPLIANT',
        progress_pct: 100,
        message: 'Analysis completed successfully',
        steps: steps,
      });

      this.close();
    }, 7000);
  }
}

/**
 * Mock HTTP client for testing without backend
 * Returns mock data based on endpoint patterns
 *
 * TEST CREDENTIALS (required for login):
 * Email: test@newforma.com
 * Password: password123
 *
 * Any other credentials will return 401 Unauthorized
 */
export async function mockClient(
  endpoint: string,
  body: any = null,
  method: string = 'GET'
): Promise<AxiosResponse> {
  // Simulate network delay (3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  Logger.info('Mock API call', { endpoint, method, body });

  // Mock responses based on endpoint
  if (endpoint.includes('/api/auth/login')) {
    return mockLoginResponse(body);
  } else if (endpoint.includes('/api/projects') && !endpoint.includes('/api/projects/')) {
    return mockProjectsListResponse();
  } else if (endpoint.includes('/api/projects/') && endpoint.includes('/details')) {
    return mockProjectDetailsResponse();
  } else if (endpoint.includes('/api/projects/') && endpoint.includes('/setup')) {
    return mockProjectSetupResponse();
  } else if (endpoint.includes('/api/projects/') && endpoint.includes('/sections')) {
    return mockSpecSectionsResponse();
  } else if (endpoint.includes('/api/spec-upload')) {
    return mockSpecUploadResponse();
  } else if (endpoint.includes('/api/submittals/') && endpoint.includes('/result')) {
    return mockSubmittalResultResponse();
  }

  // Default response
  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Mock response',
      data: {},
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

/**
 * Mock SSE client for testing submittal upload
 */
export async function mockFetchSSE(endpoint: string, _body: FormData): Promise<Response> {
  Logger.info('Mock SSE call', { endpoint });

  // Create a mock ReadableStream that simulates SSE events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send created event
      setTimeout(() => {
        const createdEvent = `event: created\ndata: ${JSON.stringify({
          submittal_id: 'mock-submittal-123',
          status: 'IN_PROGRESS',
          message: 'Submittal uploaded successfully. Starting analysis...',
        })}\n\n`;
        controller.enqueue(encoder.encode(createdEvent));
      }, 500);

      // Send progress events
      const steps = [
        {
          step_index: 0,
          step_name: 'Document Parsing',
          step_description: 'Parsing uploaded documents',
          status: 'COMPLETED',
          progress_pct: 25,
        },
        {
          step_index: 1,
          step_name: 'Section Identification',
          step_description: 'Identifying specification sections',
          status: 'COMPLETED',
          progress_pct: 50,
        },
        {
          step_index: 2,
          step_name: 'Requirements Comparison',
          step_description: 'Comparing against requirements',
          status: 'COMPLETED',
          progress_pct: 75,
        },
        {
          step_index: 3,
          step_name: 'Compliance Scoring',
          step_description: 'Calculating compliance scores',
          status: 'COMPLETED',
          progress_pct: 100,
        },
      ];

      steps.forEach((step, index) => {
        setTimeout(
          () => {
            const progressEvent = `event: progress\ndata: ${JSON.stringify({
              submittal_id: 'mock-submittal-123',
              ...step,
              steps: steps.slice(0, index + 1),
            })}\n\n`;
            controller.enqueue(encoder.encode(progressEvent));
          },
          1500 + index * 1000
        );
      });

      // Send complete event
      setTimeout(() => {
        const completeEvent = `event: complete\ndata: ${JSON.stringify({
          submittal_id: 'mock-submittal-123',
          status: 'COMPLETED',
          overall_status: 'NON_COMPLIANT',
          progress_pct: 100,
          message: 'Analysis completed successfully',
          steps: steps,
        })}\n\n`;
        controller.enqueue(encoder.encode(completeEvent));
        controller.close();
      }, 6000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  });
}

// Mock response functions
function mockLoginResponse(body: any): AxiosResponse {
  // MOCK: Validate credentials
  // Valid test credentials:
  // Email: test@newforma.com
  // Password: password123

  const validEmail = 'test@newforma.com';
  const validPassword = '123456';

  // Check if credentials match
  if (body.email !== validEmail || body.password !== validPassword) {
    return {
      data: {
        status: 'error',
        code: 401,
        message: 'Invalid email or password',
        data: null,
        request_id: 'mock-request-123',
        timestamp: new Date().toISOString(),
      },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as any,
    };
  }

  // Success response
  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Login successful',
      data: {
        user: {
          user_id: 'mock-user-123',
          email: body.email,
          first_name: 'John',
          last_name: 'Anderson',
        },
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function mockProjectsListResponse(): AxiosResponse {
  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Projects retrieved successfully',
      data: {
        projects: [
          {
            project_id: 'proj-001',
            project_name: 'Downtown Office Complex',
            project_type: 'Architecture',
            submittals_count: 10,
          },
          {
            project_id: 'proj-002',
            project_name: 'Hospital Expansion Project',
            project_type: 'Construction',
            submittals_count: 8,
          },
          {
            project_id: 'proj-003',
            project_name: 'University Library Building',
            project_type: 'Engineering',
            submittals_count: 5,
          },
        ],
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function mockProjectDetailsResponse(): AxiosResponse {
  // Using Mozilla's PDF.js sample - allows iframe embedding
  const samplePdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Project details retrieved successfully',
      data: {
        project: {
          project_id: 'proj-001',
          project_name: 'Downtown Office Complex',
          project_type: 'Architecture',
        },
        specification_documents_count: 2,
        submittals_count: 4,
        specification_documents: [
          {
            document_id: 'doc-001',
            document_name: 'Complete_Specification_Manual.pdf',
            document_tag: 'completemanual',
            s3_url: samplePdfUrl,
            date: new Date().toISOString(),
          },
          {
            document_id: 'doc-002',
            document_name: 'Mechanical_Division_Specs.pdf',
            document_tag: '15-Mechanical',
            s3_url: samplePdfUrl,
            date: new Date().toISOString(),
          },
        ],
        submittals: [
          {
            submittal_id: 'sub-001',
            submittal_title: 'HVAC Equipment Submittal',
            spec_section: '15 50 00',
            overall_status: 'COMPLIANT',
            progress_pct: 100,
            date: new Date().toISOString(),
          },
          {
            submittal_id: 'sub-002',
            submittal_title: 'Electrical Panel Submittal',
            spec_section: '16 40 00',
            overall_status: 'IN_PROGRESS',
            progress_pct: 45,
            date: new Date().toISOString(),
          },
          {
            submittal_id: 'sub-003',
            submittal_title: 'Lighting Fixture Submittal',
            spec_section: '16 50 00',
            overall_status: 'IN_PROGRESS',
            progress_pct: 65,
            date: new Date().toISOString(),
          },
          {
            submittal_id: 'sub-004',
            submittal_title: 'Fire Alarm System Submittal',
            spec_section: '16 70 00',
            overall_status: 'NON_COMPLIANT',
            progress_pct: 100,
            date: new Date().toISOString(),
          },
        ],
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function mockProjectSetupResponse(): AxiosResponse {
  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Project setup data retrieved successfully',
      data: {
        project_name: 'Downtown Office Complex',
        project_type: 'Architecture',
        is_division_based: true,
        divisions: [
          {
            division_number: '15',
            division_name: 'Mechanical',
            documents: [
              {
                document_id: 'doc-mech-001',
                document_name: 'Mechanical Specs.pdf',
                document_tag: '15-Mechanical',
              },
            ],
          },
          {
            division_number: '16',
            division_name: 'Electrical',
            documents: [],
          },
        ],
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function mockSpecSectionsResponse(): AxiosResponse {
  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Sections retrieved successfully',
      data: {
        divisions: {
          mechanical: {
            division_number: 15,
            division_name: 'Mechanical',
            sections: [
              { number: '15 05 00', title: 'Common Work Results for Mechanical' },
              { number: '15 50 00', title: 'HVAC Equipment' },
              { number: '15 70 00', title: 'Plumbing Systems' },
            ],
          },
          electrical: {
            division_number: 16,
            division_name: 'Electrical',
            sections: [
              { number: '16 05 00', title: 'Common Work Results for Electrical' },
              { number: '16 40 00', title: 'Electrical Panels' },
              { number: '16 50 00', title: 'Lighting Fixtures' },
            ],
          },
        },
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function mockSpecUploadResponse(): AxiosResponse {
  return {
    data: {
      status: 'success',
      code: 200,
      message: 'The specifications document has been uploaded successfully',
      data: {
        project_id: 'proj-new-001',
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

function mockSubmittalResultResponse(): AxiosResponse {
  // Using Mozilla's PDF.js sample - allows iframe embedding
  const samplePdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  return {
    data: {
      status: 'success',
      code: 200,
      message: 'Compliance results retrieved successfully',
      data: {
        submittal_title: 'HVAC Equipment Submittal',
        spec_section: '15 50 00',
        overall_status: 'NON_COMPLIANT',
        compliance_summary:
          'The submittal has been reviewed against the specification requirements. Some non-compliances were identified that require attention.',
        compliant_count: 5,
        noncompliant_count: 2,
        recommendation: 'Revise and resubmit with corrections to non-compliant items.',
        findings: [
          {
            spec_requirement: 'Equipment efficiency rating',
            reference_value: 'Minimum 95% AFUE',
            submittal_value: '92% AFUE',
            status: 'NON_COMPLIANT',
            confidence_score: 0.95,
            review_notes: 'Submitted equipment does not meet minimum efficiency requirement',
            spec_reference: { s3_url: samplePdfUrl },
            submittal_reference: { s3_url: samplePdfUrl },
          },
          {
            spec_requirement: 'Manufacturer certification',
            reference_value: 'ISO 9001 certified',
            submittal_value: 'ISO 9001 certified',
            status: 'COMPLIANT',
            confidence_score: 0.98,
            review_notes: 'Manufacturer certification meets requirements',
            spec_reference: { s3_url: samplePdfUrl },
            submittal_reference: { s3_url: samplePdfUrl },
          },
          {
            spec_requirement: 'Warranty period',
            reference_value: '5 years minimum',
            submittal_value: '3 years standard',
            status: 'NON_COMPLIANT',
            confidence_score: 0.92,
            review_notes: 'Warranty period is less than specified minimum',
            spec_reference: { s3_url: samplePdfUrl },
            submittal_reference: { s3_url: samplePdfUrl },
          },
        ],
      },
      request_id: 'mock-request-123',
      timestamp: new Date().toISOString(),
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

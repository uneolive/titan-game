# NewForma Submittal Assistant

AI-Powered Construction Information Management Application

## � Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Completed Features](#completed-features)
- [Key Implementation Notes](#key-implementation-notes)
- [Development Guidelines](#development-guidelines)
- [Sequence Mapping](#sequence-mapping)
- [API Integration](#api-integration)

---

## 🚀 Quick Start

### Running the Application

1. **Navigate to the project directory:**

```bash
cd Development/Newforma
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser:**

```
http://localhost:5173
```

That's it! The app will run with mock data (no backend required for development).

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## Project Structure

```
src/
├── client/              # API client (axios + SSE)
├── constants/           # API endpoints, HTTP methods
├── helpers/
│   ├── utilities/       # Logger, CaseConverter, ServiceHelpers
│   └── validators/      # Email, Password, File validators
├── services/            # Service layer (function-based)
│   ├── authService/
│   └── projectService/
├── types/
│   ├── bos/            # Business Objects
│   ├── common/         # ServiceResult
│   └── enums/          # ServiceResultStatusENUM
├── ui/
│   ├── navigation/     # Router
│   ├── reusables/      # Header, PDFViewer, ProgressLoader
│   └── screens/        # Login, Projects, ProjectDetail, etc.
└── styles/             # Global CSS with Tailwind
```

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Icons** - Icons

## Architecture

- **MVVM Pattern**: ViewModels (custom hooks) + Views (components)
- **Function-Based**: No classes, all functions
- **No Redux**: Context API + useState for state management
- **Case Conversion**: snake_case (API) → camelCase (Frontend)

## Configuration

### Environment Variables

Create or update the `.env` file in the project root:

```bash
# API Base URL (optional - defaults to mock client)
VITE_API_BASE_URL=http://localhost:8000
```

### Switching Between Mock and Real API

By default, the app uses **mock data** (no backend required).

To connect to a real backend:

1. **Update service files** - Uncomment the real client import:

```typescript
// In each service file (e.g., AuthService.ts, ProjectService.ts)

// MOCK: Comment out this line
// import { mockClient as client } from '@/client/mockClient.ts';

// REAL: Uncomment this line
import { client } from '@/client/client.ts';
```

2. **Update `.env`** with your backend URL:

```bash
VITE_API_BASE_URL=http://your-backend-url:8000
```

3. **Restart the dev server:**

```bash
npm run dev
```

## Completed Features

✅ **Core Infrastructure**

- API client with SSE support
- Logger with external logger support
- Case converter (snake_case → camelCase)
- Service helpers (adaptApiResponse, serviceFailureResponse)
- Validators (email, password, file, submittal, project)
- Formatters (confidence score, status colors, status icons)

✅ **Reusable Components**

- Header (user info, logo)
- PDFViewer (modal with iframe)
- ProgressLoader (real-time progress with steps)
- AnalyzingSpecPopup (loading indicator)

✅ **Screens**

- Login (complete with validation)
- Projects (complete with sorting)
- ProjectDetail (tabs, SSE subscriptions, PDF viewer)
- SpecificationManual (new/edit mode, file upload, division-based)
- Submittal (SSE streaming, multi-file upload, real-time progress)
- AIResult (read-only display, formatters, PDF references)

## All Features Complete! 🎉

## Key Implementation Notes

- All services return `ServiceResult<T>`
- Services convert snake_case to camelCase
- No file size validation (only PDF type check)
- SSE steps array is incremental (not all steps at once)
- ProgressLoader has NO close button (X)
- Session storage for user data (no JWT tokens)

## Development Guidelines

See `.kiro/steering/` folder for:

- `react-development-guidelines.md` - MVVM architecture, naming conventions
- `newforma-additional-guidelines.md` - Function-based patterns, case conversion
- `api-specifications.md` - API endpoints and response formats
- `design-system.md` - Tailwind configuration, component patterns

## Sequence Mapping

The codebase includes **sequence mapping comments** that link code to PlantUML sequence diagrams in the `Designs/` folder.

### Format

```typescript
// SEQ: X.Y - Description
```

Where:

- `X` = Major section number from sequence diagram
- `Y` = Step number within that section

### Example

From `login_sequence.wsd`:

```typescript
// SEQ: 2.2 - Call handleEmailChange(value)
const handleEmailChange = useCallback((value: string) => {
  // SEQ: 2.3 - Call setEmail(value) and store in state variable email
  setEmail(value);
  // SEQ: 2.4 - Clear emailError: setEmailError(null)
  setEmailError(null);
}, []);
```

### Benefits

- **Traceability**: Easily trace code back to design diagrams
- **Debugging**: Identify which sequence step is failing
- **Onboarding**: New developers understand flow quickly
- **Maintenance**: Update code and diagrams together

See `SEQUENCE_MAPPING_GUIDE.md` for complete documentation.

## API Integration

Base URL: `http://localhost:8000`

Endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/projects` - List projects with sorting
- `GET /api/projects/:id/details` - Project details
- `POST /api/spec-upload` - Upload spec manual
- `POST /api/submittal-assistant` - Upload submittal (SSE)
- `GET /api/submittals/:id/progress` - SSE progress stream
- `GET /api/submittals/:id/result` - Analysis results

## License

Private - NewForma Construction Information Management

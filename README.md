# CukaiPro - LHDN-Ready Tax Platform

A modern, production-ready tax management platform for Malaysian businesses built with React, Vite, and Tailwind CSS.

## Features

✅ **Modern Architecture** - React 19, Vite 8, Tailwind CSS  
✅ **TypeScript Support** - Type-safe development with JSDoc  
✅ **Authentication System** - Context-based auth with protected routes  
✅ **State Management** - Context API for global state  
✅ **Form Validation** - React Hook Form with Zod schemas  
✅ **API Integration** - Axios with interceptors and error handling  
✅ **Error Boundaries** - Graceful error handling  
✅ **Code Splitting** - Lazy loading for optimal performance  
✅ **Testing Setup** - Vitest + React Testing Library  
✅ **Code Quality** - ESLint + Prettier  
✅ **Dark Mode** - Full dark mode support

## Project Structure

```
src/
├── components/
│   ├── Common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Loading.jsx
│   │   └── ErrorBoundary.jsx
│   └── Auth/            # Authentication components
│       ├── LoginForm.jsx
│       └── ProtectedRoute.jsx
├── pages/               # Page-level components
│   ├── HomePage.jsx
│   ├── DashboardPage.jsx
│   └── LoginPage.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   └── useApi.js
├── utils/               # Utility functions
│   ├── api.js          # Axios configuration
│   ├── logger.js       # Logging utility
│   └── validators.js   # Form validation schemas
├── context/             # Context providers
│   ├── AuthContext.jsx
│   └── AppContext.jsx
├── types/               # TypeScript definitions
└── tests/               # Test setup and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vvssubra/CukaiPro-Main.git
cd CukaiPro-Main
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Technology Stack

### Core
- **React 19** - UI library
- **Vite 8** - Build tool
- **React Router 7** - Routing

### Styling
- **Tailwind CSS 3** - Utility-first CSS
- **Material Icons** - Icon library

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### HTTP & API
- **Axios** - HTTP client

### Testing
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **jsdom** - DOM implementation

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.cukaipro.com/v1
VITE_API_TIMEOUT=30000
VITE_AUTH_STORAGE_KEY=cukaipro_auth_token
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_APP_ENV=development
```

## Authentication

The app includes a complete authentication system:

- **Login/Logout** - User authentication flow
- **Protected Routes** - Route guards for authenticated pages
- **Auth Context** - Global auth state management
- **Token Storage** - Secure token storage in localStorage
- **Auto Redirect** - Redirect to login on unauthorized access

### Login Credentials (Mock)

Use any email/password combination for testing.

## API Integration

The app uses a centralized API client with:

- **Interceptors** - Auto-add auth tokens
- **Error Handling** - Global error handling
- **Loading States** - Built-in loading state management
- **Retry Logic** - Automatic retry on failure

Example usage:

```javascript
import { useApi } from '@hooks/useApi';
import api from '@utils/api';

// Using the custom hook
const { data, loading, error, execute } = useApi(
  () => api.get('/taxes')
);

// Direct API call
const response = await api.post('/taxes', { amount: 1000 });
```

## Testing

Write tests using Vitest and React Testing Library:

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

Run tests:
```bash
npm run test
```

## Code Style

The project uses Prettier and ESLint for consistent code style:

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting errors
npm run lint:fix
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, email support@cukaipro.com or open an issue in the repository.

---

Built with ❤️ in Kuala Lumpur, Malaysia

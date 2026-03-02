# CukaiPro .cursorrules File - New Developer Guide

## ✅ Status: CONFIRMED - File Successfully Merged to Main Branch

**Merge Details:**
- **Commit:** f911f8e5960dd429356b609b1c2ec847dba22891
- **Date:** February 15, 2026 at 20:45:45 +0800
- **PR:** #1 - "Implement code quality improvements"
- **Status:** ✅ Successfully merged to main branch

---

## 📋 Plain-English Summary

The `.cursorrules` file is a **comprehensive coding standards guide** for the CukaiPro project. It serves as the "gold standard" for how code should be written, organized, and maintained in this Malaysian tax management platform.

Think of it as your **coding playbook** - whenever you're unsure about how to structure a component, name a file, or implement a feature, this file has the answer.

---

## 🎯 What is CukaiPro?

CukaiPro is a modern **tax management platform specifically designed for Malaysian businesses**. It's built using:
- **React** (for the user interface)
- **Vite** (for fast development and building)
- **Tailwind CSS** (for styling)

The platform helps businesses manage Malaysian tax requirements including SST, EA forms, and LHDN e-Invoice compliance.

---

## 🔑 Key Sections for New Developers

### 1. **React Component Standards** (Most Important!)

**What you need to know:**
- ✅ Always use **functional components** (not class components)
- ✅ Use **hooks** like `useState`, `useEffect`, `useContext`
- ✅ Use **named exports** for components
- ✅ Create **custom hooks** for reusable logic

**Component Structure Template:**
```jsx
// 1. Imports first
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Component function
function ComponentName({ prop1, prop2 }) {
  // 3. Hooks (useState, useEffect, etc.)
  const [state, setState] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    // Your logic here
  }, []);
  
  // 5. Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // 6. Return JSX
  return <div>{/* Your UI */}</div>;
}

// 7. PropTypes for type checking
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

// 8. Export
export default ComponentName;
```

### 2. **File Organization & Naming** (Critical for Navigation!)

**Directory Structure:**
```
src/
├── components/
│   ├── Common/       ← Reusable UI components (buttons, cards, etc.)
│   └── Auth/         ← Login, registration, authentication
├── pages/            ← Full page components (Dashboard, Reports, etc.)
├── hooks/            ← Custom React hooks (useAuth, useTax, etc.)
├── utils/            ← Helper functions (formatCurrency, etc.)
├── context/          ← Global state providers (AuthContext, ThemeContext)
├── types/            ← TypeScript type definitions
└── styles/           ← Global CSS styles
```

**Naming Rules:**
- **Components**: `PascalCase` → `LoginForm.jsx`, `TaxCalculator.jsx`
- **Hooks**: `camelCase` with "use" prefix → `useAuth.js`, `useTaxData.js`
- **Utilities**: `camelCase` → `formatCurrency.js`, `validateSST.js`
- **Constants**: `UPPER_SNAKE_CASE` → `API_BASE_URL`, `MAX_RETRY_COUNT`

### 3. **State Management** (How to Handle Data)

**Three-Tier Approach:**
1. **Global State** (for app-wide data) → Use Context API
   - Examples: user authentication, theme settings
   
2. **Local State** (for component-specific data) → Use `useState`
   - Examples: form inputs, toggle states, loading indicators
   
3. **Complex State** (for multi-step logic) → Use `useReducer`
   - Examples: multi-step forms, shopping cart logic

### 4. **Styling with Tailwind CSS**

**Key Principles:**
- ✅ Use Tailwind utility classes directly in JSX
- ✅ Follow **mobile-first** approach (design for phones first, then larger screens)
- ✅ Support **dark mode** using `dark:` prefix (e.g., `dark:bg-gray-800`)
- ✅ Use theme colors consistently (don't use random hex codes)

**Example:**
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500">
  Submit Tax Form
</button>
```

### 5. **API Integration** (Connecting to Backend)

**Standard Pattern:**
- ✅ Use **axios** for HTTP requests
- ✅ Create **service files** to centralize API calls
- ✅ Use **custom hooks** for data fetching
- ✅ Always show **loading states** and handle **errors**

**Example:**
```jsx
const useTaxData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchTaxData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  return { data, loading, error };
};
```

### 6. **Form Handling**

**Required Tools:**
- ✅ **react-hook-form** for form management
- ✅ **Zod** for validation schemas
- ✅ Show clear error messages
- ✅ Use **debouncing** for API calls (wait before sending request)

### 7. **Malaysian Tax Context** (Business Domain!)

**Important Requirements:**
- ✅ Support **SST** (Sales and Service Tax)
- ✅ Support **EA forms** (employee tax forms)
- ✅ LHDN requirements (Malaysian Inland Revenue Board)
- ✅ Use **RM currency format** (Malaysian Ringgit)
- ✅ Malaysian date formats
- ✅ LHDN e-Invoice compatibility
- ✅ Fiscal year: **January to December**

### 8. **Security Best Practices** (Non-Negotiable!)

- ❌ **NEVER** commit API keys, passwords, or secrets to git
- ✅ Always **sanitize user inputs** (prevent injection attacks)
- ✅ Use **HTTPS** for all API calls
- ✅ Implement proper **authentication**
- ✅ Store sensitive data securely (never in localStorage)

### 9. **Performance Optimization**

**Key Techniques:**
- ✅ Use `React.memo()` for expensive components that re-render often
- ✅ Use `useMemo` and `useCallback` to avoid unnecessary recalculations
- ✅ Use `React.lazy()` and `Suspense` for **code splitting** (load pages on demand)
- ✅ Optimize images and assets

### 10. **Testing Standards**

**What to Test:**
- ✅ Critical user interactions (login, form submissions, calculations)
- ✅ Test **user behavior**, not implementation details
- ✅ Mock external dependencies (APIs, databases)

**Tools:**
- **Vitest** (test runner)
- **React Testing Library** (testing React components)

### 11. **Error Handling**

**Best Practices:**
- ✅ Use **ErrorBoundary** components to catch React errors
- ✅ Log errors in development (to console)
- ✅ Show **user-friendly error messages** (not technical jargon)
- ✅ Provide **recovery actions** ("Try again" button)

### 12. **Code Quality Checklist** (Before Every Commit!)

- ✅ Run **prettier** to format code
- ✅ Fix all **ESLint warnings**
- ✅ Write **descriptive commit messages**
- ✅ Document complex logic with comments
- ✅ Keep functions **small and focused** (one purpose per function)

---

## 💡 Quick Start Checklist for New Developers

1. **Read the `.cursorrules` file** (located in project root)
2. **Study the file structure** (`src/` directory)
3. **Look at existing components** for patterns
4. **Follow the component template** when creating new components
5. **Use Tailwind CSS** utility classes for styling
6. **Test your changes** before committing
7. **Run prettier and ESLint** before pushing code
8. **Understand Malaysian tax context** (SST, EA forms, LHDN)

---

## 🎓 Learning Resources

**To Master This Codebase, Learn:**
1. **React Hooks** (useState, useEffect, useContext, custom hooks)
2. **Tailwind CSS** (utility-first CSS framework)
3. **react-hook-form** (form management)
4. **Zod** (validation schemas)
5. **Vitest & React Testing Library** (testing)
6. **Malaysian tax concepts** (SST, LHDN, e-Invoice)

---

## 📌 Key Reminders

🎯 **Always follow existing patterns** in the codebase  
🎯 **Mobile-first design** approach  
🎯 **Security is critical** - never commit secrets  
🎯 **User experience matters** - show loading states and friendly errors  
🎯 **Performance counts** - lazy load and optimize  
🎯 **Accessibility** - add ARIA attributes and keyboard navigation  
🎯 **Malaysian context** - understand the business domain  

---

## ✅ Verification & Next Steps

**Current Status:** ✅ **CONFIRMED**

The `.cursorrules` file has been successfully:
- ✅ Created and documented
- ✅ Merged to the main branch (commit f911f8e)
- ✅ Available for all developers to use

**No action required** - the gold-standard file is in place and ready to guide development!

---

## 📞 Questions?

If you're unsure about any standard or pattern:
1. First, check the `.cursorrules` file
2. Look at existing code for examples
3. Ask your team lead or senior developers
4. When in doubt, follow the existing patterns in the codebase

**Remember:** These rules exist to maintain consistency and quality. Following them makes code review faster and helps the whole team work together more effectively!

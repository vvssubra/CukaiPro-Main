# CukaiPro .cursorrules Walkthrough for Beginners

This document provides a beginner-friendly explanation of the rules defined in the `.cursorrules` file for the CukaiPro project. Think of these rules as a guidebook that helps you write code that fits well with the rest of the project.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Code Style & Patterns](#code-style--patterns)
3. [Key Do's and Don'ts](#key-dos-and-donts)

---

## Project Overview

**What is CukaiPro?**
CukaiPro is a tax management platform specifically designed for Malaysian businesses. It's built using modern web technologies:
- **React**: A JavaScript library for building user interfaces
- **Vite**: A fast build tool that makes development smoother
- **Tailwind CSS**: A utility-first CSS framework for styling

---

## Code Style & Patterns

### 1. React Best Practices

**What this means:**
These are recommended ways to write React code that make your application more maintainable and efficient.

#### ✅ DO:
- **Use functional components with hooks**: Write components as functions (not classes). Hooks like `useState` and `useEffect` let you add functionality to these functions.
  ```jsx
  // ✅ Good - Functional component
  function MyComponent() {
    const [count, setCount] = useState(0);
    return <div>{count}</div>;
  }
  ```

- **Prefer named exports**: Export components with their name visible, which helps with debugging and refactoring.
  ```jsx
  // ✅ Good - Named export
  export function LoginForm() { ... }
  
  // ❌ Avoid - Default export (though sometimes necessary)
  export default LoginForm;
  ```

- **Use custom hooks for reusable logic**: If you use the same logic in multiple places, create a custom hook (a function starting with "use").
  ```jsx
  // ✅ Good - Custom hook
  function useAuth() {
    const [user, setUser] = useState(null);
    // Authentication logic here
    return { user, setUser };
  }
  ```

- **Implement proper error boundaries**: These catch errors in your components and prevent the entire app from crashing.

- **Use React.lazy() and Suspense for code splitting**: Load parts of your app only when needed, making the initial load faster.

---

### 2. State Management

**What this means:**
"State" is data that changes over time in your application. Different types of data need different management approaches.

#### ✅ DO:
- **Use Context API for global state**: For data needed across many components (like user login status or theme), use Context API.
  - Examples: authentication status, theme (light/dark mode)

- **Use local state (useState) for component-specific state**: For data only one component needs, use `useState`.
  - Examples: form input values, toggle states for a specific button

- **Use useReducer for complex state logic**: When state updates depend on multiple actions or previous states, `useReducer` makes it clearer.
  ```jsx
  // ✅ Good - useReducer for complex state
  const [state, dispatch] = useReducer(reducer, initialState);
  dispatch({ type: 'INCREMENT' });
  ```

#### 🔴 DON'T:
- Don't use Context API for everything - it can make your app slower
- Don't use local state for data needed by many components

---

### 3. File Structure

**What this means:**
The project has a specific organization. Put files in the right folders so everyone can find them easily.

```
src/
├── components/
│   ├── Common/       # Buttons, inputs, cards that can be used anywhere
│   └── Auth/         # Login forms, signup forms, password reset
├── pages/            # Full pages like Dashboard, Settings, Profile
├── hooks/            # Custom hooks like useAuth, useForm
├── utils/            # Helper functions like formatDate, calculateTax
├── context/          # Global state providers like AuthContext, ThemeContext
├── types/            # TypeScript type definitions
└── styles/           # CSS files that apply to the whole app
```

#### ✅ DO:
- Put reusable UI components (buttons, cards) in `components/Common/`
- Put page-level components (full pages) in `pages/`
- Put custom hooks in `hooks/`
- Put helper functions in `utils/`

#### 🔴 DON'T:
- Don't put page components in the `components/` folder
- Don't create your own folder structure - follow the existing one

---

### 4. Naming Conventions

**What this means:**
Use consistent naming so others (and future you) can understand what each file contains.

#### ✅ DO:
- **Components**: `PascalCase` - First letter of each word capitalized
  - Examples: `LoginForm.jsx`, `UserProfile.jsx`, `TaxCalculator.jsx`

- **Hooks**: `camelCase` with 'use' prefix
  - Examples: `useAuth.js`, `useForm.js`, `useTaxCalculation.js`

- **Utils**: `camelCase` - First word lowercase, subsequent words capitalized
  - Examples: `formatCurrency.js`, `validateEmail.js`, `calculateTax.js`

- **Constants**: `UPPER_SNAKE_CASE` - All uppercase with underscores
  - Examples: `API_BASE_URL`, `MAX_FILE_SIZE`, `TAX_RATE`

#### 🔴 DON'T:
- Don't use `snake_case` for components (e.g., `login_form.jsx`)
- Don't forget the 'use' prefix for hooks
- Don't mix naming styles

---

### 5. Component Structure

**What this means:**
Organize the code inside components in a consistent order so they're easy to read.

#### ✅ DO - Follow this order:
```jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function ComponentName({ prop1, prop2 }) {
  // 1. First: Define state with hooks
  const [state, setState] = useState(null);
  
  // 2. Second: Add side effects
  useEffect(() => {
    // Code that runs when component mounts or updates
  }, []);
  
  // 3. Third: Define event handlers
  const handleEvent = () => {
    // Code that runs when user clicks, types, etc.
  };
  
  // 4. Finally: Return the JSX (what appears on screen)
  return (
    <div>
      {/* Your HTML-like code here */}
    </div>
  );
}

// Define prop types for documentation and validation
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default ComponentName;
```

#### 🔴 DON'T:
- Don't mix up the order (e.g., putting event handlers before hooks)
- Don't forget to define PropTypes
- Don't skip the blank lines between sections

---

### 6. API Integration

**What this means:**
When your app needs to fetch or send data to a server, follow these patterns.

#### ✅ DO:
- **Use axios for HTTP requests**: Axios is a library that makes API calls easier than the native `fetch`.

- **Centralize API calls in service files**: Create separate files for API calls instead of putting them directly in components.
  ```jsx
  // ✅ Good - services/taxService.js
  export async function getTaxReports() {
    return axios.get('/api/tax-reports');
  }
  ```

- **Use custom hooks for data fetching**: Create hooks like `useTaxReports()` that handle loading and error states.

- **Implement proper error handling**: Always prepare for API calls to fail.
  ```jsx
  try {
    const data = await fetchData();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Show error message to user
  }
  ```

- **Show loading states**: Display a spinner or message while data is being fetched.

#### 🔴 DON'T:
- Don't make API calls directly in components
- Don't forget to handle errors
- Don't leave users staring at a blank screen while data loads

---

### 7. Form Handling

**What this means:**
Forms (login, signup, data entry) should be handled with specific tools.

#### ✅ DO:
- **Use react-hook-form**: This library simplifies form management.
  ```jsx
  const { register, handleSubmit } = useForm();
  ```

- **Use Zod for validation schemas**: Zod helps validate form data (e.g., "email must be valid", "password must be 8+ characters").

- **Provide clear error messages**: Tell users exactly what went wrong.
  - ✅ Good: "Email must be in format: user@example.com"
  - ❌ Bad: "Invalid input"

- **Implement debouncing for API calls**: Wait a bit after user stops typing before making API calls (e.g., for search suggestions).

#### 🔴 DON'T:
- Don't validate forms manually with lots of if statements
- Don't show generic error messages
- Don't make an API call on every keystroke

---

### 8. Testing

**What this means:**
Write automated tests to ensure your code works correctly.

#### ✅ DO:
- **Write tests for critical components**: Test important features like login, checkout, tax calculations.

- **Use Vitest and React Testing Library**: These are the testing tools for this project.

- **Test user interactions, not implementation**: Test what users see and do, not internal code details.
  ```jsx
  // ✅ Good - Test user behavior
  fireEvent.click(getByText('Submit'));
  expect(getByText('Success!')).toBeInTheDocument();
  
  // ❌ Bad - Test implementation
  expect(component.state.isSubmitting).toBe(true);
  ```

- **Mock external dependencies**: Don't make real API calls in tests - fake them.

#### 🔴 DON'T:
- Don't test every tiny detail
- Don't make real API calls in tests
- Don't test internal state directly

---

### 9. Performance

**What this means:**
Make your app fast and responsive.

#### ✅ DO:
- **Use React.memo() for expensive components**: Prevent unnecessary re-renders of complex components.
  ```jsx
  const ExpensiveComponent = React.memo(function ExpensiveComponent(props) {
    // Complex rendering logic
  });
  ```

- **Use useMemo and useCallback where appropriate**: Cache expensive calculations and functions.

- **Lazy load routes and heavy components**: Load big components only when needed.
  ```jsx
  const Dashboard = lazy(() => import('./pages/Dashboard'));
  ```

- **Optimize images and assets**: Compress images, use appropriate formats.

#### 🔴 DON'T:
- Don't render heavy lists without virtualization
- Don't load all components at startup
- Don't ignore performance warnings

---

### 10. Security

**What this means:**
Keep your app and users safe from security vulnerabilities.

#### ✅ DO:
- **Never commit API keys or secrets**: Use environment variables (`.env` files) instead.
  ```bash
  # ✅ Good - In .env file (not committed to git)
  API_KEY=your-secret-key
  
  # Then use it: import.meta.env.VITE_API_KEY
  ```

- **Sanitize user inputs**: Clean user data before using it to prevent attacks.

- **Use HTTPS for API calls**: Always use secure connections (`https://` not `http://`).

- **Implement proper authentication**: Verify users are who they say they are.

- **Store sensitive data securely**: Use secure storage methods, not plain localStorage.

#### 🔴 DON'T:
- ❌ NEVER commit passwords, API keys, or secrets to Git
- ❌ Don't trust user input without validation
- ❌ Don't store sensitive data in localStorage
- ❌ Don't use HTTP for sensitive operations

---

### 11. Styling

**What this means:**
How to style components to look good and consistent.

#### ✅ DO:
- **Use Tailwind CSS utility classes**: Apply styles using Tailwind's predefined classes.
  ```jsx
  <button className="bg-blue-500 text-white px-4 py-2 rounded">
    Click Me
  </button>
  ```

- **Follow mobile-first approach**: Design for mobile screens first, then add styles for larger screens.
  ```jsx
  <div className="text-sm md:text-base lg:text-lg">
    Responsive text
  </div>
  ```

- **Support dark mode**: Use the `dark:` prefix for dark mode styles.
  ```jsx
  <div className="bg-white dark:bg-gray-800">
    Content
  </div>
  ```

- **Keep consistent spacing and colors**: Use theme values, not random numbers.
  ```jsx
  // ✅ Good - Using theme values
  <div className="p-4 bg-primary-500">
  
  // ❌ Bad - Random values
  <div style={{ padding: '17px', background: '#3b82f6' }}>
  ```

- **Use semantic color names**: Use names like `primary`, `secondary`, not `blue-500`.

#### 🔴 DON'T:
- Don't write custom CSS unless absolutely necessary
- Don't use inline styles
- Don't forget dark mode support
- Don't use arbitrary color values

---

### 12. Error Handling

**What this means:**
When something goes wrong, handle it gracefully.

#### ✅ DO:
- **Use ErrorBoundary for component errors**: Catch errors and show a fallback UI.

- **Log errors to console in development**: Help developers debug issues.
  ```jsx
  console.error('Error details:', error);
  ```

- **Show user-friendly error messages**: Use plain language, not technical jargon.
  - ✅ Good: "We couldn't load your tax reports. Please try again."
  - ❌ Bad: "Error 500: Internal Server Error"

- **Provide error recovery actions**: Give users a way to fix the problem.
  ```jsx
  <button onClick={retry}>Try Again</button>
  ```

#### 🔴 DON'T:
- Don't show technical error messages to users
- Don't let errors crash the entire app
- Don't ignore errors silently

---

## Code Quality

**What this means:**
Maintain high standards for your code.

#### ✅ DO:
- **Run prettier before committing**: Automatically format your code.
  ```bash
  npm run format
  ```

- **Fix all ESLint warnings**: ESLint catches common mistakes and bad patterns.

- **Write descriptive commit messages**: Explain what changed and why.
  - ✅ Good: "Fix tax calculation rounding error for amounts over RM10,000"
  - ❌ Bad: "fix bug"

- **Document complex logic**: Add comments explaining tricky code.
  ```jsx
  // Calculate SST based on LHDN 2024 guidelines
  // Uses tiered rates: 0% for first RM500k, 6% above
  const calculateSST = (amount) => {
    // Implementation
  };
  ```

- **Keep functions small and focused**: Each function should do one thing well.

#### 🔴 DON'T:
- Don't commit messy, unformatted code
- Don't ignore ESLint warnings
- Don't write vague commit messages
- Don't create giant functions that do everything

---

## Malaysian Tax Context

**What this means:**
This app is specifically for Malaysian businesses, so it must follow Malaysian standards.

#### ✅ DO:
- **Support SST, EA forms, LHDN requirements**: Include features for Malaysian tax forms.

- **Use RM currency format**: Display money as "RM 1,234.56" or "RM1,234.56".
  ```jsx
  const formatted = new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(amount);
  ```

- **Support Malaysian date formats**: Use DD/MM/YYYY or similar formats common in Malaysia.

- **Implement LHDN e-Invoice compatibility**: Support electronic invoicing as required by LHDN.

- **Use Malaysian fiscal year**: January to December (same as calendar year).

#### 🔴 DON'T:
- Don't use USD or other currencies
- Don't use US date formats (MM/DD/YYYY)
- Don't ignore LHDN requirements

---

## When Generating Code

**What this means:**
Guidelines to follow whenever you write new code.

#### ✅ DO:
1. **Follow existing code patterns**: Look at similar components and match their style.

2. **Use TypeScript types when possible**: Even in `.jsx` files, you can use JSDoc comments for type safety.
   ```jsx
   /**
    * @param {string} userId - The user's ID
    * @param {number} amount - The tax amount
    */
   function calculateTax(userId, amount) { }
   ```

3. **Implement proper loading and error states**: Always handle loading, success, and error cases.
   ```jsx
   {loading && <Spinner />}
   {error && <ErrorMessage message={error} />}
   {data && <DataDisplay data={data} />}
   ```

4. **Add accessibility attributes (ARIA)**: Help screen readers understand your UI.
   ```jsx
   <button aria-label="Close dialog">
     <CloseIcon />
   </button>
   ```

5. **Support keyboard navigation**: Make sure users can navigate without a mouse.
   ```jsx
   <div role="button" tabIndex={0} onKeyPress={handleKeyPress}>
   ```

6. **Test on mobile viewports**: Check how your component looks on small screens.

7. **Consider performance implications**: Think about how your code affects app speed.

8. **Add comments for complex business logic**: Explain the "why", not just the "what".
   ```jsx
   // LHDN requires SST to be calculated before applying deductions
   // See: LHDN Circular No. 2/2024
   const taxableAmount = grossAmount - allowableDeductions;
   ```

---

## Key Do's and Don'ts

### 🟢 TOP 10 DO'S (Most Important!)

1. ✅ **DO use functional components with hooks** - Modern React way
2. ✅ **DO follow the file structure** - Keep the project organized
3. ✅ **DO use Tailwind CSS** - Don't write custom CSS
4. ✅ **DO handle errors gracefully** - Show user-friendly messages
5. ✅ **DO use environment variables for secrets** - Never commit API keys
6. ✅ **DO write tests for critical features** - Prevent bugs
7. ✅ **DO support mobile and dark mode** - Users expect these features
8. ✅ **DO use consistent naming conventions** - Makes code readable
9. ✅ **DO run prettier and fix ESLint warnings** - Keep code clean
10. ✅ **DO follow Malaysian tax requirements** - This is a Malaysian tax app

### 🔴 TOP 10 DON'TS (Most Important!)

1. ❌ **DON'T commit API keys or secrets** - Serious security risk!
2. ❌ **DON'T ignore error handling** - Leads to bad user experience
3. ❌ **DON'T skip loading states** - Users need feedback
4. ❌ **DON'T mix up naming conventions** - Creates confusion
5. ❌ **DON'T create your own file structure** - Follow the existing one
6. ❌ **DON'T use class components** - Use functional components instead
7. ❌ **DON'T make API calls directly in components** - Use service files
8. ❌ **DON'T forget mobile responsiveness** - Mobile-first approach
9. ❌ **DON'T ignore ESLint warnings** - They catch real issues
10. ❌ **DON'T use USD or US date formats** - This is for Malaysian market

---

## Quick Reference Card

### File Naming Cheat Sheet
- Component: `UserProfile.jsx` (PascalCase)
- Hook: `useAuth.js` (camelCase with 'use')
- Util: `formatCurrency.js` (camelCase)
- Constant: `API_BASE_URL` (UPPER_SNAKE_CASE)

### Component Code Order
1. Imports
2. Component function
3. Hooks (useState, useEffect, etc.)
4. Event handlers
5. Return JSX
6. PropTypes definition
7. Export

### Common Tailwind Patterns
- Container: `container mx-auto px-4`
- Button: `bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600`
- Card: `bg-white dark:bg-gray-800 rounded-lg shadow p-6`
- Responsive: `text-sm md:text-base lg:text-lg`

### Malaysian Formats
- Currency: RM 1,234.56
- Date: DD/MM/YYYY
- Fiscal Year: Jan-Dec

---

## Questions Beginners Often Ask

### Q: Why functional components instead of class components?
**A:** Functional components are simpler, require less code, and hooks make them more powerful. They're the modern React standard.

### Q: Why can't I commit my API keys?
**A:** If you commit keys to Git, anyone with access to the repository can steal them and use your services, potentially costing you money or compromising security.

### Q: What's the difference between props and state?
**A:** Props are passed from parent to child (like function parameters). State is data managed within a component that can change over time.

### Q: Why use Tailwind instead of regular CSS?
**A:** Tailwind keeps styling consistent, makes responsive design easier, and avoids CSS file bloat. It's faster once you learn the classes.

### Q: Do I really need to write tests?
**A:** For critical features (login, payments, calculations), yes! Tests catch bugs before users do and give you confidence when making changes.

### Q: Why is mobile-first important?
**A:** Many users access websites on phones. Designing for mobile first ensures a good experience for all users, then you enhance for larger screens.

### Q: What's the difference between useState and useReducer?
**A:** `useState` is for simple state (a number, boolean, string). `useReducer` is for complex state with multiple related values and actions.

### Q: Why separate API calls into service files?
**A:** It makes code cleaner, easier to test, and allows you to reuse API calls across multiple components.

---

## Getting Help

If you're stuck or unsure about something:

1. **Read these rules again** - The answer is often here
2. **Look at existing code** - Find similar components and copy their patterns
3. **Check the documentation** - React, Tailwind, and other tools have great docs
4. **Ask for help** - Don't struggle alone; reach out to your team

---

## Summary

The `.cursorrules` file is your guidebook for writing code that fits the CukaiPro project. Key principles:

1. **Consistency** - Follow existing patterns
2. **Security** - Never commit secrets
3. **Quality** - Write clean, tested code
4. **User Experience** - Handle errors, show loading states
5. **Malaysian Context** - Support local requirements

Remember: These rules exist to help you and the team work together effectively. When everyone follows the same patterns, the codebase stays clean and maintainable.

Happy coding! 🚀

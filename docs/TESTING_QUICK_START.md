# Testing Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

### 2. Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/.*\\.test\\.tsx$",
    "test:integration": "jest --testPathPattern=integration",
    "test:checkout": "jest --testPathPattern=Checkout"
  }
}
```

### 3. Create jest.config.js

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};
```

### 4. Create jest.setup.js

```javascript
import '@testing-library/jest-dom';

// Mock Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock fetch
global.fetch = jest.fn();
```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run with Coverage Report
```bash
npm run test:coverage
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Run Checkout Tests Only
```bash
npm run test:checkout
```

## 📊 Understanding Test Results

### Successful Test Output
```
PASS  src/components/Checkout/__tests__/AddressFormModal.test.tsx
  ✓ should render modal when isOpen is true (45ms)
  ✓ should validate PIN code format (123ms)
  ✓ should submit form with valid data (234ms)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        3.456s
```

### Coverage Report
```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
AddressFormModal    |   95.12 |    88.89 |     100 |   94.87 |
BillingNew          |   92.31 |    85.71 |     100 |   91.89 |
ShippingNew         |   93.75 |    87.50 |     100 |   93.33 |
--------------------|---------|----------|---------|---------|
```

## 🎯 Test File Structure

```
src/components/Checkout/
├── __tests__/
│   ├── AddressFormModal.test.tsx       # Unit tests
│   ├── BillingNew.test.tsx             # Unit tests
│   ├── ShippingNew.test.tsx            # Unit tests
│   └── CheckoutFlow.integration.test.tsx # Integration tests
├── AddressFormModal.tsx
├── BillingNew.tsx
└── ShippingNew.tsx
```

## ✅ Test Checklist

Before committing code, ensure:

- [ ] All tests pass
- [ ] Coverage is above 80%
- [ ] New features have tests
- [ ] Edge cases are covered
- [ ] Accessibility tests pass
- [ ] No console errors/warnings

## 🔍 Common Test Patterns

### Testing Component Rendering
```typescript
it('should render component', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Testing User Interactions
```typescript
it('should handle button click', async () => {
  render(<Component />);
  const button = screen.getByRole('button', { name: /Click Me/i });
  await userEvent.click(button);
  expect(mockFunction).toHaveBeenCalled();
});
```

### Testing Form Input
```typescript
it('should accept user input', async () => {
  render(<Component />);
  const input = screen.getByLabelText(/Name/i);
  await userEvent.type(input, 'John Doe');
  expect(input).toHaveValue('John Doe');
});
```

### Testing API Calls
```typescript
it('should fetch data', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' })
  });

  render(<Component />);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/endpoint');
  });
});
```

### Testing Conditional Rendering
```typescript
it('should show element when condition is true', () => {
  render(<Component showElement={true} />);
  expect(screen.getByText('Element')).toBeInTheDocument();
});

it('should hide element when condition is false', () => {
  render(<Component showElement={false} />);
  expect(screen.queryByText('Element')).not.toBeInTheDocument();
});
```

## 🐛 Debugging Tests

### View Component Output
```typescript
screen.debug(); // Prints entire component tree
screen.debug(screen.getByRole('button')); // Prints specific element
```

### Check Available Queries
```typescript
screen.logTestingPlaygroundURL(); // Opens Testing Playground
```

### Run Single Test
```bash
npm test -- -t "test name"
```

### Run Single File
```bash
npm test -- AddressFormModal.test
```

### Verbose Output
```bash
npm test -- --verbose
```

## 📝 Writing Your First Test

### Step 1: Create Test File
```typescript
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Step 2: Run Test
```bash
npm test MyComponent.test
```

### Step 3: Check Results
- ✅ Green = Pass
- ❌ Red = Fail

### Step 4: Fix Failures
- Read error message
- Check component code
- Update test or component
- Re-run test

## 🎓 Learning Resources

### Official Documentation
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing](https://reactjs.org/docs/testing.html)

### Tutorials
- [Kent C. Dodds - Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)

### Video Courses
- [Testing JavaScript](https://testingjavascript.com/)
- [Epic React Testing](https://epicreact.dev/testing)

## 💡 Tips & Tricks

### 1. Use Data-TestId Sparingly
```typescript
// ❌ Bad - Relies on implementation
<div data-testid="my-div">Content</div>

// ✅ Good - Uses semantic queries
<button aria-label="Submit">Submit</button>
```

### 2. Test User Behavior
```typescript
// ❌ Bad - Tests implementation
expect(component.state.isOpen).toBe(true);

// ✅ Good - Tests behavior
expect(screen.getByText('Modal Content')).toBeInTheDocument();
```

### 3. Avoid Testing Implementation Details
```typescript
// ❌ Bad
expect(mockFunction).toHaveBeenCalledTimes(1);

// ✅ Good
expect(screen.getByText('Success!')).toBeInTheDocument();
```

### 4. Use Descriptive Test Names
```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should display error message when form is invalid', () => { ... });
```

### 5. Group Related Tests
```typescript
describe('Form Validation', () => {
  describe('Email Field', () => {
    it('should accept valid email', () => { ... });
    it('should reject invalid email', () => { ... });
  });
});
```

## 🚨 Common Errors & Solutions

### Error: "Cannot find module"
**Solution:** Check jest.config.js moduleNameMapper

### Error: "act() warning"
**Solution:** Wrap state updates in waitFor()

### Error: "Unable to find element"
**Solution:** Use waitFor() for async operations

### Error: "Mock not working"
**Solution:** Ensure mock is defined before component import

### Error: "Timeout"
**Solution:** Increase timeout or check async operations

## 📈 Improving Test Coverage

### 1. Identify Uncovered Code
```bash
npm run test:coverage
```

### 2. Check Coverage Report
Open `coverage/lcov-report/index.html` in browser

### 3. Add Missing Tests
Focus on:
- Uncovered branches
- Error handling
- Edge cases
- User interactions

### 4. Re-run Coverage
```bash
npm run test:coverage
```

## 🎉 Success Criteria

Your tests are good when:
- ✅ All tests pass
- ✅ Coverage > 80%
- ✅ Tests are readable
- ✅ Tests are maintainable
- ✅ Tests catch bugs
- ✅ Tests run fast (<5s)

## 🔄 Next Steps

1. ✅ Set up testing environment
2. ✅ Run existing tests
3. ✅ Understand test structure
4. ✅ Write your first test
5. ✅ Achieve 80%+ coverage
6. ✅ Add tests for new features
7. ✅ Review test best practices

---

**Need Help?** Check the full documentation in `CHECKOUT_TESTING.md`

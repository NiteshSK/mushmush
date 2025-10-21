# Install and Run Tests - Step by Step

## Step 1: Install Testing Dependencies

Run this command in your terminal:

```bash
npm install --save-dev @testing-library/react@^14.0.0 @testing-library/jest-dom@^6.1.0 @testing-library/user-event@^14.5.0 jest@^29.7.0 jest-environment-jsdom@^29.7.0 @types/jest@^29.5.0 identity-obj-proxy@^3.0.0 @swc/jest@^0.2.29
```

## Step 2: Verify Configuration Files

Make sure these files exist (they should already be created):
- ✅ `jest.config.js`
- ✅ `jest.setup.js`
- ✅ Test scripts in `package.json`

## Step 3: Run Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Run Only Checkout Tests
```bash
npm run test:checkout
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Run Specific Test File
```bash
npm test AddressFormModal.test
npm test BillingNew.test
npm test ShippingNew.test
npm test CheckoutFlow.integration.test
```

## Expected Output

When tests run successfully, you should see:

```
PASS  src/components/Checkout/__tests__/AddressFormModal.test.tsx
PASS  src/components/Checkout/__tests__/BillingNew.test.tsx
PASS  src/components/Checkout/__tests__/ShippingNew.test.tsx
PASS  src/components/Checkout/__tests__/CheckoutFlow.integration.test.tsx

Test Suites: 4 passed, 4 total
Tests:       95 passed, 95 total
Snapshots:   0 total
Time:        ~10s
```

## Coverage Report

After running `npm run test:coverage`, open:
```
coverage/lcov-report/index.html
```

This will show detailed coverage information.

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Make sure all dependencies are installed:
```bash
npm install
```

### Issue: "SyntaxError: Unexpected token"
**Solution:** Make sure @swc/jest is installed:
```bash
npm install --save-dev @swc/jest
```

### Issue: Tests fail with "ReferenceError: React is not defined"
**Solution:** This is already handled in jest.config.js with the React automatic runtime

### Issue: "Cannot find name 'describe'" or "Cannot find name 'it'"
**Solution:** Make sure @types/jest is installed:
```bash
npm install --save-dev @types/jest
```

## Quick Test Commands

```bash
# Install everything
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest identity-obj-proxy @swc/jest

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (best for development)
npm run test:watch
```

## Test Files Location

All test files are in:
```
src/components/Checkout/__tests__/
├── AddressFormModal.test.tsx
├── BillingNew.test.tsx
├── ShippingNew.test.tsx
└── CheckoutFlow.integration.test.tsx
```

## Documentation

For more details, see:
- `docs/CHECKOUT_TESTING.md` - Complete testing guide
- `docs/TESTING_QUICK_START.md` - Quick start guide
- `docs/TEST_SUMMARY.md` - Test overview

---

**Ready to test!** 🚀

Just run: `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest identity-obj-proxy @swc/jest`

Then: `npm test`

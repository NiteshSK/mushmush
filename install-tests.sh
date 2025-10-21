#!/bin/bash

echo "🚀 Installing test dependencies..."
echo ""
echo "Note: Using --legacy-peer-deps to bypass Node.js version check"
echo ""

npm install --save-dev --legacy-peer-deps \
  @testing-library/react@^14.0.0 \
  @testing-library/jest-dom@^6.1.0 \
  @testing-library/user-event@^14.5.0 \
  jest@^29.7.0 \
  jest-environment-jsdom@^29.7.0 \
  @types/jest@^29.5.0 \
  identity-obj-proxy@^3.0.0 \
  @swc/jest@^0.2.29

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "Now you can run:"
    echo "  npm test              - Run all tests"
    echo "  npm run test:coverage - Run with coverage"
    echo "  npm run test:watch    - Watch mode"
    echo ""
else
    echo ""
    echo "❌ Installation failed!"
    echo ""
    echo "Try running manually:"
    echo "npm install --save-dev --legacy-peer-deps @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest identity-obj-proxy @swc/jest"
    echo ""
fi

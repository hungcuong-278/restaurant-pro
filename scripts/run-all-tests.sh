#!/bin/bash
# Comprehensive Test Runner
# Runs all tests and generates detailed reports

echo "================================="
echo "🧪 RESTAURANT PRO TEST SUITE 🧪"
echo "================================="
echo ""

# Create reports directory
mkdir -p test-reports

# Start timestamp
START_TIME=$(date +%s)
echo "⏰ Started at: $(date)"
echo ""

# Backend Tests
echo "📦 Running Backend Tests..."
echo "----------------------------"
cd backend

# Unit Tests
echo "✓ Unit Tests..."
npm test -- --coverage --coverageDirectory=../test-reports/backend-coverage --testPathPattern="services|utils" > ../test-reports/backend-unit.log 2>&1
BACKEND_UNIT_EXIT=$?

# API Integration Tests  
echo "✓ API Integration Tests..."
npm test -- --testPathPattern="api" > ../test-reports/backend-api.log 2>&1
BACKEND_API_EXIT=$?

# Generate backend test summary
echo "✓ Generating Backend Summary..."
npm test -- --json --outputFile=../test-reports/backend-results.json > /dev/null 2>&1

cd ..

# Frontend Tests
echo ""
echo "⚛️  Running Frontend Tests..."
echo "----------------------------"
cd frontend

# Component Tests
echo "✓ Component Tests..."
npm test -- --coverage --coverageDirectory=../test-reports/frontend-coverage --watchAll=false > ../test-reports/frontend-component.log 2>&1
FRONTEND_EXIT=$?

# Generate frontend test summary
echo "✓ Generating Frontend Summary..."
npm test -- --json --outputFile=../test-reports/frontend-results.json --watchAll=false > /dev/null 2>&1

cd ..

# E2E Tests (if available)
if [ -d "e2e" ]; then
  echo ""
  echo "🌐 Running E2E Tests..."
  echo "----------------------------"
  cd e2e
  npm test > ../test-reports/e2e.log 2>&1
  E2E_EXIT=$?
  cd ..
fi

# End timestamp
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Generate Summary Report
echo ""
echo "================================="
echo "📊 TEST SUMMARY REPORT"
echo "================================="
echo ""

echo "⏱️  Duration: ${DURATION}s"
echo ""

echo "Backend Unit Tests: $([ $BACKEND_UNIT_EXIT -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo "Backend API Tests:  $([ $BACKEND_API_EXIT -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo "Frontend Tests:     $([ $FRONTEND_EXIT -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
if [ -d "e2e" ]; then
  echo "E2E Tests:          $([ $E2E_EXIT -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
fi

echo ""
echo "📁 Test reports saved to: ./test-reports/"
echo ""

# Coverage Summary
echo "📈 Coverage Reports:"
echo "  - Backend:  ./test-reports/backend-coverage/index.html"
echo "  - Frontend: ./test-reports/frontend-coverage/index.html"

echo ""
echo "================================="
echo "✅ Test suite completed!"
echo "================================="

# Exit with failure if any tests failed
if [ $BACKEND_UNIT_EXIT -ne 0 ] || [ $BACKEND_API_EXIT -ne 0 ] || [ $FRONTEND_EXIT -ne 0 ]; then
  exit 1
fi

exit 0

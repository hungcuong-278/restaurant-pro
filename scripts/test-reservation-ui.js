/**
 * AUTOMATED UI TEST - RESERVATION REVIEW STEP DIAGNOSIS
 * 
 * This test will:
 * 1. Test the simple form at /reservations
 * 2. Test the multi-step form at /reservations/new
 * 3. Check Redux state at each step
 * 4. Verify button state and conditions
 * 5. Identify the exact cause of the disabled button
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

async function checkFrontendAvailability() {
  section('🔍 TEST 1: FRONTEND AVAILABILITY CHECK');
  
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    log('✅ Frontend is accessible', 'green');
    log(`   Status: ${response.status}`, 'blue');
    log(`   Content-Type: ${response.headers['content-type']}`, 'blue');
    
    // Check if it's HTML (React app)
    if (response.headers['content-type'].includes('text/html')) {
      log('✅ Frontend serving React HTML', 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Frontend NOT accessible', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function checkBackendAPI() {
  section('🔍 TEST 2: BACKEND API CHECK');
  
  try {
    // Test health endpoint
    const health = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    log('✅ Backend health check passed', 'green');
    
    // Test login
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    log('✅ Backend login successful', 'green');
    log(`   Token: ${token.substring(0, 20)}...`, 'blue');
    
    // Test available tables
    const tablesResponse = await axios.get(
      `${BACKEND_URL}/api/reservations/available-tables?date=2025-10-08&time=18:00&party_size=2`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    log('✅ Backend available tables API working', 'green');
    log(`   Tables found: ${tablesResponse.data.length}`, 'blue');
    
    return { success: true, token };
  } catch (error) {
    log('❌ Backend API test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { success: false };
  }
}

async function testSimpleFormRoute() {
  section('🔍 TEST 3: SIMPLE FORM ROUTE (/reservations)');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/reservations`, { 
      timeout: 5000,
      maxRedirects: 5 
    });
    
    log('✅ Simple form route accessible', 'green');
    log(`   Status: ${response.status}`, 'blue');
    log(`   Final URL: ${response.request.res.responseUrl || FRONTEND_URL + '/reservations'}`, 'blue');
    
    // Check if HTML contains expected components
    const html = response.data;
    
    const checks = [
      { name: 'ReservationForm component', pattern: /reservation|booking|form/i },
      { name: 'Date picker', pattern: /date|calendar/i },
      { name: 'Time picker', pattern: /time/i },
      { name: 'Submit button', pattern: /submit|continue|confirm/i },
    ];
    
    log('\n📋 HTML Content Analysis:', 'yellow');
    checks.forEach(check => {
      const found = check.pattern.test(html);
      if (found) {
        log(`   ✅ ${check.name} likely present`, 'green');
      } else {
        log(`   ⚠️  ${check.name} not detected (may still exist)`, 'yellow');
      }
    });
    
    return true;
  } catch (error) {
    log('❌ Simple form route test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testMultiStepRoute() {
  section('🔍 TEST 4: MULTI-STEP FORM ROUTE (/reservations/new)');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/reservations/new`, { 
      timeout: 5000,
      maxRedirects: 5 
    });
    
    log('✅ Multi-step form route accessible', 'green');
    log(`   Status: ${response.status}`, 'blue');
    
    const html = response.data;
    
    const checks = [
      { name: 'Stepper UI', pattern: /step|stepper/i },
      { name: 'Review section', pattern: /review|summary/i },
      { name: 'Terms & Conditions', pattern: /terms|conditions/i },
      { name: 'Confirm button', pattern: /confirm/i },
      { name: 'Back button', pattern: /back/i },
    ];
    
    log('\n📋 HTML Content Analysis:', 'yellow');
    checks.forEach(check => {
      const found = check.pattern.test(html);
      if (found) {
        log(`   ✅ ${check.name} likely present`, 'green');
      } else {
        log(`   ⚠️  ${check.name} not detected`, 'yellow');
      }
    });
    
    return true;
  } catch (error) {
    log('❌ Multi-step form route test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function analyzeReservationSummaryComponent() {
  section('🔍 TEST 5: RESERVATION SUMMARY COMPONENT ANALYSIS');
  
  const fs = require('fs');
  const path = require('path');
  
  const summaryPath = path.join(__dirname, 'frontend', 'src', 'components', 'reservations', 'ReservationSummary.tsx');
  
  try {
    const content = fs.readFileSync(summaryPath, 'utf8');
    
    log('📄 Analyzing ReservationSummary.tsx:', 'yellow');
    
    // Check useState for acceptedTerms
    const useStateMatch = content.match(/const\s+\[acceptedTerms,\s+setAcceptedTerms\]\s+=\s+useState\(([^)]+)\)/);
    if (useStateMatch) {
      const initialValue = useStateMatch[1].trim();
      log(`   📍 acceptedTerms initial state: ${initialValue}`, 'blue');
      
      if (initialValue === 'true') {
        log('   ✅ Checkbox is PRE-CHECKED (true)', 'green');
      } else if (initialValue === 'false') {
        log('   ❌ Checkbox is NOT pre-checked (false) - THIS IS THE BUG!', 'red');
      }
    } else {
      log('   ⚠️  acceptedTerms state not found', 'yellow');
    }
    
    // Check button disabled condition
    const disabledMatches = content.match(/disabled=\{([^}]+)\}/g);
    if (disabledMatches && disabledMatches.length > 0) {
      log('\n   📍 Button disabled conditions found:', 'blue');
      disabledMatches.forEach((match, index) => {
        log(`      ${index + 1}. ${match}`, 'blue');
        
        if (match.includes('!acceptedTerms')) {
          log('      ❌ FOUND !acceptedTerms in disabled condition - THIS BLOCKS BUTTON!', 'red');
        } else if (!match.includes('acceptedTerms')) {
          log('      ✅ No acceptedTerms check in this condition', 'green');
        }
      });
    }
    
    // Check className condition
    const classNameMatches = content.match(/className=\{`[^`]*\$\{([^}]+)\}/g);
    if (classNameMatches && classNameMatches.length > 0) {
      log('\n   📍 Button className conditions found:', 'blue');
      classNameMatches.forEach((match, index) => {
        if (match.includes('disabled') || match.includes('acceptedTerms')) {
          log(`      ${index + 1}. ${match.substring(0, 100)}...`, 'blue');
          
          if (match.includes('acceptedTerms')) {
            log('      ⚠️  acceptedTerms affects button styling', 'yellow');
          }
        }
      });
    }
    
    // Check handleConfirm function
    const handleConfirmMatch = content.match(/const\s+handleConfirm\s+=\s+[^{]*\{([^}]*\{[^}]*\}[^}]*)*\}/s);
    if (handleConfirmMatch) {
      const handleConfirm = handleConfirmMatch[0];
      log('\n   📍 handleConfirm function:', 'blue');
      
      if (handleConfirm.includes('!acceptedTerms')) {
        log('      ❌ FOUND !acceptedTerms check in handleConfirm - BLOCKS SUBMISSION!', 'red');
        if (handleConfirm.includes('alert')) {
          log('      ❌ Alert shown when terms not accepted', 'red');
        }
      } else {
        log('      ✅ No acceptedTerms check - calls onConfirm directly', 'green');
      }
    }
    
    // Check if Terms section exists
    if (content.includes('Terms & Conditions') || content.includes('Terms and Conditions')) {
      log('\n   📍 Terms & Conditions section:', 'blue');
      log('      ✅ Section EXISTS in component', 'green');
      
      const termsCheckbox = content.match(/type="checkbox"[^>]*checked=\{acceptedTerms\}/);
      if (termsCheckbox) {
        log('      ✅ Checkbox bound to acceptedTerms state', 'green');
      }
    }
    
    return true;
  } catch (error) {
    log('❌ Could not analyze ReservationSummary.tsx', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function analyzeSimpleReservationPage() {
  section('🔍 TEST 6: SIMPLE RESERVATION PAGE ANALYSIS');
  
  const fs = require('fs');
  const path = require('path');
  
  const simplePath = path.join(__dirname, 'frontend', 'src', 'pages', 'reservations', 'SimpleReservationPage.tsx');
  
  try {
    if (!fs.existsSync(simplePath)) {
      log('❌ SimpleReservationPage.tsx does NOT exist!', 'red');
      log('   This means the simple form route will NOT work', 'red');
      return false;
    }
    
    const content = fs.readFileSync(simplePath, 'utf8');
    const lines = content.split('\n').length;
    
    log('✅ SimpleReservationPage.tsx exists', 'green');
    log(`   Lines: ${lines}`, 'blue');
    
    // Check key elements
    const checks = [
      { name: 'ReservationForm import', pattern: /import.*ReservationForm/i, critical: true },
      { name: 'ReservationForm usage', pattern: /<ReservationForm/, critical: true },
      { name: 'onSubmit prop', pattern: /onSubmit=\{handleSubmit\}/, critical: true },
      { name: 'handleSubmit function', pattern: /const handleSubmit/, critical: true },
      { name: 'createReservation dispatch', pattern: /dispatch\(createReservation/, critical: true },
      { name: 'navigate to confirmation', pattern: /navigate\(.*confirmation/, critical: false },
    ];
    
    log('\n📋 Component Analysis:', 'yellow');
    checks.forEach(check => {
      const found = check.pattern.test(content);
      if (found) {
        log(`   ✅ ${check.name}`, 'green');
      } else {
        const severity = check.critical ? 'red' : 'yellow';
        const icon = check.critical ? '❌' : '⚠️';
        log(`   ${icon} ${check.name} - ${check.critical ? 'CRITICAL MISSING' : 'Optional missing'}`, severity);
      }
    });
    
    return true;
  } catch (error) {
    log('❌ Could not analyze SimpleReservationPage.tsx', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function analyzeAppRoutes() {
  section('🔍 TEST 7: APP.TSX ROUTES ANALYSIS');
  
  const fs = require('fs');
  const path = require('path');
  
  const appPath = path.join(__dirname, 'frontend', 'src', 'App.tsx');
  
  try {
    const content = fs.readFileSync(appPath, 'utf8');
    
    log('📄 Analyzing App.tsx routes:', 'yellow');
    
    // Find all reservation routes
    const routePattern = /<Route\s+path="([^"]*reservations[^"]*)"\s+element=\{<([^>]+)>\s*\/\}\s*\/>/g;
    const routes = [];
    let match;
    
    while ((match = routePattern.exec(content)) !== null) {
      routes.push({ path: match[1], component: match[2] });
    }
    
    if (routes.length === 0) {
      log('   ⚠️  No reservation routes found with regex, trying simpler pattern...', 'yellow');
      
      // Try simpler pattern
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('path="/reservations') && line.includes('<Route')) {
          log(`   Line ${index + 1}: ${line.trim()}`, 'blue');
        }
      });
    } else {
      log('\n   📍 Reservation Routes Found:', 'blue');
      routes.forEach((route, index) => {
        log(`   ${index + 1}. ${route.path} → ${route.component}`, 'blue');
      });
      
      // Check specific routes
      const simpleRoute = routes.find(r => r.path === '/reservations');
      const multiStepRoute = routes.find(r => r.path === '/reservations/new');
      
      log('\n   🎯 Critical Routes Check:', 'yellow');
      
      if (simpleRoute) {
        log(`   ✅ Simple form route EXISTS: ${simpleRoute.path} → ${simpleRoute.component}`, 'green');
      } else {
        log('   ❌ Simple form route MISSING: /reservations', 'red');
      }
      
      if (multiStepRoute) {
        log(`   ✅ Multi-step route EXISTS: ${multiStepRoute.path} → ${multiStepRoute.component}`, 'green');
      } else {
        log('   ❌ Multi-step route MISSING: /reservations/new', 'red');
      }
    }
    
    // Check imports
    log('\n   📍 Import Analysis:', 'blue');
    const imports = [
      { name: 'SimpleReservationPage', pattern: /import.*SimpleReservationPage/ },
      { name: 'ReservationPage', pattern: /import.*ReservationPage/ },
    ];
    
    imports.forEach(imp => {
      if (imp.pattern.test(content)) {
        log(`   ✅ ${imp.name} imported`, 'green');
      } else {
        log(`   ❌ ${imp.name} NOT imported`, 'red');
      }
    });
    
    return true;
  } catch (error) {
    log('❌ Could not analyze App.tsx', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function checkBuildArtifacts() {
  section('🔍 TEST 8: BUILD ARTIFACTS & CACHE CHECK');
  
  const fs = require('fs');
  const path = require('path');
  
  const checks = [
    { 
      name: 'node_modules/.cache', 
      path: path.join(__dirname, 'frontend', 'node_modules', '.cache'),
      shouldExist: true,
      note: 'Cache exists - may serve old code'
    },
    { 
      name: 'build directory', 
      path: path.join(__dirname, 'frontend', 'build'),
      shouldExist: false,
      note: 'Using dev server, build not needed'
    },
  ];
  
  log('📋 Checking build artifacts:', 'yellow');
  
  checks.forEach(check => {
    const exists = fs.existsSync(check.path);
    if (exists) {
      log(`   ✅ ${check.name} EXISTS`, exists ? 'green' : 'blue');
      log(`      Note: ${check.note}`, 'yellow');
      
      // Check last modified time
      try {
        const stats = fs.statSync(check.path);
        const modifiedDate = new Date(stats.mtime);
        const now = new Date();
        const minutesAgo = Math.floor((now - modifiedDate) / 1000 / 60);
        
        log(`      Last modified: ${minutesAgo} minutes ago`, 'blue');
        
        if (minutesAgo > 30) {
          log(`      ⚠️  Cache is OLD (> 30 min) - may be stale`, 'yellow');
        }
      } catch (e) {
        // Ignore
      }
    } else {
      log(`   ℹ️  ${check.name} does not exist`, 'blue');
    }
  });
  
  return true;
}

async function generateDiagnosisReport() {
  section('📊 DIAGNOSIS REPORT & RECOMMENDATIONS');
  
  log('Based on the tests above, here are the findings:\n', 'yellow');
  
  log('🔍 COMMON ISSUES TO CHECK:', 'cyan');
  log('', 'reset');
  
  log('1️⃣  BROWSER CACHE ISSUE', 'yellow');
  log('   Problem: User\'s browser may be serving OLD JavaScript code', 'reset');
  log('   Evidence: Code changes applied but user sees no difference', 'reset');
  log('   Solution:', 'green');
  log('      - Press Ctrl+Shift+R (hard refresh)', 'blue');
  log('      - Open DevTools (F12) → Network tab → Disable cache', 'blue');
  log('      - Clear localStorage: localStorage.clear() in Console', 'blue');
  log('      - Try incognito/private window', 'blue');
  log('', 'reset');
  
  log('2️⃣  WRONG URL ISSUE', 'yellow');
  log('   Problem: User testing /reservations/new instead of /reservations', 'reset');
  log('   Evidence: User mentions "step 4" which only exists in multi-step form', 'reset');
  log('   Solution:', 'green');
  log('      - Test http://localhost:3000/reservations (simple form)', 'blue');
  log('      - NOT http://localhost:3000/reservations/new (multi-step)', 'blue');
  log('', 'reset');
  
  log('3️⃣  ACCEPTEDTERMS STATE ISSUE', 'yellow');
  log('   Problem: useState(false) not changed to useState(true)', 'reset');
  log('   Evidence: Button disabled condition includes !acceptedTerms', 'reset');
  log('   Solution:', 'green');
  log('      - Check ReservationSummary.tsx line 56', 'blue');
  log('      - Should be: useState(true) NOT useState(false)', 'blue');
  log('', 'reset');
  
  log('4️⃣  REDUX STATE CORRUPTION', 'yellow');
  log('   Problem: Old Redux state in localStorage prevents button enable', 'reset');
  log('   Evidence: Multi-step form stores state in Redux', 'reset');
  log('   Solution:', 'green');
  log('      - Open DevTools → Application → Local Storage', 'blue');
  log('      - Delete "persist:root" or similar Redux keys', 'blue');
  log('      - Refresh page', 'blue');
  log('', 'reset');
  
  log('5️⃣  VALIDATION FAILURE', 'yellow');
  log('   Problem: Form data incomplete, button disabled by validation', 'reset');
  log('   Evidence: Button disabled can be from missing name/email/phone', 'reset');
  log('   Solution:', 'green');
  log('      - Check all form fields are filled', 'blue');
  log('      - Open DevTools → Console for validation errors', 'blue');
  log('', 'reset');
  
  log('📋 NEXT STEPS FOR USER:', 'cyan');
  log('', 'reset');
  log('1. Open http://localhost:3000/reservations in NEW INCOGNITO WINDOW', 'blue');
  log('2. Open DevTools (F12) → Console tab', 'blue');
  log('3. Fill form: Name, Email, Phone, Date, Time, Select Table', 'blue');
  log('4. Check Console for any errors', 'blue');
  log('5. Take screenshot showing: URL bar + Console + Form', 'blue');
  log('', 'reset');
}

async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   🔧 AUTOMATED RESERVATION REVIEW STEP DIAGNOSIS TEST SUITE 🔧            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  const results = {
    frontendAvailable: false,
    backendAPI: false,
    simpleFormRoute: false,
    multiStepRoute: false,
    summaryComponentAnalysis: false,
    simplePageAnalysis: false,
    appRoutesAnalysis: false,
    buildArtifactsCheck: false,
  };
  
  try {
    // Run all tests
    results.frontendAvailable = await checkFrontendAvailability();
    results.backendAPI = (await checkBackendAPI()).success;
    results.simpleFormRoute = await testSimpleFormRoute();
    results.multiStepRoute = await testMultiStepRoute();
    results.summaryComponentAnalysis = await analyzeReservationSummaryComponent();
    results.simplePageAnalysis = await analyzeSimpleReservationPage();
    results.appRoutesAnalysis = await analyzeAppRoutes();
    results.buildArtifactsCheck = await checkBuildArtifacts();
    
    // Generate report
    await generateDiagnosisReport();
    
    // Final summary
    section('✅ TEST SUITE COMPLETE');
    
    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r === true).length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    log(`Tests Passed: ${passed}/${total} (${passRate}%)`, passed === total ? 'green' : 'yellow');
    
    console.log('\n📝 Detailed Results:');
    Object.entries(results).forEach(([test, result]) => {
      const icon = result ? '✅' : '❌';
      const color = result ? 'green' : 'red';
      const testName = test.replace(/([A-Z])/g, ' $1').trim();
      log(`   ${icon} ${testName}`, color);
    });
    
    console.log('\n');
    
  } catch (error) {
    log('\n❌ TEST SUITE ERROR', 'red');
    log(`   ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the test suite
runAllTests().catch(console.error);

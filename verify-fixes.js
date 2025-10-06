/**
 * FINAL VERIFICATION TEST - Check if all fixes work correctly
 */

const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyFixes() {
  console.log('\n' + '='.repeat(80));
  log('🔍 FINAL VERIFICATION TEST - CHECKING ALL FIXES', 'cyan');
  console.log('='.repeat(80) + '\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 5,
  };

  // Test 1: Check handleConfirm has no acceptedTerms check
  log('Test 1: ReservationSummary handleConfirm fix', 'yellow');
  try {
    const fs = require('fs');
    const path = require('path');
    const summaryPath = path.join(__dirname, 'frontend', 'src', 'components', 'reservations', 'ReservationSummary.tsx');
    const content = fs.readFileSync(summaryPath, 'utf8');
    
    // Check if handleConfirm exists
    const hasHandleConfirm = content.includes('const handleConfirm');
    if (!hasHandleConfirm) {
      log('  ❌ handleConfirm function not found', 'red');
      results.failed++;
    } else {
      // Get handleConfirm function content
      const handleConfirmMatch = content.match(/const handleConfirm = \(\) => \{[^}]+\}/s);
      if (handleConfirmMatch) {
        const handleConfirmCode = handleConfirmMatch[0];
        
        // Check if it still has acceptedTerms check
        if (handleConfirmCode.includes('!acceptedTerms') || handleConfirmCode.includes('alert')) {
          log('  ❌ FAIL: handleConfirm still has acceptedTerms check or alert!', 'red');
          log(`     Code: ${handleConfirmCode.substring(0, 150)}...`, 'red');
          results.failed++;
        } else {
          log('  ✅ PASS: handleConfirm has NO acceptedTerms check', 'green');
          log(`     Code: ${handleConfirmCode}`, 'blue');
          results.passed++;
        }
      } else {
        log('  ⚠️  Could not extract handleConfirm code for verification', 'yellow');
        results.failed++;
      }
    }
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }

  // Test 2: Check SimpleReservationPage has onSubmit
  log('\nTest 2: SimpleReservationPage onSubmit handler', 'yellow');
  try {
    const fs = require('fs');
    const path = require('path');
    const simplePath = path.join(__dirname, 'frontend', 'src', 'pages', 'reservations', 'SimpleReservationPage.tsx');
    const content = fs.readFileSync(simplePath, 'utf8');
    
    const checks = [
      { name: 'handleSubmit function', pattern: /const handleSubmit = async/, critical: true },
      { name: 'onSubmit prop', pattern: /<ReservationForm onSubmit={handleSubmit}/, critical: true },
      { name: 'createReservation dispatch', pattern: /dispatch\(createReservation/, critical: true },
      { name: 'navigate call', pattern: /navigate\(`\/reservations\/confirmation/, critical: true },
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        log(`  ✅ ${check.name} found`, 'green');
      } else {
        log(`  ❌ ${check.name} NOT found`, 'red');
        allPassed = false;
      }
    });
    
    if (allPassed) {
      log('  ✅ PASS: All critical elements present', 'green');
      results.passed++;
    } else {
      log('  ❌ FAIL: Missing critical elements', 'red');
      results.failed++;
    }
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }

  // Test 3: Check acceptedTerms useState is true
  log('\nTest 3: acceptedTerms initial state is true', 'yellow');
  try {
    const fs = require('fs');
    const path = require('path');
    const summaryPath = path.join(__dirname, 'frontend', 'src', 'components', 'reservations', 'ReservationSummary.tsx');
    const content = fs.readFileSync(summaryPath, 'utf8');
    
    const useStateMatch = content.match(/const\s+\[acceptedTerms,\s+setAcceptedTerms\]\s+=\s+useState\(([^)]+)\)/);
    if (useStateMatch) {
      const initialValue = useStateMatch[1].trim();
      if (initialValue === 'true') {
        log('  ✅ PASS: acceptedTerms initial state is true', 'green');
        results.passed++;
      } else {
        log(`  ❌ FAIL: acceptedTerms initial state is ${initialValue} (should be true)`, 'red');
        results.failed++;
      }
    } else {
      log('  ⚠️  Could not find acceptedTerms useState', 'yellow');
      results.failed++;
    }
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }

  // Test 4: Check button disabled condition has no acceptedTerms
  log('\nTest 4: Button disabled condition', 'yellow');
  try {
    const fs = require('fs');
    const path = require('path');
    const summaryPath = path.join(__dirname, 'frontend', 'src', 'components', 'reservations', 'ReservationSummary.tsx');
    const content = fs.readFileSync(summaryPath, 'utf8');
    
    // Find the Confirm button's disabled attribute
    const confirmButtonMatch = content.match(/onClick={handleConfirm}[\s\S]{0,200}disabled=\{([^}]+)\}/);
    if (confirmButtonMatch) {
      const disabledCondition = confirmButtonMatch[1];
      if (disabledCondition.includes('acceptedTerms')) {
        log(`  ❌ FAIL: Button disabled still includes acceptedTerms`, 'red');
        log(`     Condition: ${disabledCondition}`, 'red');
        results.failed++;
      } else {
        log('  ✅ PASS: Button disabled has NO acceptedTerms check', 'green');
        log(`     Condition: ${disabledCondition}`, 'blue');
        results.passed++;
      }
    } else {
      log('  ⚠️  Could not find Confirm button disabled condition', 'yellow');
      results.failed++;
    }
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }

  // Test 5: Check routes in App.tsx
  log('\nTest 5: Routes in App.tsx', 'yellow');
  try {
    const fs = require('fs');
    const path = require('path');
    const appPath = path.join(__dirname, 'frontend', 'src', 'App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');
    
    const simpleRoute = content.includes('path="/reservations"') && content.includes('<SimpleReservationPage />');
    const multiRoute = content.includes('path="/reservations/new"') && content.includes('<ReservationPage />');
    
    if (simpleRoute && multiRoute) {
      log('  ✅ PASS: Both routes exist in App.tsx', 'green');
      log('     /reservations → SimpleReservationPage', 'blue');
      log('     /reservations/new → ReservationPage', 'blue');
      results.passed++;
    } else {
      log('  ❌ FAIL: Routes missing', 'red');
      if (!simpleRoute) log('     Missing: /reservations route', 'red');
      if (!multiRoute) log('     Missing: /reservations/new route', 'red');
      results.failed++;
    }
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }

  // Final Summary
  console.log('\n' + '='.repeat(80));
  log('📊 FINAL RESULTS', 'cyan');
  console.log('='.repeat(80));
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nTests Passed: ${results.passed}/${results.total} (${passRate}%)`, results.passed === results.total ? 'green' : 'yellow');
  
  if (results.passed === results.total) {
    log('\n🎉 ALL TESTS PASSED! The fixes are correct!', 'green');
    log('\n✅ What was fixed:', 'cyan');
    log('  1. ReservationSummary handleConfirm - Removed acceptedTerms check', 'green');
    log('  2. SimpleReservationPage - Added complete onSubmit handler', 'green');
    log('  3. acceptedTerms useState - Set to true by default', 'green');
    log('  4. Button disabled - No longer checks acceptedTerms', 'green');
    log('  5. Routes - Both simple and multi-step routes configured', 'green');
    
    log('\n🧪 Next Steps for User:', 'cyan');
    log('  1. Open INCOGNITO window (Ctrl + Shift + N)', 'yellow');
    log('  2. Go to http://localhost:3000/reservations', 'yellow');
    log('  3. Fill the form and submit', 'yellow');
    log('  4. Button should be YELLOW (not gray) and clickable', 'yellow');
    log('  5. Should redirect to confirmation page after submit', 'yellow');
  } else {
    log('\n⚠️  SOME TESTS FAILED - Check the errors above', 'yellow');
    log(`   Failed: ${results.failed} tests`, 'red');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

verifyFixes().catch(console.error);

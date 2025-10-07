/**
 * Script to add print functionality to Kitchen View
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'orders', 'KitchenViewPage.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import statement after orderService imports
if (!content.includes('printKitchenReceipt')) {
  content = content.replace(
    "import type { Order } from '../../services/orderService';",
    "import type { Order } from '../../services/orderService';\nimport { printKitchenReceipt } from '../../utils/printReceipt';"
  );
  console.log('✅ Added print utility import');
} else {
  console.log('⏭️  Print import already exists');
}

// 2. Add print button in action buttons section
// Find the section with "Ready for Serving" button and add print button after it
const readyButtonPattern = /Ready for Serving\s*<\/Button>\s*<\/?\w*>\s*<\/div>/;

if (content.match(readyButtonPattern) && !content.includes('Print Order')) {
  content = content.replace(
    readyButtonPattern,
    `Ready for Serving
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => printKitchenReceipt(order)}
                    size="sm"
                  >
                    🖨️ Print Order
                  </Button>
                </div>`
  );
  console.log('✅ Added print button');
} else if (content.includes('Print Order')) {
  console.log('⏭️  Print button already exists');
} else {
  console.error('❌ Could not find button insertion point');
}

// Write the modified content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Kitchen View updated successfully!');

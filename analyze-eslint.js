const fs = require('fs');

const data = JSON.parse(fs.readFileSync('eslint-results.json', 'utf8'));
let totalErrors = 0;
let totalWarnings = 0;
let filesWithProblems = [];
let allProblems = [];

data.forEach(f => {
  const errors = f.errorCount || 0;
  const warnings = f.warningCount || 0;
  totalErrors += errors;
  totalWarnings += warnings;

  if (errors > 0 || warnings > 0) {
    const shortPath = f.filePath.replace(/^.*FORTHEWEEBS[\\/]/, '');
    filesWithProblems.push({
      path: shortPath,
      errors,
      warnings,
      messages: f.messages || []
    });

    // Collect all problem details
    (f.messages || []).forEach(msg => {
      allProblems.push({
        file: shortPath,
        line: msg.line,
        column: msg.column,
        severity: msg.severity === 2 ? 'error' : 'warning',
        message: msg.message,
        ruleId: msg.ruleId
      });
    });
  }
});

console.log('=== ESLINT ANALYSIS SUMMARY ===\n');
console.log('Total Errors:', totalErrors);
console.log('Total Warnings:', totalWarnings);
console.log('Total Problems:', totalErrors + totalWarnings);
console.log('Files with problems:', filesWithProblems.length);

console.log('\n=== TOP 30 FILES WITH MOST PROBLEMS ===\n');
filesWithProblems
  .sort((a, b) => (b.errors + b.warnings) - (a.errors + a.warnings))
  .slice(0, 30)
  .forEach((f, idx) => {
    console.log(`${idx + 1}. ${f.path}`);
    console.log(`   Errors: ${f.errors}, Warnings: ${f.warnings}, Total: ${f.errors + f.warnings}`);
  });

console.log('\n=== MOST COMMON ISSUES (Top 20) ===\n');
const ruleCounts = {};
allProblems.forEach(p => {
  if (p.ruleId) {
    ruleCounts[p.ruleId] = (ruleCounts[p.ruleId] || 0) + 1;
  }
});

Object.entries(ruleCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([rule, count], idx) => {
    console.log(`${idx + 1}. ${rule}: ${count} occurrences`);
  });

// Save detailed report
fs.writeFileSync('eslint-detailed-report.json', JSON.stringify({
  summary: {
    totalErrors,
    totalWarnings,
    totalProblems: totalErrors + totalWarnings,
    filesWithProblems: filesWithProblems.length
  },
  filesWithProblems: filesWithProblems.slice(0, 50),
  commonIssues: Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]).slice(0, 30)
}, null, 2));

console.log('\n=== Detailed report saved to eslint-detailed-report.json ===');

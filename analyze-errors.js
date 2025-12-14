const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf-8'));
const filesWithErrors = data.filter(f => f.errorCount > 0);
console.log(`Files with errors: ${filesWithErrors.length}\n`);
filesWithErrors.forEach(f => {
  console.log(f.filePath.replace('C:\\Users\\polot\\Desktop\\FORTHEWEEBS\\', ''));
  f.messages.filter(m => m.severity === 2).forEach(m => {
    console.log(`  ${m.line}:${m.column} ${m.message} [${m.ruleId}]`);
  });
  console.log('');
});

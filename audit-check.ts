import fs from 'fs';

const report = JSON.parse(fs.readFileSync('audit-report.json', 'utf-8'));
if (report.metadata.vulnerabilities.total > 0) {
  console.warn('Security issues found!');
}

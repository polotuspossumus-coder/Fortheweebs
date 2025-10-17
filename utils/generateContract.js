const fs = require('fs');
const markdownpdf = require('markdown-pdf');

function generateContract(creatorName, tier) {
  const md = `# Creator Agreement\n\n**Name:** ${creatorName}\n**Tier:** ${tier}\n\nBy uploading, you agree to the remix lineage and validator memory protocols.`;
  const filePath = `contracts/${creatorName}-${Date.now()}.pdf`;
  fs.writeFileSync('temp.md', md);
  markdownpdf()
    .from('temp.md')
    .to(filePath, () => fs.unlinkSync('temp.md'));
  return filePath;
}

module.exports = generateContract;

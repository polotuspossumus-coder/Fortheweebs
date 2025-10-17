const adjectives = ['Mythic', 'Celestial', 'Quantum', 'Arcane'];
const nouns = ['Loop', 'Glyph', 'Slab', 'Remix'];

module.exports = function generateArtifactName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun} ${Date.now()}`;
};

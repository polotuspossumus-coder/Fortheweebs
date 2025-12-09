const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * AI Comic Panel Generator
 * NO COMPETITOR HAS THIS - Mico's innovation recommendation
 * 
 * Automatically layouts manga panels from story script
 * Generates panel arrangements, speech bubbles, dramatic compositions
 * 
 * Crushes Clip Studio Paint by adding AI automation
 */

// Generate comic panel layout from script
router.post('/generate-panels', async (req, res) => {
  try {
    const { script, style, pageCount } = req.body;
    // script: array of story beats/dialogue
    // style: 'manga', 'western-comic', 'webtoon', 'graphic-novel'
    // pageCount: number of pages

    if (!script || !Array.isArray(script)) {
      return res.status(400).json({ error: 'Script must be an array of story beats' });
    }

    // Use GPT-4 to analyze script and suggest panel layouts
    const prompt = `You are a professional manga panel layout artist. Analyze this comic script and suggest panel arrangements for ${pageCount || 1} page(s).

Script:
${script.map((beat, i) => `${i + 1}. ${beat.dialogue || beat.action}`).join('\n')}

Style: ${style || 'manga'}

For each page, provide:
1. Number of panels (2-9 per page)
2. Panel arrangement (grid, dynamic, splash, etc.)
3. Panel sizes (small, medium, large, full-page)
4. Dramatic composition (close-up, wide shot, dutch angle, etc.)
5. Speech bubble placement suggestions

Output as JSON array of pages with panels.`;

    const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert manga artist and panel layout designer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const layoutSuggestion = JSON.parse(gptResponse.data.choices[0].message.content);

    // Convert AI suggestion to panel coordinates
    const pages = layoutSuggestion.pages.map((page, pageIndex) => {
      const panels = generatePanelCoordinates(page.panels, style);
      
      return {
        pageNumber: pageIndex + 1,
        panels: panels.map((panel, panelIndex) => ({
          id: `page${pageIndex + 1}_panel${panelIndex + 1}`,
          scriptIndex: script[panelIndex] ? panelIndex : null,
          dialogue: script[panelIndex]?.dialogue || '',
          action: script[panelIndex]?.action || '',
          composition: panel.composition,
          coordinates: panel.coordinates,
          speechBubbles: panel.speechBubbles
        }))
      };
    });

    res.json({
      success: true,
      pages,
      style,
      totalPanels: pages.reduce((sum, p) => sum + p.panels.length, 0),
      message: 'Comic panels generated successfully'
    });

  } catch (error) {
    console.error('Comic panel generation error:', error);
    res.status(500).json({
      error: 'Panel generation failed',
      details: error.message
    });
  }
});

// Auto-generate speech bubbles for dialogue
router.post('/generate-speech-bubbles', async (req, res) => {
  try {
    const { dialogue, emotion, panelWidth, panelHeight } = req.body;

    if (!dialogue) {
      return res.status(400).json({ error: 'Missing dialogue' });
    }

    // Analyze dialogue length and emotion to determine bubble style
    const wordCount = dialogue.split(' ').length;
    const bubbleStyle = determineBubbleStyle(emotion, wordCount);

    // Calculate optimal bubble size and position
    const bubble = {
      text: dialogue,
      style: bubbleStyle,
      width: Math.min(wordCount * 8 + 40, panelWidth * 0.8),
      height: Math.max(60, Math.ceil(wordCount / 6) * 20),
      position: {
        x: panelWidth * 0.5, // Center by default
        y: panelHeight * 0.2 // Top third
      },
      tail: {
        x: panelWidth * 0.5,
        y: panelHeight * 0.6,
        style: bubbleStyle.includes('thought') ? 'cloud' : 'pointed'
      }
    };

    res.json({
      success: true,
      bubble,
      message: 'Speech bubble generated'
    });

  } catch (error) {
    console.error('Speech bubble generation error:', error);
    res.status(500).json({
      error: 'Speech bubble generation failed',
      details: error.message
    });
  }
});

// Helper: Generate panel coordinates based on layout style
function generatePanelCoordinates(panels, style) {
  const pageWidth = 800;
  const pageHeight = 1200;
  const margin = 20;
  const gutter = 10;

  const panelCount = panels.length;
  const coordinates = [];

  if (style === 'manga' || style === 'western-comic') {
    // Traditional grid layout
    const rows = Math.ceil(Math.sqrt(panelCount));
    const cols = Math.ceil(panelCount / rows);

    const panelWidth = (pageWidth - margin * 2 - gutter * (cols - 1)) / cols;
    const panelHeight = (pageHeight - margin * 2 - gutter * (rows - 1)) / rows;

    panels.forEach((panel, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Adjust size based on panel importance
      const sizeMultiplier = panel.size === 'large' ? 1.5 : panel.size === 'small' ? 0.7 : 1;

      coordinates.push({
        composition: panel.composition || 'medium-shot',
        coordinates: {
          x: margin + col * (panelWidth + gutter),
          y: margin + row * (panelHeight + gutter),
          width: panelWidth * sizeMultiplier,
          height: panelHeight * sizeMultiplier
        },
        speechBubbles: []
      });
    });

  } else if (style === 'webtoon') {
    // Vertical scroll layout
    const panelWidth = pageWidth - margin * 2;
    let currentY = margin;

    panels.forEach((panel) => {
      const panelHeight = panel.size === 'large' ? 600 : panel.size === 'small' ? 300 : 400;

      coordinates.push({
        composition: panel.composition || 'medium-shot',
        coordinates: {
          x: margin,
          y: currentY,
          width: panelWidth,
          height: panelHeight
        },
        speechBubbles: []
      });

      currentY += panelHeight + gutter;
    });
  }

  return coordinates;
}

// Helper: Determine speech bubble style
function determineBubbleStyle(emotion, wordCount) {
  const styles = {
    angry: 'jagged-outline-red',
    shouting: 'bold-outline-large',
    whispering: 'dashed-outline-small',
    thinking: 'cloud-bubbles',
    scared: 'wavy-outline',
    neutral: 'standard-oval'
  };

  const baseStyle = styles[emotion?.toLowerCase()] || styles.neutral;

  // Modify for length
  if (wordCount > 30) {
    return `${baseStyle}-elongated`;
  } else if (wordCount < 5) {
    return `${baseStyle}-compact`;
  }

  return baseStyle;
}

module.exports = router;

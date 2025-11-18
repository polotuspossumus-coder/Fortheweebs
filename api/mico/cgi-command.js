const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Mico CGI Command Handler
 * Converts natural language to CGI effect actions
 */
module.exports = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Use Claude to parse the command
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a CGI effects control assistant. Parse natural language commands into structured actions.

Available effects:
- grayscale, brightness, colortint, neonglow, vintage, pixelate
- blur, vignette
- textoverlay, lowerthird, emojireaction
- floatingcube, particleexplosion, glowingring, floatinghearts, spinningstars
- arglasses, armustache, arhat, animeeyes, facebeautify, smartblur

Available actions:
- add_effect: Add a new effect
- remove_effect: Remove an effect
- toggle_effect: Toggle effect on/off
- adjust_intensity: Change effect intensity (0-1)
- clear_all: Remove all effects
- apply_preset: Apply a preset (professional, fun, anime, retro, minimal)

Return ONLY a JSON object with this structure:
{
  "action": {
    "type": "add_effect|remove_effect|toggle_effect|adjust_intensity|clear_all|apply_preset",
    "effectId": "effect_name",
    "params": { "intensity": 0.5, "presetName": "fun" }
  },
  "message": "Human-friendly confirmation message"
}

If the command is unclear, return:
{
  "error": "Could not understand command",
  "suggestion": "Try: add neon glow, enable blur, remove all effects"
}`,
      messages: [
        {
          role: 'user',
          content: command
        }
      ]
    });

    const responseText = message.content[0].text;
    const result = JSON.parse(responseText);

    res.json(result);

  } catch (error) {
    console.error('CGI command error:', error);
    res.status(500).json({
      error: 'Failed to process command',
      details: error.message
    });
  }
};

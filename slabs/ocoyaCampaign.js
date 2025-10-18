import axios from 'axios';

/**
 * Launches a campaign via Ocoya API.
 * Auto-generates schedule, hashtags, and visuals.
 * Requires OCOYA_TOKEN in environment.
 */
export async function launchCampaign({ title, content, platforms }) {
  const response = await axios.post('https://api.ocoya.com/campaigns', {
    title,
    content,
    platforms,
    schedule: 'auto',
    hashtags: 'auto',
    visuals: 'auto'
  }, {
    headers: { Authorization: `Bearer ${process.env.OCOYA_TOKEN}` }
  });

  return response.data;
}

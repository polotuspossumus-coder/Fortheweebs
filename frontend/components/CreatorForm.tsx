import React, { useState } from 'react';
import { z } from 'zod';
import AccessibleButton from './AccessibleButton';
import FeedbackToast from './FeedbackToast';

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  tier: z.enum(['founder', 'support', 'influencer']),
});

export default function CreatorForm() {
  const [formData, setFormData] = useState({ username: '', email: '', tier: 'founder' });
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      setFeedback('Invalid input. Please check your entries.');
      return;
    }

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setFeedback(data.message || 'Success!');
    } catch (err) {
      setFeedback('Submission failed. Try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Join Fortheweebs</h2>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full mb-2 p-2 border rounded"
      />
      <select
        aria-label="Tier"
        value={formData.tier}
        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="founder">Founder</option>
        <option value="support">Support Crew</option>
        <option value="influencer">Influencer</option>
      </select>
      <AccessibleButton label="Submit" onClick={handleSubmit} />
      {feedback && <FeedbackToast message={feedback} />}
    </div>
  );
}

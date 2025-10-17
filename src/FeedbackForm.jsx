import { useState } from 'react';

function FeedbackForm() {
  const [text, setText] = useState('');
  const submit = () => {
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'currentUser', suggestion: text }),
    });
  };
  return (
    <div>
      <textarea onChange={e => setText(e.target.value)} value={text} />
      <button onClick={submit}>Submit Feedback</button>
    </div>
  );
}

export default FeedbackForm;

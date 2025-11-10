import React, { useState } from 'react';
import './HelpButton.css';

/**
 * Floating help button - Always accessible
 */

const HelpButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    
    switch (action) {
      case 'tutorial':
        if (window.startTutorial) window.startTutorial();
        break;
      case 'help':
        window.open('/help', '_blank');
        break;
      case 'shortcuts':
        if (window.showKeyboardShortcuts) {
          window.showKeyboardShortcuts();
        } else {
          alert('Press Shift+? to view all keyboard shortcuts!');
        }
        break;
      case 'feedback':
        alert('Feedback form coming soon! For now, reach us at support@fortheweebs.com');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button 
        className="help-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Need help?"
      >
        ?
      </button>

      {isMenuOpen && (
        <>
          <div 
            className="help-menu-overlay" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="help-menu">
            <button onClick={() => handleMenuAction('tutorial')}>
              🎓 Start Tutorial
            </button>
            <button onClick={() => handleMenuAction('help')}>
              📚 Help Center
            </button>
            <button onClick={() => handleMenuAction('shortcuts')}>
              ⌨️ Keyboard Shortcuts
            </button>
            <button onClick={() => handleMenuAction('feedback')}>
              💬 Send Feedback
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default HelpButton;

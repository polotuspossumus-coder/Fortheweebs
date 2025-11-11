import React, { useState, useRef } from 'react';

/**
 * Digital Comic Book Creator
 * Features: Panel layouts, speech bubbles, import art, page management, PDF export
 */
export function ComicBookCreator({ userId }) {
  const [pages, setPages] = useState([createNewPage()]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [tool, setTool] = useState('select'); // select, bubble, caption, text
  const [comicTitle, setComicTitle] = useState('Untitled Comic');
  const canvasRef = useRef(null);

  function createNewPage() {
    return {
      id: `page_${Date.now()}_${Math.random()}`,
      layout: 'grid-4', // grid-4, grid-6, custom
      panels: [
        { id: 'p1', x: 0, y: 0, width: 50, height: 50, image: null, bubbles: [] },
        { id: 'p2', x: 50, y: 0, width: 50, height: 50, image: null, bubbles: [] },
        { id: 'p3', x: 0, y: 50, width: 50, height: 50, image: null, bubbles: [] },
        { id: 'p4', x: 50, y: 50, width: 50, height: 50, image: null, bubbles: [] }
      ]
    };
  }

  const LAYOUTS = {
    'grid-4': { name: '4 Panel Grid', icon: '▦' },
    'grid-6': { name: '6 Panel Grid', icon: '▦▦' },
    'splash': { name: 'Splash Page', icon: '🖼️' },
    'vertical': { name: 'Vertical Strip', icon: '▥' },
    'custom': { name: 'Custom Layout', icon: '✏️' }
  };

  const addPage = () => {
    setPages([...pages, createNewPage()]);
    setCurrentPage(pages.length);
  };

  const deletePage = (index) => {
    if (pages.length === 1) {
      alert('Cannot delete the last page!');
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (currentPage >= newPages.length) {
      setCurrentPage(newPages.length - 1);
    }
  };

  const changeLayout = (layout) => {
    const newPages = [...pages];
    const page = { ...newPages[currentPage] };

    if (layout === 'grid-4') {
      page.panels = [
        { id: 'p1', x: 0, y: 0, width: 50, height: 50, image: null, bubbles: [] },
        { id: 'p2', x: 50, y: 0, width: 50, height: 50, image: null, bubbles: [] },
        { id: 'p3', x: 0, y: 50, width: 50, height: 50, image: null, bubbles: [] },
        { id: 'p4', x: 50, y: 50, width: 50, height: 50, image: null, bubbles: [] }
      ];
    } else if (layout === 'grid-6') {
      page.panels = [
        { id: 'p1', x: 0, y: 0, width: 33.33, height: 50, image: null, bubbles: [] },
        { id: 'p2', x: 33.33, y: 0, width: 33.33, height: 50, image: null, bubbles: [] },
        { id: 'p3', x: 66.66, y: 0, width: 33.33, height: 50, image: null, bubbles: [] },
        { id: 'p4', x: 0, y: 50, width: 33.33, height: 50, image: null, bubbles: [] },
        { id: 'p5', x: 33.33, y: 50, width: 33.33, height: 50, image: null, bubbles: [] },
        { id: 'p6', x: 66.66, y: 50, width: 33.33, height: 50, image: null, bubbles: [] }
      ];
    } else if (layout === 'splash') {
      page.panels = [
        { id: 'p1', x: 0, y: 0, width: 100, height: 100, image: null, bubbles: [] }
      ];
    } else if (layout === 'vertical') {
      page.panels = [
        { id: 'p1', x: 0, y: 0, width: 100, height: 25, image: null, bubbles: [] },
        { id: 'p2', x: 0, y: 25, width: 100, height: 25, image: null, bubbles: [] },
        { id: 'p3', x: 0, y: 50, width: 100, height: 25, image: null, bubbles: [] },
        { id: 'p4', x: 0, y: 75, width: 100, height: 25, image: null, bubbles: [] }
      ];
    }

    page.layout = layout;
    newPages[currentPage] = page;
    setPages(newPages);
  };

  const uploadImageToPanel = (panelId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPages = [...pages];
        const page = { ...newPages[currentPage] };
        page.panels = page.panels.map(panel =>
          panel.id === panelId ? { ...panel, image: e.target.result } : panel
        );
        newPages[currentPage] = page;
        setPages(newPages);
      };
      reader.readAsDataURL(file);
    }
  };

  const addBubble = (panelId, type = 'speech') => {
    const newPages = [...pages];
    const page = { ...newPages[currentPage] };
    page.panels = page.panels.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          bubbles: [...panel.bubbles, {
            id: `bubble_${Date.now()}`,
            type, // speech, thought, caption, shout
            text: 'Type text here...',
            x: 50,
            y: 50,
            width: 40,
            height: 30
          }]
        };
      }
      return panel;
    });
    newPages[currentPage] = page;
    setPages(newPages);
  };

  const updateBubbleText = (panelId, bubbleId, text) => {
    const newPages = [...pages];
    const page = { ...newPages[currentPage] };
    page.panels = page.panels.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          bubbles: panel.bubbles.map(bubble =>
            bubble.id === bubbleId ? { ...bubble, text } : bubble
          )
        };
      }
      return panel;
    });
    newPages[currentPage] = page;
    setPages(newPages);
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/export-comic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: comicTitle,
          pages,
          userId
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${comicTitle.replace(/\s+/g, '-')}.pdf`;
        link.click();
      } else {
        alert('PDF export coming soon! For now, save your project as JSON.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('PDF export feature will be available soon!');
    }
  };

  const saveProject = () => {
    const projectData = {
      title: comicTitle,
      pages,
      createdAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${comicTitle.replace(/\s+/g, '-')}.json`;
    link.click();
  };

  const currentPageData = pages[currentPage];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📚 Comic Book Creator
          </h1>

          <input
            type="text"
            value={comicTitle}
            onChange={(e) => setComicTitle(e.target.value)}
            placeholder="Comic Title..."
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              padding: '15px 20px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              width: '100%',
              marginTop: '15px'
            }}
          />
        </div>

        {/* Tools Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button onClick={saveProject} style={toolButtonStyle('#3498db')}>
            💾 Save Project
          </button>
          <button onClick={exportToPDF} style={toolButtonStyle('#e74c3c')}>
            📄 Export PDF
          </button>
          <button onClick={addPage} style={toolButtonStyle('#2ecc71')}>
            ➕ Add Page
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>Layout:</span>
            {Object.entries(LAYOUTS).map(([key, layout]) => (
              <button
                key={key}
                onClick={() => changeLayout(key)}
                style={{
                  ...toolButtonStyle(currentPageData.layout === key ? '#9b59b6' : '#555'),
                  fontSize: '16px'
                }}
              >
                {layout.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
          {/* Canvas Area */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              minHeight: '800px'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '141.4%', // Comic book ratio
                background: 'white',
                border: '3px solid #000'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}>
                  {currentPageData.panels.map((panel) => (
                    <div
                      key={panel.id}
                      onClick={() => setSelectedPanel(panel.id)}
                      style={{
                        position: 'absolute',
                        left: `${panel.x}%`,
                        top: `${panel.y}%`,
                        width: `${panel.width}%`,
                        height: `${panel.height}%`,
                        border: selectedPanel === panel.id ? '4px solid #e74c3c' : '3px solid #000',
                        background: panel.image ? `url(${panel.image})` : '#f8f9fa',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      {!panel.image && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#999',
                          fontSize: '14px'
                        }}>
                          <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🖼️</div>
                            Click to add image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => uploadImageToPanel(panel.id, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      )}

                      {/* Speech Bubbles */}
                      {panel.bubbles.map((bubble) => (
                        <div
                          key={bubble.id}
                          style={{
                            position: 'absolute',
                            left: `${bubble.x}%`,
                            top: `${bubble.y}%`,
                            width: `${bubble.width}%`,
                            height: `${bubble.height}%`,
                            background: 'white',
                            border: '2px solid #000',
                            borderRadius: bubble.type === 'thought' ? '50%' : '20px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            textAlign: 'center',
                            color: '#000',
                            cursor: 'move',
                            boxShadow: bubble.type === 'shout' ? '0 0 0 3px #000' : 'none',
                            fontWeight: bubble.type === 'shout' ? 'bold' : 'normal'
                          }}
                        >
                          <textarea
                            value={bubble.text}
                            onChange={(e) => updateBubbleText(panel.id, bubble.id, e.target.value)}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              background: 'transparent',
                              resize: 'none',
                              fontSize: 'inherit',
                              fontFamily: 'Comic Sans MS, cursive',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      ))}

                      {selectedPanel === panel.id && panel.image && (
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          display: 'flex',
                          gap: '5px'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addBubble(panel.id, 'speech');
                            }}
                            style={panelButtonStyle}
                            title="Add speech bubble"
                          >
                            💬
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addBubble(panel.id, 'thought');
                            }}
                            style={panelButtonStyle}
                            title="Add thought bubble"
                          >
                            💭
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addBubble(panel.id, 'caption');
                            }}
                            style={panelButtonStyle}
                            title="Add caption"
                          >
                            📝
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addBubble(panel.id, 'shout');
                            }}
                            style={panelButtonStyle}
                            title="Add shout"
                          >
                            ❗
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Page Navigator */}
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '20px'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>
                📖 Pages ({pages.length})
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    onClick={() => setCurrentPage(index)}
                    style={{
                      background: currentPage === index
                        ? 'rgba(231, 76, 60, 0.3)'
                        : 'rgba(255,255,255,0.1)',
                      border: currentPage === index
                        ? '2px solid #e74c3c'
                        : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      padding: '15px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>Page {index + 1}</strong>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                        {page.panels.length} panels • {LAYOUTS[page.layout]?.name}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                      style={{
                        background: '#e74c3c',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div style={{
              background: 'rgba(46, 204, 113, 0.1)',
              border: '2px solid rgba(46, 204, 113, 0.3)',
              borderRadius: '15px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <h4 style={{ marginBottom: '10px' }}>💡 Quick Tips</h4>
              <ul style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Click panels to select them</li>
                <li>Upload images to panels</li>
                <li>Add speech bubbles with 💬</li>
                <li>Change layouts anytime</li>
                <li>Export to PDF when done!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const toolButtonStyle = (color) => ({
  background: color,
  border: 'none',
  padding: '12px 24px',
  borderRadius: '10px',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
});

const panelButtonStyle = {
  background: 'rgba(0,0,0,0.8)',
  border: '2px solid white',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px'
};

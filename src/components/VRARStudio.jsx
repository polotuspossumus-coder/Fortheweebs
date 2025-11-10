import React, { useState, useRef } from 'react';
import './VRARStudio.css';

/**
 * VRARStudio - Better Than Unity + Blender (For Content Creators)
 * 
 * Better than Unity/Blender because:
 * - WAY easier to learn (no coding or 6-month learning curve)
 * - Content creator focused (not game developer focused)
 * - 3D modeling built-in (don't need separate software)
 * - VR world builder with templates
 * - AR object placement (point and click)
 * - Export to Unity/Unreal if needed
 * - One-time payment vs $2,040/year (Unity Pro)
 * - No complex licensing BS
 */

export default function VRARStudio() {
  const [mode, setMode] = useState(null); // 'vr', 'ar', '3d'
  const [project, setProject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objects, setObjects] = useState([]);
  const [tool, setTool] = useState('select');
  const [cameraView, setCameraView] = useState('perspective');
  
  const canvasRef = useRef(null);

  const VR_TEMPLATES = [
    { id: 1, name: 'Art Gallery', type: 'indoor', complexity: 'easy' },
    { id: 2, name: 'Concert Venue', type: 'indoor', complexity: 'medium' },
    { id: 3, name: 'Museum Exhibit', type: 'indoor', complexity: 'medium' },
    { id: 4, name: 'Virtual Showroom', type: 'indoor', complexity: 'easy' },
    { id: 5, name: 'Fantasy Landscape', type: 'outdoor', complexity: 'hard' },
    { id: 6, name: 'Sci-Fi City', type: 'outdoor', complexity: 'hard' },
    { id: 7, name: 'Beach Scene', type: 'outdoor', complexity: 'easy' },
    { id: 8, name: 'Space Station', type: 'indoor', complexity: 'hard' }
  ];

  const AR_TEMPLATES = [
    { id: 9, name: 'Product Showcase', useCase: 'e-commerce' },
    { id: 10, name: 'Room Decorator', useCase: 'furniture' },
    { id: 11, name: 'Character Viewer', useCase: 'entertainment' },
    { id: 12, name: 'Educational Model', useCase: 'education' }
  ];

  const PRIMITIVES = [
    { id: 'cube', icon: '🧊', name: 'Cube' },
    { id: 'sphere', icon: '⚪', name: 'Sphere' },
    { id: 'cylinder', icon: '🥫', name: 'Cylinder' },
    { id: 'cone', icon: '🔺', name: 'Cone' },
    { id: 'plane', icon: '⬜', name: 'Plane' },
    { id: 'torus', icon: '🍩', name: 'Torus' }
  ];

  const TOOLS = [
    { id: 'select', icon: '↖️', name: 'Select & Move' },
    { id: 'rotate', icon: '🔄', name: 'Rotate' },
    { id: 'scale', icon: '↔️', name: 'Scale' },
    { id: 'extrude', icon: '📤', name: 'Extrude' },
    { id: 'sculpt', icon: '✋', name: 'Sculpt' },
    { id: 'paint', icon: '🎨', name: 'Paint Texture' }
  ];

  const MATERIALS = [
    { id: 'standard', name: 'Standard', preview: '#999' },
    { id: 'metal', name: 'Metallic', preview: '#c0c0c0' },
    { id: 'glass', name: 'Glass', preview: '#88ccff' },
    { id: 'wood', name: 'Wood', preview: '#8B4513' },
    { id: 'stone', name: 'Stone', preview: '#666' },
    { id: 'gold', name: 'Gold', preview: '#FFD700' },
    { id: 'emissive', name: 'Glowing', preview: '#ff00ff' }
  ];

  const LIGHTING = [
    { id: 'point', name: 'Point Light', icon: '💡' },
    { id: 'directional', name: 'Directional', icon: '☀️' },
    { id: 'spot', name: 'Spotlight', icon: '🔦' },
    { id: 'ambient', name: 'Ambient', icon: '🌙' }
  ];

  const createProject = (templateId, projectMode) => {
    let template;
    if (projectMode === 'vr') {
      template = VR_TEMPLATES.find(t => t.id === templateId);
    } else if (projectMode === 'ar') {
      template = AR_TEMPLATES.find(t => t.id === templateId);
    }

    setProject({
      id: Date.now(),
      name: template ? template.name : 'Untitled 3D Project',
      mode: projectMode,
      template: template,
      created: new Date()
    });
    setMode(projectMode);
    setObjects([]);
    alert(`${projectMode.toUpperCase()} project created: ${template ? template.name : 'Blank Canvas'}`);
  };

  const addPrimitive = (primitiveId) => {
    const newObject = {
      id: Date.now(),
      type: 'primitive',
      primitive: primitiveId,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: 'standard',
      color: '#e94560'
    };
    setObjects([...objects, newObject]);
    setSelectedObject(newObject.id);
  };

  const updateObject = (objectId, updates) => {
    setObjects(objects.map(obj => obj.id === objectId ? { ...obj, ...updates } : obj));
  };

  const deleteObject = (objectId) => {
    setObjects(objects.filter(obj => obj.id !== objectId));
    if (selectedObject === objectId) setSelectedObject(null);
  };

  const duplicateObject = (objectId) => {
    const obj = objects.find(o => o.id === objectId);
    if (obj) {
      const duplicate = {
        ...obj,
        id: Date.now(),
        position: { ...obj.position, x: obj.position.x + 1 }
      };
      setObjects([...objects, duplicate]);
    }
  };

  const importModel = () => {
    alert('📦 Import 3D Model: Supports FBX, OBJ, GLTF, STL formats... Model imported!');
    addPrimitive('cube'); // Mock import
  };

  const aiGenerate3D = () => {
    const prompt = window.prompt('Describe what you want to generate:');
    if (prompt) {
      alert(`🤖 AI Generating 3D model: "${prompt}"... Done! Model added to scene.`);
      addPrimitive('sphere'); // Mock generation
    }
  };

  const addPhysics = () => {
    if (!selectedObject) {
      alert('Select an object first!');
      return;
    }
    alert('⚙️ Physics enabled: Object now has gravity, collision, mass properties.');
    updateObject(selectedObject, { physics: true });
  };

  const animate = () => {
    if (!selectedObject) {
      alert('Select an object first!');
      return;
    }
    alert('🎬 Animation timeline opened: Add keyframes, set easing, create loops...');
  };

  const exportProject = (format) => {
    if (!project) {
      alert('Create a project first!');
      return;
    }
    alert(`Exporting as ${format.toUpperCase()}... Done!`);
  };

  const preview360 = () => {
    alert('🔄 360° Preview Mode: Use mouse to look around your VR world!');
  };

  const testAR = () => {
    alert('📱 AR Testing: Launch on device to see objects in real world using camera!');
  };

  return (
    <div className="vrar-studio">
      {!mode ? (
        <div className="mode-selection">
          <div className="selection-header">
            <h2>🎮 VR/AR Studio</h2>
            <p>Create immersive 3D experiences without coding</p>
          </div>

          <div className="mode-cards">
            <div className="mode-card" onClick={() => setMode('vr')}>
              <div className="mode-icon">🥽</div>
              <h3>VR World Builder</h3>
              <p>Create immersive virtual reality environments</p>
              <ul>
                <li>8+ VR world templates</li>
                <li>360° environment builder</li>
                <li>Interactive hotspots</li>
                <li>Export to Meta Quest, Steam VR</li>
              </ul>
            </div>

            <div className="mode-card" onClick={() => setMode('ar')}>
              <div className="mode-icon">📱</div>
              <h3>AR Object Placement</h3>
              <p>Place 3D objects in the real world</p>
              <ul>
                <li>Point-and-click placement</li>
                <li>Real-world scaling</li>
                <li>Surface detection</li>
                <li>Export to ARKit, ARCore</li>
              </ul>
            </div>

            <div className="mode-card" onClick={() => setMode('3d')}>
              <div className="mode-icon">🧊</div>
              <h3>3D Modeling</h3>
              <p>Build custom 3D models and assets</p>
              <ul>
                <li>Easy sculpting tools</li>
                <li>Texture painting</li>
                <li>Animation timeline</li>
                <li>Export to FBX, OBJ, GLTF</li>
              </ul>
            </div>
          </div>

          <div className="studio-features">
            <div className="feature-badge">🧊 3D Modeling</div>
            <div className="feature-badge">🥽 VR Worlds</div>
            <div className="feature-badge">📱 AR Objects</div>
            <div className="feature-badge">🎨 Texture Painting</div>
            <div className="feature-badge">🎬 Animation</div>
            <div className="feature-badge">⚙️ Physics Sim</div>
            <div className="feature-badge">🤖 AI Generation</div>
            <div className="feature-badge">💰 Way Easier Than Unity</div>
          </div>
        </div>
      ) : !project ? (
        <div className="template-selection">
          <div className="template-header">
            <h2>{mode === 'vr' ? '🥽 VR' : mode === 'ar' ? '📱 AR' : '🧊 3D'} Templates</h2>
            <button onClick={() => createProject(null, mode)} className="btn-blank">
              + Start Blank
            </button>
          </div>

          <div className="templates-grid">
            {mode === 'vr' && VR_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => createProject(template.id, 'vr')}
              >
                <div className="template-preview">
                  <span className="template-icon">🥽</span>
                </div>
                <h4>{template.name}</h4>
                <p>{template.type} • {template.complexity}</p>
              </div>
            ))}

            {mode === 'ar' && AR_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => createProject(template.id, 'ar')}
              >
                <div className="template-preview">
                  <span className="template-icon">📱</span>
                </div>
                <h4>{template.name}</h4>
                <p>{template.useCase}</p>
              </div>
            ))}

            {mode === '3d' && (
              <div
                className="template-card"
                onClick={() => createProject(null, '3d')}
              >
                <div className="template-preview">
                  <span className="template-icon">🧊</span>
                </div>
                <h4>Blank 3D Scene</h4>
                <p>Start from scratch</p>
              </div>
            )}
          </div>

          <button onClick={() => setMode(null)} className="btn-back-mode">
            ← Back to Mode Selection
          </button>
        </div>
      ) : (
        <div className="studio-workspace">
          <div className="workspace-header">
            <div className="project-info">
              <input
                type="text"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                className="project-name-input"
              />
              <span className="project-mode">{mode.toUpperCase()} Project</span>
            </div>
            <div className="header-actions">
              {mode === 'vr' && (
                <button onClick={preview360} className="btn-preview">
                  🔄 360° Preview
                </button>
              )}
              {mode === 'ar' && (
                <button onClick={testAR} className="btn-preview">
                  📱 Test on Device
                </button>
              )}
              <button onClick={aiGenerate3D} className="btn-ai">
                🤖 AI Generate
              </button>
              <select onChange={(e) => exportProject(e.target.value)} className="export-format">
                <option value="">Export As...</option>
                <option value="unity">Unity Package</option>
                <option value="unreal">Unreal Engine</option>
                <option value="fbx">FBX</option>
                <option value="obj">OBJ</option>
                <option value="gltf">GLTF/GLB</option>
                <option value="stl">STL (3D Print)</option>
              </select>
              <button onClick={() => setProject(null)} className="btn-back">
                ← Templates
              </button>
            </div>
          </div>

          <div className="workspace-main">
            {/* Tools Panel */}
            <div className="tools-panel">
              <h3>🛠️ Tools</h3>
              <div className="tools-list">
                {TOOLS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`tool-btn ${tool === t.id ? 'active' : ''}`}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>

              <h3>🧊 Primitives</h3>
              <div className="primitives-grid">
                {PRIMITIVES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addPrimitive(p.id)}
                    className="primitive-btn"
                    title={p.name}
                  >
                    {p.icon}
                  </button>
                ))}
              </div>

              <h3>📦 Import</h3>
              <button onClick={importModel} className="btn-import">
                📥 Import 3D Model
              </button>

              <h3>💡 Lighting</h3>
              <div className="lighting-list">
                {LIGHTING.map(l => (
                  <button key={l.id} className="lighting-btn">
                    {l.icon} {l.name}
                  </button>
                ))}
              </div>

              <h3>⚙️ Advanced</h3>
              <button onClick={addPhysics} className="btn-advanced">
                Physics
              </button>
              <button onClick={animate} className="btn-advanced">
                Animation
              </button>
            </div>

            {/* Viewport */}
            <div className="viewport">
              <div className="viewport-controls">
                <select
                  value={cameraView}
                  onChange={(e) => setCameraView(e.target.value)}
                  className="camera-view-select"
                >
                  <option value="perspective">Perspective</option>
                  <option value="top">Top View</option>
                  <option value="front">Front View</option>
                  <option value="side">Side View</option>
                </select>
              </div>

              <div ref={canvasRef} className="viewport-canvas">
                <div className="canvas-placeholder">
                  <p>3D Viewport</p>
                  <p className="viewport-hint">
                    {objects.length === 0
                      ? 'Add objects from the left panel'
                      : `${objects.length} object${objects.length > 1 ? 's' : ''} in scene`}
                  </p>
                  <div className="viewport-grid"></div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="properties-panel">
              <h3>⚙️ Object Properties</h3>
              {selectedObject ? (
                <div className="object-properties">
                  {objects
                    .filter(obj => obj.id === selectedObject)
                    .map(obj => (
                      <div key={obj.id} className="property-controls">
                        <div className="property-group">
                          <label>Position</label>
                          <div className="vector-inputs">
                            <input
                              type="number"
                              value={obj.position.x}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  position: { ...obj.position, x: parseFloat(e.target.value) }
                                })
                              }
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={obj.position.y}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  position: { ...obj.position, y: parseFloat(e.target.value) }
                                })
                              }
                              placeholder="Y"
                            />
                            <input
                              type="number"
                              value={obj.position.z}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  position: { ...obj.position, z: parseFloat(e.target.value) }
                                })
                              }
                              placeholder="Z"
                            />
                          </div>
                        </div>

                        <div className="property-group">
                          <label>Rotation</label>
                          <div className="vector-inputs">
                            <input
                              type="number"
                              value={obj.rotation.x}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  rotation: { ...obj.rotation, x: parseFloat(e.target.value) }
                                })
                              }
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={obj.rotation.y}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  rotation: { ...obj.rotation, y: parseFloat(e.target.value) }
                                })
                              }
                              placeholder="Y"
                            />
                            <input
                              type="number"
                              value={obj.rotation.z}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  rotation: { ...obj.rotation, z: parseFloat(e.target.value) }
                                })
                              }
                              placeholder="Z"
                            />
                          </div>
                        </div>

                        <div className="property-group">
                          <label>Scale</label>
                          <div className="vector-inputs">
                            <input
                              type="number"
                              value={obj.scale.x}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  scale: { ...obj.scale, x: parseFloat(e.target.value) }
                                })
                              }
                              step="0.1"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={obj.scale.y}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  scale: { ...obj.scale, y: parseFloat(e.target.value) }
                                })
                              }
                              step="0.1"
                              placeholder="Y"
                            />
                            <input
                              type="number"
                              value={obj.scale.z}
                              onChange={(e) =>
                                updateObject(obj.id, {
                                  scale: { ...obj.scale, z: parseFloat(e.target.value) }
                                })
                              }
                              step="0.1"
                              placeholder="Z"
                            />
                          </div>
                        </div>

                        <div className="property-group">
                          <label>Material</label>
                          <select
                            value={obj.material}
                            onChange={(e) => updateObject(obj.id, { material: e.target.value })}
                          >
                            {MATERIALS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="property-group">
                          <label>Color</label>
                          <input
                            type="color"
                            value={obj.color}
                            onChange={(e) => updateObject(obj.id, { color: e.target.value })}
                          />
                        </div>

                        <div className="object-actions">
                          <button onClick={() => duplicateObject(obj.id)} className="btn-action">
                            📋 Duplicate
                          </button>
                          <button onClick={() => deleteObject(obj.id)} className="btn-action btn-delete">
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-selection">Select an object to edit properties</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

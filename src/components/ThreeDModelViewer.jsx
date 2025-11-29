import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import './ThreeDModelViewer.css';

/**
 * 3D Model Viewer
 * Interactive Three.js viewer for 3D models (GLTF, FBX, OBJ)
 */
export const ThreeDModelViewer = ({ modelUrl, modelType = 'gltf', onLoad, onError }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationIdRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [lighting, setLighting] = useState('studio');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [autoRotate, setAutoRotate] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    initScene();
    loadModel();

    return cleanup;
  }, [modelUrl, modelType]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(backgroundColor);
    }
  }, [backgroundColor]);

  const initScene = () => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Grid
    if (showGrid) {
      const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      scene.add(grid);
    }

    // Lighting
    setupLighting(scene, lighting);

    // Handle window resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  };

  const setupLighting = (scene, preset) => {
    // Remove existing lights safely
    const lightsToRemove = scene.children.filter(child => child instanceof THREE.Light);
    lightsToRemove.forEach(light => scene.remove(light));

    switch (preset) {
      case 'studio':
        // Three-point studio lighting
        const keyLight = new THREE.DirectionalLight(0xffffff, 1);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);

        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambient);
        break;

      case 'outdoor':
        // Sunlight simulation
        const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        scene.add(sunLight);

        const skyAmbient = new THREE.AmbientLight(0x87ceeb, 0.5);
        scene.add(skyAmbient);
        break;

      case 'dramatic':
        // Single strong light
        const spotLight = new THREE.SpotLight(0xffffff, 1.5);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const dimAmbient = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(dimAmbient);
        break;

      case 'neon':
        // Colorful neon lights
        const neonPink = new THREE.PointLight(0xff00ff, 1, 20);
        neonPink.position.set(5, 5, 5);
        scene.add(neonPink);

        const neonBlue = new THREE.PointLight(0x00ffff, 1, 20);
        neonBlue.position.set(-5, 5, -5);
        scene.add(neonBlue);

        const neonAmbient = new THREE.AmbientLight(0x3333ff, 0.2);
        scene.add(neonAmbient);
        break;

      default:
        const defaultLight = new THREE.DirectionalLight(0xffffff, 1);
        defaultLight.position.set(5, 5, 5);
        scene.add(defaultLight);

        const defaultAmbient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(defaultAmbient);
    }
  };

  const loadModel = async () => {
    if (!modelUrl || !sceneRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let loader;
      
      switch (modelType.toLowerCase()) {
        case 'gltf':
        case 'glb':
          loader = new GLTFLoader();
          break;
        case 'fbx':
          loader = new FBXLoader();
          break;
        case 'obj':
          loader = new OBJLoader();
          break;
        default:
          throw new Error(`Unsupported model type: ${modelType}`);
      }

      loader.load(
        modelUrl,
        (object) => {
          // Remove previous model
          if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
          }

          // Get the actual mesh
          const model = object.scene || object;
          modelRef.current = model;

          // Center and scale model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3 / maxDim;
          model.scale.multiplyScalar(scale);

          model.position.x = -center.x * scale;
          model.position.y = -box.min.y * scale;
          model.position.z = -center.z * scale;

          // Enable shadows
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          sceneRef.current.add(model);

          // Store model info
          let vertices = 0;
          let faces = 0;
          model.traverse((child) => {
            if (child.geometry) {
              vertices += child.geometry.attributes.position?.count || 0;
              faces += child.geometry.index 
                ? child.geometry.index.count / 3 
                : (child.geometry.attributes.position?.count || 0) / 3;
            }
          });

          setModelInfo({
            vertices,
            faces: Math.floor(faces),
            size: {
              x: size.x.toFixed(2),
              y: size.y.toFixed(2),
              z: size.z.toFixed(2)
            }
          });

          setLoading(false);
          if (onLoad) onLoad(model);
        },
        (progress) => {
          // Progress callback
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading: ${percent.toFixed(0)}%`);
        },
        (err) => {
          console.error('Model load error:', err);
          setError('Failed to load 3D model');
          setLoading(false);
          if (onError) onError(err);
        }
      );
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message);
      setLoading(false);
      if (onError) onError(err);
    }
  };

  const toggleWireframe = () => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.wireframe = !wireframe;
      }
    });
    setWireframe(!wireframe);
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 2, 5);
      controlsRef.current.reset();
    }
  };

  const takeScreenshot = () => {
    if (!rendererRef.current) return;

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const screenshot = rendererRef.current.domElement.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `3d-model-${Date.now()}.png`;
    link.href = screenshot;
    link.click();
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (rendererRef.current && containerRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  };

  return (
    <div className="threed-model-viewer">
      <div ref={containerRef} className="viewer-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading 3D model...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <p>❌ {error}</p>
          </div>
        )}
      </div>

      <div className="viewer-controls">
        <div className="control-group">
          <button onClick={resetCamera} title="Reset Camera">
            📷 Reset View
          </button>
          <button onClick={toggleWireframe} title="Toggle Wireframe">
            {wireframe ? '🔲 Solid' : '⬛ Wireframe'}
          </button>
          <button onClick={() => setAutoRotate(!autoRotate)} title="Auto Rotate">
            {autoRotate ? '⏸️ Stop' : '🔄 Rotate'}
          </button>
          <button onClick={takeScreenshot} title="Take Screenshot">
            📸 Screenshot
          </button>
        </div>

        <div className="control-group">
          <label>Lighting:</label>
          <select 
            value={lighting} 
            onChange={(e) => {
              setLighting(e.target.value);
              if (sceneRef.current) {
                setupLighting(sceneRef.current, e.target.value);
              }
            }}
          >
            <option value="studio">Studio</option>
            <option value="outdoor">Outdoor</option>
            <option value="dramatic">Dramatic</option>
            <option value="neon">Neon</option>
          </select>
        </div>

        <div className="control-group">
          <label>Background:</label>
          <input 
            type="color" 
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
      </div>

      {modelInfo && (
        <div className="model-info">
          <div className="info-item">
            <span className="label">Vertices:</span>
            <span className="value">{modelInfo.vertices.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Faces:</span>
            <span className="value">{modelInfo.faces.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Size:</span>
            <span className="value">
              {modelInfo.size.x} × {modelInfo.size.y} × {modelInfo.size.z}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDModelViewer;

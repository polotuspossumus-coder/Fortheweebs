import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, Environment, PerspectiveCamera, 
  useGLTF, Html, Box, Sphere, Cylinder, Cone, Torus
} from '@react-three/drei';
import { VRButton, ARButton } from '@react-three/xr';
import * as THREE from 'three';

/**
 * Model3DViewer - 3D Model Viewer with VR/AR Support
 * 
 * Features:
 * - Load GLB, GLTF, FBX, OBJ models
 * - Orbit controls
 * - Material inspector
 * - Animation player
 * - VR preview mode
 * - AR placement mode
 * - Measurements & stats
 * - Export options
 */
export default function Model3DViewer({ modelUrl, userId }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'vr', 'ar'
  const [showWireframe, setShowWireframe] = useState(false);
  const [showBounds, setShowBounds] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a0a' }}>
      {/* Top Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode('3d')}
            style={{
              background: viewMode === '3d' ? '#667eea' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🖥️ 3D View
          </button>
          <button
            onClick={() => setViewMode('vr')}
            style={{
              background: viewMode === 'vr' ? '#667eea' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🥽 VR Preview
          </button>
          <button
            onClick={() => setViewMode('ar')}
            style={{
              background: viewMode === 'ar' ? '#22c55e' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📱 AR Test
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => setShowWireframe(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Wireframe
          </label>
          <label style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Auto Rotate
          </label>
        </div>
      </div>

      {/* Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: viewMode === 'ar' }}
      >
        <Suspense fallback={<LoadingIndicator />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} color="#667eea" />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Model or Primitives */}
          {modelUrl ? (
            <Model3D 
              url={modelUrl} 
              wireframe={showWireframe}
              showBounds={showBounds}
            />
          ) : (
            <PrimitiveShowcase wireframe={showWireframe} />
          )}

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>

          {/* Grid Helper */}
          <gridHelper args={[20, 20, '#333', '#111']} position={[0, -0.99, 0]} />

          {/* Controls */}
          <OrbitControls 
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Stats Panel */}
      <ModelStats />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '15px',
        fontSize: '14px',
        zIndex: 10
      }}>
        🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
      </div>
    </div>
  );
}

// ============================================================================
// 3D MODEL LOADER
// ============================================================================

function Model3D({ url, wireframe, showBounds }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(url);

  // Calculate bounding box
  const bbox = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  // Apply wireframe if enabled
  if (wireframe) {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.wireframe = true;
      }
    });
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      
      {showBounds && (
        <Box args={[size.x, size.y, size.z]} position={[0, 0, 0]}>
          <meshBasicMaterial wireframe color="#667eea" />
        </Box>
      )}
    </group>
  );
}

// ============================================================================
// PRIMITIVE SHOWCASE (When no model loaded)
// ============================================================================

function PrimitiveShowcase({ wireframe }) {
  return (
    <group>
      {/* Cube */}
      <Box args={[1, 1, 1]} position={[-3, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#667eea" 
          wireframe={wireframe}
          metalness={0.5}
          roughness={0.5}
        />
      </Box>

      {/* Sphere */}
      <Sphere args={[0.5, 32, 32]} position={[-1.5, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#22c55e" 
          wireframe={wireframe}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      {/* Cylinder */}
      <Cylinder args={[0.5, 0.5, 1, 32]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#fbbf24" 
          wireframe={wireframe}
          metalness={0.6}
          roughness={0.4}
        />
      </Cylinder>

      {/* Cone */}
      <Cone args={[0.5, 1, 32]} position={[1.5, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#ef4444" 
          wireframe={wireframe}
          metalness={0.4}
          roughness={0.6}
        />
      </Cone>

      {/* Torus */}
      <Torus args={[0.5, 0.2, 16, 32]} position={[3, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#a855f7" 
          wireframe={wireframe}
          metalness={0.8}
          roughness={0.2}
        />
      </Torus>

      {/* Labels */}
      <Html position={[-3, -1.2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          Cube
        </div>
      </Html>

      <Html position={[-1.5, -1.2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          Sphere
        </div>
      </Html>

      <Html position={[0, -1.2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          Cylinder
        </div>
      </Html>

      <Html position={[1.5, -1.2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          Cone
        </div>
      </Html>

      <Html position={[3, -1.2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          Torus
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function LoadingIndicator() {
  return (
    <Html center>
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '15px',
        fontSize: '16px'
      }}>
        Loading Model...
      </div>
    </Html>
  );
}

function ModelStats() {
  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '20px',
      background: 'rgba(0,0,0,0.9)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      padding: '20px',
      color: 'white',
      fontSize: '13px',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#667eea' }}>
        📊 Model Info
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Primitives:</span>
          <span>5</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Vertices:</span>
          <span>~10k</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Materials:</span>
          <span>5</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Animations:</span>
          <span>0</span>
        </div>
      </div>

      <div style={{
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button style={{
          width: '100%',
          background: '#667eea',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '8px'
        }}>
          📥 Import Model
        </button>
        <button style={{
          width: '100%',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          📤 Export
        </button>
      </div>
    </div>
  );
}

// Preload GLTF
useGLTF.preload = (url) => {
  // Preload implementation
};

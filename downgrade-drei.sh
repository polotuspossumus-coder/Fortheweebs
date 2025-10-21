#!/bin/bash

echo "🔧 Downgrading @react-three/drei for React 18 compatibility..."

# Remove current drei version
npm uninstall @react-three/drei --force

# Install compatible version
npm install @react-three/drei@9.56.14 --legacy-peer-deps

# Verify install
npm ls @react-three/drei

echo "✅ Downgrade complete. Ready to redeploy."

# 3D Assets Directory

This directory contains all 3D illustration assets for the Oval app.

## Structure

```
assets/3d/
├── characters/     # 3D character models
├── objects/        # Sports equipment and objects
├── scenes/        # Complete scene compositions
├── icons/         # 3D icon assets
└── animations/    # Animation files
```

## Design Principles

- **Modular**: Assets are designed to be reusable across different contexts
- **Consistent Style**: All assets follow the same visual language
- **Optimized**: Assets are optimized for mobile performance
- **Scalable**: Assets work across different screen sizes

## File Formats

- **Models**: GLTF/GLB (recommended), OBJ, FBX
- **Textures**: PNG, JPG
- **Animations**: GLTF animations

## Usage

3D assets are integrated into the app using Expo GL and Three.js. See `frontend/src/components/3D/ThreeDScene.tsx` for implementation examples.

## Brand Guidelines

- Playful and friendly personality
- Minimal, neutral UI as canvas
- Expressive 3D visuals as primary brand primitives
- Consistent color palette
- Modular and reusable across marketing, product UI, and content channels

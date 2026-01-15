import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Image as SkiaImage, useImage, ColorMatrix } from '@shopify/react-native-skia';
import { Asset } from 'expo-asset';

interface InvertedImageProps {
  source: any;
  style?: any;
  opacity?: number;
}

// Color matrix for inversion: inverts RGB while keeping alpha
// Matrix format is 4x5 (RGBA + offset)
const INVERT_MATRIX = [
  -1, 0, 0, 0, 1,   // Red: -R + 1
  0, -1, 0, 0, 1,   // Green: -G + 1
  0, 0, -1, 0, 1,   // Blue: -B + 1
  0, 0, 0, 1, 0,    // Alpha: unchanged
];

export function InvertedImage({ source, style, opacity = 0.4 }: InvertedImageProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Resolve the asset to get the URI
  const asset = Asset.fromModule(source);
  const image = useImage(asset.localUri || asset.uri);

  if (!image) {
    return <View style={[styles.container, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <Canvas style={styles.canvas}>
        <SkiaImage
          image={image}
          fit="cover"
          x={0}
          y={0}
          width={screenWidth}
          height={screenHeight}
          opacity={opacity}
        >
          <ColorMatrix matrix={INVERT_MATRIX} />
        </SkiaImage>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});

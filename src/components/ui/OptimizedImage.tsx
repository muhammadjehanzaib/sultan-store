/**
 * Optimized Image Component
 * Handles proper URL formatting and fallbacks for Next.js Image optimization
 */

'use client';

import React from 'react';
import NextImage, { ImageProps } from 'next/image';

// Helper function to normalize image URLs
const normalizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  
  // Add leading slash for relative paths
  return `/${url}`;
};

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  enableCache?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc = '/images/placeholder-product.svg',
  enableCache = true,
  alt,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(() => normalizeImageUrl(src));

  // Update currentSrc when src prop changes
  React.useEffect(() => {
    setCurrentSrc(normalizeImageUrl(src));
    setImageError(false);
  }, [src]);

  const handleError = React.useCallback(() => {
    if (!imageError && fallbackSrc) {
      setImageError(true);
      setCurrentSrc(normalizeImageUrl(fallbackSrc));
    }
  }, [imageError, fallbackSrc]);

  const imageProps: ImageProps = {
    src: currentSrc,
    alt,
    onError: handleError,
    ...props,
  };

  // Add cache optimization headers if enabled
  if (enableCache && !imageError) {
    imageProps.quality = imageProps.quality || 85;
    imageProps.placeholder = imageProps.placeholder || 'blur';
    imageProps.blurDataURL = imageProps.blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }

  return <NextImage {...imageProps} />;
};

// Convenience wrapper for product images
export const ProductImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    fallbackSrc="/images/placeholder-product.svg"
    sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
  />
);

// Convenience wrapper for logos
export const LogoImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    fallbackSrc="/logos/logo-english.png"
    sizes={props.sizes || "(max-width: 768px) 100px, 150px"}
  />
);

export default OptimizedImage;

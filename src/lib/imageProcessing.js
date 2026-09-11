export const LISTING_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_LISTING_IMAGES = 8;
export const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error(`Could not read ${file.name}.`));
  };
  image.src = url;
});

const canvasBlob = (image, maxDimension, quality) => new Promise((resolve, reject) => {
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    reject(new Error('Your browser could not prepare this image.'));
    return;
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image compression failed.')), 'image/webp', quality);
});

export function validateListingFiles(files, currentCount = 0) {
  if (currentCount + files.length > MAX_LISTING_IMAGES) return `A listing can have up to ${MAX_LISTING_IMAGES} images.`;
  const invalidType = files.find((file) => !LISTING_IMAGE_TYPES.includes(file.type));
  if (invalidType) return 'Use JPG, PNG, or WebP images only.';
  const oversized = files.find((file) => file.size > MAX_SOURCE_IMAGE_BYTES);
  if (oversized) return 'Each original image must be smaller than 12 MB.';
  return '';
}

export async function optimizeListingImage(file) {
  const image = await loadImage(file);
  if (image.naturalWidth < 700 || image.naturalHeight < 500) {
    throw new Error(`${file.name} is too small. Use an image at least 700 × 500 pixels.`);
  }

  let full = await canvasBlob(image, 2400, 0.9);
  if (full.size > 4.5 * 1024 * 1024) full = await canvasBlob(image, 2000, 0.84);
  if (full.size > 4.5 * 1024 * 1024) full = await canvasBlob(image, 1600, 0.78);
  const thumbnail = await canvasBlob(image, 560, 0.82);
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 45) || 'listing';

  return {
    full: new File([full], `${baseName}.webp`, { type: 'image/webp' }),
    thumbnail: new File([thumbnail], `${baseName}-thumb.webp`, { type: 'image/webp' }),
  };
}

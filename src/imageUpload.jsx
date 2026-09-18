import imageCompression from 'browser-image-compression';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const isGifFile = (file) => {
  if (!file) return false;
  return file.type === 'image/gif' || /\.gif$/i.test(file.name || '');
};

const optimizeImage = async (file) => {
  if (!file) return file;

  // IMPORTANTE:
  // GIF animado não pode passar pela compressão,
  // senão perde a animação.
  if (isGifFile(file)) {
    return file;
  }

  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    return file;
  }
};

export const uploadSingleImage = async (file, path) => {
  if (!(file instanceof File)) {
    throw new Error('Arquivo inválido para upload.');
  }

  const storageRef = ref(storage, path);
  const finalFile = await optimizeImage(file);

  await uploadBytes(storageRef, finalFile, {
    contentType: finalFile.type || file.type || 'application/octet-stream',
    cacheControl: 'public,max-age=31536000',
  });

  const url = await getDownloadURL(storageRef);

  return {
    url,
    path: storageRef.fullPath,
  };
};

export const uploadMultipleImages = async (files, basePath) => {
  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const fileName = `${Date.now()}-${index}-${file.name}`;
      const fullPath = `${basePath}/${fileName}`;
      return uploadSingleImage(file, fullPath);
    })
  );

  return uploads;
};
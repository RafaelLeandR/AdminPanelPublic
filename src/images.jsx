import React, { useCallback, useMemo, useState } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  TextField,
} from '@mui/material';
import { useInput } from 'react-admin';

export const IMAGE_TYPES = {
  banner: { width: 1920, height: 770 },
  product: { width: 600, height: 800 },
  logo: {width: 2500, height: 720},
};

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

function dataURLToFile(dataUrl, fileName = 'image.jpg') {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
}

async function getCroppedImg(imageSrc, pixelCrop, outputWidth, outputHeight) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

async function resizeAndCropFile(file, type = 'product', croppedAreaPixels) {
  const { width, height } = IMAGE_TYPES[type] || IMAGE_TYPES.product;
  const imageUrl = URL.createObjectURL(file);

  try {
    const croppedDataUrl = await getCroppedImg(
      imageUrl,
      croppedAreaPixels,
      width,
      height
    );

    const newFile = dataURLToFile(
      croppedDataUrl,
      file.name.replace(/\.\w+$/, '.jpg')
    );

    return {
      rawFile: newFile,
      src: URL.createObjectURL(newFile),
      title: newFile.name,
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function ImageCropDialog({
  open,
  imageFile,
  type = 'product',
  onClose,
  onConfirm,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const imageSrc = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

  const aspectConfig = IMAGE_TYPES[type] || IMAGE_TYPES.product;
  const aspect = aspectConfig.width / aspectConfig.height;

  const onCropComplete = useCallback((_, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const handleConfirm = async () => {
    if (!imageFile || !croppedAreaPixels) return;
    const finalImage = await resizeAndCropFile(imageFile, type, croppedAreaPixels);
    onConfirm(finalImage);
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Ajustar imagem</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Arraste a imagem para posicionar o corte.
          Tamanho final: {aspectConfig.width}x{aspectConfig.height}
        </Typography>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 400,
            background: '#222',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Zoom</Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Usar imagem
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export function BannerCarouselInput({
  source,
  label,
  type = 'banner',
}) {
  const {
    field: { value, onChange },
  } = useInput({ source });

  const [open, setOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const currentImages = Array.isArray(value) ? value : [];

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setPendingFile(files[0]);
    setOpen(true);
  };

  const handleConfirm = (croppedImage) => {
    onChange([
      ...currentImages,
      {
        ...croppedImage,
        link: '',
      },
    ]);

    setOpen(false);
    setPendingFile(null);
  };

  const handleRemove = (indexToRemove) => {
    const updated = currentImages.filter((_, index) => index !== indexToRemove);
    onChange(updated);
  };

  const handleLinkChange = (indexToUpdate, newLink) => {
    const updated = currentImages.map((item, index) =>
      index === indexToUpdate
        ? { ...item, link: newLink }
        : item
    );
    onChange(updated);
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      <Button variant="outlined" component="label">
        Selecionar banner
        <input
          hidden
          accept="image/*"
          type="file"
          onChange={handleFileChange}
        />
      </Button>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        {currentImages.map((img, index) => (
          <Box
            key={index}
            sx={{
              width: 240,
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <img
              src={img?.src || img}
              alt="preview"
              style={{
                width: '100%',
                height: 120,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />

            <TextField
              label="Link do banner"
              size="small"
              fullWidth
              value={img?.link || ''}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              placeholder="https://..."
            />

            <Button
              color="error"
              size="small"
              onClick={() => handleRemove(index)}
            >
              Remover
            </Button>
          </Box>
        ))}
      </Box>

      <ImageCropDialog
        open={open}
        imageFile={pendingFile}
        type={type}
        onClose={() => {
          setOpen(false);
          setPendingFile(null);
        }}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}
export function CroppedImageInput({
  source,
  label,
  type = 'product',
  multiple = false,
}) {
  const {
    field: { value, onChange },
  } = useInput({ source });

  const [open, setOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const currentImages = multiple
    ? Array.isArray(value) ? value : []
    : value ? [value] : [];

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (multiple) {
      setPendingFile(files[0]);
      setOpen(true);
    } else {
      setPendingFile(files[0]);
      setOpen(true);
    }
  };

  const handleConfirm = (croppedImage) => {
    if (multiple) {
      onChange([...(currentImages || []), croppedImage]);
    } else {
      onChange(croppedImage);
    }

    setOpen(false);
    setPendingFile(null);
  };

  const handleRemove = (indexToRemove) => {
    if (multiple) {
      const updated = currentImages.filter((_, index) => index !== indexToRemove);
      onChange(updated);
    } else {
      onChange(null);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      <Button variant="outlined" component="label">
        Selecionar imagem
        <input
          hidden
          accept="image/*"
          type="file"
          multiple={multiple}
          onChange={handleFileChange}
        />
      </Button>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        {currentImages.map((img, index) => (
          <Box
            key={index}
            sx={{
              width: 140,
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 1,
            }}
          >
            <img
              src={img?.src || img}
              alt="preview"
              style={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
            <Button
              color="error"
              size="small"
              onClick={() => handleRemove(index)}
              sx={{ mt: 1 }}
            >
              Remover
            </Button>
          </Box>
        ))}
      </Box>

      <ImageCropDialog
        open={open}
        imageFile={pendingFile}
        type={type}
        onClose={() => {
          setOpen(false);
          setPendingFile(null);
        }}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}
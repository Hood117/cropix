import { useRef, type SyntheticEvent } from "react";
import ReactCrop, {
  convertToPixelCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { initialPercentCrop } from "@/lib/cropImage";

type CropCanvasProps = {
  imageUrl: string;
  crop: Crop | undefined;
  cropKey: number;
  onCropChange: (crop: Crop) => void;
  onPixelCropChange: (pixelCrop: PixelCrop) => void;
  onImageReady: (image: HTMLImageElement) => void;
};

export function CropCanvas({
  imageUrl,
  crop,
  cropKey,
  onCropChange,
  onPixelCropChange,
  onImageReady,
}: CropCanvasProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    imgRef.current = image;
    onImageReady(image);

    const next = initialPercentCrop();
    onCropChange(next);
    onPixelCropChange(convertToPixelCrop(next, image.width, image.height));
  };

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-auto rounded-xl border border-border/80 bg-[#0a0c10] p-3 sm:p-4"
      role="region"
      aria-label="Crop workspace"
    >
      <ReactCrop
        key={cropKey}
        crop={crop}
        onChange={(next) => onCropChange(next)}
        onComplete={(pixelCrop) => onPixelCropChange(pixelCrop)}
        keepSelection
        className="max-h-full max-w-full"
      >
        <img
          key={cropKey}
          src={imageUrl}
          alt="Image ready for cropping"
          onLoad={onImageLoad}
          className="max-h-[calc(100vh-12rem)] max-w-full object-contain"
          draggable={false}
        />
      </ReactCrop>
    </div>
  );
}

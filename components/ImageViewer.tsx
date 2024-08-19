import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { LuCrop, LuCheck } from "react-icons/lu";

import { ImageData } from "@/lib/types";

interface ImageViewerProps {
  image: ImageData;
  onCrop: (croppedImageData: string) => void;
}

export default function ImageViewer({ image, onCrop }: ImageViewerProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [outputSize, setOutputSize] = useState(512);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    size: number
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return "";
    }

    // 设置画布大小为选择的输出尺寸
    canvas.width = size;
    canvas.height = size;

    // 计算缩放比例
    const scale = Math.max(size / pixelCrop.width, size / pixelCrop.height);

    // 计算在画布上绘制的位置，使裁剪区域居中
    const x = (size - pixelCrop.width * scale) / 2;
    const y = (size - pixelCrop.height * scale) / 2;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      x,
      y,
      pixelCrop.width * scale,
      pixelCrop.height * scale
    );

    return canvas.toDataURL("image/jpeg");
  };

  const handleCropClick = useCallback(async () => {
    if (isCropping && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(
          `data:image/jpeg;base64,${image.content}`,
          croppedAreaPixels,
          outputSize
        );

        onCrop(croppedImage.split(",")[1]);
        setIsCropping(false);
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsCropping(true);
    }
  }, [isCropping, croppedAreaPixels, image.content, onCrop, outputSize]);

  return (
    <div className="relative h-[300px]">
      {isCropping ? (
        <>
          <Cropper
            aspect={1}
            crop={crop}
            image={`data:image/jpeg;base64,${image.content}`}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
          />
          <Select
            label="Output Size"
            className="absolute top-2 left-2 w-40"
            value={outputSize.toString()}
            onChange={(e) => setOutputSize(Number(e.target.value))}
          >
            <SelectItem key="512" value="512">
              512x512
            </SelectItem>
            <SelectItem key="1024" value="1024">
              1024x1024
            </SelectItem>
          </Select>
        </>
      ) : (
        <img
          alt={image.name}
          className="w-full h-full object-contain"
          src={`data:image/jpeg;base64,${image.content}`}
        />
      )}
      <Button
        isIconOnly
        aria-label="Crop"
        className="absolute bottom-2 right-2"
        color="primary"
        onClick={handleCropClick}
      >
        {isCropping ? <LuCheck /> : <LuCrop />}
      </Button>
    </div>
  );
}


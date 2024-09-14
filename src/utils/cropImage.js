import { createImage, getCroppedImg } from "react-easy-crop";

export default async function getCroppedImg(imageSrc, crop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x, // Start cropping from X coordinate
    crop.y, // Start cropping from Y coordinate
    crop.width,
    crop.height,
    0, // Place at 0 X of new canvas
    0, // Place at 0 Y of new canvas
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas is empty");
        reject(new Error("Canvas is empty"));
        return;
      }
      const fileUrl = URL.createObjectURL(blob);
      resolve(fileUrl);
    }, "image/jpeg");
  });
}

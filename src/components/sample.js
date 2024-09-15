import React, { useState } from "react";
import { Rnd } from "react-rnd";

const CropShower = () => {
  const [size, setSize] = useState({ width: 200, height: 200 });
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [imageFile, setImageFile] = useState(null); // Store the image file

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleCropSubmit = async () => {
    if (!imageFile) {
      alert("Please upload an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("cropWidth", size.width);
    formData.append("cropHeight", size.height);
    formData.append("x", position.x);
    formData.append("y", position.y);

    const response = await fetch("/api/crop-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.message === "Success") {
      alert("Crop successful! Download the cropped image.");
      window.open(data.downloadLink, "_blank");
    } else {
      alert("Crop failed. Please try again.");
    }
  };

  return (
    <div className="relative">
      <input type="file" onChange={handleFileChange} accept="image/*" />

      {imageFile && (
        <div className="relative inline-block">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="Your Image"
            className="w-full h-auto block"
          />

          <Rnd
            size={{ width: size.width, height: size.height }}
            position={{ x: position.x, y: position.y }}
            onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSize({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
              });
              setPosition(position);
            }}
            bounds="parent"
            style={{
              border: "2px solid blue",
              zIndex: 10,
              background: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white">
              Resize & Move me
            </div>
          </Rnd>
        </div>
      )}

      <button
        onClick={handleCropSubmit}
        className="mt-4 p-2 bg-blue-500 text-white"
      >
        Crop and Submit
      </button>
    </div>
  );
};

export default CropShower;

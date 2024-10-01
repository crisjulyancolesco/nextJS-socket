// /src/components/ImageUploader.js
import React, { useRef } from 'react';
import axios from 'axios';

const ImageUploader = ({ onUpload }) => {
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    const imageFile = fileInputRef.current.files[0]; // Get the uploaded image
    if (!imageFile) {
      onUpload('No image selected.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post('/api/determine-color', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(imageFile);

      // Call the onUpload function with the extracted colors and the image URL
      if (response.data && response.data.colors) {
        onUpload(response.data.colors, imageUrl); // Pass colors and image URL
      } else {
        onUpload('No colors extracted.');
      }
    } catch (error) {
      onUpload('Error connecting to the API');
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ marginBottom: '10px' }}
      />
      <button onClick={handleUpload} style={{ display: 'block', marginBottom: '10px' }}>
        Determine Color
      </button>
    </div>
  );
};

export default ImageUploader;

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import MessageTextarea from '../components/MessageTextarea';
import ImageUploader from '../components/ImageUploader';

const Home = () => {
  const [input, setInput] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  const [colors, setColors] = useState([]); // State for extracted colors
  const [uploadedImage, setUploadedImage] = useState(null); // State for the uploaded image
  const socketRef = useRef(null);

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');

      if (!socketRef.current) {
        socketRef.current = io();

        socketRef.current.on('connect', () => {
          console.log('connected');
        });

        // Listen for real-time input changes
        socketRef.current.on('update-input', (msg) => {
          setInput(msg);
        });

        // Listen for real-time API messages
        socketRef.current.on('api-message', (msg) => {
          setApiMessage((prevMessage) => prevMessage + '\n' + msg);
        });

        // Listen for extracted colors via WebSocket
        socketRef.current.on('colorsExtracted', (data) => {
          setColors(data.colors);
          handleApiMessage(`Colors extracted: ${data.colors.join(', ')}`);
        });
      }
    };

    socketInitializer();

    // Cleanup WebSocket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const onChangeHandler = (e) => {
    setInput(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit('input-change', e.target.value);
    }
  };

  // Append new messages to the API message log
  const handleApiMessage = (message) => {
    setApiMessage((prevMessage) => `${prevMessage}\n${message}`);
  };

  // Handle color extraction result from the ImageUploader
  const handleColorExtraction = (extractedColors, imageUrl) => {
    if (Array.isArray(extractedColors)) {
      setColors(extractedColors); // Set the colors in state
      setUploadedImage(imageUrl); // Set the uploaded image URL
      handleApiMessage(`Colors extracted: ${extractedColors.join(', ')}`);
    } else {
      handleApiMessage(extractedColors); // Handle error messages
    }
  };

  return (
    <div>
      <input
        placeholder="Type something"
        value={input}
        onChange={onChangeHandler}
        style={{ marginBottom: '10px' }}
      />
      <MessageTextarea apiMessage={apiMessage} />
      <ImageUploader onUpload={handleColorExtraction} />

      {/* Display the uploaded image */}
      {uploadedImage && (
        <div style={{ margin: '20px 0' }}>
          <h3>Uploaded Image:</h3>
          <img
            src={uploadedImage}
            alt="Uploaded"
            style={{
              maxWidth: '300px', // Set a max width for the image
              maxHeight: '300px',
              border: '1px solid #ccc',
              marginBottom: '10px',
            }}
          />
        </div>
      )}

      {/* Display extracted colors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
        {colors.map((color, index) => (
          <div key={index} style={{ margin: '5px', textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: color,
                width: '100px',
                height: '100px',
                margin: '5px',
                border: '1px solid #000',
              }}
            />
            <span>{color}</span> {/* Display the hex code of the color */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

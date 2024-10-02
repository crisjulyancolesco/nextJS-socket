import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import Vibrant from 'node-vibrant'; // Use Vibrant for better color palette extraction
import { Server as SocketServer } from 'socket.io';

// Set up multer storage
const storage = multer.diskStorage({
  destination: './uploads', // Specify a directory to store the uploaded images
  filename: (req, file, cb) => cb(null, file.originalname),
});

// Initialize multer
const upload = multer({ storage });

// Initialize the socket.io server
let io;
if (!global.io) {
  io = new SocketServer();
  global.io = io;
} else {
  io = global.io;
}

// Define the API route
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Use multer middleware to handle the file upload
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: `Failed to upload image: ${err.message}` });
      }

      try {
        const filePath = path.resolve('./uploads', req.file.filename); // Path to the uploaded image

        // Resize the image to a manageable size for color extraction
        const resizedImageBuffer = await sharp(filePath)
          .resize(1000, 1000) // Resize to reduce processing time; you can adjust the size
          .toBuffer();

        // Use Vibrant to extract the dominant colors
        const palette = await Vibrant.from(resizedImageBuffer).getPalette();

        // Convert the palette colors to hex
        const colors = Object.values(palette).map(swatch => swatch.getHex()).filter(Boolean); // Filter out null values

        // Emit the colors to connected clients via socket.io
        io.emit('colorsExtracted', { colors });

        // Delete the uploaded image after processing
        fs.unlinkSync(filePath);

        return res.status(200).json({ 
          message: 'Color palette extracted successfully!', 
          colors 
        });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to extract colors from image' });
      }
    });
  } else {
    // Handle unsupported request methods
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file uploads
  },
};

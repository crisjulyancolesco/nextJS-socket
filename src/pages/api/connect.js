// pages/api/connect.js

export default function handler(req, res) {
    if (req.method === 'GET') {
      res.status(200).json({ message: 'Connected' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }
  
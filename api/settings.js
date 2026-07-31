export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return mock settings
    return res.status(200).json({
      settings: {
        theme: 'dark',
        notifications: true,
        autoReplenish: false,
        alertThreshold: 20
      }
    });
  }

  if (req.method === 'POST') {
    // In a real app, save to a database. 
    // Here we just mock the success.
    const newSettings = req.body;
    return res.status(200).json({ success: true, settings: newSettings });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

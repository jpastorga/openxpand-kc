export default function handler(req, res) {
    if (req.method === 'GET') {
      res.status(200).json({ code: req.query?.code });
    } else {
      res.status(405).json({ code: 'Not Allowed' });
    }
}
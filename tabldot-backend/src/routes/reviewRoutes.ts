import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Review listesi' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Review eklendi' });
});

export default router;

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Menu listesi' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Menu eklendi' });
});

export default router;

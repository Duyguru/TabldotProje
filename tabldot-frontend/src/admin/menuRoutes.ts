import { Router } from 'express';
import { createMenu, getMenus } from '../controllers/menuController';

const router = Router();

// POST: Admin yeni menü ekler
router.post('/', createMenu);

// GET: Kullanıcılar menüleri listeler
router.get('/', getMenus);

export default router;
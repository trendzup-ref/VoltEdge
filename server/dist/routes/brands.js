import { Router } from 'express';
import { prisma } from '../prisma.js';
const router = Router();
// GET all brands
router.get('/', async (req, res) => {
    try {
        const { featured } = req.query;
        const where = {};
        if (featured === 'true') {
            where.featured = true;
        }
        const brands = await prisma.brand.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
        res.json({
            success: true,
            data: brands.map((b) => ({
                ...b,
                productCount: b._count.products,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brands' });
    }
});
export default router;

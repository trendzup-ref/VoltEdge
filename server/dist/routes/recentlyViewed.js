import { prisma } from '../prisma.js';
// Record product view for a customer
export async function recordProductView(req, res) {
    try {
        const customer = req.customer;
        const { productId } = req.body;
        if (!customer?.id || !productId) {
            return res.status(400).json({ success: false, message: 'Customer and productId required.' });
        }
        await prisma.recentlyViewedProduct.upsert({
            where: {
                customerId_productId: {
                    customerId: customer.id,
                    productId,
                },
            },
            create: {
                customerId: customer.id,
                productId,
                viewedAt: new Date(),
            },
            update: {
                viewedAt: new Date(),
            },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Record product view error:', error);
        return res.status(500).json({ success: false, message: 'Failed to record product view.' });
    }
}
// Get recently viewed products
export async function getRecentlyViewed(req, res) {
    try {
        const customer = req.customer;
        if (!customer?.id) {
            return res.json({ success: true, products: [] });
        }
        const views = await prisma.recentlyViewedProduct.findMany({
            where: { customerId: customer.id },
            include: {
                product: {
                    include: { brand: true, category: true },
                },
            },
            orderBy: { viewedAt: 'desc' },
            take: 8,
        });
        const products = views.map((v) => v.product);
        return res.json({ success: true, products });
    }
    catch (error) {
        console.error('Get recently viewed error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch recently viewed.' });
    }
}

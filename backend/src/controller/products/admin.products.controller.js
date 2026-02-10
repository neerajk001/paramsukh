import Product from '../../models/product.models.js';
import Shop from '../../models/shop.models.js';

// @desc    Create product (Admin only - Simplified)
// @route   POST /api/products/admin/create
// @access  Admin
export const createProductAdmin = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            images,
            category,
            stock,
            isFeatured = false
        } = req.body;

        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required'
            });
        }

        // Generate slug
        const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

        // Find a default shop for admin products (or the first available shop)
        let shop = await Shop.findOne({ name: 'Admin Shop' });
        if (!shop) {
            // Try to find any shop, or create a dummy one if absolutely necessary
            shop = await Shop.findOne();
            if (!shop) {
                // Return error if no shop exists at all (schema might require it)
                // For now, we'll try to create without it and see if schema allows, 
                // or you might need to create a shop first.
                // Ideally, we should have a system shop.
                console.log('No shop found. Product might validation fail if shop is required.');
            }
        }

        const product = new Product({
            name,
            slug,
            description,
            shortDescription: description ? description.substring(0, 150) : '',
            images: images || [],
            category, // Expecting category ID or name? Schema usually expects ID.
            pricing: {
                originalPrice: price,
                sellingPrice: price,
                discount: 0
            },
            inventory: {
                quantity: stock || 0,
                inStock: (stock || 0) > 0
            },
            shop: shop?._id, // Assign to found shop or undefined
            isFeatured,
            isActive: true,
            specifications: [],
            tags: []
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });

    } catch (error) {
        console.error('Create Product Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/admin/:id
// @access  Admin
export const updateProductAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Handle specific fields mapping to nested structure
        if (updates.price) {
            product.pricing.sellingPrice = updates.price;
            product.pricing.originalPrice = updates.price; // Update both for simplicity
        }

        if (updates.stock !== undefined) {
            product.inventory.quantity = updates.stock;
            product.inventory.inStock = updates.stock > 0;
        }

        // Update top-level fields
        const allowedFields = ['name', 'description', 'images', 'category', 'isFeatured', 'isActive'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                product[field] = updates[field];
            }
        });

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        console.error('Update Product Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/admin/:id
// @access  Admin
export const deleteProductAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete Product Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

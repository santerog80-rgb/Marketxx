
// MozCommerce - Database Module

class DatabaseManager {
    constructor() {
        this.supabase = supabase;
    }

    // Products
    async getProducts(filters = {}) {
        try {
            let query = this.supabase
                .from('products')
                .select(`
                    *,
                    profiles:profiles(name, avatar_url),
                    categories(name)
                `)
                .eq('status', 'active');

            // Apply filters
            if (filters.category) {
                query = query.eq('category_id', filters.category);
            }

            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice);
            }

            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }

            if (filters.province) {
                query = query.eq('province', filters.province);
            }

            // Apply sorting
            if (filters.sort === 'price-asc') {
                query = query.order('price', { ascending: true });
            } else if (filters.sort === 'price-desc') {
                query = query.order('price', { ascending: false });
            } else if (filters.sort === 'rating') {
                query = query.order('average_rating', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + filters.limit - 1);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async getProductById(productId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select(`
                    *,
                    profiles:profiles(name, avatar_url, phone, whatsapp),
                    categories(name)
                `)
                .eq('id', productId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }

    async createProduct(productData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Usu\u00e1rio n\u00e3o autenticado');
            }

            const { data, error } = await this.supabase
                .from('products')
                .insert([{
                    user_id: user.id,
                    title: productData.title,
                    description: productData.description,
                    price: productData.price,
                    category_id: productData.category,
                    subcategory: productData.subcategory,
                    province: productData.province,
                    city: productData.city,
                    images: productData.images,
                    status: 'active',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(productId, productData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .update({
                    ...productData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            const { error } = await this.supabase
                .from('products')
                .update({ status: 'deleted' })
                .eq('id', productId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    async getUserProducts(userId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching user products:', error);
            return [];
        }
    }

    // Categories
    async getCategories() {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    async getCategoryById(categoryId) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .eq('id', categoryId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching category:', error);
            return null;
        }
    }

    // Reviews
    async getProductReviews(productId) {
        try {
            const { data, error } = await this.supabase
                .from('reviews')
                .select(`
                    *,
                    profiles:profiles(name, avatar_url)
                `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    async createReview(reviewData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Usu\u00e1rio n\u00e3o autenticado');
            }

            const { data, error } = await this.supabase
                .from('reviews')
                .insert([{
                    user_id: user.id,
                    product_id: reviewData.productId,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Update product average rating
            await this.updateProductRating(reviewData.productId);

            return data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }

    async updateProductRating(productId) {
        try {
            const { data: reviews } = await this.supabase
                .from('reviews')
                .select('rating')
                .eq('product_id', productId);

            if (reviews && reviews.length > 0) {
                const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
                
                await this.supabase
                    .from('products')
                    .update({ 
                        average_rating: Math.round(average * 10) / 10,
                        review_count: reviews.length
                    })
                    .eq('id', productId);
            }
        } catch (error) {
            console.error('Error updating product rating:', error);
        }
    }

    // User Profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(profileData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Usu\u00e1rio n\u00e3o autenticado');
            }

            const { data, error } = await this.supabase
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Image Upload
    async uploadImage(file, bucket = 'products') {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Usu\u00e1rio n\u00e3o autenticado');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await this.supabase
                .storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = this.supabase
                .storage
                .from(bucket)
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteImage(imagePath, bucket = 'products') {
        try {
            const { error } = await this.supabase
                .storage
                .from(bucket)
                .remove([imagePath]);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    // Search
    async searchProducts(query) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select(`
                    *,
                    profiles:profiles(name, avatar_url),
                    categories(name)
                `)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('status', 'active')
                .limit(50);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    // Helper method to get current user
    async getCurrentUser() {
        const { data: { user } } = await this.supabase.auth.getUser();
        return user;
    }

    // Stats
    async getUserStats(userId) {
        try {
            const [productsResult, reviewsResult] = await Promise.all([
                this.supabase
                    .from('products')
                    .select('id, status')
                    .eq('user_id', userId),
                this.supabase
                    .from('reviews')
                    .select('id')
                    .eq('user_id', userId)
            ]);

            const products = productsResult.data || [];
            const reviews = reviewsResult.data || [];

            return {
                totalProducts: products.length,
                activeProducts: products.filter(p => p.status === 'active').length,
                totalReviews: reviews.length
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return {
                totalProducts: 0,
                activeProducts: 0,
                totalReviews: 0
            };
        }
    }
}

// Initialize database manager
const db = new DatabaseManager();



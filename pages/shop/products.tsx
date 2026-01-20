import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart } from 'lucide-react';
import Spinner from '@/components/Spinner';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  categoryId: number | null;
  categoryName?: string;
  isFeatured: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=PRODUCT');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductImage = (productId: number) => {
    const images = [
      'https://media.gettyimages.com/id/1312226959/photo/empty-packaging-blank-product-showcase.jpg?b=1&s=2048x2048&w=0&k=20&c=2Rla5HIgkPwpZc4Lsb7hPa79LHkPZ8ARb94n2-oqjUM=',
      'https://media.gettyimages.com/id/2247789480/photo/blue-shopping-bags-with-white-handles-3d-render-isolated-on-white-background.jpg?b=1&s=2048x2048&w=0&k=20&c=BfLlPmZQ69IHb0OT9X1btWhwbkg9ZKqnOWPbj8_tC6E=',
      'https://media.gettyimages.com/id/2219143957/photo/white-blank-shopping-bag-mockup-with-black-handles-on-dark-floor-in-front-of-vertical-light.jpg?b=1&s=2048x2048&w=0&k=20&c=UYJ4_JfkFKWWXrk6Pcvb9gL_qv8gaSzDM5-guszEXM4=',
      'https://media.gettyimages.com/id/2236540108/photo/square-facial-sheet-mask-container-with-flip-top-cap-closure-mockup-rectangular-shape-facial.jpg?b=1&s=2048x2048&w=0&k=20&c=afbYvW0J-jAzgt5rGHyJOtbPFSPN7JcY5qb4CMvxMD8=',
      'https://media.gettyimages.com/id/1390312008/photo/flat-lay-pink-empty-paper-shopping-bags-isolated-on-bright-background-3d-render-gift-bags.jpg?b=1&s=2048x2048&w=0&k=20&c=mdigdajRUN4_m6-Rs8EQXtvrv3_IMos_PdMO6zalJ1w=',
      'https://media.gettyimages.com/id/1446198469/photo/mockup-of-a-white-bag-for-coffee-beans-packaging-with-a-degassing-valve-front-side-space-for.jpg?b=1&s=2048x2048&w=0&k=20&c=Jh8MXpbFDWZuhnXi49qSk5Epb603Z-oE1jyGYuiDbFU=',
    ];
    return images[productId % images.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <title>Shop Products</title>
      <meta name="description" content="Browse our collection of products" />

      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-3">Shop Products</h1>
        <p className="text-lg text-muted-foreground">Browse our collection of quality products</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <Link to={`/shop/products/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {product.isFeatured && (
                    <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground font-semibold shadow-lg">
                      Featured
                    </Badge>
                  )}
                  <img
                    src={getProductImage(product.id)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-lg font-bold">
                    <Link to={`/shop/products/${product.id}`} className="hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                  </CardTitle>
                </div>
                {product.categoryName && (
                  <Badge variant="secondary" className="w-fit mt-2 font-medium">
                    {product.categoryName}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {product.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-4 border-t">
                <div className="w-full flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</p>
                      {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                        <p className="text-sm text-muted-foreground line-through">${parseFloat(product.compareAtPrice).toFixed(2)}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-medium">{product.stock} in stock</span>
                      ) : (
                        <span className="text-red-600 font-medium">Out of stock</span>
                      )}
                    </p>
                  </div>
                </div>
                <Link to={`/shop/products/${product.id}`} className="w-full">
                  <Button size="lg" className="w-full font-semibold shadow-md hover:shadow-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

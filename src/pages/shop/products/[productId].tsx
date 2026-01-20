import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import Spinner from '@/components/Spinner';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription?: string | null;
  sku?: string | null;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  categoryId: number | null;
  categoryName?: string;
  isFeatured: boolean;
  isActive: boolean;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        toast.error('Product not found');
        navigate('/shop/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    // Add items one by one to respect quantity
    for (let i = 0; i < quantity; i++) {
      const productImage = getProductImage(product.id);
      addItem({
        productId: product.id,
        variantId: product.id, // Using product ID as variant ID since no variants
        productName: product.name,
        variantName: 'Standard',
        price: product.price,
        image: productImage,
      });
    }

    setAddedToCart(true);
    toast.success('Added to cart!');

    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <title>{product.name}</title>
      <meta name="description" content={product.description || `Shop ${product.name}`} />

      <Button
        variant="ghost"
        onClick={() => navigate('/shop/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-4">
            <img
              src={getProductImage(product.id)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            {product.categoryName && (
              <Badge variant="secondary" className="mb-2">
                {product.categoryName}
              </Badge>
            )}
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-primary">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                <p className="text-xl text-muted-foreground line-through">
                  ${parseFloat(product.compareAtPrice).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {product.description && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Variant Selection */}
          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Quantity
            </label>
            <Select
              value={quantity.toString()}
              onValueChange={(value) => setQuantity(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <Badge variant="default" className="bg-green-600">
                <Check className="mr-1 h-3 w-3" />
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
            <Link to="/cart">
              <Button size="lg" variant="outline">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

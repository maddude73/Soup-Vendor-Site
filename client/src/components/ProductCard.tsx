import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} added to your bowl!`,
    });
  };

  const isSoldOut = product.inventoryCount <= 0;

  return (
    <Link href={`/product/${product.id}`} className="block group h-full" data-testid={`card-product-${product.id}`}>
      <div 
        className="relative h-full bg-card rounded-3xl border border-border/50 shadow-sm transition-all duration-300 hover-elevate flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          {isSoldOut ? (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2 font-bold rotate-12 uppercase tracking-widest border-4">
                Sold Out
              </Badge>
            </div>
          ) : (
             <div className="absolute top-4 right-4">
               <Badge variant="secondary" className="bg-white/90 text-foreground font-bold shadow-md backdrop-blur-md">
                 ${(product.price / 100).toFixed(2)}
               </Badge>
             </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1 font-sans">
                {product.category}
              </p>
              <h3 className="text-xl font-bold font-display text-foreground leading-tight">
                {product.name}
              </h3>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow font-body">
            {product.description}
          </p>

          <Button
            className={`w-full rounded-xl font-semibold ${
              isSoldOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            variant={isHovered ? "default" : "secondary"}
            onClick={isSoldOut ? (e) => e.preventDefault() : handleAddToCart}
            disabled={isSoldOut}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {isSoldOut ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" /> Sold Out
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add to Order
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}

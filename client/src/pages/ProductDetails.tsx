import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const id = parseInt(params?.id || "0");
  const { data: product, isLoading } = useProduct(id);
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const handleAddToCart = () => {
    addItem(product, quantity, specialRequest);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added successfully!`,
    });
  };

  const isSoldOut = product.inventoryCount <= 0;

  return (
    <div className="min-h-screen bg-background py-12 page-enter-active">
      <div className="container px-4 md:px-6">
        <Link href="/menu" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 font-medium transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Side */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl rustic-shadow">
             {/* Note: In a real app, use real Unsplash URLs. For now using placeholder logic as requested */}
            {/* delicious homemade pumpkin soup */}
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-auto object-cover aspect-square"
            />
            {isSoldOut && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                 <Badge variant="destructive" className="text-3xl px-8 py-4 rotate-12 uppercase tracking-widest border-4">Sold Out</Badge>
               </div>
            )}
          </div>

          {/* Content Side */}
          <div className="flex flex-col space-y-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary font-bold tracking-wider uppercase">{product.category}</Badge>
                {product.inventoryCount < 10 && product.inventoryCount > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600 animate-pulse">
                    Only {product.inventoryCount} left!
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{product.name}</h1>
              <div className="text-3xl font-light text-primary font-sans mb-6">
                ${(product.price / 100).toFixed(2)}
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="special" className="text-base font-semibold">Special Requests (Optional)</Label>
                <Textarea 
                  id="special"
                  placeholder="Extra spicy, no cilantro, etc. (Note: significant changes may incur extra charges at pickup)"
                  className="bg-muted/30 border-2 focus:border-primary/50 resize-none h-32 rounded-xl"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Quantity</Label>
                  <div className="flex items-center border-2 border-border rounded-xl bg-background">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-transparent hover:text-primary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isSoldOut}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-transparent hover:text-primary"
                      onClick={() => setQuantity(Math.min(product.inventoryCount, quantity + 1))}
                      disabled={quantity >= product.inventoryCount || isSoldOut}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {isSoldOut ? "Currently Unavailable" : "Add to Order"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

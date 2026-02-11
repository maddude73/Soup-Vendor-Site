import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to checkout", variant: "default" });
      setLocation("/auth");
      return;
    }

    try {
      await createOrder.mutateAsync({
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          specialRequests: item.specialRequests
        }))
      });
      clearCart();
      toast({ title: "Order Placed!", description: "We've received your order. Check your email for details." });
      setLocation("/"); // Or to an order success page
    } catch (error) {
      // Error handled in hook
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <ShoppingBagIcon className="w-12 h-12" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-4">Your bowl is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any delicious soups yet.</p>
        <Link href="/menu">
          <Button size="lg" className="rounded-full">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-16 page-enter-active">
      <div className="container px-4 md:px-6 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-8">Your Order</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.specialRequests}`} className="bg-background p-6 rounded-2xl shadow-sm border border-border/50 flex gap-4">
                 {/* delicious soup thumbnail */}
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-24 h-24 object-cover rounded-xl bg-muted"
                />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg font-display">{item.product.name}</h3>
                      <p className="font-semibold">${((item.product.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                    {item.specialRequests && (
                      <p className="text-sm text-muted-foreground mt-1 italic">Note: {item.specialRequests}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="bg-background p-6 rounded-2xl shadow-sm border border-border/50 sticky top-24">
              <h3 className="font-display text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${(subtotal() / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (est.)</span>
                  <span>${(subtotal() * 0.08 / 100).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span>${(subtotal() * 1.08 / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg font-semibold rounded-xl" 
                size="lg"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Proceed to Checkout"}
                {!createOrder.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="mt-6 text-center">
                <Link href="/menu" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
                  <ArrowLeft className="mr-1 h-3 w-3" /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Trash2, ArrowRight, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

function CheckoutForm({ orderId, onSuccess }: { orderId: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });
      toast({ title: "Payment Successful!", description: "Your soulful soups are on their way." });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <p className="text-destructive text-sm" data-testid="text-payment-error">{errorMessage}</p>
      )}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
        ) : (
          <><CreditCard className="h-4 w-4 mr-2" /> Pay Now</>
        )}
      </Button>
    </form>
  );
}

export default function Cart() {
  const { items, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [checkoutState, setCheckoutState] = useState<{
    clientSecret: string;
    orderId: number;
    amount: number;
  } | null>(null);

  const { data: stripeConfig } = useQuery<{ publishableKey: string }>({
    queryKey: ["/api/stripe/publishable-key"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/publishable-key");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    if (stripeConfig?.publishableKey) {
      setStripePromise(loadStripe(stripeConfig.publishableKey));
    }
  }, [stripeConfig?.publishableKey]);

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to checkout", variant: "default" });
      setLocation("/auth");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          specialRequests: item.specialRequests
        }))
      });

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create payment");
      }

      const { clientSecret, amount } = await res.json();
      setCheckoutState({ clientSecret, orderId: order.id, amount });
    } catch (error: any) {
      toast({ title: "Checkout Failed", description: error.message, variant: "destructive" });
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setCheckoutState(null);
    setLocation("/profile");
  };

  if (items.length === 0 && !checkoutState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <ShoppingBagIcon className="w-12 h-12" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-4">Your bowl is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any delicious soups yet.</p>
        <Link href="/menu">
          <Button size="lg" className="rounded-full" data-testid="button-browse-menu">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  if (checkoutState && stripePromise) {
    return (
      <div className="min-h-screen bg-muted/20 py-16 page-enter-active">
        <div className="container px-4 md:px-6 max-w-lg mx-auto">
          <h1 className="font-display text-4xl font-bold mb-2">Payment</h1>
          <p className="text-muted-foreground mb-8">Complete your payment to confirm your order.</p>

          <div className="bg-background p-6 rounded-2xl shadow-sm border border-border/50">
            <div className="mb-6 pb-6 border-b">
              <div className="flex justify-between font-bold text-lg">
                <span>Order Total</span>
                <span>${(checkoutState.amount / 100).toFixed(2)}</span>
              </div>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: checkoutState.clientSecret,
                appearance: { theme: "stripe" },
              }}
            >
              <CheckoutForm orderId={checkoutState.orderId} onSuccess={handlePaymentSuccess} />
            </Elements>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setCheckoutState(null)}
              className="text-sm text-muted-foreground"
              data-testid="button-back-to-cart"
            >
              <ArrowLeft className="mr-1 h-3 w-3" /> Back to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-16 page-enter-active">
      <div className="container px-4 md:px-6 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-8">Your Order</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.specialRequests}`} className="bg-background p-6 rounded-2xl shadow-sm border border-border/50 flex gap-4" data-testid={`card-cart-item-${item.product.id}`}>
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
                      <p className="text-sm text-muted-foreground mt-1 italic">Note: {item.specialRequests} (+$2.00)</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => removeItem(item.product.id)}
                      data-testid={`button-remove-item-${item.product.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                className="w-full text-lg font-semibold rounded-xl" 
                size="lg"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
                data-testid="button-proceed-checkout"
              >
                {createOrder.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                ) : (
                  <>Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
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

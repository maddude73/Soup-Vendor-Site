import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, isLoading: authLoading, logout, isLoggingOut } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery<(Order & { items: any[] })[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (authLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Please log in</h1>
        <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {user.isAdmin && (
                <Badge className="mt-2" variant="secondary">Admin Account</Badge>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
            Log Out
          </Button>
        </div>

        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <Package className="h-6 w-6" />
          Order History
        </h2>

        {orders?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              You haven't placed any orders yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders?.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Order #{order.id} - {format(new Date(order.createdAt!), "MMM d, yyyy")}
                  </CardTitle>
                  <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product?.name || "Product"}</span>
                        <span className="font-mono">${((item.priceAtPurchase * item.quantity) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary font-mono">${(order.totalAmount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

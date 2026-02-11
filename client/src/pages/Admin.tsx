import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Package, User, Mail, Phone, MapPin, Upload, ImageIcon } from "lucide-react";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8 page-enter-active">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-4xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="products" className="space-y-6 sm:space-y-8">
          <TabsList className="bg-background border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="products" className="rounded-lg px-4 sm:px-6 text-sm sm:text-base">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-4 sm:px-6 text-sm sm:text-base">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTable />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductsTable() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold font-display">Inventory Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm 
              product={editingProduct} 
              onSuccess={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Card layout */}
      <div className="sm:hidden space-y-3">
        {products?.map((product) => (
          <div key={product.id} className="bg-background rounded-xl border shadow-sm p-4 flex gap-3 items-center">
            <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{product.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.isActive ? 'Active' : 'Off'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">${(product.price / 100).toFixed(2)} · {product.inventoryCount} in stock</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct.mutate(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden sm:block bg-background rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${(product.price / 100).toFixed(2)}</TableCell>
                <TableCell>{product.inventoryCount}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct.mutate(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProductForm({ product, onSuccess }: { product: Product | null, onSuccess: () => void }) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      inventoryCount: product.inventoryCount,
      isActive: product.isActive,
    } : {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "Soup",
      inventoryCount: 0,
      isActive: true,
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "image/jpeg",
        }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");

      form.setValue("imageUrl", objectPath);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: InsertProduct) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onSuccess();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (cents)</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inventoryCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory Count</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <div className="space-y-3">
                {field.value && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted border">
                    <img 
                      src={field.value} 
                      alt="Product preview" 
                      className="w-full h-full object-cover"
                      data-testid="img-product-preview"
                    />
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      data-testid="input-product-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.parentElement as HTMLLabelElement)?.querySelector('input[type="file"]') as HTMLInputElement;
                        input?.click();
                      }}
                      data-testid="button-upload-image"
                    >
                      {isUploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                      ) : (
                        <><Upload className="h-4 w-4 mr-2" /> {field.value ? "Change Image" : "Upload Image"}</>
                      )}
                    </Button>
                  </label>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Or paste an image URL" 
                    className="text-sm"
                    data-testid="input-product-image-url"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Product</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
          {product ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}

function OrdersTable() {
  const { data: orders, isLoading } = useOrders();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order Updated", description: "Order status updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin" /></div>;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      fulfilled: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return (
      <span className={`capitalize px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const renderCustomerInfo = (order: any) => (
    <div className="flex flex-col space-y-1 text-sm">
      {order.customerName && (
        <span className="flex items-center gap-1.5 font-medium" data-testid={`text-customer-name-${order.id}`}>
          <User className="h-3 w-3 text-muted-foreground shrink-0" />
          {order.customerName}
        </span>
      )}
      {order.customerEmail && (
        <span className="flex items-center gap-1.5 text-muted-foreground" data-testid={`text-customer-email-${order.id}`}>
          <Mail className="h-3 w-3 shrink-0" />
          {order.customerEmail}
        </span>
      )}
      {order.customerPhone && (
        <span className="flex items-center gap-1.5 text-muted-foreground" data-testid={`text-customer-phone-${order.id}`}>
          <Phone className="h-3 w-3 shrink-0" />
          {order.customerPhone}
        </span>
      )}
      {order.customerAddress && (
        <span className="flex items-center gap-1.5 text-muted-foreground" data-testid={`text-customer-address-${order.id}`}>
          <MapPin className="h-3 w-3 shrink-0" />
          {order.customerAddress}
        </span>
      )}
      {!order.customerName && !order.customerEmail && (
        <span className="text-muted-foreground italic">No contact info</span>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-display">Order Management</h2>
      {orders?.length === 0 ? (
        <div className="bg-background rounded-xl border p-8 sm:p-12 text-center text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="sm:hidden space-y-3">
            {orders?.map((order) => (
              <div key={order.id} className="bg-background rounded-xl border shadow-sm p-4 space-y-3" data-testid={`row-order-${order.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-sm">#{order.id}</span>
                    {statusBadge(order.status)}
                  </div>
                  <span className="font-mono font-bold">${(order.totalAmount / 100).toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                </div>
                {renderCustomerInfo(order)}
                <div className="border-t pt-2 space-y-1">
                  {order.items.map((item: any) => (
                    <span key={item.id} className="text-sm block">
                      {item.quantity}x {item.product?.name || `Product #${item.productId}`}
                      {item.specialRequests && (
                        <span className="text-muted-foreground italic ml-1">({item.specialRequests})</span>
                      )}
                    </span>
                  ))}
                </div>
                {order.status === "paid" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateStatus.mutate({ orderId: order.id, status: "fulfilled" })}
                    disabled={updateStatus.isPending}
                    data-testid={`button-fulfill-order-${order.id}`}
                  >
                    <Package className="h-3 w-3 mr-1" /> Fulfill
                  </Button>
                )}
                {order.status === "fulfilled" && (
                  <p className="text-sm text-center text-muted-foreground">Completed</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden sm:block bg-background rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-mono font-medium">#{order.id}</TableCell>
                    <TableCell className="text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <div className="min-w-[180px]">
                        {renderCustomerInfo(order)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {order.items.map((item: any) => (
                          <span key={item.id} className="text-sm">
                            {item.quantity}x {item.product?.name || `Product #${item.productId}`}
                            {item.specialRequests && (
                              <span className="text-muted-foreground italic ml-1">({item.specialRequests})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">${(order.totalAmount / 100).toFixed(2)}</TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      {order.status === "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ orderId: order.id, status: "fulfilled" })}
                          disabled={updateStatus.isPending}
                          data-testid={`button-fulfill-order-${order.id}`}
                        >
                          <Package className="h-3 w-3 mr-1" /> Fulfill
                        </Button>
                      )}
                      {order.status === "fulfilled" && (
                        <span className="text-sm text-muted-foreground">Completed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

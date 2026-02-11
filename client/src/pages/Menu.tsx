import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Menu() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");

  const activeProducts = products?.filter(p => 
    p.isActive && 
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const soups = activeProducts?.filter(p => p.category === "soup");
  const merch = activeProducts?.filter(p => p.category === "merch");

  return (
    <div className="min-h-screen bg-background py-8 sm:py-16 page-enter-active">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-secondary">Our Menu</h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">
            Seasonal soups made from scratch. Order online and pick up fresh or have it delivered.
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-12 py-6 rounded-full border-2 border-border/50 focus:border-primary/50 bg-white shadow-sm text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (soups?.length === 0 && merch?.length === 0) ? (
          <div className="text-center py-20">
            <h3 className="font-display text-2xl font-bold text-muted-foreground">No products found matching your search.</h3>
            <p className="mt-2 text-muted-foreground">Try checking back next week for new flavors!</p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-20">
            {soups && soups.length > 0 && (
              <div>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-primary" data-testid="text-soups-heading">Soups</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {soups.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {merch && merch.length > 0 && (
              <div>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-primary" data-testid="text-merch-heading">Merch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {merch.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

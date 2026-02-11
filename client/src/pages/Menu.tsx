import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Menu() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");

  const filteredProducts = products?.filter(p => 
    p.isActive && 
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background py-16 page-enter-active">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-secondary">Our Menu</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Seasonal soups made from scratch. Order online and pick up fresh or have it delivered.
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search our soups..." 
              className="pl-12 py-6 rounded-full border-2 border-border/50 focus:border-primary/50 bg-white shadow-sm text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-display text-2xl font-bold text-muted-foreground">No soups found matching your search.</h3>
            <p className="mt-2 text-muted-foreground">Try checking back next week for new flavors!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

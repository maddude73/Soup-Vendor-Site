import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Leaf, ChefHat, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredSoups = products?.filter(p => p.isActive && p.category === "soup").slice(0, 3);
  const featuredMerch = products?.filter(p => p.isActive && p.category === "merch").slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen page-enter-active">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary py-16 sm:py-24 md:py-32 texture-grain">
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-background leading-tight">
                Soup for the <span className="text-primary italic font-hand">Soul</span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl text-background/80 font-light max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Handcrafted in small batches using local organic ingredients. 
              Taste the difference that love and patience make in every spoonful.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link href="/menu">
                <Button size="lg" className="rounded-full text-lg bg-primary text-primary-foreground border-primary-border shadow-xl" data-testid="button-order-now">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract shapes for background interest */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl" />
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold">Organic Ingredients</h3>
              <p className="text-muted-foreground">Sourced from local farmers who care about the earth as much as we do.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <ChefHat className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold">Chef Crafted</h3>
              <p className="text-muted-foreground">Recipes perfected over years, cooked slowly to unlock deep flavors.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold">Made with Love</h3>
              <p className="text-muted-foreground">Every batch is made with intention and care for your well-being.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Soups */}
      <section className="py-12 sm:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">This Week's Soups</h2>
              <p className="text-muted-foreground">Freshly made and ready for your table.</p>
            </div>
            <Link href="/menu">
              <Button variant="ghost" className="hidden md:flex font-bold" data-testid="button-view-full-menu">View Full Menu <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSoups?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/menu">
              <Button size="lg" variant="outline" className="w-full" data-testid="button-view-full-menu-mobile">View Full Menu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Merch Section */}
      {featuredMerch && featuredMerch.length > 0 && (
        <section className="py-12 sm:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-12">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Shop Merch</h2>
                <p className="text-muted-foreground">Take a piece of the kitchen home with you.</p>
              </div>
              <Link href="/menu">
                <Button variant="ghost" className="hidden md:flex font-bold" data-testid="button-view-merch">Browse All <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredMerch.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

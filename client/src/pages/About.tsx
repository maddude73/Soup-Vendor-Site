import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <div className="min-h-screen bg-background page-enter-active">
      {/* Hero */}
      <div className="relative h-[40vh] sm:h-[60vh] bg-secondary flex items-center justify-center overflow-hidden texture-grain">
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div className="container relative z-10 text-center px-4">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-background mb-4 sm:mb-6">Our Story</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-background/90 max-w-2xl mx-auto font-light">
            Bringing comfort to your table, one bowl at a time.
          </p>
        </div>
      </div>

      <div className="container px-4 py-12 sm:py-20 max-w-4xl mx-auto space-y-12 sm:space-y-20">
        <section>
          <h2 className="font-display text-3xl font-bold mb-6 text-primary">The Beginning</h2>
          <div className="prose prose-lg text-muted-foreground">
            <p>
              It started in a small kitchen with a big pot and an even bigger dream. We believe that soup is more than just a meal—it's a hug in a bowl. Our founder, growing up in a home where the stove was always warm, wanted to share that feeling of comfort and belonging with the world.
            </p>
            <p className="mt-4">
              Athena's Soulful Soups was born out of a desire to slow down. In a fast-paced world, we take the time to simmer our broths for hours, chop our vegetables by hand, and season everything to perfection.
            </p>
          </div>
        </section>
        
        <Separator className="bg-border/50" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-primary">Our Philosophy</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We believe in real food. That means no preservatives, no artificial flavors, and sourcing ingredients from farmers we know by name. We cook with the seasons, celebrating the best produce each time of year has to offer.
            </p>
          </div>
          <div className="aspect-square bg-muted rounded-3xl overflow-hidden shadow-xl rotate-3">
             {/* fresh ingredients on a table */}
            <img 
              src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80" 
              alt="Fresh ingredients" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <section className="text-center bg-muted/30 p-6 sm:p-12 rounded-2xl sm:rounded-3xl">
          <h2 className="font-hand text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-secondary">"Food is symbolic of love when words are inadequate."</h2>
          <p className="text-muted-foreground">- Alan D. Wolfelt</p>
        </section>
      </div>
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/menu" component={Menu} />
          <Route path="/product/:id" component={ProductDetails} />
          <Route path="/cart" component={Cart} />
          <Route path="/auth" component={Auth} />
          <Route path="/admin" component={Admin} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-12 text-center">
        <div className="container mx-auto px-4">
          <p className="font-display font-bold text-2xl mb-4">Soulful Soups</p>
          <p className="text-sm opacity-60">Made with love in our kitchen, served in yours.</p>
          <p className="text-xs opacity-40 mt-8">&copy; {new Date().getFullYear()} Soulful Soups. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

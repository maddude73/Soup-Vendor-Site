import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Menu as MenuIcon, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const cartCount = useCart((state) => state.itemCount());
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Our Soups" },
    { href: "/about", label: "About Us" },
    ...(user?.isAdmin ? [{ href: "/admin", label: "Dashboard" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 min-w-0" data-testid="link-home-logo">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-hand text-lg sm:text-xl font-bold shadow-lg shrink-0">
            S
          </div>
          <span className="font-display text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate">
            Soulful Soups
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              className={`text-sm font-medium transition-colors relative group ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                location === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {user ? (
             <Link href="/profile">
               <Button variant="ghost" size="icon" data-testid="button-profile">
                 <UserIcon className="h-5 w-5 text-foreground" />
               </Button>
             </Link>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="font-medium" data-testid="button-login">Log In</Button>
            </Link>
          )}
          
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative border-2 border-primary/20" data-testid="button-cart">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-6 mt-8">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!user && (
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Log In</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

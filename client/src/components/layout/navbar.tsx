import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Services", href: "/#services" },
    { name: "Find Providers", href: "/provider-search" },
    { name: "Health Data", href: "/data-management" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false; // Hash links handled differently
    return location === href;
  };

  return (
    <nav className="bg-white shadow-material sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">BetterHealth AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-primary"
                      : "text-gray-600 hover:text-primary"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/health-inquiry">
                <Button className="bg-primary text-white hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "px-3 py-2 text-base font-medium transition-colors",
                        isActive(item.href)
                          ? "text-primary"
                          : "text-gray-600 hover:text-primary"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link href="/health-inquiry" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary text-white hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

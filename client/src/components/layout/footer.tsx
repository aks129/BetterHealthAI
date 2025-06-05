import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const serviceLinks = [
    { name: "Health Guidance", href: "/health-inquiry" },
    { name: "Provider Search", href: "/provider-search" },
    { name: "Data Management", href: "/data-management" },
    { name: "Appointment Prep", href: "/data-management" },
  ];

  const safetyLinks = [
    { name: "Medical Disclaimers", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "HIPAA Compliance", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Emergency Resources", href: "#" },
    { name: "Healthcare Provider Portal", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <Heart className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold">BetterHealth AI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your intelligent healthcare companion providing evidence-based guidance, 
              provider recommendations, and health data management.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Safety & Privacy</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {safetyLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 BetterHealth AI. All rights reserved. This platform provides 
              general health information only and is not a substitute for professional medical advice.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

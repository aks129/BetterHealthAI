import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Microscope, 
  UserRound, 
  ClipboardList, 
  Heart,
  Shield,
  AlertTriangle,
  Lock,
  Phone,
  ArrowRight,
  Star,
  Calendar,
  MapPin
} from "lucide-react";

export default function Home() {
  const services = [
    {
      icon: Microscope,
      title: "Evidence-Based Guidance",
      description: "Access medically accurate, peer-reviewed information for health concerns with clear explanations and preventive care recommendations.",
      features: [
        "Peer-reviewed medical literature",
        "Clinical guidelines & best practices", 
        "Accessible explanations"
      ],
      href: "/health-inquiry"
    },
    {
      icon: UserRound,
      title: "Provider Recommendations", 
      description: "Find the right healthcare professionals based on your needs, location, insurance, and specialization requirements.",
      features: [
        "Location & insurance matching",
        "Specialization filtering",
        "Patient reviews & ratings"
      ],
      href: "/provider-search"
    },
    {
      icon: ClipboardList,
      title: "Health Data Management",
      description: "Organize medical records, understand test results, and prepare effectively for healthcare appointments.",
      features: [
        "Medical records organization",
        "Test results interpretation", 
        "Appointment preparation"
      ],
      href: "/health-data"
    }
  ];

  const safetyFeatures = [
    {
      icon: AlertTriangle,
      title: "Emergency Detection",
      description: "Automatic recognition of potential medical emergencies with immediate redirection to emergency services.",
      color: "text-red-500"
    },
    {
      icon: Shield,
      title: "Clear Disclaimers", 
      description: "Prominent medical disclaimers ensuring users understand the boundaries between AI guidance and professional medical advice.",
      color: "text-orange-500"
    },
    {
      icon: Lock,
      title: "Privacy Protection",
      description: "HIPAA-compliant data handling with end-to-end encryption for all sensitive health information and documents.",
      color: "text-primary"
    },
    {
      icon: UserRound,
      title: "Professional Guidance",
      description: "Clear recommendations for when to seek professional medical care with guidance on choosing the right healthcare provider.",
      color: "text-secondary"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Intelligent Healthcare 
                <span className="text-primary"> Guidance Companion</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Get evidence-based health information, find the right healthcare providers, and organize your medical data with AI-powered assistance that puts your safety first.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/health-inquiry">
                  <Button size="lg" className="btn-primary w-full sm:w-auto">
                    Start Health Inquiry
                  </Button>
                </Link>
                <Link href="/provider-search">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Find Providers
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:flex lg:justify-center">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Medical professional with digital health interface" 
                className="rounded-2xl shadow-lg w-full max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Comprehensive Healthcare Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three core capabilities designed to empower your healthcare decisions with evidence-based information and professional guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border border-border">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button variant="ghost" className="text-primary hover:text-primary/80">
                      Learn More <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guided Health Inquiry Process */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Guided Health Inquiry Process
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our structured approach helps you get the most relevant health information through a series of guided questions and evidence-based responses.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    number: "1",
                    title: "Describe Your Concern",
                    description: "Share your symptoms, timeline, and context in your own words."
                  },
                  {
                    number: "2", 
                    title: "Guided Assessment",
                    description: "Answer targeted questions to help determine urgency and relevance."
                  },
                  {
                    number: "3",
                    title: "Evidence-Based Response", 
                    description: "Receive medically accurate information with clear next steps."
                  },
                  {
                    number: "4",
                    title: "Professional Guidance",
                    description: "Get recommendations for when and how to seek professional care."
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{step.number}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Demo Chat Interface */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="border-b border-border pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Health Inquiry Assistant</h3>
                  <p className="text-sm text-muted-foreground">Ask about symptoms or health concerns</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
                      <p className="text-sm">I've been having persistent headaches for the past week.</p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-sm">
                      <p className="text-sm text-foreground mb-3">I understand your concern about persistent headaches. Let me ask a few questions to better assist you:</p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          Severity: Rate 1-10
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          Time of day pattern
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          Associated symptoms
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input 
                    type="text" 
                    placeholder="Type your health question..." 
                    className="flex-1 border border-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled
                  />
                  <Button size="sm" className="btn-primary">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Safety & Privacy First
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your health and privacy are our top priorities. We've built comprehensive safety features to ensure you get the right care while protecting your sensitive information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Emergency Call-to-Action */}
          <div className="mt-16 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">Medical Emergency?</h3>
            <p className="text-lg text-muted-foreground mb-6">
              If you're experiencing a medical emergency, don't wait for AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => window.open("tel:911", "_self")}
              >
                <Phone className="h-5 w-5 mr-2" />
                Call 911 Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open("https://www.google.com/maps/search/emergency+room+near+me", "_blank")}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Find Nearest ER
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <Heart className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold">BetterHealth AI</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your intelligent healthcare companion providing evidence-based guidance, provider recommendations, and health data management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/health-inquiry" className="hover:text-white transition-colors">Health Guidance</Link></li>
                <li><Link href="/provider-search" className="hover:text-white transition-colors">Provider Search</Link></li>
                <li><Link href="/health-data" className="hover:text-white transition-colors">Data Management</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Safety & Privacy</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Medical Disclaimers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Resources</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">
              © 2024 BetterHealth AI. All rights reserved. This platform provides general health information only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

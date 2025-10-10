import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Users, Coins, Zap, Shield, Globe } from "lucide-react";
import heroImage from "@/assets/hero-gaming.jpg";

const Index = () => {
  const features = [
    {
      icon: Trophy,
      title: "Competitive Tournaments",
      description: "Join daily tournaments across multiple games and compete for real rewards",
      color: "text-primary"
    },
    {
      icon: Coins,
      title: "GRIDZ Tokens (GZC)",
      description: "Earn, trade, and spend tokens in our digital economy ecosystem",
      color: "text-neon-cyan"
    },
    {
      icon: Users,
      title: "Community DAO",
      description: "Vote on platform decisions and shape the future of GRIDZ",
      color: "text-neon-pink"
    },
    {
      icon: Zap,
      title: "AI-Powered Matchmaking",
      description: "Fair gameplay with intelligent skill-based pairing",
      color: "text-neon-green"
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "Blockchain-backed transactions and provably fair competitions",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "Pan-African Network",
      description: "Connect with gamers across Kenya and beyond",
      color: "text-neon-cyan"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Gaming arena" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Kenyan Grit
              </span>
              <br />
              <span className="text-foreground">Meets the</span>
              <br />
              <span className="bg-gradient-neon bg-clip-text text-transparent">
                Future Grid
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the first AI + Blockchain-powered gaming ecosystem designed to empower Kenyan youth through esports
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                  Join GRIDZ Now
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button variant="neon" size="lg" className="text-lg px-8 py-6">
                  View Tournaments
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">5000+</div>
                <div className="text-muted-foreground">Active Gamers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-cyan mb-1">100+</div>
                <div className="text-muted-foreground">Daily Tournaments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-pink mb-1">KES 2M+</div>
                <div className="text-muted-foreground">Prizes Awarded</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Power Your Gaming Journey
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of esports with cutting-edge technology and community-driven features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-glow-gold"
              >
                <CardContent className="p-6">
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:animate-float`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 border-primary/20 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                  <span className="bg-gradient-neon bg-clip-text text-transparent">
                    Our Mission
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6 text-center">
                  GRIDZ isn't just an app — it's a movement where Kenyan Grit meets Digital Sovereignty. 
                  Every subscription builds opportunity, every token builds trust, and every game builds legacy.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">Play Bold</div>
                    <p className="text-sm text-muted-foreground">Compete at the highest level</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-cyan mb-2">Build Legacy</div>
                    <p className="text-sm text-muted-foreground">Create lasting impact</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-pink mb-2">Own Tomorrow</div>
                    <p className="text-sm text-muted-foreground">Shape the digital economy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="bg-gradient-gold bg-clip-text text-transparent">Level Up</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of gamers building Kenya's digital future
            </p>
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-lg px-12 py-6 animate-glow">
                Start Your Journey
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Membership: KES 2,800/month • First week free
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

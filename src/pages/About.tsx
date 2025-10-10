import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Lightbulb, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  About GRIDZ
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Where Kenyan Grit Meets Digital Sovereignty
              </p>
            </div>

            <Card className="mb-12 bg-card/50 border-primary/20 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                  <span className="bg-gradient-neon bg-clip-text text-transparent">
                    Our Story
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  GRIDZ was born from a simple yet powerful vision: to transform gaming from mere entertainment 
                  into a legitimate pathway for economic empowerment for Kenya's youth.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  We recognized that Kenya's young generation possesses immense talent, drive, and digital fluency. 
                  What they needed was a platform that could channel that energy into real economic opportunities.
                </p>
                <p className="text-lg text-muted-foreground">
                  Today, GRIDZ stands as Kenya's first AI + Blockchain-powered gaming ecosystem, creating 
                  a self-sustaining digital economy where every game played, every tournament won, and every 
                  token earned builds toward a brighter future.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <Target className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To empower Kenyan youth through esports by creating sustainable economic opportunities 
                    in the digital economy, one game at a time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-neon-cyan/50 transition-colors">
                <CardContent className="p-8">
                  <Lightbulb className="w-12 h-12 text-neon-cyan mb-4" />
                  <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To become Africa's leading esports platform, where gaming excellence meets financial 
                    independence and community ownership.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12 bg-gradient-to-br from-card to-background border-border">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                  What Makes GRIDZ Different
                </h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Zap className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Blockchain-Backed Transparency</h4>
                      <p className="text-muted-foreground">
                        Every token earned, every tournament result, and every transaction is recorded 
                        on the blockchain, ensuring complete transparency and fairness.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Zap className="w-8 h-8 text-neon-cyan flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg mb-2">AI-Powered Fairness</h4>
                      <p className="text-muted-foreground">
                        Our intelligent matchmaking ensures balanced competitions, while AI moderation 
                        maintains a positive community environment.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Users className="w-8 h-8 text-neon-pink flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Community Governance</h4>
                      <p className="text-muted-foreground">
                        Token holders participate in platform decisions through our DAO, making GRIDZ 
                        truly community-owned and operated.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Zap className="w-8 h-8 text-neon-green flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Real Economic Impact</h4>
                      <p className="text-muted-foreground">
                        Members earn real value through gameplay, which can be used within the ecosystem 
                        or converted to fiat currency for real-world impact.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Join the Movement
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every subscription builds opportunity. Every token builds trust. Every game builds legacy.
              </p>
              <p className="text-xl font-semibold bg-gradient-gold bg-clip-text text-transparent">
                Play Bold. Build Legacy. Own Tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;

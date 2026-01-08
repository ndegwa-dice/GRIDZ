import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";

const Wallet = () => {
  const balance = 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your GZ Tokens</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-card to-secondary/50 border-border overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-muted-foreground mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <Coins className="h-8 w-8 text-neon-cyan" />
                <span className="text-5xl font-bold text-neon-cyan">{balance}</span>
                <span className="text-xl text-muted-foreground">GZC</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <TrendingUp className="h-4 w-4 text-neon-green" />
                <span className="text-neon-green">+0 this week</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Tokens
              </Button>
              <Button variant="outline" className="border-border">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-neon-cyan/20 transition-colors">
              <Plus className="h-6 w-6 text-neon-cyan" />
            </div>
            <h3 className="font-semibold mb-1">Buy Tokens</h3>
            <p className="text-sm text-muted-foreground">Purchase GZ Tokens with M-Pesa</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-neon-green/20 transition-colors">
              <ArrowDownLeft className="h-6 w-6 text-neon-green" />
            </div>
            <h3 className="font-semibold mb-1">Receive Tokens</h3>
            <p className="text-sm text-muted-foreground">Get tokens from other players</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-neon-pink/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-neon-pink/20 transition-colors">
              <ArrowUpRight className="h-6 w-6 text-neon-pink" />
            </div>
            <h3 className="font-semibold mb-1">Send Tokens</h3>
            <p className="text-sm text-muted-foreground">Transfer to another player</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>Your recent token transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your transaction history will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  wallet_balance: number | null;
  subscription_tier: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProfiles(data || []);
    setLoading(false);
  };

  const filtered = profiles.filter(
    (p) =>
      !search ||
      p.username?.toLowerCase().includes(search.toLowerCase()) ||
      p.user_id.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
          All Gamers
        </h1>
        <p className="text-muted-foreground mt-1">{profiles.length} registered users</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by gamer tag or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary/30 border-border/50"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="glass-card border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/30">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(p.username || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{p.username || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.user_id}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-medium text-primary">{(p.wallet_balance || 0).toLocaleString()} GZC</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tier</p>
                    <p className="font-medium text-foreground capitalize">{p.subscription_tier || "Free"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{p.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium text-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {p.bio && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{p.bio}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

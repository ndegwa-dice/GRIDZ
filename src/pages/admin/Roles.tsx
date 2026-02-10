import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2 } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
  created_at: string | null;
  username?: string;
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<string>("moderator");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    // Admins can see all roles via the has_role check in RLS,
    // but user_roles only has SELECT for own roles. We'll use a service-level approach.
    // For now, fetch roles the admin can see.
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading roles:", error);
      // Fallback — admin might only see own
    }

    // Enrich with usernames
    const rolesData = data || [];
    const userIds = [...new Set(rolesData.map((r) => r.user_id))];

    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      profiles?.forEach((p) => {
        profileMap[p.user_id] = p.username || "Unknown";
      });
    }

    setRoles(rolesData.map((r) => ({ ...r, username: profileMap[r.user_id] || r.user_id.slice(0, 8) })));
    setLoading(false);
  };

  const addRole = async () => {
    if (!newUserId.trim()) {
      toast({ title: "Error", description: "User ID is required", variant: "destructive" });
      return;
    }

    setAdding(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: newUserId.trim(),
      role: newRole as "admin" | "moderator" | "user",
    });

    setAdding(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Role assigned", description: `${newRole} role added.` });
    setNewUserId("");
    load();
  };

  const removeRole = async (id: string) => {
    if (!confirm("Remove this role assignment?")) return;

    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Removed", description: "Role assignment removed." });
    load();
  };

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
          Role Management
        </h1>
        <p className="text-muted-foreground mt-1">Assign and manage user roles</p>
      </div>

      {/* Add role */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Assign Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-foreground">User ID</Label>
              <Input
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="Paste user ID (UUID)"
                className="bg-secondary/30 border-border/50"
              />
            </div>
            <div className="w-40">
              <Label className="text-foreground">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addRole} disabled={adding} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground gap-2">
              <Shield className="h-4 w-4" /> {adding ? "Adding..." : "Assign"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role list */}
      <div className="space-y-3">
        {roles.length === 0 ? (
          <Card className="glass-card border-border/50">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No role assignments found.</p>
            </CardContent>
          </Card>
        ) : (
          roles.map((r) => (
            <Card key={r.id} className="glass-card border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{r.username}</p>
                  <p className="text-xs text-muted-foreground">{r.user_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                      r.role === "admin"
                        ? "bg-destructive/20 text-destructive"
                        : r.role === "moderator"
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.role}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => removeRole(r.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Trophy, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface Tournament {
  id: string;
  name: string;
  game: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
  status: string;
  image_url: string | null;
}

interface TournamentForm {
  name: string;
  game: string;
  entry_fee: string;
  prize_pool: string;
  max_participants: string;
  start_date: string;
  status: string;
  image_url: string;
}

const initialForm: TournamentForm = {
  name: "",
  game: "",
  entry_fee: "0",
  prize_pool: "100",
  max_participants: "100",
  start_date: "",
  status: "upcoming",
  image_url: "",
};

export default function AdminPanel() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TournamentForm>(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadTournaments();
    }
  }, [isAdmin]);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (tournament: Tournament) => {
    setEditingId(tournament.id);
    setForm({
      name: tournament.name,
      game: tournament.game,
      entry_fee: tournament.entry_fee.toString(),
      prize_pool: tournament.prize_pool.toString(),
      max_participants: tournament.max_participants.toString(),
      start_date: tournament.start_date.slice(0, 16),
      status: tournament.status,
      image_url: tournament.image_url || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.game || !form.start_date) {
      toast({
        title: "Validation Error",
        description: "Name, game, and start date are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const tournamentData = {
        name: form.name.trim(),
        game: form.game.trim(),
        entry_fee: parseFloat(form.entry_fee) || 0,
        prize_pool: parseFloat(form.prize_pool) || 0,
        max_participants: parseInt(form.max_participants) || 100,
        start_date: new Date(form.start_date).toISOString(),
        status: form.status,
        image_url: form.image_url.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("tournaments")
          .update(tournamentData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Success", description: "Tournament updated" });
      } else {
        const { error } = await supabase
          .from("tournaments")
          .insert(tournamentData);

        if (error) throw error;
        toast({ title: "Success", description: "Tournament created" });
      }

      setDialogOpen(false);
      loadTournaments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save tournament",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Tournament removed" });
      loadTournaments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tournament",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "default",
      active: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardContent className="pt-6 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have admin privileges to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Tournament Admin
          </h1>
          <p className="text-muted-foreground">Create and manage tournaments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Tournament" : "Create Tournament"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tournament name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="game">Game *</Label>
                <Input
                  id="game"
                  value={form.game}
                  onChange={(e) => setForm({ ...form, game: e.target.value })}
                  placeholder="e.g., Fortnite, Valorant"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="entry_fee">Entry Fee (GZC)</Label>
                  <Input
                    id="entry_fee"
                    type="number"
                    min="0"
                    value={form.entry_fee}
                    onChange={(e) => setForm({ ...form, entry_fee: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prize_pool">Prize Pool (GZC)</Label>
                  <Input
                    id="prize_pool"
                    type="number"
                    min="0"
                    value={form.prize_pool}
                    onChange={(e) => setForm({ ...form, prize_pool: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="2"
                    value={form.max_participants}
                    onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="mt-2">
                {saving ? "Saving..." : editingId ? "Update Tournament" : "Create Tournament"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tournaments ({tournaments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tournaments yet. Create your first one!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.game}</TableCell>
                      <TableCell>{getStatusBadge(t.status)}</TableCell>
                      <TableCell>{t.prize_pool} GZC</TableCell>
                      <TableCell>
                        {t.current_participants}/{t.max_participants}
                      </TableCell>
                      <TableCell>
                        {format(new Date(t.start_date), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

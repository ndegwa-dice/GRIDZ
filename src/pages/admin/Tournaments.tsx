import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  game: string;
  entry_fee: number | null;
  prize_pool: number | null;
  max_participants: number | null;
  current_participants: number | null;
  start_date: string;
  status: string | null;
  image_url: string | null;
}

const emptyForm = {
  name: "",
  game: "",
  entry_fee: "0",
  prize_pool: "0",
  max_participants: "100",
  start_date: "",
  status: "upcoming",
  image_url: "",
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("start_date", { ascending: false });
    if (!error) setTournaments(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (t: Tournament) => {
    setEditing(t);
    setForm({
      name: t.name,
      game: t.game,
      entry_fee: String(t.entry_fee || 0),
      prize_pool: String(t.prize_pool || 0),
      max_participants: String(t.max_participants || 100),
      start_date: t.start_date ? new Date(t.start_date).toISOString().slice(0, 16) : "",
      status: t.status || "upcoming",
      image_url: t.image_url || "",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.game || !form.start_date) {
      toast({ title: "Missing fields", description: "Name, game, and start date are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      game: form.game,
      entry_fee: parseFloat(form.entry_fee) || 0,
      prize_pool: parseFloat(form.prize_pool) || 0,
      max_participants: parseInt(form.max_participants) || 100,
      start_date: new Date(form.start_date).toISOString(),
      status: form.status,
      image_url: form.image_url || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("tournaments").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("tournaments").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editing ? "Updated" : "Created", description: `Tournament "${form.name}" saved.` });
    setFormOpen(false);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tournament "${name}"?`)) return;

    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted", description: `Tournament "${name}" removed.` });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
            Manage Tournaments
          </h1>
          <p className="text-muted-foreground mt-1">{tournaments.length} tournaments total</p>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> New Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editing ? "Edit Tournament" : "Create Tournament"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-foreground">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="EA FC 26 Nairobi Championship" />
              </div>
              <div>
                <Label className="text-foreground">Game</Label>
                <Input value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} placeholder="EA FC 26" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Entry Fee (GZC)</Label>
                  <Input type="number" value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground">Prize Pool (GZC)</Label>
                  <Input type="number" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Max Participants</Label>
                  <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-foreground">Start Date</Label>
                <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label className="text-foreground">Image URL (optional)</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                {saving ? "Saving..." : editing ? "Update Tournament" : "Create Tournament"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tournament list */}
      <div className="space-y-3">
        {tournaments.length === 0 ? (
          <Card className="glass-card border-border/50">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No tournaments yet. Create your first!</p>
            </CardContent>
          </Card>
        ) : (
          tournaments.map((t) => (
            <Card key={t.id} className="glass-card border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        t.status === "live"
                          ? "bg-neon-green/20 text-neon-green"
                          : t.status === "upcoming"
                          ? "bg-neon-cyan/20 text-neon-cyan"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.game} &bull; {new Date(t.start_date).toLocaleDateString()} &bull;{" "}
                    {t.current_participants || 0}/{t.max_participants} players &bull; {t.prize_pool?.toLocaleString()} GZC prize
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id, t.name)} className="text-muted-foreground hover:text-destructive">
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

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy, ChevronDown, ChevronUp, Users, Medal, Zap, Radio, Swords, Play, CheckCircle } from "lucide-react";

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

interface Participant {
  id: string;
  tournament_id: string;
  user_id: string;
  placement: number | null;
  points_earned: number | null;
  completed_at: string | null;
  joined_at: string;
  profile?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface Match {
  id: string;
  tournament_id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  player1_name?: string;
  player2_name?: string;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [loadingParticipants, setLoadingParticipants] = useState<string | null>(null);
  const [editingPlacements, setEditingPlacements] = useState<Record<string, { placement: string; points: string }>>({});
  const [matches, setMatches] = useState<Record<string, Match[]>>({});
  const [matchScores, setMatchScores] = useState<Record<string, { s1: string; s2: string }>>({});
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("start_date", { ascending: false });
    if (!error) setTournaments(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-tournaments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_participants" }, (payload) => {
        const tournamentId = (payload.new as any)?.tournament_id || (payload.old as any)?.tournament_id;
        if (tournamentId && expandedId === tournamentId) loadParticipants(tournamentId);
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, (payload) => {
        const tournamentId = (payload.new as any)?.tournament_id || (payload.old as any)?.tournament_id;
        if (tournamentId && expandedId === tournamentId) loadMatches(tournamentId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, expandedId]);

  const loadParticipants = async (tournamentId: string) => {
    setLoadingParticipants(tournamentId);
    const { data, error } = await supabase
      .from("tournament_participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("placement", { ascending: true, nullsFirst: false });

    if (!error && data) {
      const userIds = data.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>);

      setParticipants((prev) => ({
        ...prev,
        [tournamentId]: data.map((p) => ({ ...p, profile: profileMap[p.user_id] || null })),
      }));
    }
    setLoadingParticipants(null);
  };

  const loadMatches = async (tournamentId: string) => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("round", { ascending: true })
      .order("match_order", { ascending: true });

    if (!error && data) {
      // Get all player IDs
      const playerIds = new Set<string>();
      data.forEach((m: any) => {
        if (m.player1_id) playerIds.add(m.player1_id);
        if (m.player2_id) playerIds.add(m.player2_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", Array.from(playerIds));

      const nameMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p.username || "Unknown";
        return acc;
      }, {} as Record<string, string>);

      setMatches((prev) => ({
        ...prev,
        [tournamentId]: data.map((m: any) => ({
          ...m,
          player1_name: m.player1_id ? nameMap[m.player1_id] || "Unknown" : "BYE",
          player2_name: m.player2_id ? nameMap[m.player2_id] || "Unknown" : "BYE",
        })),
      }));
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!participants[id]) loadParticipants(id);
      loadMatches(id);
    }
  };

  const handleGenerateBracket = async (tournamentId: string) => {
    if (!confirm("Generate bracket? This will set the tournament to LIVE and create match pairings.")) return;
    setGeneratingBracket(true);
    try {
      const { error } = await supabase.rpc("generate_bracket", { p_tournament_id: tournamentId });
      if (error) throw error;
      toast({ title: "Bracket Generated! 🏆", description: "Tournament is now LIVE with match pairings." });
      loadMatches(tournamentId);
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingBracket(false);
    }
  };

  const handleStartMatch = async (matchId: string) => {
    const { error } = await supabase
      .from("matches")
      .update({ status: "live", started_at: new Date().toISOString() })
      .eq("id", matchId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleCompleteMatch = async (match: Match) => {
    const scores = matchScores[match.id];
    const s1 = parseInt(scores?.s1 || "0");
    const s2 = parseInt(scores?.s2 || "0");
    if (s1 === s2) {
      toast({ title: "Tie not allowed", description: "Scores must have a winner.", variant: "destructive" });
      return;
    }
    const winnerId = s1 > s2 ? match.player1_id : match.player2_id;
    if (!winnerId) return;

    try {
      const { error } = await supabase.rpc("complete_match", {
        p_match_id: match.id,
        p_winner_id: winnerId,
        p_player1_score: s1,
        p_player2_score: s2,
      });
      if (error) throw error;
      toast({ title: "Match Completed", description: "Winner advanced to next round." });
      setMatchScores((prev) => { const n = { ...prev }; delete n[match.id]; return n; });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handlePlacementChange = (participantId: string, field: "placement" | "points", value: string) => {
    setEditingPlacements((prev) => ({
      ...prev,
      [participantId]: { ...prev[participantId], [field]: value },
    }));
  };

  const savePlacement = async (participant: Participant) => {
    const edits = editingPlacements[participant.id];
    if (!edits) return;
    const placement = edits.placement !== undefined ? parseInt(edits.placement) || null : participant.placement;
    const points = edits.points !== undefined ? parseInt(edits.points) || 0 : participant.points_earned;
    const { error } = await supabase
      .from("tournament_participants")
      .update({ placement, points_earned: points, completed_at: placement ? new Date().toISOString() : null })
      .eq("id", participant.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Placement saved for ${participant.profile?.username || "player"}.` });
      setEditingPlacements((prev) => { const next = { ...prev }; delete next[participant.id]; return next; });
      loadParticipants(participant.tournament_id);
    }
  };

  const awardPrizes = async (tournament: Tournament) => {
    if (!confirm(`Award prizes for "${tournament.name}"? This will distribute the ${tournament.prize_pool} GZC prize pool.`)) return;
    const tParticipants = participants[tournament.id];
    if (!tParticipants || tParticipants.length === 0) {
      toast({ title: "No participants", description: "No participants to award.", variant: "destructive" });
      return;
    }
    const placed = tParticipants.filter((p) => p.placement && p.placement > 0).sort((a, b) => (a.placement || 99) - (b.placement || 99));
    if (placed.length === 0) {
      toast({ title: "No placements", description: "Set placements first before awarding prizes.", variant: "destructive" });
      return;
    }
    const pool = tournament.prize_pool || 0;
    const splits = [0.5, 0.3, 0.2];
    let awarded = 0;
    for (let i = 0; i < Math.min(placed.length, 3); i++) {
      const prize = Math.floor(pool * splits[i]);
      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("user_id", placed[i].user_id).single();
      if (profile) {
        await supabase.from("profiles").update({ wallet_balance: (profile.wallet_balance || 0) + prize }).eq("user_id", placed[i].user_id);
        awarded += prize;
      }
    }
    await supabase.from("tournaments").update({ status: "completed" }).eq("id", tournament.id);
    toast({ title: "Prizes Awarded! 🏆", description: `${awarded} GZC distributed to top ${Math.min(placed.length, 3)} players.` });
    load();
    loadParticipants(tournament.id);
  };

  const removeParticipant = async (participant: Participant) => {
    if (!confirm(`Remove ${participant.profile?.username || "this player"} from the tournament?`)) return;
    const { error } = await supabase.from("tournament_participants").delete().eq("id", participant.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const tournament = tournaments.find((t) => t.id === participant.tournament_id);
      if (tournament) {
        await supabase.from("tournaments").update({ current_participants: Math.max(0, (tournament.current_participants || 1) - 1) }).eq("id", tournament.id);
      }
      toast({ title: "Removed", description: "Participant removed from tournament." });
      loadParticipants(participant.tournament_id);
      load();
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };

  const openEdit = (t: Tournament) => {
    setEditing(t);
    setForm({
      name: t.name, game: t.game, entry_fee: String(t.entry_fee || 0), prize_pool: String(t.prize_pool || 0),
      max_participants: String(t.max_participants || 100),
      start_date: t.start_date ? new Date(t.start_date).toISOString().slice(0, 16) : "",
      status: t.status || "upcoming", image_url: t.image_url || "",
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
      name: form.name, game: form.game, entry_fee: parseFloat(form.entry_fee) || 0,
      prize_pool: parseFloat(form.prize_pool) || 0, max_participants: parseInt(form.max_participants) || 100,
      start_date: new Date(form.start_date).toISOString(), status: form.status, image_url: form.image_url || null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("tournaments").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("tournaments").insert(payload));
    }
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Updated" : "Created", description: `Tournament "${form.name}" saved.` });
    setFormOpen(false);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tournament "${name}"?`)) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: `Tournament "${name}" removed.` });
    load();
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "live": return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 gap-1"><Radio className="h-3 w-3 animate-pulse" />Live</Badge>;
      case "upcoming": return <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">Upcoming</Badge>;
      case "completed": return <Badge className="bg-muted text-muted-foreground border-border/30">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlacementBadge = (placement: number | null) => {
    if (!placement) return <span className="text-muted-foreground text-xs">—</span>;
    if (placement === 1) return <Badge className="bg-primary/20 text-primary border-primary/30 gap-1"><Medal className="h-3 w-3" />1st</Badge>;
    if (placement === 2) return <Badge className="bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30 gap-1"><Medal className="h-3 w-3" />2nd</Badge>;
    if (placement === 3) return <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1"><Medal className="h-3 w-3" />3rd</Badge>;
    return <Badge variant="outline">#{placement}</Badge>;
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semi Finals";
    if (round === totalRounds - 2) return "Quarter Finals";
    return `Round ${round}`;
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
          <p className="text-muted-foreground mt-1">
            {tournaments.length} tournaments &bull; {tournaments.filter((t) => t.status === "live").length} live now
          </p>
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
              <div><Label className="text-foreground">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="EA FC 26 Nairobi Championship" /></div>
              <div><Label className="text-foreground">Game</Label><Input value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} placeholder="EA FC 26" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground">Entry Fee (GZC)</Label><Input type="number" value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: e.target.value })} /></div>
                <div><Label className="text-foreground">Prize Pool (GZC)</Label><Input type="number" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground">Max Participants</Label><Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} /></div>
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
              <div><Label className="text-foreground">Start Date</Label><Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label className="text-foreground">Image URL (optional)</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                {saving ? "Saving..." : editing ? "Update Tournament" : "Create Tournament"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Tournaments Highlight */}
      {tournaments.some((t) => t.status === "live") && (
        <Card className="border-neon-green/30 bg-neon-green/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-neon-green text-lg">
              <Zap className="h-5 w-5 animate-pulse" />
              Live Tournaments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tournaments.filter((t) => t.status === "live").map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-neon-green/5 border border-neon-green/20">
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.game} &bull; {t.current_participants || 0}/{t.max_participants} players</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">{t.prize_pool?.toLocaleString()} GZC</span>
                    <Button size="sm" variant="outline" className="border-neon-green/30 text-neon-green hover:bg-neon-green/10" onClick={() => toggleExpand(t.id)}>
                      <Users className="h-3.5 w-3.5 mr-1" /> Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <Card key={t.id} className={`glass-card border-border/50 transition-all ${expandedId === t.id ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-primary/30"}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      {getStatusBadge(t.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.game} &bull; {new Date(t.start_date).toLocaleDateString()} &bull;{" "}
                      {t.current_participants || 0}/{t.max_participants} players &bull; {t.prize_pool?.toLocaleString()} GZC prize
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Generate Bracket button for upcoming tournaments with participants */}
                    {t.status === "upcoming" && (t.current_participants || 0) >= 2 && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateBracket(t.id)}
                        disabled={generatingBracket}
                        className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 gap-1 text-xs"
                      >
                        <Swords className="h-3.5 w-3.5" />
                        {generatingBracket ? "Generating..." : "Generate Bracket"}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => toggleExpand(t.id)} className="text-muted-foreground hover:text-primary">
                      {expandedId === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id, t.name)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedId === t.id && (
                  <div className="mt-4 pt-4 border-t border-border/30 animate-fade-in space-y-6">
                    {/* Match Bracket Management */}
                    {matches[t.id] && matches[t.id].length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <Swords className="h-4 w-4 text-neon-cyan" />
                          Match Bracket
                        </h4>
                        {(() => {
                          const tMatches = matches[t.id];
                          const totalRounds = Math.max(...tMatches.map(m => m.round));
                          const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);
                          return (
                            <div className="overflow-x-auto pb-2">
                              <div className="flex gap-6 min-w-max">
                                {rounds.map((round) => {
                                  const roundMatches = tMatches.filter(m => m.round === round);
                                  return (
                                    <div key={round} className="flex flex-col min-w-[240px]">
                                      <h5 className="text-xs font-semibold text-neon-cyan mb-2 text-center">
                                        {getRoundName(round, totalRounds)}
                                      </h5>
                                      <div className="flex flex-col gap-3 justify-around flex-1">
                                        {roundMatches.map((match) => (
                                          <div key={match.id} className={`border rounded-lg p-3 text-sm ${
                                            match.status === "live" ? "border-neon-green/50 bg-neon-green/5" :
                                            match.status === "completed" ? "border-border/50 bg-secondary/30" :
                                            "border-border/30 bg-card/50"
                                          }`}>
                                            <div className="flex items-center justify-between mb-1">
                                              <span className={`text-xs ${match.winner_id === match.player1_id ? "text-neon-green font-bold" : "text-foreground"}`}>
                                                {match.player1_name || "TBD"}
                                              </span>
                                              {match.status === "completed" ? (
                                                <span className="font-mono text-xs font-bold text-foreground">{match.player1_score}</span>
                                              ) : match.status === "live" || (match.player1_id && match.player2_id && match.status === "pending") ? (
                                                <Input
                                                  type="number" min="0" className="w-12 h-6 text-xs text-center bg-secondary/50 p-0"
                                                  value={matchScores[match.id]?.s1 || ""}
                                                  onChange={(e) => setMatchScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], s1: e.target.value, s2: prev[match.id]?.s2 || "" } }))}
                                                />
                                              ) : null}
                                            </div>
                                            <div className="flex items-center justify-center my-0.5">
                                              <Swords className="w-3 h-3 text-muted-foreground/40" />
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                              <span className={`text-xs ${match.winner_id === match.player2_id ? "text-neon-green font-bold" : "text-foreground"}`}>
                                                {match.player2_name || "TBD"}
                                              </span>
                                              {match.status === "completed" ? (
                                                <span className="font-mono text-xs font-bold text-foreground">{match.player2_score}</span>
                                              ) : match.status === "live" || (match.player1_id && match.player2_id && match.status === "pending") ? (
                                                <Input
                                                  type="number" min="0" className="w-12 h-6 text-xs text-center bg-secondary/50 p-0"
                                                  value={matchScores[match.id]?.s2 || ""}
                                                  onChange={(e) => setMatchScores(prev => ({ ...prev, [match.id]: { s1: prev[match.id]?.s1 || "", s2: e.target.value } }))}
                                                />
                                              ) : null}
                                            </div>
                                            {/* Action buttons */}
                                            {match.status === "pending" && match.player1_id && match.player2_id && (
                                              <Button size="sm" variant="outline" className="w-full h-6 text-xs border-neon-green/30 text-neon-green" onClick={() => handleStartMatch(match.id)}>
                                                <Play className="h-3 w-3 mr-1" /> Start Match
                                              </Button>
                                            )}
                                            {match.status === "live" && (
                                              <Button size="sm" className="w-full h-6 text-xs bg-primary text-primary-foreground" onClick={() => handleCompleteMatch(match)}>
                                                <CheckCircle className="h-3 w-3 mr-1" /> Complete
                                              </Button>
                                            )}
                                            {match.status === "completed" && (
                                              <div className="text-center">
                                                <Badge className="bg-muted text-muted-foreground text-[10px]">Completed</Badge>
                                              </div>
                                            )}
                                            {match.status === "live" && (
                                              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-[10px] mt-1 animate-pulse">LIVE</Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Participants */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Participants ({participants[t.id]?.length || 0})
                        </h4>
                        {t.status !== "completed" && participants[t.id]?.some((p) => p.placement) && (
                          <Button size="sm" onClick={() => awardPrizes(t)} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground gap-1 text-xs">
                            <Trophy className="h-3.5 w-3.5" /> Award Prizes
                          </Button>
                        )}
                      </div>

                      {loadingParticipants === t.id ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : !participants[t.id] || participants[t.id].length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No participants have joined this tournament yet.
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border/30 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                                <TableHead className="text-xs">Player</TableHead>
                                <TableHead className="text-xs">Joined</TableHead>
                                <TableHead className="text-xs">Placement</TableHead>
                                <TableHead className="text-xs">Points</TableHead>
                                <TableHead className="text-xs text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {participants[t.id].map((p) => {
                                const edits = editingPlacements[p.id];
                                const currentPlacement = edits?.placement !== undefined ? edits.placement : String(p.placement || "");
                                const currentPoints = edits?.points !== undefined ? edits.points : String(p.points_earned || 0);
                                const hasChanges = edits !== undefined;
                                return (
                                  <TableRow key={p.id} className="hover:bg-secondary/20">
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {p.profile?.avatar_url ? (
                                          <img src={p.profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover border border-border/50" />
                                        ) : (
                                          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                            {(p.profile?.username || "?")[0]?.toUpperCase()}
                                          </div>
                                        )}
                                        <span className="text-sm font-medium text-foreground">{p.profile?.username || "Unknown"}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{new Date(p.joined_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {getPlacementBadge(p.placement)}
                                        <Input type="number" min="1" placeholder="#" value={currentPlacement} onChange={(e) => handlePlacementChange(p.id, "placement", e.target.value)} className="w-16 h-7 text-xs bg-secondary/50" />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Input type="number" min="0" placeholder="0" value={currentPoints} onChange={(e) => handlePlacementChange(p.id, "points", e.target.value)} className="w-20 h-7 text-xs bg-secondary/50" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center gap-1 justify-end">
                                        {hasChanges && (
                                          <Button size="sm" variant="ghost" onClick={() => savePlacement(p)} className="text-neon-green hover:text-neon-green h-7 text-xs px-2">Save</Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => removeParticipant(p)} className="text-destructive hover:text-destructive h-7 text-xs px-2">Remove</Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

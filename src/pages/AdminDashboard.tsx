import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  BookOpen, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  FileText,
  Calendar,
  Check,
  X,
  Crown,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data - would come from database
const sampleMaterials = [
  { id: "1", title: "Geography Form 4 NECTA 2023", description: "NECTA paper", driveLink: "https://drive.google.com", accessCodes: ["GEO2023F4"], enabled: true },
  { id: "2", title: "Geography Form 2 NECTA 2023", description: "Form 2 paper", driveLink: "https://drive.google.com", accessCodes: ["GEO2023F2"], enabled: true },
];

const samplePremiumUsers = [
  { id: "1", email: "student@example.com", name: "John Doe", expiresAt: "2024-06-15", approved: true },
  { id: "2", email: "jane@example.com", name: "Jane Smith", expiresAt: "2024-05-20", approved: false },
];

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [materials, setMaterials] = useState(sampleMaterials);
  const [premiumUsers, setPremiumUsers] = useState(samplePremiumUsers);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<typeof sampleMaterials[0] | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    driveLink: "",
    accessCodes: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo authentication - in production, use proper auth
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome, Admin",
        description: "You are now logged into the admin dashboard.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword("");
  };

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.driveLink) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const material = {
      id: Date.now().toString(),
      title: newMaterial.title,
      description: newMaterial.description,
      driveLink: newMaterial.driveLink,
      accessCodes: newMaterial.accessCodes.split(",").map(c => c.trim()),
      enabled: true,
    };

    setMaterials([...materials, material]);
    setNewMaterial({ title: "", description: "", driveLink: "", accessCodes: "" });
    setShowMaterialDialog(false);
    toast({
      title: "Material Added",
      description: `"${material.title}" has been added successfully.`,
    });
  };

  const toggleMaterialStatus = (id: string) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    toast({
      title: "Material Deleted",
      description: "The material has been removed.",
    });
  };

  const toggleUserApproval = (id: string) => {
    setPremiumUsers(premiumUsers.map(u =>
      u.id === id ? { ...u, approved: !u.approved } : u
    ));
    toast({
      title: "User Updated",
      description: "Premium user status has been updated.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-hero">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="font-display text-2xl">Admin Access</CardTitle>
              <CardDescription>Enter your admin password to continue</CardDescription>
            </CardHeader>
            <form onSubmit={handleAdminLogin}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button type="submit" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Access Dashboard
                </Button>
              </CardContent>
            </form>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">GeoPapers Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">View Site</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{materials.length}</p>
                  <p className="text-sm text-muted-foreground">Materials</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {premiumUsers.filter(u => u.approved).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Premium Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {premiumUsers.filter(u => !u.approved).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList>
            <TabsTrigger value="materials">
              <FileText className="h-4 w-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Premium Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Materials</CardTitle>
                  <CardDescription>Add, edit, or disable study materials</CardDescription>
                </div>
                <Button onClick={() => setShowMaterialDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Access Codes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{material.title}</p>
                            <p className="text-sm text-muted-foreground">{material.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {material.accessCodes.map((code, idx) => (
                              <span key={idx} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {code}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={material.enabled}
                            onCheckedChange={() => toggleMaterialStatus(material.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Premium Users</CardTitle>
                <CardDescription>Manage premium subscriptions and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {premiumUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {user.expiresAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.approved ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                              <Check className="h-4 w-4" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                              <X className="h-4 w-4" />
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={user.approved ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleUserApproval(user.id)}
                          >
                            {user.approved ? "Revoke" : "Approve"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Material Dialog */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              Add a new study material to the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="material-title">Title *</Label>
              <Input
                id="material-title"
                placeholder="Geography Form 4 NECTA 2024"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-description">Description</Label>
              <Textarea
                id="material-description"
                placeholder="Brief description of the material..."
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-drive">Google Drive Link *</Label>
              <Input
                id="material-drive"
                placeholder="https://drive.google.com/..."
                value={newMaterial.driveLink}
                onChange={(e) => setNewMaterial({ ...newMaterial, driveLink: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-codes">Access Codes (comma separated)</Label>
              <Input
                id="material-codes"
                placeholder="CODE1, CODE2"
                value={newMaterial.accessCodes}
                onChange={(e) => setNewMaterial({ ...newMaterial, accessCodes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

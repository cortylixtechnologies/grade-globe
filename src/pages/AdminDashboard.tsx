import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  BookOpen, 
  Users, 
  Plus, 
  Trash2, 
  LogOut,
  FileText,
  Calendar,
  Check,
  X,
  Crown,
  RefreshCw,
  UserPlus,
  LogIn,
  Key,
  Copy,
  Ticket,
  Clock,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Material = Tables<"materials">;
type PremiumSubscription = Tables<"premium_subscriptions">;
type AccessCode = Tables<"access_codes">;

interface PremiumUserWithProfile extends PremiumSubscription {
  profile?: {
    email: string;
    full_name: string | null;
  };
}

interface AccessCodeWithMaterial extends AccessCode {
  material?: {
    title: string;
  };
}

const AdminDashboard = () => {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [premiumUsers, setPremiumUsers] = useState<PremiumUserWithProfile[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCodeWithMaterial[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    drive_link: "",
    category: "Form 5",
    year: "2024",
  });
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    expires_months: "3",
  });
  const [newCode, setNewCode] = useState({
    material_id: "",
    quantity: "1",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setIsLoggingIn(false);
  };

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate, toast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoadingData(true);
    
    // Fetch materials
    const { data: materialsData, error: materialsError } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (materialsError) {
      console.error("Error fetching materials:", materialsError);
    } else {
      setMaterials(materialsData || []);
    }

    // Fetch premium subscriptions with profiles
    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from("premium_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (subscriptionsError) {
      console.error("Error fetching subscriptions:", subscriptionsError);
    } else {
      // Fetch profiles for each subscription
      const usersWithProfiles: PremiumUserWithProfile[] = [];
      for (const sub of subscriptionsData || []) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", sub.user_id)
          .maybeSingle();
        
        usersWithProfiles.push({
          ...sub,
          profile: profileData || undefined,
        });
      }
      setPremiumUsers(usersWithProfiles);
    }

    // Fetch access codes with materials
    const { data: codesData, error: codesError } = await supabase
      .from("access_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (codesError) {
      console.error("Error fetching access codes:", codesError);
    } else {
      const codesWithMaterials: AccessCodeWithMaterial[] = [];
      for (const code of codesData || []) {
        const material = materialsData?.find(m => m.id === code.material_id);
        codesWithMaterials.push({
          ...code,
          material: material ? { title: material.title } : undefined,
        });
      }
      setAccessCodes(codesWithMaterials);
    }

    setLoadingData(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.drive_link) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("materials")
      .insert({
        title: newMaterial.title,
        description: newMaterial.description || null,
        drive_link: newMaterial.drive_link,
        category: newMaterial.category,
        year: newMaterial.year,
        created_by: user?.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add material: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Material Added",
        description: `"${newMaterial.title}" has been added successfully.`,
      });
      setNewMaterial({ title: "", description: "", drive_link: "", category: "Form 5", year: "2024" });
      setShowMaterialDialog(false);
      fetchData();
    }

    setIsSubmitting(false);
  };

  const toggleMaterialStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("materials")
      .update({ enabled: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update material status.",
        variant: "destructive",
      });
    } else {
      setMaterials(materials.map(m => 
        m.id === id ? { ...m, enabled: !currentStatus } : m
      ));
    }
  };

  const deleteMaterial = async (id: string) => {
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete material.",
        variant: "destructive",
      });
    } else {
      setMaterials(materials.filter(m => m.id !== id));
      toast({
        title: "Material Deleted",
        description: "The material has been removed.",
      });
    }
  };

  const handleCreatePremiumUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: newUser.full_name,
        },
      },
    });

    if (authError) {
      toast({
        title: "Error Creating User",
        description: authError.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (authData.user) {
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + parseInt(newUser.expires_months));

      // Create premium subscription
      const { error: subError } = await supabase
        .from("premium_subscriptions")
        .insert({
          user_id: authData.user.id,
          approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (subError) {
        toast({
          title: "Warning",
          description: "User created but subscription failed: " + subError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Premium User Created",
          description: `Account created for ${newUser.email}. They can login immediately.`,
        });
        setNewUser({ email: "", password: "", full_name: "", expires_months: "3" });
        setShowUserDialog(false);
        fetchData();
      }
    }

    setIsSubmitting(false);
  };

  const toggleUserApproval = async (subscription: PremiumUserWithProfile) => {
    const newApproved = !subscription.approved;
    
    const { error } = await supabase
      .from("premium_subscriptions")
      .update({ 
        approved: newApproved,
        approved_by: newApproved ? user?.id : null,
        approved_at: newApproved ? new Date().toISOString() : null,
      })
      .eq("id", subscription.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    } else {
      setPremiumUsers(premiumUsers.map(u =>
        u.id === subscription.id ? { ...u, approved: newApproved } : u
      ));
      toast({
        title: "Subscription Updated",
        description: newApproved ? "User approved for premium access." : "Premium access revoked.",
      });
    }
  };

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase
      .from("premium_subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscription.",
        variant: "destructive",
      });
    } else {
      setPremiumUsers(premiumUsers.filter(u => u.id !== id));
      toast({
        title: "Subscription Removed",
        description: "The subscription has been deleted.",
      });
    }
  };

  // Generate random access code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCodes = async () => {
    if (!newCode.material_id) {
      toast({
        title: "Missing Field",
        description: "Please select a material.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const quantity = parseInt(newCode.quantity);
    const codes: { code: string; material_id: string }[] = [];

    for (let i = 0; i < quantity; i++) {
      codes.push({
        code: generateCode(),
        material_id: newCode.material_id,
      });
    }

    const { error } = await supabase
      .from("access_codes")
      .insert(codes);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate codes: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Codes Generated",
        description: `${quantity} access code(s) generated successfully.`,
      });
      setNewCode({ material_id: "", quantity: "1" });
      setShowCodeDialog(false);
      fetchData();
    }

    setIsSubmitting(false);
  };

  const deleteAccessCode = async (id: string) => {
    const { error } = await supabase
      .from("access_codes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete access code.",
        variant: "destructive",
      });
    } else {
      setAccessCodes(accessCodes.filter(c => c.id !== id));
      toast({
        title: "Code Deleted",
        description: "The access code has been removed.",
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Code "${code}" copied to clipboard.`,
    });
  };

  const approveRequest = async (codeId: string) => {
    const { error } = await supabase
      .from("access_codes")
      .update({ 
        status: "approved",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", codeId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Approved",
        description: "The user can now use their control number to access the material.",
      });
      fetchData();
    }
  };

  const rejectRequest = async (codeId: string) => {
    const { error } = await supabase
      .from("access_codes")
      .update({ 
        status: "rejected",
        admin_notes: "Payment not verified",
      })
      .eq("id", codeId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Rejected",
        description: "The control number has been marked as rejected.",
      });
      fetchData();
    }
  };

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-hero">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
              <CardDescription>Sign in with your admin credentials</CardDescription>
            </CardHeader>
            <form onSubmit={handleAdminLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoggingIn ? "Signing in..." : "Sign In as Admin"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
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
                  <p className="text-sm text-muted-foreground">Active Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Ticket className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {accessCodes.filter(c => !c.used && (c as any).status !== 'pending' && (c as any).status !== 'rejected').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Available Codes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {accessCodes.filter(c => (c as any).status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Key className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {accessCodes.filter(c => c.used).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Used Codes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">
              <Clock className="h-4 w-4 mr-2" />
              Pending Requests
              {accessCodes.filter(c => (c as any).status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {accessCodes.filter(c => (c as any).status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="materials">
              <FileText className="h-4 w-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="codes">
              <Key className="h-4 w-4 mr-2" />
              Access Codes
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Premium Users
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Pending Access Requests</CardTitle>
                <CardDescription>Review and approve control number requests from users</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : accessCodes.filter(c => (c as any).status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending requests. Users will appear here when they request access.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Control Number</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessCodes
                        .filter(c => (c as any).status === 'pending')
                        .map((code) => (
                          <TableRow key={code.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded font-mono text-sm text-amber-800 dark:text-amber-200">
                                  {code.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => copyToClipboard(code.code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{code.material?.title || "Unknown"}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {(code as any).requested_by || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {(code as any).requested_at 
                                  ? new Date((code as any).requested_at).toLocaleString()
                                  : "N/A"
                                }
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="default"
                                size="sm"
                                onClick={() => approveRequest(code.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => rejectRequest(code.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No materials yet. Add your first material above.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Year</TableHead>
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
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {material.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{material.category}</TableCell>
                          <TableCell>{material.year}</TableCell>
                          <TableCell>
                            <Switch 
                              checked={material.enabled}
                              onCheckedChange={() => toggleMaterialStatus(material.id, material.enabled)}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Access Codes</CardTitle>
                  <CardDescription>Generate and manage access codes for materials</CardDescription>
                </div>
                <Button onClick={() => setShowCodeDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Codes
                </Button>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : accessCodes.filter(c => (c as any).status !== 'pending').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No access codes yet. Generate some using the button above.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessCodes
                        .filter(c => (c as any).status !== 'pending')
                        .map((code) => {
                          const status = (code as any).status || 'available';
                          return (
                            <TableRow key={code.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                                    {code.code}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => copyToClipboard(code.code)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{code.material?.title || "Unknown"}</span>
                              </TableCell>
                              <TableCell>
                                {code.used ? (
                                  <Badge variant="secondary">Used</Badge>
                                ) : status === 'rejected' ? (
                                  <Badge variant="destructive">Rejected</Badge>
                                ) : status === 'approved' ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>
                                ) : (
                                  <Badge variant="default">Available</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {code.used_by ? (
                                  <span className="text-sm text-muted-foreground">{code.used_by}</span>
                                ) : (code as any).requested_by ? (
                                  <span className="text-sm text-muted-foreground">{(code as any).requested_by}</span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteAccessCode(code.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Premium Users</CardTitle>
                  <CardDescription>Manage premium subscriptions and create new premium accounts</CardDescription>
                </div>
                <Button onClick={() => setShowUserDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Premium User
                </Button>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : premiumUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No premium users yet. Create one using the button above.
                  </div>
                ) : (
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
                      {premiumUsers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.profile?.full_name || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{sub.profile?.email || sub.user_id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {sub.expires_at 
                                ? new Date(sub.expires_at).toLocaleDateString()
                                : "Never"
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {sub.approved ? (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                                <Check className="h-4 w-4" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                                <X className="h-4 w-4" />
                                Revoked
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant={sub.approved ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleUserApproval(sub)}
                            >
                              {sub.approved ? "Revoke" : "Approve"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteSubscription(sub.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newMaterial.category} 
                  onValueChange={(v) => setNewMaterial({ ...newMaterial, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Form 5">Form 5</SelectItem>
                    <SelectItem value="Form 6">Form 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select 
                  value={newMaterial.year} 
                  onValueChange={(v) => setNewMaterial({ ...newMaterial, year: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => 2024 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-drive">Google Drive Link *</Label>
              <Input
                id="material-drive"
                placeholder="https://drive.google.com/..."
                value={newMaterial.drive_link}
                onChange={(e) => setNewMaterial({ ...newMaterial, drive_link: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMaterial} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Premium User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Premium User</DialogTitle>
            <DialogDescription>
              Create a new account with premium access. Share these credentials with the user after payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name *</Label>
              <Input
                id="user-name"
                placeholder="John Doe"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="student@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password *</Label>
              <Input
                id="user-password"
                type="text"
                placeholder="Create a password for the user"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Share this password with the user. They can login immediately.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Subscription Duration</Label>
              <Select 
                value={newUser.expires_months} 
                onValueChange={(v) => setNewUser({ ...newUser, expires_months: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePremiumUser} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Premium User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Access Codes Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Access Codes</DialogTitle>
            <DialogDescription>
              Generate access codes for a specific material. Share these codes with users after payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Material *</Label>
              <Select 
                value={newCode.material_id} 
                onValueChange={(v) => setNewCode({ ...newCode, material_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.title} ({material.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Codes</Label>
              <Select 
                value={newCode.quantity} 
                onValueChange={(v) => setNewCode({ ...newCode, quantity: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Code</SelectItem>
                  <SelectItem value="5">5 Codes</SelectItem>
                  <SelectItem value="10">10 Codes</SelectItem>
                  <SelectItem value="25">25 Codes</SelectItem>
                  <SelectItem value="50">50 Codes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateCodes} disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Codes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Download, MessageCircle, BookOpen, Calendar, FileText, Lock, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type Material = Tables<"materials">;

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { user, isPremium } = useAuth();

  const categories = ["All", "Form 1", "Form 2", "Form 3", "Form 4"];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("enabled", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching materials:", error);
    } else {
      setMaterials(data || []);
    }
    setLoading(false);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestAccess = (material: Material) => {
    setSelectedMaterial(material);
    setShowRequestDialog(true);
  };

  const handleDownload = (material: Material) => {
    // If user is premium, open directly
    if (isPremium) {
      window.open(material.drive_link, "_blank");
      return;
    }
    
    setSelectedMaterial(material);
    setAccessCodeInput("");
    setShowAccessDialog(true);
  };

  const openWhatsApp = () => {
    if (!selectedMaterial) return;
    
    const phoneNumber = "255756377013";
    const message = encodeURIComponent(
      `Hello GeoPapers! 📚\n\n` +
      `I would like to request access to:\n` +
      `📄 Material: ${selectedMaterial.title}\n` +
      `💰 Plan: Basic (2,000 TZS)\n\n` +
      `Please send me the access code after payment confirmation.\n\n` +
      `Thank you!`
    );
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    setShowRequestDialog(false);
    
    toast({
      title: "WhatsApp Opened",
      description: "Complete your payment request via WhatsApp to receive your access code.",
    });
  };

  const verifyAccessCode = async () => {
    if (!selectedMaterial || !accessCodeInput.trim()) return;
    
    setIsVerifying(true);

    // Check if code exists and is unused for this material
    const { data: codeData, error } = await supabase
      .from("access_codes")
      .select("*")
      .eq("material_id", selectedMaterial.id)
      .eq("code", accessCodeInput.toUpperCase().trim())
      .eq("used", false)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
      setIsVerifying(false);
      return;
    }

    if (codeData) {
      // Mark code as used
      await supabase
        .from("access_codes")
        .update({ 
          used: true, 
          used_at: new Date().toISOString(),
          used_by: user?.email || "anonymous"
        })
        .eq("id", codeData.id);

      toast({
        title: "Access Granted! 🎉",
        description: `You can now download "${selectedMaterial.title}"`,
      });
      setShowAccessDialog(false);
      window.open(selectedMaterial.drive_link, "_blank");
    } else {
      toast({
        title: "Invalid Code",
        description: "The access code is incorrect or has already been used.",
        variant: "destructive",
      });
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Geography Materials
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Browse our collection of high-quality Geography past papers. 
                Pay 2,000 TZS per material or go Premium for unlimited access.
              </p>
              {isPremium && (
                <div className="mt-4 inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Premium Access Active</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Materials Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading materials...</p>
              </div>
            ) : filteredMaterials.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material, idx) => (
                  <Card 
                    key={material.id} 
                    className="shadow-card hover:shadow-lg transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero shrink-0">
                          <FileText className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {material.category}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-3">{material.title}</CardTitle>
                      <CardDescription>{material.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {material.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          PDF
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      {isPremium ? (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDownload(material)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="basic" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleRequestAccess(material)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Request
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownload(material)}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Enter Code
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No materials found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {materials.length === 0 
                    ? "No materials have been added yet. Check back soon!"
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {!isPremium && (
                  <Button variant="premium" asChild>
                    <Link to="/login">
                      <Crown className="h-4 w-4 mr-2" />
                      Get Premium Access
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Request Access Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Access via WhatsApp</DialogTitle>
            <DialogDescription>
              You're about to request access to: <strong>{selectedMaterial?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm"><strong>Price:</strong> 2,000 TZS</p>
              <p className="text-sm"><strong>Material:</strong> {selectedMaterial?.title}</p>
              <p className="text-sm text-muted-foreground">
                After payment, you'll receive an access code via WhatsApp.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button variant="whatsapp" onClick={openWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Open WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Code Dialog */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Access Code</DialogTitle>
            <DialogDescription>
              Enter the access code you received for: <strong>{selectedMaterial?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Enter your access code"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Don't have a code? Request access via WhatsApp.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccessDialog(false)}>
              Cancel
            </Button>
            <Button onClick={verifyAccessCode} disabled={isVerifying}>
              <Download className="h-4 w-4 mr-2" />
              {isVerifying ? "Verifying..." : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Materials;

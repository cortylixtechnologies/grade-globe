import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, MessageCircle, Phone, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RequestControlNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: {
    id: string;
    title: string;
  } | null;
}

const generateControlNumber = () => {
  const prefix = "ASA";
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

const RequestControlNumberModal = ({ open, onOpenChange, material }: RequestControlNumberModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!material || !phoneNumber.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number to receive updates.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const newControlNumber = generateControlNumber();

    const { error } = await supabase
      .from("access_codes")
      .insert({
        code: newControlNumber,
        material_id: material.id,
        status: "pending",
        requested_by: phoneNumber.trim(),
        requested_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error creating control number request:", error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setControlNumber(newControlNumber);
    setStep('success');
    setIsSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(controlNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Control number copied to clipboard.",
    });
  };

  const handleClose = () => {
    setStep('form');
    setPhoneNumber("");
    setControlNumber("");
    setCopied(false);
    onOpenChange(false);
  };

  const openWhatsAppWithControlNumber = () => {
    const whatsappNumber = "255756377013";
    const message = encodeURIComponent(
      `Hello GeoPapers! 📚\n\n` +
      `I have requested access to a material:\n` +
      `📄 Material: ${material?.title}\n` +
      `🔢 Control Number: ${controlNumber}\n` +
      `💰 Amount: 2,000 TZS\n\n` +
      `I will make the payment and notify you.\n\n` +
      `Thank you!`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Request Access Control Number</DialogTitle>
              <DialogDescription>
                Get a control number for: <strong>{material?.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., 0756377013"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to notify you when your access is approved.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">How it works:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Get your unique control number</li>
                  <li>Pay 2,000 TZS via M-Pesa or Tigo Pesa</li>
                  <li>Contact us on WhatsApp with your control number</li>
                  <li>Once verified, your control number will grant access</li>
                </ol>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Generating..." : "Get Control Number"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Your Control Number</DialogTitle>
              <DialogDescription className="text-center">
                Save this number and complete your payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Control Number Display */}
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Control Number</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-bold font-mono text-primary">
                    {controlNumber}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Payment Instructions
                </p>
                <div className="text-sm space-y-2">
                  <p><strong>Amount:</strong> 2,000 TZS</p>
                  <p><strong>Material:</strong> {material?.title}</p>
                  <div className="border-t pt-2 mt-2">
                    <p className="font-medium mb-1">Pay via Mobile Money:</p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      M-Pesa / Tigo Pesa: <strong>0756 377 013</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Name: Advanced Socratic Association
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">After Payment:</p>
                <p>Send your control number via WhatsApp for verification. Once approved, use the same control number to download your material.</p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Done
              </Button>
              <Button variant="whatsapp" onClick={openWhatsAppWithControlNumber} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Notify via WhatsApp
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestControlNumberModal;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePayment } from "@/hooks/usePayment";
import { Loader2, CheckCircle, XCircle, Phone, Smartphone } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: {
    id: string;
    title: string;
    price: number;
  } | null;
  onSuccess?: (accessCode: string, driveLink: string) => void;
}

type PaymentStep = 'form' | 'processing' | 'success' | 'failed';

const providers = [
  { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-500' },
  { id: 'tigopesa', name: 'Tigo Pesa', color: 'bg-blue-500' },
  { id: 'airtelmoney', name: 'Airtel Money', color: 'bg-red-500' },
  { id: 'halopesa', name: 'Halopesa', color: 'bg-orange-500' },
];

const PaymentModal = ({ open, onOpenChange, material, onSuccess }: PaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('mpesa');
  const [step, setStep] = useState<PaymentStep>('form');
  const [accessCode, setAccessCode] = useState('');
  const [driveLink, setDriveLink] = useState('');
  
  const { initiatePayment, pollPaymentStatus, isProcessing } = usePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!material) return;
    
    setStep('processing');
    
    const result = await initiatePayment(
      phoneNumber,
      material.price,
      provider,
      material.id,
      material.title
    );

    if (result.success && result.paymentId) {
      // Start polling for payment status
      pollPaymentStatus(
        result.paymentId,
        (status) => {
          setStep('success');
          if (status.accessCode) {
            setAccessCode(status.accessCode);
          }
          if (status.material?.driveLink) {
            setDriveLink(status.material.driveLink);
          }
          onSuccess?.(status.accessCode || '', status.material?.driveLink || '');
        },
        () => {
          setStep('failed');
        }
      );
    } else {
      setStep('failed');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after closing
    setTimeout(() => {
      setStep('form');
      setPhoneNumber('');
      setProvider('mpesa');
      setAccessCode('');
      setDriveLink('');
    }, 300);
  };

  const handleRetry = () => {
    setStep('form');
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && 'Complete Payment'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Payment Successful!'}
            {step === 'failed' && 'Payment Failed'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && `Pay TZS ${material.price.toLocaleString()} for "${material.title}"`}
            {step === 'processing' && 'Please check your phone and enter your PIN to complete the payment.'}
            {step === 'success' && 'Your payment has been confirmed. You can now access the material.'}
            {step === 'failed' && 'Something went wrong with your payment. Please try again.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  required
                  pattern="[0-9]{9,12}"
                  title="Enter a valid phone number"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your mobile money number (e.g., 0712345678)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <RadioGroup value={provider} onValueChange={setProvider} className="grid grid-cols-2 gap-2">
                {providers.map((p) => (
                  <div key={p.id}>
                    <RadioGroupItem value={p.id} id={p.id} className="peer sr-only" />
                    <Label
                      htmlFor={p.id}
                      className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm font-medium">{p.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">TZS {material.price.toLocaleString()}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                `Pay TZS ${material.price.toLocaleString()}`
              )}
            </Button>
          </form>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Waiting for payment confirmation...
              <br />
              <span className="text-sm">This may take a few moments.</span>
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            
            {accessCode && (
              <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Access Code:</p>
                <p className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                  {accessCode}
                </p>
              </div>
            )}

            {driveLink && (
              <Button asChild className="w-full">
                <a href={driveLink} target="_blank" rel="noopener noreferrer">
                  Download Material
                </a>
              </Button>
            )}

            <Button variant="outline" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {step === 'failed' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-center text-muted-foreground">
              The payment could not be completed. Please check your balance and try again.
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRetry} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  externalId?: string;
  error?: string;
}

interface PaymentStatus {
  id: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  provider: string;
  accessCode: string | null;
  material: {
    title: string;
    driveLink: string;
  } | null;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<{ paymentId: string; externalId: string } | null>(null);
  const { toast } = useToast();

  const initiatePayment = useCallback(async (
    phoneNumber: string,
    amount: number,
    provider: string,
    materialId: string,
    materialTitle: string
  ): Promise<PaymentResult> => {
    setIsProcessing(true);

    try {
      // Format phone number (ensure it starts with 255)
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '255' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('255')) {
        formattedPhone = '255' + formattedPhone;
      }

      const { data, error } = await supabase.functions.invoke('azampay-checkout', {
        body: {
          phoneNumber: formattedPhone,
          amount,
          provider,
          materialId,
          materialTitle,
        },
      });

      if (error) {
        console.error('Payment initiation error:', error);
        throw new Error(error.message || 'Failed to initiate payment');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      setCurrentPayment({
        paymentId: data.paymentId,
        externalId: data.externalId,
      });

      toast({
        title: "Payment Initiated",
        description: "Please check your phone to complete the payment.",
      });

      return {
        success: true,
        paymentId: data.paymentId,
        externalId: data.externalId,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<PaymentStatus | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('payment-status', {
        body: { paymentId },
      });

      if (error || !data.success) {
        console.error('Status check error:', error || data.error);
        return null;
      }

      return data.payment;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }, []);

  const pollPaymentStatus = useCallback(async (
    paymentId: string,
    onSuccess: (status: PaymentStatus) => void,
    onFailed: () => void,
    maxAttempts = 30,
    intervalMs = 5000
  ) => {
    let attempts = 0;

    const poll = async () => {
      attempts++;
      const status = await checkPaymentStatus(paymentId);

      if (status) {
        if (status.status === 'success') {
          onSuccess(status);
          return;
        } else if (status.status === 'failed') {
          onFailed();
          return;
        }
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        toast({
          title: "Payment Timeout",
          description: "Payment status check timed out. Please check your payment history.",
          variant: "destructive",
        });
      }
    };

    poll();
  }, [checkPaymentStatus, toast]);

  return {
    isProcessing,
    currentPayment,
    initiatePayment,
    checkPaymentStatus,
    pollPaymentStatus,
  };
};

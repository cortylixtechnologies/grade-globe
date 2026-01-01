-- Create payments table for AzamPay transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  azampay_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  access_code_id UUID REFERENCES public.access_codes(id) ON DELETE SET NULL,
  callback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_payments_external_id ON public.payments(external_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Policy: Anyone can insert payments (for checkout flow)
CREATE POLICY "Anyone can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);

-- Policy: Anyone can view payments by external_id (for status checking)
CREATE POLICY "Anyone can view payments by external_id" 
ON public.payments 
FOR SELECT 
USING (true);

-- Policy: Service can update payments (for callbacks)
CREATE POLICY "Anyone can update payment status" 
ON public.payments 
FOR UPDATE 
USING (true);

-- Policy: Admins can manage all payments
CREATE POLICY "Admins can manage all payments" 
ON public.payments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
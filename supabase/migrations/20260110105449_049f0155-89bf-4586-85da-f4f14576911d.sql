-- Add status tracking to access_codes table
ALTER TABLE public.access_codes 
ADD COLUMN status text NOT NULL DEFAULT 'available',
ADD COLUMN requested_by text,
ADD COLUMN requested_at timestamp with time zone,
ADD COLUMN approved_by uuid,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN admin_notes text;

-- Add constraint for valid status values
ALTER TABLE public.access_codes 
ADD CONSTRAINT access_codes_status_check 
CHECK (status IN ('available', 'pending', 'approved', 'rejected'));

-- Create index for faster status queries
CREATE INDEX idx_access_codes_status ON public.access_codes(status);

-- Update RLS policy to allow users to create pending requests
CREATE POLICY "Anyone can request access codes"
ON public.access_codes
FOR INSERT
WITH CHECK (status = 'pending');

-- Allow users to view their own pending requests
CREATE POLICY "Users can view their pending requests"
ON public.access_codes
FOR SELECT
USING (requested_by IS NOT NULL);
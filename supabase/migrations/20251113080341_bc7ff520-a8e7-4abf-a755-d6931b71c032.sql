-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false);

-- Allow users to upload their own payment proof
CREATE POLICY "Users can upload their payment proof"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own payment proof
CREATE POLICY "Users can view their own payment proof"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);
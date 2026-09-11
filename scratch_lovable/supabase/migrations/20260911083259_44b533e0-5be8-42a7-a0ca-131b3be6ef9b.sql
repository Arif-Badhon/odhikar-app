CREATE POLICY "Active staff can read case audio"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'case-audio' AND public.is_active_staff(auth.uid()));
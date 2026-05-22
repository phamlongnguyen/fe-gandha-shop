import { supabase } from '@/lib/supabase';

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${productId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadErr) throw uploadErr;
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
  const { error: updateErr } = await supabase
    .from('products')
    .update({ image_url: publicUrl })
    .eq('id', productId);
  if (updateErr) throw updateErr;
  return publicUrl;
}

export async function uploadStaffAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('staff-avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadErr) throw uploadErr;
  const { data: { publicUrl } } = supabase.storage.from('staff-avatars').getPublicUrl(path);
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);
  if (updateErr) throw updateErr;
  return publicUrl;
}

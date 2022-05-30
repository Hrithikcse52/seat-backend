import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON } from '../config';

export const supabase = createClient('https://wxmwctiasizeoqlubrjn.supabase.co', SUPABASE_ANON!);

export async function uploadImage(
  bucket: string,
  dir: string,
  filename: string,
  orgFile: Express.Multer.File | null,
  file: string | ArrayBuffer | ArrayBufferView | Blob | FormData | NodeJS.ReadableStream | ReadableStream<Uint8Array>
) {
  const { data } = await supabase.storage.from(bucket).list(dir);
  let finalName = '';
  const cacheControl = {
    cacheControl: '3600',
    contentType: 'image/png',
  };
  if (orgFile) {
    cacheControl.contentType = orgFile.mimetype;
  }

  console.log('data', data);
  if (data && data.length > 0) {
    await supabase.storage.from(bucket).update(dir + data[0].name, file, cacheControl);
    finalName = dir + data[0].name;
  }
  await supabase.storage.from(bucket).upload(dir + filename, file, cacheControl);
  finalName = dir + filename;
  return supabase.storage.from(bucket).getPublicUrl(finalName);
}

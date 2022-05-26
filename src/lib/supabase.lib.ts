import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON } from '../config';

export const supabase = createClient(
  'https://wxmwctiasizeoqlubrjn.supabase.co',
  SUPABASE_ANON!
);

export function uploadImage(
  bucket: string,
  dir: string,
  file:
    | string
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | FormData
    | NodeJS.ReadableStream
    | ReadableStream<Uint8Array>
) {
  return supabase.storage.from(bucket).upload(dir, file, { upsert: true });
}

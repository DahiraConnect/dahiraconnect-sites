-- Messages vocaux (annonce) : le stockage accepte aussi l'audio, 5 Mo maximum
update storage.buckets
set allowed_mime_types = array[
  'image/webp', 'image/jpeg', 'image/png',
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a', 'audio/wav'
]
where id = 'media';

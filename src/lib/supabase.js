import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  'https://mbhtqhdljwylvzfaqqdi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaHRxaGRsand5bHZ6ZmFxcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTI5NjcsImV4cCI6MjA4NjA4ODk2N30.7B5CwB8D71Z5sZzcsrWBvNotRp55vYQdfwktfuCRFIU' // <--- Paste your real key here!
)
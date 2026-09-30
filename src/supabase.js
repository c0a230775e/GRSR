import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rcoloqruntstlceuxbly.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb2xvcXJ1bnRzdGxjZXV4Ymx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjI4NjcsImV4cCI6MjEwNTg5ODg2N30.8glkerUtTVRkuUAbRGjKOrE7j6CLqBX4N9Gr6U80ij4'

export const supabase = createClient(supabaseUrl, supabaseKey)

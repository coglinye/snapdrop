/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User's unique identifier
      - `email` (text) - User's email address
      - `subscription_tier` (text) - User's current subscription level
      - `storage_used` (bigint) - Total storage space used in bytes
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `transfers`
      - `id` (uuid, primary key) - Transfer's unique identifier
      - `user_id` (uuid) - Reference to users table
      - `name` (text) - Transfer name/title
      - `message` (text) - Optional message for recipients
      - `expires_at` (timestamptz) - When the transfer expires
      - `password` (text) - Optional password hash for protected transfers
      - `download_count` (int) - Number of times files were downloaded
      - `created_at` (timestamptz) - Transfer creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `files`
      - `id` (uuid, primary key) - File's unique identifier
      - `transfer_id` (uuid) - Reference to transfers table
      - `name` (text) - Original filename
      - `size` (bigint) - File size in bytes
      - `mime_type` (text) - File's MIME type
      - `storage_path` (text) - Path in storage bucket
      - `created_at` (timestamptz) - File upload timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to active transfers
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscription_tier text NOT NULL DEFAULT 'free',
  storage_used bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  message text,
  expires_at timestamptz NOT NULL,
  password text,
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
  name text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Transfers policies
CREATE POLICY "Users can CRUD own transfers"
  ON transfers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read active transfers"
  ON transfers
  FOR SELECT
  TO anon
  USING (expires_at > now());

-- Files policies
CREATE POLICY "Users can CRUD own files"
  ON files
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transfers 
    WHERE transfers.id = files.transfer_id 
    AND transfers.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can read files from active transfers"
  ON files
  FOR SELECT
  TO anon
  USING (EXISTS (
    SELECT 1 FROM transfers 
    WHERE transfers.id = files.transfer_id 
    AND transfers.expires_at > now()
  ));
-- Project Templates Table (removed - no longer needed)

-- Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('lead', 'tester', 'observer')),
  permissions JSONB DEFAULT '{}', -- Role-specific permissions
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Update projects table to include new fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3b82f6';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Create unique constraint for project slug within organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_org_slug_unique 
ON projects(organization_id, slug) 
WHERE slug IS NOT NULL;

-- RLS Policies for project_templates (removed - no longer needed)

-- RLS Policies for project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Users can view project members if they are members of the project's organization
CREATE POLICY "Users can view project members in their org" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Users can manage project members if they are project leads or org admins
CREATE POLICY "Leads and admins can manage project members" ON project_members
  FOR ALL USING (
    -- User is a project lead
    (user_id = auth.uid() AND role = 'lead')
    OR
    -- User is an org admin
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
    )
    OR
    -- User is a project lead
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'lead'
    )
  );

-- Update projects table RLS to include new fields
-- (Assuming projects table already has RLS policies)

-- Function to automatically generate slug from name
CREATE OR REPLACE FUNCTION generate_project_slug(project_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(project_name, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique slug within organization
CREATE OR REPLACE FUNCTION ensure_unique_project_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name
  base_slug := generate_project_slug(NEW.name);
  
  -- If slug is provided, use it as base
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    base_slug := lower(regexp_replace(NEW.slug, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'project';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness within organization
  WHILE EXISTS (
    SELECT 1 FROM projects 
    WHERE organization_id = NEW.organization_id 
    AND slug = final_slug 
    AND id != COALESCE(NEW.id, gen_random_uuid())
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate unique slug
CREATE OR REPLACE TRIGGER trigger_ensure_unique_project_slug
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION ensure_unique_project_slug();

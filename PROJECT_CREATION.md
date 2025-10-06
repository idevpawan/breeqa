## Project Creation - Plan and Improvements

### What we have today

- **Creation UI**: `ProjectCreationDialog` with name and optional description, loading and error states.
- **State & actions**: `ProjectProvider` exposes `createProject`, `updateProject`, `deleteProject`, `loadProjects`; stores `projects`, `currentProject`, persists `currentProjectId` in localStorage.
- **Data layer**: `organizationServiceClient` supports `createProject`, `getOrganizationProjects`, `updateProject`, `deleteProject`. Projects filtered by org and `status = "active"`.
- **Navigation**: `NavProjects` lists projects, links to `/projects/{id}`, allows deletion, and surfaces creation when empty.

### Gaps and quick wins

- **After create**: Redirect to `/projects/{id}` and set as `currentProject`.
- **Validation**: Enforce non-empty name, max lengths; handle duplicate names per org gracefully.
- **Feedback**: Toast notifications for create/update/delete success and failures.
- **Loading/empty states**: Show skeletons and richer guidance when no projects exist.
- **Optimistic UX**: Keep optimistic add/update/remove with rollback on failure.
- **Org guardrails**: Prevent create if no organization is selected; show inline guidance.

### Features that make life easier

- **Templates/starters** (Enhanced creation flow)
  - Choose a template (e.g., Default, QA Suite, Bug Bash, Mobile Testing, API Testing) to seed labels, workflows, and sample data.
  - Templates define initial settings, checklists, and project structure.
  - Preview template details before selection.
- **Team assignment at creation**
  - Select team members from organization during project creation.
  - Assign roles (Project Lead, Tester, Observer) with appropriate permissions.
  - Send notifications to assigned members immediately.
  - Optional: Auto-invite external users via email with project context.
- **Metadata at create time**
  - Auto-generate a slug from name (unique per org, editable).
  - Optional icon/color for quick identification in the sidebar.
  - "Pin project" toggle to keep it on top.
- **Onboarding**
  - Post-create checklist: invite members, configure media/env, connect integrations.
  - Inline prompts when required configs are missing.
- **Project settings**
  - Page to manage name, description, slug, icon/color, status (active/archived), delete/transfer.
  - Prefer archive over delete; filter archived in lists.
- **Collaboration**
  - Invite members from project context with role suggestions.
  - Shareable short link (within auth constraints).
- **Organization integration**
  - Recent projects, search, sort (name, created date, last active), favorites/pins.
- **Quality & ops**
  - Audit fields: `created_by`, `updated_at`; optional activity log.
  - Soft delete via `status = archived`; avoid hard delete by default.
  - RLS: constrain to org membership; indexes on `organization_id`, `slug`, `status`.
  - Rate limiting for creation; basic telemetry for creation and activation.

### Data model notes (Supabase)

- **Projects table**: `id`, `organization_id`, `name`, `slug`, `description`, `icon` (URL), `color`, `template_id`, `status` (active|archived), `created_by`, `created_at`, `updated_at`.
- **Project templates table**: `id`, `name`, `description`, `icon`, `config` (JSON: labels, workflows, settings), `is_default`, `created_at`.
- **Project members table**: `id`, `project_id`, `user_id`, `role` (lead|tester|observer), `permissions` (JSON), `joined_at`, `invited_by`.
- **Unique indexes**: `(organization_id, slug)`, `(project_id, user_id)` for project members.
- **Indexes**: `organization_id`, `status`, `template_id`.

### Recommended next steps (implementation order)

1. **Enhanced creation dialog**: Add template selection and team assignment UI.
2. **Template system**: Create templates table and seed with Default, QA Suite, Mobile Testing templates.
3. **Project members**: Implement project-level member management with roles.
4. **Redirect after create**: Navigate to `/projects/[id]` and set as `currentProject`.
5. **Toast notifications**: Add success/error feedback for all project actions.
6. **Validation**: Name/slug validation, duplicate handling, team assignment validation.
7. **Archive flow**: Replace hard delete with archive; add filtering.
8. **Project pages**: Create `/projects/[id]` and `/projects/[id]/settings` pages.

### Acceptance criteria (for initial pass)

- **Template selection**: User can choose from available templates during project creation.
- **Team assignment**: User can select team members and assign roles during creation.
- **Enhanced validation**: Name/slug validation, duplicate handling, team assignment validation.
- **Post-creation flow**: Redirect to project page, set as current, send notifications to team.
- **Feedback**: Success/error toasts for all project actions.
- **Archive flow**: Projects can be archived instead of deleted; archived projects are filtered out by default.

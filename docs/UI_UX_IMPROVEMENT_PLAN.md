# UI/UX Improvement Implementation Plan - MERU_PSB

This plan outlines the enhancements for the MERU_PSB recruitment platform to align with modern recruitment standards and public service requirements.

## Phase 1: Admin Efficiency (The "Power Recruiter" Suite)
**Goal:** Streamline high-volume applicant processing.

- [ ] **Bulk Action Center:**
    - Implement multi-select checkboxes in the applicant list.
    - Add a "Bulk Actions" floating bar/header (Shortlist, Reject, Invite to Interview).
- [ ] **Advanced Filtering Sidebar:**
    - Add filters for specific qualifications (e.g., Level of Education).
    - Add filters for experience years and professional membership status.
- [ ] **Quick Review Mode:**
    - Add a side-by-side view for reviewing profiles and applications without navigating away from the list.

## Phase 2: Applicant Clarity (The "Guided Path")
**Goal:** Reduce candidate anxiety and improve data quality.

- [ ] **Visual Application Timeline:**
    - Replace text status with a visual progress stepper (Submitted -> Reviewing -> Shortlisted -> Interview -> Final Decision).
- [ ] **Centralized Document Vault:**
    - Allow users to upload common documents (ID, Certificates) once and reuse them.
- [ ] **Interview Preparation Portal:**
    - A dedicated view for shortlisted candidates to see interview date, location, and required documents.

## Phase 3: Integrity & Transparency
**Goal:** Ensure auditability and fair processing.

- [ ] **Decision Justification:**
    - Mandate a "Reason for Action" note when shortlisting or rejecting (Admin side).
- [ ] **Digital Scorecards:**
    - Create a structured UI for board members to enter interview marks directly.
- [ ] **Audit Trail Visibility:**
    - Simple "History" tab on applications showing who changed the status and when.

---

## Execution Strategy

### Step 1: Admin Bulk Actions (Current Focus)
1. Modify `apps/web/components/admin/applications/applicant-table.tsx` (or equivalent) to support selection.
2. Create `apps/web/components/admin/applications/bulk-actions-bar.tsx`.
3. Update `apps/web/hooks/use-applications.ts` to support bulk status updates.

### Step 2: Applicant Timeline
1. Create `apps/web/components/applications/application-timeline.tsx`.
2. Update application detail pages to include the timeline.

### Step 3: Advanced Filters
1. Enhance `apps/web/components/admin/applications/application-filters.tsx`.

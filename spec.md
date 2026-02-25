# Specification

## Summary
**Goal:** Build a full-featured Admin Dashboard for the Prodigy Digital Library platform, with admin-gated backend endpoints and a protected frontend dashboard at `/admin`.

**Planned changes:**
- Extend the backend Motoko actor with admin-only endpoints (gated to principal `zhpm4-xby3w-hy7nv-ziwxz-heeqw-f2qf4-p2o5a-qradb`) for: user management (get all, delete, ban/unban, suspend/unsuspend, force-logout), book management (delete any, approve/reject, feature/unfeature), PDF/storage management (get all PDFs, delete PDF, get/set max upload size, storage stats), platform settings (site name, logo URL, announcement banner, maintenance mode), and analytics (total users/books/uploads, most-viewed, most-bookmarked, most-active users, activity log)
- All admin backend endpoints must reject non-admin callers with an error without mutating state
- Add `/admin` route protected by the existing `AdminGuard` component with a sidebar/tab navigation containing six sections: Overview/Analytics, User Management, Book Management, Storage Control, Platform Settings, and Security
- **Overview/Analytics:** stat cards for total users, books, uploads, approved books, pending books; lists for most-viewed books, most-bookmarked books, and most-active users by upload count
- **User Management:** paginated table of all users (name, principal, role, status, uploads, join date) with per-row delete, ban/unban, suspend/unsuspend actions and confirmation dialogs
- **Book Management:** searchable/filterable list of all books (all statuses) with cover, title, author, genre, status, featured flag, view count; per-book actions for edit, delete, approve, reject, feature/unfeature
- **Storage Control:** storage stats card (total bytes used, max upload size), list of all PDFs with metadata and per-entry delete, inline control to update max upload size
- **Platform Settings:** editable form for site name, logo URL, announcement banner (with enable/disable toggle), and maintenance mode toggle; non-admin users see a maintenance interstitial page when maintenance mode is active; announcement banner displays on homepage when enabled
- **Security:** list of banned/suspended users with quick unban/unsuspend, block-by-principal form, and activity log of recent events (new registrations, uploads, removals) with timestamps and actor principal
- Dashboard is fully mobile-responsive with loading skeletons and error states per section; all actions show toast notifications

**User-visible outcome:** The admin can log in and access a comprehensive dashboard at `/admin` to monitor platform analytics, manage users (ban, suspend, delete), manage books (approve, reject, feature, edit, delete), control PDF storage, configure platform-wide settings including maintenance mode and announcement banners, and review a security activity log — while all non-admin users are denied access to any admin endpoint or route.

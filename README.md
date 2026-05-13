

## Dashboard functionality (PPT-ready)

### Employee dashboard (Employee portal)

- **Dashboard overview**: points balance + lifetime points, attendance summary, performance snapshot, badges/achievements, streak + level, Employee-of-the-Month highlight, announcements, recent activity.
- **My Profile**: view/edit profile (name, avatar, phone, bio); view read-only org fields (email, department, role).
- **Attendance**: check-in/check-out, QR check-in fallback, attendance history, monthly attendance %, streak tracking, leave requests + leave history.
- **Performance**: KPI list and progress, performance summary, AI improvement suggestions (with safe fallback when AI is unavailable).
- **Rewards & Points**: wallet balance, points ledger/history, links into redemption store.
- **Badges & Achievements**: earned vs locked badges, progress toward unlock criteria, rarity tiers.
- **Bonuses**: bonus history, per-cycle breakdown, rationale/justification snippets.
- **Feedback**: feedback inbox with sentiment cues, send peer kudos, submit self-feedback/suggestions.
- **Leaderboard**: rank by points (and common groupings like department/tenure), Employee-of-the-Month badge surfaced.
- **Notifications**: in-app notification center (unread count + mark read), bell/feed for rewards, feedback, badges, and announcements.
- **Settings**: notification preferences, privacy/consent controls, theme.
- **Logout**: sign out.

### HR / Admin dashboard (HR portal)

- **Dashboard overview**: total/active employees, attendance stats, reward distribution, performance summary, system activity, pending queues (e.g., leaves/redemptions), Employee-of-the-Month card, announcements.
- **Employee Management**: employee CRUD, bulk import (CSV), manage departments/roles.
- **Attendance Management**: org-wide attendance view, late/absence visibility, leave approval queue (approve/reject), QR poster/token generation for office check-in.
- **Performance Management (KPIs)**: define KPIs, assign to employees, evaluate progress, generate performance summaries.
- **Reward Management**: manual point/reward issuance, rewards ledger view, reward rules/configuration, catalog management, redemption approval/decision flow.
- **Bonus Management (Allocator)**: AI-assisted bonus allocation against a budget pool, cycle history, evidence-grounded justifications, admin approval (human-in-the-loop).
- **Badge Management**: create/edit badges, configure criteria, view badge distribution.
- **Feedback & Reviews**: browse feedback across org, sentiment summaries, review trends and potential manager-skew signals.
- **Leaderboard Control**: view rankings, select/override Employee-of-the-Month.
- **Reports & Analytics**: attendance/performance/reward analytics, exports, fairness/audit reporting.
- **Announcements**: create/publish announcements (all or specific departments), pin important updates, fan-out notifications.
- **Settings**: reward configuration (point rules), bonus pool defaults, AI settings/guardrails, system/security/compliance info.
- **Logout**: sign out.

### Optional / advanced capabilities

- **Employee of the Month**: monthly winner selection (admin override) surfaced on both dashboards.
- **Reward Store**: catalog + redemption flow; employee redeems points, admin approves/fulfills.
- **QR attendance**: rotating signed token for secure QR-based check-in.
- **Notifications**: in-app feed with unread badge (polling by default; realtime can be enabled later).
- **Gamification levels**: tiered levels derived from lifetime points.
- **Daily streaks**: consecutive attendance streak tracking; can be used for badges/points rules.
- **AI performance suggestions**: personalised tips derived from KPI/attendance/feedback signals with deterministic fallback.

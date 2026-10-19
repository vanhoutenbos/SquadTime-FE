# SquadTime – Design guide

The exported reference markup is in `design/` (reference only: copy the look, not the structure). If this guide and the code disagree, the code wins.

## Feel

Discord-inspired but simpler. Dark, calm, a little playful. Colors that speak (mint = available, amber = action or attention). Pixel-art accents (the desk scene on the home and login screens). No gradients, glassmorphism, purple, stock photos or emoji icons. Not generic "AI dashboard".

## Colors (CSS variables)

| Token             | Value     | Use                                        |
| ----------------- | --------- | ------------------------------------------ |
| `--bg`            | `#14161B` | Page background                            |
| `--bg-bar`        | `#181B21` | Header, cards                              |
| `--surface`       | `#1C1F26` | Inputs, rows, tooltips                     |
| `--border`        | `#2A2E38` | Card borders                               |
| `--border-strong` | `#3A404C` | Inputs, buttons                            |
| `--text`          | `#E8EAF0` | Primary text                               |
| `--text-2`        | `#C4C9D4` | Secondary text                             |
| `--muted`         | `#9AA1AF` | Hints, labels                              |
| `--mint`          | `#2EE6A6` | Available, positive, selected              |
| `--amber`         | `#FFB547` | Primary action, "today", changed, warnings |
| `--danger`        | `#FF8A8A` | Delete and destructive text                |

Primary buttons: amber background, text `#1A1203`. Secondary buttons: `--surface` with `--border-strong`. Destructive: transparent with `--danger` border and text. Keep colors to mint and amber plus neutrals.

**Heat levels (friends free):**
`c0 #1C1F26`, `c1 #1F3A33 / text #BFEFDD`, `c2 #1F5A4A / #E6FFF6`, `c3 #20805F / #FFFFFF`, `c4 #27B887 / #08130F`, `c5 #2EE6A6 / #04120C`. The number is always in the cell; 0 is empty.

## Typography

Headings: Space Grotesk 500/700. Body: DM Sans 400/500/600. Load from Google Fonts with a real fallback stack, or self-host. Sizes: h1 28px (22px mobile), card titles 16-18px, body 14px, helper text 12-13px. Hour labels sit on the **top edge of the block** they start.

## Shape and spacing

Radii: 10px controls, 12-16px cards, 999px pills. Card padding 14-20px. Gaps 8-24px. Focus ring: 2px mint outline with 2px offset (not shown in the boards, required).

## Components and where to look

| Component                                                          | Reference board                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Calendar week grid, friends panel, best-time style card, tz banner | `Main`, `MCalendar`                                                      |
| Tonight card                                                       | new (style it like the best-time card: amber left border, eyebrow label) |
| Add my times (usual, extra, upcoming list, edit panel)             | `AddTimes`, `MAddTimes`                                                  |
| Settings, sharing off                                              | `Settings`, `SharingOff`, `MSettings`                                    |
| Account menu, delete confirmation, tap sheet                       | `Account`, `Hover`, `MSheets`                                            |
| Login, onboarding, waitlist                                        | `Login`, `Onboarding`, `Waitlist`                                        |
| Empty state, invite landing, full screen                           | `EmptyState`, `InviteLanding`, `Full`                                    |
| By friend view                                                     | `ByFriend`, `MByFriend` (deferred, not in the demo)                      |

## Rules that must hold

- Initials in circles instead of avatars.
- Status always has a text label: Usual, Today, Changed, Cancelled, Extra · one time, Sharing off.
- The timezone notice above the calendar always states the user's timezone, for example "All times are converted to your timezone: Europe/Amsterdam · UTC+2 (CEST)".
- "Sharing off" pill appears in the header only when sharing is off.
- Touch targets at least 44px, except the half-hour calendar cells.
- Mobile uses a bottom tab bar: Calendar, My times, Account. Menus and detail cards become bottom sheets.

## Tone and key strings

Casual, friendly, a bit of gamer language, not over the top. Keep all strings in one module.

| Where            | Text                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Home title       | Who's up for a game?                                                                                                     |
| Primary action   | Add my times                                                                                                             |
| Invite           | Invite friends · Invite message copied. Paste it in a chat.                                                              |
| Sharing off card | Your calendar is hidden · Sharing is off, so you can't see when your friends are free. · Turn on sharing · Open Settings |
| Empty state      | It's quiet in here · SquadTime works best with your squad.                                                               |
| Waitlist         | Your spot is position N · Join the community · Leave the waitlist and delete my data                                     |
| Full             | We're full for today                                                                                                     |
| Delete           | Delete your account? · Keep my account · Delete everything · Download my data first                                      |
| Weekly check     | Still true this week?                                                                                                    |
| AI note          | One line in Privacy & data or the footer that the app was made with AI.                                                  |

## Images

CC0 or AI-generated only. No game screenshots, logos or copyrighted characters. The pixel desk scene in the boards is drawn in SVG and may be reused.

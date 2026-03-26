# 📦 Deliverables & Resolution Notes

This document details the root causes and step-by-step resolutions for the four primary bugs identified in the Event Portal system, along with suggestions for future architectural improvements.

## 🐛 Bug 1: The Infinite Onboarding Loop
**Root Cause:**
When checking if a user had completed the onboarding form, the system solely relied on a direct `user_id` match. However, due to authentication mapping quirks (or users switching authentication providers), the `user_id` could occasionally mismatch or fail to bind to the original submission, tricking the API into believing the user had never completed onboarding.

**How it was fixed:**
1. Upgraded `organization_service.go` to implement a new `GetLatestOnboardingSubmissionByEmail` fallback method.
2. Now, the system dynamically extracts the user's JWT `email`. If the direct `user_id` UUID lookup fails, it automatically queries the onboarding table for any completed submissions matching the user's explicit email address. This entirely bypasses the infinite loop and flawlessly forwards the user directly to the `/org/events` dashboard.

## 🐛 Bug 2: Missing User Data in Settings
**Root Cause:**
The "Settings" (Profile Modal) component had a desync between the API response keys and the React State variables. Specifically, the backend was returning `org_type` and `industry_type`, but the frontend `ProfileModal.tsx` was discarding custom attributes and failing to map them onto the UI component.

**How it was fixed:**
1. Modified `ProfileModal.tsx` to align the `fetch` response payload exactly with the React Hook form mappings.
2. Added conditional `useEffect` hydration to securely trap the API context and dynamically populate dropdowns, particularly syncing `customOrgType` directly to the `org_type` string.

## 🐛 Bug 3: Empty "Edit Event" Form (Incomplete Hydration)
**Root Cause:**
When a user published an event, the frontend dispatched highly complex nested JSON structures (e.g., Agenda Days/Slots, Speaker arrays, Certificate definitions, Outcomes). However, the backend's `CreateEventRequest` struct completely ignored these fields. Because the backend threw the arrays away, they disappeared from the database forever. When the user clicked "Edit Event", the backend retrieved a skeletal model devoid of layout context.

**How it was fixed (Step-by-Step):**
1. **Model Upgrades:** Added a dedicated generic JSON column named `HydrationPayload` into `internal/models/event.go`.
2. **DTO Upgrades:** Exposed `HydrationPayload` inside `UpdateEventRequest` and `CreateEventRequest` within `event_service.go`.
3. **Frontend Publishing Hook:** Overhauled `participants/page.tsx`'s `onSubmit` sequence to stringify all non-trivial React states (`Agenda`, `Outcomes`, `Speakers`, `Credentials`) into `hydration_payload` before issuing the POST request.
4. **Context Hydration Hook:** In `EventCreateContext.tsx`, wrote a robust parsing routine inside the `useEffect` fetch block to deserialize `event.hydration_payload` and map it identically backward into the user's React State.
5. **Key Collision Fix:** Discovered the GORM schema possessed duplicate JSON tags (`json:"event_type"`) for both a relation and a string. Renamed the string to `event_type_raw` to prevent catastrophic data wipes.

## 🐛 Bug 4: Edit Collisions, Missing UI Bindings, and Zombie Events
**Root Causes & Fixes:**
* **Duplicate Events on Edit:** The `EventCreateContext` extracted `editId` strictly from `useSearchParams()`. Navigating from Step 1 to Step 2 stripped the URL parameter, destroying the Context's knowledge of the Edit state. When the user clicked "Publish" on Step 8, the app generated a `POST` instead of a `PUT`.
  * **Fix:** Cached `editId` deep inside a React `useState` variable on initial mount, guaranteeing it survived URL mutations. Conditioned `participants/page.tsx` to conditionally execute `PUT /api/v1/events/:editId` if this variable existed.
* **Dates not Prefilling:** The custom `<DateInput>` library component only digested the date string *once* on initialization. Because the backend fetch lookup takes ~150ms, the input mounted empty and refused to visibly update.
  * **Fix:** Wired a reactive `useEffect` hook deep inside `DateInput.tsx` to sync its visual string whenever the external prop value populated.
* **Location Empty:** The frontend packaged location attributes inside an arbitrary nested object (`location: { name, address... }`), but the Go backend statically demanded flat root fields (`location_name`, `location_city`). It silently rejected the location.
  * **Fix:** Flattened the JS payload structure sent by the frontend, and added Inline Location mapping into `event_service.go`'s `Update` logic.
* **Deleted Events Reappearing:** Clicking the Delete button only executed a localized `setEvents(prev.filter(...))` command masking the event via HTML. It never fired an actual HTTP request to the backend.
  * **Fix:** Bound `handleDeleteConfirm` to actively issue a formal `fetch(url, { method: "DELETE" })` request to fully remove the entity from the remote table.

---

## 🚀 Future Improvements & Thoughts

If I had a bit more time with this codebase, here’s how I’d tackle things to make it even more solid:

1. **Get rid of the JSON "Memory Card":** 
   Using a `HydrationPayload` JSON blob was a quick and effective win to fix the data loss, but it's a bit of a hack. Ideally, we should pull that data out into real database tables (like `agenda_items`, `speakers`, etc.). This would make the data much easier to query for reporting or search later on, rather than having it "trapped" in a JSON string.

2. **Upgrade the State Management:** 
   Right now, `EventCreateContext` is doing a *lot* of heavy lifting—it’s holding state for almost every single field across the whole multi-step wizard. This can lead to some sluggishness because every small keystroke re-renders everything. Moving this to something like **Zustand** would be a game-changer. It’s much lighter, easier to debug, and won't buckle as the form gets more complex.

3. **Use a real Form library (Zod + React Hook Form):** 
   A lot of the validation right now is manual code block checking (`if (!name) return false`). It works, but it’s hard to maintain. Wiring up `Zod` would let us define a "schema" for the event once and then let the library handle all the error messages and edge cases automatically. It would probably cut the component code size by 30%.

4. **Make the Backend louder on errors:** 
   Currently, if the frontend sends a weirdly formatted location or a typo in a field name, the Go backend often just ignores it and saves a partial record. I’d switch to using strict JSON binding in the Gin controllers so the server actually "yells" (returns a 400 error) if the data isn't exactly what it expects. It’s better to fail fast than to save "zombie" data that breaks the UI later.

Side Note: I haven't anything for .env because when i check the frontend, most of process.env have default value, so i assume it will work fine. If not, please let me know. Well, it was working when i ran it locally.

Github: https://github.com/lonshanworld/metalverse
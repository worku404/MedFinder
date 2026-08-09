"You are a formal, intelligent AI study assistant for the Ethiopian NextGen "
    "BEFORE GIVING ANY RECOMMENDATION YOU HAVE TO VERIFY FROM THE PROJECT FIRST"
    "DO NOT GUESS FIRTS VERIFY "
    "E-Learning Platform, helping the student understand code they've already "
    "written or encountered in their IDE. "
    "Do not start the conversation with a greeting; get to the point immediately. "

    "Scale your depth to the input. A greeting, short question, or casual message "
    "gets a short, natural reply. A code snippet gets the full analysis below. "
    "Don't force every section onto every response. "

    # Code formatting
    "Formatting Rule for Code: Always format code snippets using standard "
    "Markdown triple backticks with an explicit lowercase language identifier "
    "on the first line (e.g. python, dart, cpp, html, css, javascript). "
    "Always put a newline before opening backticks and after closing backticks. "
    "Never use smart quotes or unicode backticks. "

    # Callouts
    "When providing key takeaways, tips, warnings, or cautions, use GitHub "
    "Markdown Callout blockquotes: > [!NOTE], > [!TIP], > [!IMPORTANT], "
    "> [!WARNING], > [!CAUTION]. Use [!WARNING]/[!CAUTION] for real risks or "
    "missing dependencies, [!IMPORTANT] for requirements that shouldn't be "
    "overlooked, [!TIP] for practical improvements, [!NOTE] for context. "

    # Core analysis behavior
    "When the student shares code, explain what it does and why it exists in "
    "natural, conversational depth — not a rigid checklist. Then, where genuinely "
    "relevant, weave in: "
    "- Hidden dependencies or required configuration (what's needed, why, what "
    "breaks if it's missing). "
    "- Relationships between settings, where one config only matters if another "
    "is also set correctly (e.g. rotation + blacklisting). "
    "- Non-standard patterns, flagged as such — non-standard isn't automatically wrong. "
    "- Best practices, distinguishing required vs. recommended vs. optional/stylistic. "
    "- Meaningful alternative implementations, only when they offer a real "
    "architectural, security, or performance difference — skip alternatives for "
    "the sake of having alternatives. "
    "- Trade-off analysis between the current approach and alternatives: explain "
    "when each is preferable rather than declaring a single winner, unless the "
    "current code is genuinely the weaker choice — then say so and explain why. "
    "- Security or performance concerns, only when the code actually touches "
    "those areas (auth, user input, queries, external calls, etc). "

    "Only raise a warning when there's a concrete reason. Don't manufacture "
    "issues just to seem thorough. "

    "If you're unsure whether something is a hard requirement, a framework "
    "convention, or just common practice, say so directly instead of stating it "
    "with false confidence."

    "DO NOT Edit code unless user explicitly asks you to."
    "Do not write failback code into your recommendation code."
    all imports should be at the top."
    "always read this file"
    "allways check before guessing"

    "Full project SRS"
    # Software Requirements Specification (SRS)

## MedFinder — AI-Assisted Medicine Availability Locator

**Version:** 1.0
**Status:** Draft — Portfolio/Demonstration Project

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for
MedFinder, a web-based platform that allows patients to search for medicine
availability across registered pharmacies. It is intended as a portfolio
demonstration of backend engineering practice, not a commercial product
launch, and is scoped accordingly throughout this document.

### 1.2 Intended Audience

Developers, instructors/reviewers evaluating the project, and (secondarily)
anyone assessing the system's design decisions around AI use and health-data
handling.

### 1.3 Project Scope

MedFinder allows a patient to search for a medicine by name (including
misspelled, brand, or generic names) or by uploading a photo/PDF of a
prescription, and see which registered pharmacies currently report having it
in stock, ranked by distance and data freshness. Pharmacists manage their own
pharmacy's stock through a dashboard. Administrators verify pharmacy
registrations and manage the medicine catalog.

**This system is explicitly a locate/search tool, not a commerce, dispensing,
or diagnostic platform.** See Section 8 for a full statement of what is out
of scope and why.

### 1.4 Definitions and Acronyms

| Term | Meaning |
|---|---|
| SRS | Software Requirements Specification |
| LLM | Large Language Model |
| OCR | Optical Character Recognition |
| Canonical medicine | The generic/standard name a set of brand names maps to |
| Stale stock | Inventory data not confirmed by the pharmacy within a defined freshness window |
| PII | Personally Identifiable Information |

### 1.5 Document Conventions

Functional requirements are numbered `FR-<module>-<n>`. Non-functional
requirements are numbered `NFR-<category>-<n>`. `MUST` indicates a mandatory
requirement; `SHOULD` indicates a strong recommendation that may be descoped
under the project's time constraint without invalidating the design.

---

## 2. Overall Description

### 2.1 Product Perspective

A comparable commercial product (Medhanite) already operates in this space
in Ethiopia, including prescription upload and order routing to wholesalers.
MedFinder is **not** positioned as a competitor — it deliberately omits
ordering/fulfillment (Section 8) and is built and documented as an
engineering demonstration using seeded/sample pharmacy data rather than real
onboarded pharmacies.

### 2.2 User Classes

| Role | Description |
|---|---|
| **Customer** | Searches for medicines, optionally uploads a prescription image, receives restock notifications. No login required for basic search; login required for saved alerts/history. |
| **Pharmacist** | Represents one registered pharmacy. Manages that pharmacy's profile, location, and stock listings. Account requires admin verification before activation. |
| **Administrator** | Manages via Django's built-in admin: pharmacy verification queue, medicine catalog, user management, and content moderation. |

### 2.3 Operating Environment

Django/DRF backend, PostgreSQL (with `pg_trgm` extension) + PostGIS,
Redis, Celery + Celery Beat, Django Channels/Daphne for real-time
status/notification push, containerized via Docker. Web client (framework
unspecified here — out of scope for this SRS's backend focus).

### 2.4 Design and Implementation Constraints

- **C-1:** The system MUST NOT provide medical diagnosis, treatment
  recommendations, or dosage guidance at any point, including via the AI
  Assistant module. All AI output is restricted to *medicine name
  identification* only (see FR-AST-*).
- **C-2:** The system MUST NOT process actual payments or route orders to
  pharmacies/wholesalers for fulfillment (see Section 8).
- **C-3:** Prescription images are sensitive personal data under Ethiopia's
  Personal Data Protection Proclamation No. 1321/2024, which requires
  explicit, informed consent before processing sensitive data categories and
  designates the Ethiopian Communications Authority as the regulating body.
  The system MUST obtain explicit, specific consent (not bundled into a
  general terms-of-service acceptance) before processing any uploaded
  medical image, and MUST support data-subject deletion requests.
- **C-4:** All pharmacy and medicine data in the demo deployment MUST be
  clearly seeded/sample data, not real business data implying an existing
  commercial relationship.

### 2.5 Assumptions and Dependencies

- An LLM provider (cloud, e.g. Gemini, or a locally hosted vision-capable
  model such as a Llama 3.2 Vision variant via Ollama) is available and
  configured.
- SMTP credentials are available for transactional email.
- OAuth2 credentials (Google) are available for social login.
- Real-time pharmacy onboarding and inventory accuracy are out of scope;
  the demo assumes pharmacist users self-report stock honestly.

---

## 3. System Architecture Overview (App Boundaries)

| Django app | Responsibility |
|---|---|
| `accounts` | Registration, OAuth2, email verification, password reset, roles |
| `pharmacies` | Pharmacy profiles, geolocation, verification workflow |
| `medicines` | Canonical medicine catalog + brand/alias mapping |
| `inventory` | Per-pharmacy stock entries, freshness tracking |
| `search` | Trigram + geospatial search, ranking |
| `assistant` | AI-assisted prescription image → medicine name extraction |
| `notifications` | Centralized dispatch for all system notifications |
| Django admin | Administrator-facing management (no separate custom app) |

---

## 4. Functional Requirements

### 4.1 Accounts & Authentication (`accounts`)

- **FR-ACC-1:** The system MUST support registration via email/password and
  via OAuth2 (Google).
- **FR-ACC-2:** A newly registered email/password account MUST be inactive
  until the user confirms their email via an SMTP-delivered verification
  link.
- **FR-ACC-3:** The system MUST support password reset via an SMTP-delivered,
  time-limited, single-use link.
- **FR-ACC-4:** A user registering as a pharmacist MUST be assigned an
  `unverified` status and MUST NOT be able to publish pharmacy/stock data
  until an Administrator approves the associated pharmacy profile
  (FR-PHM-2).
- **FR-ACC-5:** Role (`customer`, `pharmacist`, `administrator`) MUST be
  enforced via object- and view-level permissions, not solely by hiding UI
  elements.

### 4.2 Pharmacy Management (`pharmacies`)

- **FR-PHM-1:** A pharmacist MUST be able to register a pharmacy profile:
  name, geolocation (point), address/landmark description, license
  reference, contact details.
- **FR-PHM-2:** A pharmacy profile MUST enter a `pending` state on creation
  and only become publicly searchable once an Administrator sets it to
  `verified`.
- **FR-PHM-3:** Administrators MUST be able to reject a pharmacy
  registration with a reason, notifying the pharmacist (FR-NTF-6).
- **FR-PHM-4:** A pharmacist MUST only be able to manage the pharmacy
  profile(s) they own (object-level authorization).

### 4.3 Medicine Catalog (`medicines`)

- **FR-MED-1:** The system MUST maintain a canonical `Medicine` record
  (generic name, category, dosage form) distinct from an `Alias` record
  (brand names, common misspellings mapped to a canonical medicine).
- **FR-MED-2:** Administrators MUST be able to create, merge, and edit
  canonical medicines and their aliases.
- **FR-MED-3 (SHOULD):** The catalog MAY be seeded from a public essential-
  medicines list as a starting dataset for the demo.

### 4.4 Inventory Management (`inventory`)

- **FR-INV-1:** A pharmacist MUST be able to create/update a stock entry
  (medicine, quantity band or in-stock/out-of-stock flag, price)
  scoped to their own pharmacy only.
- **FR-INV-2:** Every stock entry MUST record a `last_confirmed_at`
  timestamp, updated whenever the pharmacist confirms or edits it.
- **FR-INV-3:** A scheduled background task MUST flag stock entries not
  confirmed within a configurable freshness window (e.g. 48 hours) as
  `unconfirmed`, and this status MUST be visible to searchers, not hidden.
- **FR-INV-4 (SHOULD):** The system MAY periodically remind pharmacists
  (via `notifications`) to confirm stale entries.

### 4.5 Search (`search`)

- **FR-SRCH-1:** The system MUST support fuzzy, typo-tolerant search over
  medicine names using PostgreSQL trigram similarity (`pg_trgm`), matching
  against both canonical names and aliases.
- **FR-SRCH-2:** Search results MUST be ranked by a combination of distance
  (via PostGIS geospatial query against the searcher's location or a
  manually entered area) and stock freshness (confirmed entries ranked above
  unconfirmed ones).
- **FR-SRCH-3:** Basic search MUST be available without authentication.
- **FR-SRCH-4:** The public search endpoint MUST be rate-limited.

### 4.6 AI Assistant (`assistant`)

- **FR-AST-1:** The system MUST allow a user to upload a photo or PDF of a
  prescription/medical note, after presenting an explicit consent notice
  describing what will be processed and how long it will be retained
  (Constraint C-3).
- **FR-AST-2:** Image/document processing MUST run asynchronously via
  Celery; the user MUST receive a status update (via polling or a
  WebSocket/notification push) rather than a blocking request.
- **FR-AST-3:** Extraction MUST use either (a) a multimodal/vision-capable
  LLM applied directly to the image, or (b) an OCR step (Tesseract) followed
  by a text LLM — `pypdf` MUST NOT be used for this purpose, as it does not
  perform OCR. A locally hosted vision model MUST be an available
  configuration option, specifically to allow deployments that avoid
  transmitting sensitive medical images to a third-party API.
- **FR-AST-4:** The Assistant's output MUST be restricted to a list of
  *candidate medicine names* matched against the catalog (FR-MED-1) with a
  confidence indicator. It MUST NOT generate or display a diagnosis, dosage
  recommendation, or any medical advice (Constraint C-1).
- **FR-AST-5:** Extracted candidates MUST be presented to the user for
  confirmation before being used to run a search — the system MUST NOT
  silently trust LLM output as ground truth (human-in-the-loop).
- **FR-AST-6:** The original uploaded image MUST be deleted automatically
  after a short, configurable retention window (e.g. 24–72 hours) once text
  extraction is complete, consistent with data-minimization principles
  under Constraint C-3.

### 4.7 Notifications (`notifications`)

- **FR-NTF-1:** All system-generated notifications MUST be dispatched
  through a single centralized module, not scattered inline across other
  apps' views/tasks.
- **FR-NTF-2:** The system MUST support, at minimum, these notification
  types: registration confirmation, email verification, password reset,
  medicine-restock alert (customer), pharmacy-verification-pending
  (administrator), pharmacy-approved / pharmacy-rejected (pharmacist),
  stale-stock reminder (pharmacist).
- **FR-NTF-3:** Email (SMTP) MUST be the primary delivery channel for
  account-critical notifications (verification, password reset).
- **FR-NTF-4:** An in-app notification feed SHOULD supplement email for
  non-critical notifications (restock alerts, reminders).
- **FR-NTF-5 (SHOULD):** Users MAY configure preferences to opt out of
  non-critical notification types; account-critical notifications (FR-NTF-3)
  MUST NOT be optional.
- **FR-NTF-6:** Each notification type MUST correspond to exactly one
  template/handler location, to avoid the duplicated-logic smell discussed
  in prior design review.

### 4.8 Administration

- **FR-ADM-1:** Administrators MUST manage all entities (users, pharmacies,
  medicines, aliases, flagged content) through Django's built-in admin
  interface — no separate custom admin app is required.
- **FR-ADM-2:** The admin interface MUST provide an explicit approve/reject
  action for pending pharmacy registrations (not just generic field editing).

---

## 5. Non-Functional Requirements

- **NFR-SEC-1:** All traffic MUST be served over HTTPS.
- **NFR-SEC-2:** Uploaded prescription images MUST be stored encrypted at
  rest and served only via short-lived signed URLs, never a public static
  path.
- **NFR-SEC-3:** Public-facing endpoints (search, upload) MUST be rate
  limited to mitigate abuse and cost exposure on the LLM processing path.
- **NFR-PRIV-1:** The system MUST obtain and record explicit consent before
  processing sensitive data categories, per Constraint C-3.
- **NFR-PRIV-2:** The system MUST support a user-initiated data deletion
  request affecting their uploaded images and extracted data.
- **NFR-PERF-1:** Non-AI search queries SHOULD return within 500ms under
  expected demo load.
- **NFR-PERF-2:** AI Assistant processing MUST NOT block the requesting
  HTTP worker; it MUST run via Celery.
- **NFR-SCALE-1:** Frequently repeated search queries SHOULD be cacheable
  via Redis.
- **NFR-REL-1:** Background tasks (freshness flagging, reminders) MUST be
  idempotent and safe to retry.
- **NFR-USE-1:** The interface SHOULD remain usable on low-bandwidth mobile
  connections, consistent with documented connectivity constraints in the
  target market.
- **NFR-MAINT-1:** Each Django app SHOULD maintain a single, clearly stated
  responsibility, consistent with the modular structure in Section 3.
- **NFR-PORT-1:** The system MUST be deployable via Docker/docker-compose.

---

## 6. External Interface Requirements

- **API:** DRF-based REST API for all client interactions; cursor-based
  pagination for list endpoints (search results, notifications).
- **Auth provider:** Google OAuth2.
- **Email:** SMTP (transactional email provider or self-hosted SMTP relay).
- **AI provider:** Configurable — cloud multimodal LLM (e.g. Gemini) or a
  locally hosted vision-capable model via Ollama.
- **Real-time channel:** WebSocket (Django Channels + Redis channel layer)
  for Assistant processing status and live notification delivery.
- **Maps/Geocoding:** A geocoding provider or manual pin-drop MUST be
  available for pharmacies to set their location.

---

## 7. Core Data Entities (High-Level)

- `User` (role: customer / pharmacist / administrator)
- `Pharmacy` (owner → User, geolocation, verification status)
- `Medicine` (canonical) / `MedicineAlias` (brand/misspelling → Medicine)
- `StockEntry` (Pharmacy, Medicine, status, price, last_confirmed_at)
- `PrescriptionUpload` (User, image reference, extraction status, extracted
  candidates, consent record, scheduled deletion timestamp)
- `Notification` (User, type, channel, status, created_at)

---

## 8. Explicitly Out of Scope

The following are deliberately excluded, with rationale:

| Excluded | Rationale |
|---|---|
| In-app purchasing / payment / checkout | Pharmaceutical commerce carries licensing and regulatory obligations outside this project's purpose (demonstrating backend engineering) |
| Order routing/fulfillment to pharmacies or wholesalers | Same as above; also reintroduces real-world liability if a listed medicine turns out unavailable after a "confirmed" order |
| Medical diagnosis or dosage guidance, from the AI Assistant or anywhere else | Outside the qualification of the system and its developer; restricting AI output to name-matching only avoids giving medical advice |
| Real pharmacy onboarding / live production data | Not achievable within the project's time constraint; demo uses clearly labeled seeded data |
| Prescription fulfillment tracking | Requires licensed-pharmacist-in-the-loop workflows outside this project's scope |

---

## 9. Open Questions for Further Refinement

- Retention window length for uploaded images (proposed 24–72h — confirm
  against actual consent-notice wording).
- Whether local-model or cloud-LLM is the default in the reference
  deployment (recommendation: default to local/self-hosted given the
  sensitivity of the data category, with cloud as an opt-in configuration).
- Exact freshness window for stock entries before flagging as
  `unconfirmed` (proposed 48h).

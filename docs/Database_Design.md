# Production Database Design Specification - VetiCare

This specification documents the production-grade PostgreSQL database schema designed for the VetiCare pet healthcare platform. It supports integrations with **FastAPI**, **SQLAlchemy ORM**, **Supabase Storage**, and **JWT-based Authentication**.

The raw SQL schema script is located at: [schema.sql](file:///c:/Users/sky2k/OneDrive/Documents/GitHub/veticare/docs/schema.sql)

---

## 1. Entity-Relationship (ER) Diagram (Text Format)

```text
  +--------------------+             +--------------------+
  |       users        |             |      contacts      |
  +--------------------+             +--------------------+
  | PK  id (UUID)     |<----+        | PK  id (UUID)      |
  |     email          |     |       | FK  user_id (UUID) | (ON DELETE SET NULL)
  |     username       |     +-------|     name           |
  |     password_hash  |             |     email          |
  |     first_name     |             |     subject        |
  |     last_name      |             |     message        |
  |     is_active      |             |     status         | (OPEN, IN_PROGRESS, CLOSED)
  |     created_at     |             |     created_at     |
  |     updated_at     |             |     updated_at     |
  +--------------------+             +--------------------+
            |
            | 1
            |
            | N (ON DELETE CASCADE)
            v
  +--------------------+
  |        pets        |
  +--------------------+
  | PK  id (UUID)     |<----+
  | FK  owner_id(UUID) |     |
  |     name           |     |
  |     species        |     |
  |     breed          |     |
  |     gender         |     |
  |     weight         |     |
  |     date_of_birth  |     |
  |     image_url      |     |
  |     is_active      |     |
  |     created_at     |     |
  |     updated_at     |     |
  +--------------------+     |
        |          |         |
      1 |        1 |         |
        |          |         |
      N | (Cascade)| N       | (Cascade)
        v          +---------+
  +--------------------+   |  +--------------------+
  |    vaccinations    |   |  |    predictions     |
  +--------------------+   |  +--------------------+
  | PK  id (UUID)      |   |  | PK  id (UUID)      |
  | FK  pet_id (UUID)  |   +--| FK  pet_id (UUID)  |
  |     vaccine_name   |      |     symptoms (JSONB)
  |     date_admin     |      |     pred_disease   |
  |     next_due_date  |      |     confidence     |
  |     clinic_name    |      |     dangerous      |
  |     notes          |      |     model_version  |
  |     created_at     |      |     proc_time_ms   |
  |     updated_at     |      |     created_at     |
  +--------------------+      |     updated_at     |
                              +--------------------+
```

---

## 2. Refined DDL Best Practices (DDL)

Refer to the database definitions inside [schema.sql](file:///c:/Users/sky2k/OneDrive/Documents/GitHub/veticare/docs/schema.sql). The updated schema includes the following improvements:
- **CITEXT (Case-Insensitive Text)**: Used for user email lookups to prevent registration duplication on casing differences.
- **Native UUID Generation**: Uses PostgreSQL 13+ native `gen_random_uuid()` to remove external dependencies on `uuid-ossp`.
- **TRIGGERS**: Automatically sync `updated_at` columns on row modification.
- **JSONB for Symptoms**: The symptoms list in `predictions` uses native JSONB, enabling highly flexible object models (such as symptom severities) while optimizing query performance using GIN index.
- **ML Latency Logging**: Tracks model configurations (`model_version`) and runtime latency (`processing_time_ms`) to support telemetry.
- **Domain Validation Constraints**: Validate email syntax, username format restrictions (`chk_username_format`), non-negative weights (`chk_pet_weight`), valid genders, category-free species types, and confidence ranges (0.0 to 1.0 ratio).

---

## 3. Relationships & Foreign Key Logic

*   **`users` 1 : N `pets`:**
    *   **Field:** `pets.owner_id` references `users.id`.
    *   **Rule:** `ON DELETE CASCADE`. If a user deletes their account, all associated pets and their medical records are automatically removed.
*   **`pets` 1 : N `vaccinations`:**
    *   **Field:** `vaccinations.pet_id` references `pets.id`.
    *   **Rule:** `ON DELETE CASCADE`. Removes child vaccination entries on pet deletion.
*   **`pets` 1 : N `predictions`:**
    *   **Field:** `predictions.pet_id` references `pets.id`.
    *   **Rule:** `ON DELETE CASCADE`. Cleans diagnosis metrics histories.
*   **`users` 1 : N `contacts`:**
    *   **Field:** `contacts.user_id` references `users.id`.
    *   **Rule:** `ON DELETE SET NULL`. Retains general contact entries for analysis while safely detaching user references.

---

## 4. Performance Optimization (Indexes)

1.  **Composite Query Indexes:**
    *   `idx_pets_owner_name` on `(owner_id, name)`: speeds up list pages sorting pets by name.
    *   `idx_vaccinations_pet_date` on `(pet_id, date_administered DESC)`: speeds up medical timeline rendering.
    *   `idx_predictions_pet_created` on `(pet_id, created_at DESC)`: optimizes reading recent machine learning logs.
    *   `idx_contacts_user_created` on `(user_id, created_at DESC)`: helps user profile contact query pages.
2.  **GIN Indexing**:
    *   `idx_predictions_symptoms_gin` on `predictions USING gin (symptoms jsonb_path_ops)`: permits high-speed symptom lookups across the symptoms JSONB array.
3.  **Partial/Filtered Indexes**:
    *   `idx_vaccinations_next_due` on `vaccinations (next_due_date) WHERE next_due_date IS NOT NULL`: optimizes alert schedules without indexing records lacking a future vaccination date.

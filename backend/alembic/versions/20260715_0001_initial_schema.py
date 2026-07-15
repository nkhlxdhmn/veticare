"""Initial VetiCare schema.

Revision ID: 20260715_0001
Revises:
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260715_0001"
down_revision = None
branch_labels = None
depends_on = None


def timestamp_columns() -> list[sa.Column]:
    return [
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    ]


def upgrade() -> None:
    op.create_table("profiles", *timestamp_columns(), sa.Column("email", sa.String(320), nullable=False), sa.Column("hashed_password", sa.String(255), nullable=False), sa.Column("full_name", sa.String(120), nullable=False), sa.Column("phone", sa.String(30)), sa.Column("avatar_url", sa.String(2048)), sa.Column("role", sa.String(30), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False))
    op.create_index("ix_profiles_email", "profiles", ["email"], unique=True)
    op.create_table("animals", *timestamp_columns(), sa.Column("name", sa.String(100), nullable=False), sa.Column("scientific_name", sa.String(160)), sa.Column("description", sa.Text()), sa.Column("image_url", sa.String(2048)), sa.Column("diet", sa.Text()), sa.Column("average_lifespan", sa.String(100)), sa.Column("vaccination_schedule", sa.JSON()), sa.Column("care_guide", sa.JSON()), sa.UniqueConstraint("name", "scientific_name", name="uq_animals_name_scientific_name"))
    op.create_index("ix_animals_name", "animals", ["name"])
    op.create_table("ml_models", *timestamp_columns(), sa.Column("model_name", sa.String(160), nullable=False), sa.Column("version", sa.String(80), nullable=False), sa.Column("accuracy", sa.Float()), sa.Column("bucket_path", sa.String(2048), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("model_name", "version", name="uq_ml_models_name_version"))
    op.create_table("care_guides", *timestamp_columns(), sa.Column("animal", sa.String(100), nullable=False), sa.Column("disease", sa.String(160)), sa.Column("diet", sa.Text()), sa.Column("dos", sa.Text()), sa.Column("donts", sa.Text()), sa.Column("medication", sa.Text()), sa.Column("warning_signs", sa.Text()), sa.Column("recovery_time", sa.String(100)))
    op.create_index("ix_care_guides_animal", "care_guides", ["animal"])
    op.create_index("ix_care_guides_disease", "care_guides", ["disease"])
    op.create_table("pets", *timestamp_columns(), sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False), sa.Column("animal_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("animals.id", ondelete="SET NULL")), sa.Column("name", sa.String(100), nullable=False), sa.Column("breed", sa.String(100)), sa.Column("dob", sa.Date()), sa.Column("gender", sa.String(30)), sa.Column("weight", sa.Float()), sa.Column("height", sa.Float()), sa.Column("color", sa.String(80)), sa.Column("microchip_number", sa.String(100), unique=True), sa.Column("image_url", sa.String(2048)), sa.Column("notes", sa.Text()))
    op.create_index("ix_pets_owner_id_created_at", "pets", ["owner_id", "created_at"])
    op.create_table("animal_diseases", *timestamp_columns(), sa.Column("animal_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("animals.id", ondelete="CASCADE"), nullable=False), sa.Column("disease_name", sa.String(160), nullable=False), sa.Column("symptoms", sa.Text()), sa.Column("causes", sa.Text()), sa.Column("treatment", sa.Text()), sa.Column("prevention", sa.Text()), sa.UniqueConstraint("animal_id", "disease_name", name="uq_animal_disease_name"))
    op.create_table("vaccination_records", *timestamp_columns(), sa.Column("pet_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False), sa.Column("vaccine_name", sa.String(160), nullable=False), sa.Column("vaccination_date", sa.Date(), nullable=False), sa.Column("next_due_date", sa.Date()), sa.Column("dose", sa.String(80)), sa.Column("clinic_name", sa.String(160)), sa.Column("veterinarian", sa.String(160)), sa.Column("certificate_url", sa.String(2048)), sa.Column("notes", sa.Text()))
    op.create_index("ix_vaccinations_pet_due", "vaccination_records", ["pet_id", "next_due_date"])
    op.create_table("prediction_history", *timestamp_columns(), sa.Column("pet_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False), sa.Column("predicted_disease", sa.String(160), nullable=False), sa.Column("confidence", sa.Float(), nullable=False), sa.Column("model_version", sa.String(80), nullable=False), sa.Column("prediction_json", sa.JSON(), nullable=False), sa.CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_prediction_confidence"))
    op.create_index("ix_prediction_history_pet_id", "prediction_history", ["pet_id"])


def downgrade() -> None:
    for table in ["prediction_history", "vaccination_records", "animal_diseases", "pets", "care_guides", "ml_models", "animals", "profiles"]:
        op.drop_table(table)

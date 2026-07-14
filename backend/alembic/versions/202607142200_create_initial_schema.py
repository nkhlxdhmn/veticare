"""create initial schema

Revision ID: 202607142200
Revises: None
Create Date: 2026-07-14 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '202607142200'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 0. Enable citext extension (must happen before creating tables using it)
    op.execute('CREATE EXTENSION IF NOT EXISTS "citext"')

    # 1. Create table: users
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', postgresql.CITEXT(), nullable=False),
        sa.Column('hashed_password', sa.Text(), nullable=False),
        sa.Column('username', sa.String(length=30), nullable=False),
        sa.Column('first_name', sa.String(length=50), nullable=True),
        sa.Column('last_name', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
        sa.CheckConstraint("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name='chk_email_format'),
        sa.CheckConstraint("username ~ '^[a-z0-9_.-]{3,30}$'", name='chk_username_format')
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_username', 'users', ['username'])

    # 2. Create table: pets
    op.create_table(
        'pets',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('owner_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('species', sa.String(length=50), nullable=False),
        sa.Column('breed', sa.String(length=50), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=False, server_default='Unknown'),
        sa.Column('weight', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE', name='fk_pets_owner'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('date_of_birth <= CURRENT_DATE', name='chk_pet_dob'),
        sa.CheckConstraint('weight >= 0.00', name='chk_pet_weight'),
        sa.CheckConstraint("gender IN ('Male', 'Female', 'Unknown')", name='chk_pet_gender'),
        sa.CheckConstraint("species IN ('Dog', 'Cat', 'Cow', 'Buffalo', 'Sheep', 'Goat', 'Horse', 'Pig', 'Rabbit', 'Other')", name='chk_pet_species')
    )
    op.create_index('idx_pets_owner_name', 'pets', ['owner_id', 'name'])
    op.create_index('idx_pets_species', 'pets', ['species'])

    # 3. Create table: vaccinations
    op.create_table(
        'vaccinations',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('pet_id', sa.UUID(), nullable=False),
        sa.Column('vaccine_name', sa.String(length=100), nullable=False),
        sa.Column('date_administered', sa.Date(), nullable=False),
        sa.Column('next_due_date', sa.Date(), nullable=True),
        sa.Column('clinic_name', sa.String(length=150), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['pet_id'], ['pets.id'], ondelete='CASCADE', name='fk_vaccinations_pet'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('next_due_date IS NULL OR next_due_date >= date_administered', name='chk_dates')
    )
    op.create_index('idx_vaccinations_pet_date', 'vaccinations', ['pet_id', sa.text('date_administered DESC')])
    op.create_index('idx_vaccinations_next_due', 'vaccinations', ['next_due_date'], postgresql_where=sa.text('next_due_date IS NOT NULL'))

    # 4. Create table: predictions
    op.create_table(
        'predictions',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('pet_id', sa.UUID(), nullable=False),
        sa.Column('symptoms', postgresql.JSONB(), nullable=False),
        sa.Column('predicted_disease', sa.String(length=100), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('dangerous', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('processing_time_ms', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['pet_id'], ['pets.id'], ondelete='CASCADE', name='fk_predictions_pet'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('confidence BETWEEN 0.0 AND 1.0', name='chk_confidence'),
        sa.CheckConstraint('processing_time_ms >= 0', name='chk_processing_time')
    )
    op.create_index('idx_predictions_pet_created', 'predictions', ['pet_id', sa.text('created_at DESC')])
    op.create_index('idx_predictions_symptoms_gin', 'predictions', ['symptoms'], postgresql_using='gin', postgresql_ops={'symptoms': 'jsonb_path_ops'})

    # 5. Create table: contacts
    op.create_table(
        'contacts',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', postgresql.CITEXT(), nullable=False),
        sa.Column('subject', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='OPEN'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL', name='fk_contacts_user'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name='chk_contacts_email'),
        sa.CheckConstraint("status IN ('OPEN', 'IN_PROGRESS', 'CLOSED')", name='chk_contact_status')
    )
    op.create_index('idx_contacts_user_created', 'contacts', ['user_id', sa.text('created_at DESC')])


def downgrade() -> None:
    op.drop_table('contacts')
    op.drop_table('predictions')
    op.drop_table('vaccinations')
    op.drop_table('pets')
    op.drop_table('users')
    
    op.execute('DROP EXTENSION IF EXISTS "citext"')

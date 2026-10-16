"""add_google_auth_fields

Revision ID: 35577a999d5a
Revises: a192884bff90
Create Date: 2026-08-19 20:35:02.918419

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35577a999d5a'
down_revision: Union[str, Sequence[str], None] = 'a192884bff90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('google_id', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('profile_picture', sa.String(length=1000), nullable=True))
        batch_op.add_column(sa.Column('auth_provider', sa.String(length=50), nullable=False, server_default='local'))
        batch_op.create_index('ix_users_google_id', ['google_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index('ix_users_google_id')
        batch_op.drop_column('auth_provider')
        batch_op.drop_column('profile_picture')
        batch_op.drop_column('google_id')

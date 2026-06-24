"""
Bootstrap an admin user against the live SR Bagz Zone schema.

Usage:
    python seed_admin.py admin@srbagzone.com Admin@123 "SR Admin"
"""
import asyncio
import sys
import bcrypt
from sqlmodel import select
from database import async_session_factory, connect_db, close_db
from models.user import User


async def seed(email: str, password: str, name: str = "Admin") -> None:
    await connect_db()
    try:
        async with async_session_factory() as session:
            existing = await session.execute(select(User).where(User.email == email.lower()))
            if existing.scalar_one_or_none():
                print(f"[seed] User already exists: {email}")
                return
            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            u = User(
                name=name,
                email=email.lower(),
                password_hash=hashed,
                role="admin",
                is_active=True,
                is_verified=True,  # admins are pre-verified
            )
            session.add(u)
            await session.commit()
            await session.refresh(u)
            print(f"[seed] Admin created: id={u.id}, email={u.email}")
    finally:
        await close_db()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python seed_admin.py <email> <password> [name]")
        sys.exit(1)
    email_arg = sys.argv[1]
    password_arg = sys.argv[2]
    name_arg = sys.argv[3] if len(sys.argv) > 3 else "Admin"
    asyncio.run(seed(email_arg, password_arg, name_arg))

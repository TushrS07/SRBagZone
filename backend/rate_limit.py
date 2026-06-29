"""
Shared rate limiter instance — imported by main.py and any router that
applies @limiter.limit(...) decorators.

Defaults to an in-memory bucket keyed by the client IP. For multi-worker
production deployments, swap the storage_uri to Redis:

    Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379")
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

import os
from typing import ContextManager
import psycopg


class Database(ContextManager):
    def __init__(self):
        self.connection_string = os.getenv("POSTGRES_URL")

    def __enter__(self):
        self.connection = psycopg.connect(self.connection_string)
        return self.connection

    def __exit__(self, exc_type, exc_value, traceback):
        self.connection.close()

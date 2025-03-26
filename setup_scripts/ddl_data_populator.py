#!/usr/bin/env python3

import os
import sys
import psycopg2
from dotenv import load_dotenv

def main():
    # Load environment variables from the .env file in the parent directory
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    print(f"Looking for .env at: {os.path.abspath(env_path)}")
    load_dotenv(dotenv_path=env_path)

    # Retrieve configuration from environment variables
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")

    # Debug: Print variables
    print(f"DB_HOST: {db_host}, DB_PORT: {db_port}, DB_NAME: {db_name}, DB_USER: {db_user}, DB_PASSWORD: {db_password}")

    # Validate variables
    required = {'DB_HOST': db_host, 'DB_PORT': db_port, 'DB_NAME': db_name, 'DB_USER': db_user, 'DB_PASSWORD': db_password}
    missing = [key for key, value in required.items() if not value]
    if missing:
        print(f"Error: Missing environment variables: {', '.join(missing)}")
        sys.exit(1)

    # Specify the file path for your data script
    data_file_path = "data.sql"

    # Read the data (DML) script from file
    try:
        with open(data_file_path, "r") as data_file:
            data_script = data_file.read()
    except FileNotFoundError:
        print(f"Error: Could not find data file '{data_file_path}'")
        sys.exit(1)

    # Step 1: Connect to the default 'postgres' database to check/create asc_db
    try:
        # Connect to postgres database (default admin database)
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname="postgres",  # Connect to default database
            user=db_user,
            password=db_password
        )
        conn.autocommit = True  # Auto-commit for DDL commands
        cur = conn.cursor()

        # Check if asc_db exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        db_exists = cur.fetchone()

        if not db_exists:
            print(f"Database '{db_name}' does not exist. Creating it...")
            # Create the database
            cur.execute(f"CREATE DATABASE {db_name}")
            # Grant privileges to the user
            cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user}")
            print(f"Database '{db_name}' created and privileges granted to '{db_user}'.")
        else:
            print(f"Database '{db_name}' already exists.")

        cur.close()
        conn.close()
    except psycopg2.Error as e:
        print("Error connecting to 'postgres' database or creating 'asc_db':", e)
        sys.exit(1)

    # Step 2: Connect to asc_db and execute the data script
    try:
        # Connect to the target database (asc_db)
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password
        )
        conn.autocommit = True  # Auto-commit for immediate execution
        cur = conn.cursor()

        # Execute the data (DML) script
        print("Executing data script...")
        cur.execute(data_script)
        print("Data script executed successfully.")

        cur.close()
        conn.close()
        print("All tasks completed successfully.")
    except psycopg2.Error as e:
        print("Error executing scripts on 'asc_db':", e)
        sys.exit(1)

if __name__ == "__main__":
    main()
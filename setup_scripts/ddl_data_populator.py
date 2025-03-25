#!/usr/bin/env python3

import os
import sys
import psycopg2
from dotenv import load_dotenv
env_path = "/../.env"

def main():
    # Load environment variables from the .env file
    load_dotenv(dotenv_path=env_path)

    # Retrieve configuration from environment variables
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")

    # Specify the file paths for your DDL and data scripts
    ddl_file_path = "DDL.sql"
    data_file_path = "data.sql"

    # Read the DDL script from file
    try:
        with open(ddl_file_path, "r") as ddl_file:
            ddl_script = ddl_file.read()
    except FileNotFoundError:
        print(f"Error: Could not find DDL file '{ddl_file_path}'")
        sys.exit(1)

    # Read the data (DML) script from file
    try:
        with open(data_file_path, "r") as data_file:
            data_script = data_file.read()
    except FileNotFoundError:
        print(f"Error: Could not find data file '{data_file_path}'")
        sys.exit(1)

    try:
        # Connect to PostgreSQL using the provided environment variables
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password
        )
        # Auto-commit so each command is executed immediately
        conn.autocommit = True
        cur = conn.cursor()

        # Execute the DDL script
        print("Executing DDL script...")
        cur.execute(ddl_script)
        print("DDL script executed successfully.")

        # Execute the data (DML) script
        print("Executing data script...")
        cur.execute(data_script)
        print("Data script executed successfully.")

        cur.close()
        conn.close()
        print("All tasks completed successfully.")
    except Exception as e:
        print("Error executing scripts:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()

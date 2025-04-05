-- Drop all views
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_schema, table_name FROM information_schema.views WHERE table_schema NOT IN ('pg_catalog', 'information_schema'))
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all tables
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema'))
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all sequences
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_schema, sequence_name FROM information_schema.sequences WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema'))
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_schema) || '.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all functions
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT n.nspname AS schema, p.proname AS name, pg_get_function_identity_arguments(p.oid) AS args
              FROM pg_proc p
              JOIN pg_namespace n ON p.pronamespace = n.oid
              WHERE n.nspname NOT IN ('pg_catalog', 'information_schema'))
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.schema) || '.' || quote_ident(r.name) || '(' || r.args || ')' || ' CASCADE';
    END LOOP;
END $$;

-- Drop all types (domains and enums)
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT n.nspname, t.typname FROM pg_type t
              JOIN pg_namespace n ON n.oid = t.typnamespace
              WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') 
                AND t.typtype IN ('e', 'd')) -- enum or domain
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.nspname) || '.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

# dbis

update .env file 
go to setup_scripts
run ddl_data_populator.py
pip install -r python-requirements.txt (or alternative on ubuntu)

--update
in .env file user needs necessary privileges otherwise use postgres as "ddl_data_populator.py" needs to be changed
in respective database
\i DDL.sql
\i data.sql
to reset table (if changing schema)
\i drop.sql
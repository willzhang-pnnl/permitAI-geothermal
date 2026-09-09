from pathlib import Path
import sqlite3

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "geothermal.db"


def get_connection():
    connection = sqlite3.connect(str(DATABASE_PATH))
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def create_tables():
    connection = get_connection()

    connection.executescript("""
        CREATE TABLE IF NOT EXISTS projects (
            project_id TEXT PRIMARY KEY,
            project_name TEXT,
            project_description TEXT,
            project_sponsor TEXT,
            project_sector TEXT,
            project_type TEXT,
            kgra_name TEXT,
            raw_json TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS locations (
            project_id TEXT PRIMARY KEY,
            state TEXT,
            county TEXT,
            township_range TEXT,
            state_fips TEXT,
            county_fips TEXT,
            FOREIGN KEY(project_id)
                REFERENCES projects(project_id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS facilities (
            facility_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            facility_name TEXT,
            latitude REAL,
            longitude REAL,
            owner TEXT,
            operator TEXT,
            start_year INTEGER,
            unit_capacity_mw REAL,
            technology_type TEXT,
            FOREIGN KEY(project_id)
                REFERENCES projects(project_id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS activity_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            activity_group TEXT NOT NULL,
            federal_unique_id TEXT,
            process_status TEXT,
            process_map_phase TEXT,
            UNIQUE(project_id, activity_group),
            FOREIGN KEY(project_id)
                REFERENCES projects(project_id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_group_id INTEGER NOT NULL,
            activity_type TEXT,
            level TEXT,
            process_map_phase TEXT,
            document_availability_flag INTEGER,
            summary TEXT,
            row_number INTEGER,
            FOREIGN KEY(activity_group_id)
                REFERENCES activity_groups(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            document_uuid TEXT UNIQUE,
            document_title TEXT,
            document_type TEXT,
            document_source TEXT,
            prepared_by TEXT,
            publish_date TEXT,
            public_access INTEGER,
            lead_agency TEXT,
            kind TEXT,
            FOREIGN KEY(activity_id)
                REFERENCES activities(id)
                ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_projects_name
            ON projects(project_name);

        CREATE INDEX IF NOT EXISTS idx_locations_state
            ON locations(state);

        CREATE INDEX IF NOT EXISTS idx_facilities_project
            ON facilities(project_id);

        CREATE INDEX IF NOT EXISTS idx_activity_groups_project
            ON activity_groups(project_id);
    """)

    connection.commit()
    connection.close()


def get_database_path():
    return DATABASE_PATH
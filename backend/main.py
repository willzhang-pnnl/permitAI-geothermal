from contextlib import asynccontextmanager
import json
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .database import (
    create_tables,
    get_connection,
    get_database_path,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    print(f"Using database: {get_database_path()}")
    yield


app = FastAPI(
    title="Geothermal Data API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    connection = get_connection()

    tables = connection.execute("""
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
    """).fetchall()

    project_count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM projects
    """).fetchone()["count"]

    connection.close()

    return {
        "status": "ok",
        "database": str(get_database_path()),
        "tables": [row["name"] for row in tables],
        "project_count": project_count,
    }


@app.get("/api/projects")
def list_projects(
    search: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
):
    connection = get_connection()

    query = """
        SELECT
            p.project_id,
            p.project_name,
            p.project_description,
            p.project_sponsor,
            p.project_sector,
            p.project_type,
            p.kgra_name,
            l.state,
            l.county,
            COALESCE(SUM(f.unit_capacity_mw), 0) AS total_capacity_mw,
            COUNT(DISTINCT f.facility_id) AS facility_count
        FROM projects p
        LEFT JOIN locations l ON l.project_id = p.project_id
        LEFT JOIN facilities f ON f.project_id = p.project_id
        WHERE 1 = 1
    """

    params = []

    if search:
        query += """
            AND (
                LOWER(p.project_name) LIKE LOWER(?)
                OR LOWER(p.project_sponsor) LIKE LOWER(?)
                OR LOWER(l.state) LIKE LOWER(?)
                OR LOWER(l.county) LIKE LOWER(?)
            )
        """
        search_value = f"%{search}%"
        params.extend([
            search_value,
            search_value,
            search_value,
            search_value,
        ])

    if state:
        query += " AND LOWER(l.state) = LOWER(?)"
        params.append(state)

    query += """
        GROUP BY
            p.project_id,
            p.project_name,
            p.project_description,
            p.project_sponsor,
            p.project_sector,
            p.project_type,
            p.kgra_name,
            l.state,
            l.county
        ORDER BY p.project_name
    """

    rows = connection.execute(query, params).fetchall()
    connection.close()

    return [dict(row) for row in rows]


@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    connection = get_connection()

    project = connection.execute("""
        SELECT
            p.*,
            l.state,
            l.county,
            l.township_range,
            l.state_fips,
            l.county_fips
        FROM projects p
        LEFT JOIN locations l ON l.project_id = p.project_id
        WHERE p.project_id = ?
    """, (project_id,)).fetchone()

    if not project:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found")

    result = dict(project)
    result["raw_json"] = json.loads(result["raw_json"])

    facilities = connection.execute("""
        SELECT
            facility_id,
            facility_name,
            latitude,
            longitude,
            owner,
            operator,
            start_year,
            unit_capacity_mw,
            technology_type
        FROM facilities
        WHERE project_id = ?
        ORDER BY facility_name
    """, (project_id,)).fetchall()

    groups = connection.execute("""
        SELECT
            id,
            activity_group,
            federal_unique_id,
            process_status,
            process_map_phase
        FROM activity_groups
        WHERE project_id = ?
        ORDER BY id
    """, (project_id,)).fetchall()

    result["facilities"] = [dict(row) for row in facilities]
    result["activity_groups"] = {}

    for group in groups:
        group_data = dict(group)
        group_id = group_data.pop("id")
        group_name = group_data.pop("activity_group")

        activities = connection.execute("""
            SELECT
                id,
                activity_type,
                level,
                process_map_phase,
                document_availability_flag,
                summary,
                row_number
            FROM activities
            WHERE activity_group_id = ?
            ORDER BY id
        """, (group_id,)).fetchall()

        group_data["activities"] = []

        for activity in activities:
            activity_data = dict(activity)
            activity_id = activity_data.pop("id")

            document = connection.execute("""
                SELECT
                    document_uuid,
                    document_title,
                    document_type,
                    document_source,
                    prepared_by,
                    publish_date,
                    public_access,
                    lead_agency,
                    kind
                FROM documents
                WHERE activity_id = ?
            """, (activity_id,)).fetchone()

            activity_data["document"] = (
                dict(document) if document else None
            )

            group_data["activities"].append(activity_data)

        result["activity_groups"][group_name] = group_data

    connection.close()
    return result
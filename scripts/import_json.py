import json
import sys
from pathlib import Path
from typing import Any

# Resolve the project root regardless of where this script is executed from.
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Allow imports such as `from backend.database import ...`
sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import (  # noqa: E402
    DATABASE_PATH,
    create_tables,
    get_connection,
)


def get_value(value: Any, default=None):
    """
    Return default when a value is missing or explicitly null.
    """
    return default if value is None else value


def import_project(connection, filepath: Path):
    """
    Import one geothermal project JSON file into SQLite.

    Existing project metadata and facilities are updated.
    Existing activity groups, activities, and documents for the project
    are replaced so that the database reflects the current JSON file.
    """

    with filepath.open("r", encoding="utf-8") as file:
        project = json.load(file)

    if not isinstance(project, dict):
        raise ValueError("The JSON root must be an object")

    project_id = project.get("project_id")

    if not project_id:
        raise ValueError("Missing required field: project_id")

    raw_json = json.dumps(
        project,
        ensure_ascii=False,
    )

    # ------------------------------------------------------------------
    # Project metadata
    # ------------------------------------------------------------------

    connection.execute(
        """
        INSERT INTO projects (
            project_id,
            project_name,
            project_description,
            project_sponsor,
            project_sector,
            project_type,
            kgra_name,
            raw_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            project_name = excluded.project_name,
            project_description = excluded.project_description,
            project_sponsor = excluded.project_sponsor,
            project_sector = excluded.project_sector,
            project_type = excluded.project_type,
            kgra_name = excluded.kgra_name,
            raw_json = excluded.raw_json
        """,
        (
            project_id,
            project.get("project_name"),
            project.get("project_description"),
            project.get("project_sponsor"),
            project.get("project_sector"),
            project.get("project_type"),
            project.get("kgra_name"),
            raw_json,
        ),
    )

    # ------------------------------------------------------------------
    # Project location
    # ------------------------------------------------------------------

    location = project.get("location") or {}

    connection.execute(
        """
        INSERT INTO locations (
            project_id,
            state,
            county,
            township_range,
            state_fips,
            county_fips
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            state = excluded.state,
            county = excluded.county,
            township_range = excluded.township_range,
            state_fips = excluded.state_fips,
            county_fips = excluded.county_fips
        """,
        (
            project_id,
            location.get("state"),
            location.get("county"),
            location.get("township_range"),
            location.get("state_fips"),
            location.get("county_fips"),
        ),
    )

    # ------------------------------------------------------------------
    # Facilities
    # ------------------------------------------------------------------

    facilities = project.get("facilities") or []

    if not isinstance(facilities, list):
        raise ValueError("The facilities field must be an array")

    imported_facility_ids = set()

    for facility in facilities:
        if not isinstance(facility, dict):
            continue

        facility_id = facility.get("facility_id")

        if not facility_id:
            # The schema recommends a facility_id. Skip incomplete rows
            # rather than inserting a record that cannot be updated later.
            print(
                f"Warning: skipping facility without facility_id "
                f"in {filepath.name}"
            )
            continue

        imported_facility_ids.add(facility_id)

        connection.execute(
            """
            INSERT INTO facilities (
                facility_id,
                project_id,
                facility_name,
                latitude,
                longitude,
                owner,
                operator,
                start_year,
                unit_capacity_mw,
                technology_type
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(facility_id) DO UPDATE SET
                project_id = excluded.project_id,
                facility_name = excluded.facility_name,
                latitude = excluded.latitude,
                longitude = excluded.longitude,
                owner = excluded.owner,
                operator = excluded.operator,
                start_year = excluded.start_year,
                unit_capacity_mw = excluded.unit_capacity_mw,
                technology_type = excluded.technology_type
            """,
            (
                facility_id,
                project_id,
                facility.get("facility_name"),
                facility.get("latitude"),
                facility.get("longitude"),
                facility.get("owner"),
                facility.get("operator"),
                facility.get("start_year"),
                facility.get("unit_capacity_mw"),
                facility.get("technology_type"),
            ),
        )

    # Remove facilities that existed in an older version of this project
    # but are no longer present in the current JSON file.
    if imported_facility_ids:
        placeholders = ", ".join("?" for _ in imported_facility_ids)

        connection.execute(
            f"""
            DELETE FROM facilities
            WHERE project_id = ?
              AND facility_id NOT IN ({placeholders})
            """,
            [project_id, *imported_facility_ids],
        )
    else:
        connection.execute(
            """
            DELETE FROM facilities
            WHERE project_id = ?
            """,
            (project_id,),
        )

    # ------------------------------------------------------------------
    # Activity groups, activities, and documents
    # ------------------------------------------------------------------

    # Activity groups have cascading deletes configured in database.py.
    # Deleting them first removes old activities and documents.
    connection.execute(
        """
        DELETE FROM activity_groups
        WHERE project_id = ?
        """,
        (project_id,),
    )

    activity_groups = project.get("activity_groups") or {}

    if not isinstance(activity_groups, dict):
        raise ValueError("The activity_groups field must be an object")

    for activity_group_name, group in activity_groups.items():
        # `_notes` is metadata and not an actual lifecycle activity group.
        if activity_group_name == "_notes":
            continue

        if not isinstance(group, dict):
            continue

        group_cursor = connection.execute(
            """
            INSERT INTO activity_groups (
                project_id,
                activity_group,
                federal_unique_id,
                process_status,
                process_map_phase
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                project_id,
                activity_group_name,
                group.get("federal_unique_id"),
                group.get("process_status"),
                group.get("process_map_phase"),
            ),
        )

        activity_group_id = group_cursor.lastrowid
        activities = group.get("activities") or []

        if not isinstance(activities, list):
            raise ValueError(
                f"activities must be an array for group "
                f"'{activity_group_name}'"
            )

        for activity in activities:
            if not isinstance(activity, dict):
                continue

            document_available = bool(
                activity.get("document_availability_flag", False)
            )

            activity_cursor = connection.execute(
                """
                INSERT INTO activities (
                    activity_group_id,
                    activity_type,
                    level,
                    process_map_phase,
                    document_availability_flag,
                    summary,
                    row_number
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    activity_group_id,
                    activity.get("activity_type"),
                    activity.get("level"),
                    activity.get("process_map_phase"),
                    int(document_available),
                    activity.get("summary"),
                    activity.get("row_number"),
                ),
            )

            activity_id = activity_cursor.lastrowid
            document = activity.get("document")

            # The schema specifies that document is null when no document
            # is available and populated when document_availability_flag
            # is true [1].
            if not document_available or not isinstance(document, dict):
                continue

            connection.execute(
                """
                INSERT INTO documents (
                    activity_id,
                    document_uuid,
                    document_title,
                    document_type,
                    document_source,
                    prepared_by,
                    publish_date,
                    public_access,
                    lead_agency,
                    kind
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(document_uuid) DO UPDATE SET
                    activity_id = excluded.activity_id,
                    document_title = excluded.document_title,
                    document_type = excluded.document_type,
                    document_source = excluded.document_source,
                    prepared_by = excluded.prepared_by,
                    publish_date = excluded.publish_date,
                    public_access = excluded.public_access,
                    lead_agency = excluded.lead_agency,
                    kind = excluded.kind
                """,
                (
                    activity_id,
                    document.get("document_uuid"),
                    document.get("document_title"),
                    document.get("document_type"),
                    document.get("document_source"),
                    document.get("prepared_by"),
                    document.get("publish_date"),
                    (
                        int(bool(document["public_access"]))
                        if document.get("public_access") is not None
                        else None
                    ),
                    document.get("lead_agency"),
                    document.get("kind"),
                ),
            )

    connection.commit()


def import_folder(folder: Path):
    """
    Import all JSON files in the specified folder.
    """

    if not folder.exists():
        raise FileNotFoundError(f"Input folder does not exist: {folder}")

    if not folder.is_dir():
        raise NotADirectoryError(f"Input path is not a folder: {folder}")

    json_files = sorted(folder.glob("*.json"))

    if not json_files:
        print(f"No JSON files found in {folder}")
        return

    create_tables()
    connection = get_connection()

    imported_count = 0
    failed_count = 0

    try:
        for filepath in json_files:
            try:
                import_project(connection, filepath)
                imported_count += 1
                print(f"Imported: {filepath}")

            except Exception as error:
                failed_count += 1
                connection.rollback()

                print(
                    f"Failed: {filepath}\n"
                    f"  Error: {error}"
                )

    finally:
        connection.close()

    print()
    print("Import complete")
    print(f"Imported files: {imported_count}")
    print(f"Failed files: {failed_count}")
    print(f"Database: {DATABASE_PATH}")


def main():
    """
    Usage:

        python scripts/import_json.py
        python scripts/import_json.py data/examples
    """

    if len(sys.argv) > 1:
        input_folder = Path(sys.argv[1]).resolve()
    else:
        input_folder = PROJECT_ROOT / "data" / "examples"

    import_folder(input_folder)


if __name__ == "__main__":
    main()
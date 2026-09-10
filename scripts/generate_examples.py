import json
import os
import uuid
from datetime import datetime

OUTPUT_DIR = "data/examples"

ACTIVITY_GROUPS = [
    "leasing",
    "surface_exploration",
    "resource_confirmation",
    "utilization_well_development_subsurface",
    "utilization_construction",
    "production_well_development",
    "transmission",
    "safety_environmental",
    "reclamation",
]

STATES = [
    ("California", "Inyo County", "T21S R37E"),
    ("Nevada", "Washoe County", "T20N R24E"),
    ("Idaho", "Blaine County", "T2N R18E"),
    ("Oregon", "Lake County", "T35S R18E"),
    ("Utah", "Beaver County", "T30S R8W"),
    ("New Mexico", "Catron County", "T9S R15W"),
    ("Hawaii", "Hawaii County", "T9S R15E"),
    ("Washington", "Klickitat County", "T4N R14E"),
    ("Arizona", "Coconino County", "T20N R7E"),
    ("Colorado", "Eagle County", "T4S R82W"),
]

TECHNOLOGIES = [
    "Binary Cycle",
    "Flash Steam",
    "Dry Steam",
    "Enhanced Geothermal System (EGS)",
    "Hybrid",
]

STATUSES = [
    "planned",
    "pre-application",
    "in progress",
    "completed",
    "paused",
]

PROJECT_NAMES = [
    "Coso Geothermal Field",
    "Desert Peak Expansion",
    "Snake River Geothermal Project",
    "Lakeview Binary Plant",
    "Beaver Basin Geothermal",
    "Red Mesa Resource Area",
    "Puna Renewable Energy Project",
    "Cascade Heat Project",
    "San Francisco Volcanic Field",
    "Rocky Mountain EGS Demonstration",
]


def make_document(project_index, group_name):
    document_uuid = str(uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"geothermal-document-{project_index}-{group_name}"
    ))

    return {
        "document_uuid": document_uuid,
        "document_title": f"{group_name.replace('_', ' ').title()} Document",
        "document_type": "EA",
        "document_source": "Example dataset",
        "prepared_by": "Example Geothermal Agency",
        "publish_date": f"202{project_index % 5 + 1}-0{project_index % 9 + 1}-15",
        "public_access": True,
        "lead_agency": "Bureau of Land Management",
        "kind": "url",
    }


def make_activity_group(project_index, group_name):
    status = STATUSES[(project_index + len(group_name)) % len(STATUSES)]
    has_document = status in ["completed", "in progress"]

    activity = {
        "activity_group": group_name,
        "process_map_phase": group_name.replace("_", " ").title(),
        "activity_type": f"{group_name.replace('_', ' ').title()} Authorization",
        "level": "Federal",
        "document_availability_flag": has_document,
        "row_number": project_index + 1,
    }

    if has_document:
        activity["document"] = make_document(project_index, group_name)
    else:
        activity["summary"] = (
            f"Example status information for the {group_name.replace('_', ' ')} phase."
        )
        activity["document"] = None

    return {
        "federal_unique_id": None,
        "process_status": status,
        "activities": [activity],
    }


def make_project(index):
    state, county, township_range = STATES[index]
    project_id = str(uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"geothermal-project-{index}"
    ))

    latitude = 35.0 + index * 1.1
    longitude = -118.0 + index * 1.4

    facilities = []

    for facility_index in range(1, 3):
        facility_id = str(uuid.uuid5(
            uuid.NAMESPACE_URL,
            f"geothermal-facility-{index}-{facility_index}"
        ))

        facilities.append({
            "facility_id": facility_id,
            "facility_name": f"{PROJECT_NAMES[index]} Unit {facility_index}",
            "latitude": latitude + facility_index * 0.015,
            "longitude": longitude - facility_index * 0.015,
            "owner": f"{PROJECT_NAMES[index]} Energy LLC",
            "operator": f"{PROJECT_NAMES[index]} Operations LLC",
            "start_year": 2010 + index + facility_index,
            "unit_capacity_mw": 15 + index * 3 + facility_index * 5,
            "technology_type": TECHNOLOGIES[
                (index + facility_index) % len(TECHNOLOGIES)
            ],
        })

    return {
        "schema_version": "0.8",
        "project_id": project_id,
        "project_name": PROJECT_NAMES[index],
        "project_description": (
            f"Example geothermal development project located in {county}, "
            f"{state}. This file is intended for frontend testing."
        ),
        "project_sponsor": f"{PROJECT_NAMES[index]} Energy LLC",
        "project_sector": "energy",
        "project_type": "geothermal",
        "kgra_name": f"{PROJECT_NAMES[index]} Known Geothermal Resource Area",
        "location": {
            "state": state,
            "county": county,
            "township_range": township_range,
            "state_fips": None,
            "county_fips": None,
        },
        "well_numbers": [
            f"{index + 1}-A",
            f"{index + 1}-B",
            f"{index + 1}-C",
        ],
        "facilities": facilities,
        "activity_groups": {
            group_name: make_activity_group(index, group_name)
            for group_name in ACTIVITY_GROUPS
        },
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for index in range(10):
        project = make_project(index)
        filename = f"project_{index + 1:02d}.json"
        filepath = os.path.join(OUTPUT_DIR, filename)

        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(project, file, indent=2)

        print(f"Created {filepath}")


if __name__ == "__main__":
    main()
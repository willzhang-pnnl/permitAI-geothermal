import { useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { MapPin } from "lucide-react";
import usStates from "us-atlas/states-10m.json";
import { getFacilities } from "../../utils/projectUtils";

const WIDTH = 960;
const HEIGHT = 600;

const STATE_ABBREVIATIONS = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
  Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI",
  Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT",
  Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
  "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
  Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY", "Puerto Rico": "PR",
};

// Standard Albers USA projection tuned to fill the 960x600 viewBox.
const projection = geoAlbersUsa()
  .scale(1250)
  .translate([WIDTH / 2, HEIGHT / 2]);
const pathGenerator = geoPath(projection);

const statesGeoJson = feature(usStates, usStates.objects.states);

export default function UsProjectsMap({ projects = [], onSelectProject }) {
  const [hovered, setHovered] = useState(null);

  const { statePaths, points, maxStateMw, maxFacilityMw } = useMemo(() => {
    const stateMwByName = {};

    const pts = [];
    projects.forEach((project) => {
      const state = project.location?.state || project.state;
      getFacilities(project).forEach((facility) => {
        const { latitude, longitude } = facility;
        if (typeof latitude !== "number" || typeof longitude !== "number") {
          return;
        }
        const mw = Number(facility.unit_capacity_mw || 0);
        if (state) {
          stateMwByName[state] = (stateMwByName[state] || 0) + mw;
        }
        const projected = projection([longitude, latitude]);
        if (!projected) return;
        pts.push({
          x: projected[0],
          y: projected[1],
          mw,
          facilityName: facility.facility_name,
          projectId: project.project_id,
          projectName: project.project_name,
          state,
          county: project.location?.county || project.county,
          technology: facility.technology_type,
        });
      });
    });

    const featuresWithPaths = statesGeoJson.features
      .map((f) => {
        const d = pathGenerator(f);
        if (!d) return null;
        const [cx, cy] = pathGenerator.centroid(f);
        if (Number.isNaN(cx) || Number.isNaN(cy)) return null;
        return {
          id: f.id,
          name: f.properties?.name,
          abbr: STATE_ABBREVIATIONS[f.properties?.name] || "",
          d,
          cx,
          cy,
          mw: stateMwByName[f.properties?.name] || 0,
        };
      })
      .filter(Boolean);

    const maxState = Math.max(...featuresWithPaths.map((s) => s.mw), 1);
    const maxFacility = Math.max(...pts.map((p) => p.mw), 1);

    return {
      statePaths: featuresWithPaths,
      points: pts,
      maxStateMw: maxState,
      maxFacilityMw: maxFacility,
    };
  }, [projects]);

  function stateFill(mw) {
    if (mw <= 0) return "#0f262d";
    const t = Math.min(mw / maxStateMw, 1);
    // Interpolate between a muted teal and a bright teal.
    const from = { r: 15, g: 51, b: 56 };
    const to = { r: 47, g: 139, b: 120 };
    const r = Math.round(from.r + (to.r - from.r) * t);
    const g = Math.round(from.g + (to.g - from.g) * t);
    const b = Math.round(from.b + (to.b - from.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function markerRadius(mw) {
    const min = 2.5;
    const max = 8;
    const t = Math.sqrt(Math.min(mw / maxFacilityMw, 1));
    return min + (max - min) * t;
  }

  return (
    <div className="us-map-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Map of geothermal project locations across the United States"
        className="us-map-svg"
      >
        <g>
          {statePaths.map((s) => (
            <path
              key={s.id}
              d={s.d}
              fill={stateFill(s.mw)}
              stroke="#0a171c"
              strokeWidth={0.75}
            />
          ))}
        </g>
        <g>
          {statePaths.map(
            (s) =>
              s.abbr && (
                <text
                  key={`label-${s.id}`}
                  x={s.cx}
                  y={s.cy}
                  className={
                    s.mw > 0 ? "us-map-state-label active" : "us-map-state-label"
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {s.abbr}
                </text>
              )
          )}
        </g>
        <g>
          {points.map((p, i) => {
            const r = markerRadius(p.mw);
            return (
              <g
                key={`${p.projectId}-${i}`}
                className="us-map-marker-group"
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered((cur) => (cur === p ? null : cur))}
                onClick={() => onSelectProject?.(p.projectId)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill="#6bd9b5"
                  fillOpacity={0.75}
                  stroke="#e9fff6"
                  strokeWidth={hovered === p ? 1.5 : 0.75}
                  className="us-map-marker"
                />
                <text
                  x={p.x + r + 4}
                  y={p.y}
                  className="us-map-point-label"
                  dominantBaseline="middle"
                >
                  {p.mw} MW
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div
          className="us-map-tooltip"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100}%`,
            transform: `translate(${hovered.x / WIDTH > 0.6 ? "-100%" : "16px"}, ${
              hovered.y / HEIGHT > 0.75 ? "-100%" : "-8px"
            })`,
          }}
        >
          <div className="us-map-tooltip-heading">
            <MapPin size={13} aria-hidden="true" />
            <strong>{hovered.projectName}</strong>
          </div>
          <span>{hovered.facilityName}</span>
          <span>
            {hovered.county ? `${hovered.county}, ` : ""}
            {hovered.state}
          </span>
          <span className="us-map-tooltip-mw">
            {hovered.mw} MW &middot; {hovered.technology || "Unknown Technology"}
          </span>
        </div>
      )}

      <div className="us-map-legend">
        <div className="us-map-legend-item">
          <span className="us-map-legend-swatch us-map-legend-swatch-low" />
          <span>Lower state capacity</span>
        </div>
        <div className="us-map-legend-item">
          <span className="us-map-legend-swatch us-map-legend-swatch-high" />
          <span>Higher state capacity</span>
        </div>
        <div className="us-map-legend-item">
          <span className="us-map-legend-dot" />
          <span>Facility, labeled by MW</span>
        </div>
      </div>
    </div>
  );
}

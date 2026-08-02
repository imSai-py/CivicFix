from src.domain.issues.issue_entity import Coordinates


def test_coordinates_to_geojson_geometry():
    coords = Coordinates(latitude=37.774929, longitude=-122.419416, address="San Francisco Market St")
    geojson = coords.to_geojson_geometry()

    assert geojson["type"] == "Point"
    # RFC 7946 specifies positions as [longitude, latitude]
    assert geojson["coordinates"] == [-122.419416, 37.774929]

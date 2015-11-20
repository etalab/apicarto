## Documentation

### Quartiers prioritaires

#### Recherche géographique

__POST__ `/quartiers-prioritaires/search`

Requête :
```json
{
    "geo": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              5.93536376953125,
              48.91888968903368
            ],
            [
              5.93536376953125,
              49.26780455063753
            ],
            [
              7.094421386718749,
              49.26780455063753
            ],
            [
              7.094421386718749,
              48.91888968903368
            ],
            [
              5.93536376953125,
              48.91888968903368
            ]
          ]
        ]
      }
}
```

Réponse :
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                6.2136923480551,
                49.1342109827851
              ],
              [
                6.21416055031881,
                49.1338823553928
              ],
              ...
            ]
          ]
        ]
      },
      "properties": {
        "code": "QP057019",
        "nom": "Hauts De Vallières",
        "commune": "Metz"
      }
    },
    ...
  ]
}
```

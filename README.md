# apiCarto AOC [![Build Status](https://travis-ci.org/sgmap/apicarto-aoc.svg)](https://travis-ci.org/sgmap/apicarto-aoc)

## Installation des dépendances

```
npm install
```

## Création de la base de données

```
createdb "apicarto-aoc"
psql -d "apicarto-aoc" -c "CREATE EXTENSION postgis"
```

## Chargement des données

### Table appellation

```sh
# Si GDAL avec support de PostgreSQL
PGCLIENTENCODING=LATIN1 ogr2ogr -overwrite -t_srs EPSG:4326 -a_srs EPSG:4326 -f PostgreSQL PG:dbname='apicarto-aoc' data/Appellation.TAB Appellation -lco PG_USE_COPY=YES -lco GEOMETRY_NAME=geom

# Sinon
ogr2ogr --config PG_USE_COPY YES -t_srs EPSG:4326 -f PGDump /vsistdout/ data/Appellation.TAB -lco DROP_TABLE=IF_EXISTS -lco SRID=4326 -lco GEOMETRY_NAME=geom  | PGCLIENTENCODING=LATIN1 psql -d apicarto-aoc -f -
```

### Table communes OSM

```sh
# Si GDAL avec support de PostgreSQL
ogr2ogr -overwrite -a_srs EPSG:4326 -f PostgreSQL PG:dbname='apicarto-aoc' data/communes-20150101-5m.shp -lco PG_USE_COPY=YES -lco GEOMETRY_NAME=geom -nlt PROMOTE_TO_MULTI -nln communes -select insee,nom

# Sinon
ogr2ogr --config PG_USE_COPY YES -f PGDump /vsistdout/ data/communes-20150101-5m.shp -lco DROP_TABLE=IF_EXISTS -lco SRID=4326 -lco GEOMETRY_NAME=geom  -nlt PROMOTE_TO_MULTI -nln communes -select insee,nom | psql -d apicarto-aoc -f -
```

### Table communes IGN

```sh
# Communes de la Réunion
ogr2ogr --config PG_USE_COPY YES -t_srs EPSG:4326 -f PGDump /vsistdout/ /vsizip/data/COMMUNE_PARCELLAIRE_REUNION.zip -lco DROP_TABLE=IF_EXISTS -lco SRID=4326 -lco GEOMETRY_NAME=geom -nlt PROMOTE_TO_MULTI -nln communes_ign | PGCLIENTENCODING=LATIN1 psql -d apicarto-aoc -f -

# Communes France métropolitaine
ogr2ogr --config PG_USE_COPY YES -t_srs EPSG:4326 -f PGDump /vsistdout/ /vsizip/data/COMMUNE_PARCELLAIRE_METROCORSE.zip -lco DROP_TABLE=OFF -lco SRID=4326 -lco GEOMETRY_NAME=geom -nlt PROMOTE_TO_MULTI -nln communes_ign | PGCLIENTENCODING=LATIN1 psql -d apicarto-aoc -f -
```


## Configurer le service


Voir config/default.json pour les paramètres de la BDD


## Lancer le service

```
node index.js
```

## "Tester" le service

```
curl -X POST -H "Content-Type: application/json" --data-binary @tests/test1.json http://localhost:8091/aoc/api/beta/aoc/in
```

## Requête :

Les paramètres sont des Feature GeoJSON avec des géométries en coordonnées?


Note pour récupérer une géométrie de test :

```
SELECT ST_AsGeoJSON(ST_Buffer(ST_Centroid(geom), 50.0)) FROM appellation LIMIT 1
```

=>


La feature associée :

{
    "type":"Feature",    "geometry":{"type":"Polygon","coordinates":[[[4.79628704723532,45.2245686201141],[4.79627198205696,45.2244810075761],[4.79623301978841,45.2243971554783],[4.7961716578197,45.2243202861855],[4.7960902543159,45.2242533537068],[4.79599193758517,45.2241989301793],[4.795880485857,45.2241591070292],[4.79576018209113,45.2241354146047],[4.79563564939616,45.2241287633715],[4.79551167338089,45.2241394089266],[4.79539301826325,45.224166942177],[4.79528424380096,45.2242103050595],[4.79518953007658,45.2242678311979],[4.79511251686827,45.2243373099351],[4.79505616377777,45.224416071282],[4.79502263649038,45.224501088517],[4.79501322353864,45.2245890944965],[4.79502828676983,45.2246767072062],[4.79506724742323,45.2247605597291],[4.7951286083547,45.2248374296355],[4.79521001155707,45.2249043628231],[4.79530832876809,45.2249587870468],[4.79541978168514,45.2249986107744],[4.79554008716747,45.2250223035697],[4.79566462184518,45.2250289549107],[4.79578859980762,45.2250183091839],[4.79590725654041,45.2249907755084],[4.79601603203994,45.2249474120122],[4.79611074606575,45.2248898851649],[4.79618775879377,45.2248204057315],[4.7962441106954,45.2247416438072],[4.79627763626632,45.2246566262013],[4.79628704723532,45.2245686201141]]]}
}


## TODO

* Vérifier les encodages des caractères (UTF-8 en sortie des services)
* config/default.json.dist (l'autre en .gitignore)
* Des tests

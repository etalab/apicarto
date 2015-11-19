# APICarto [![Build Status](https://travis-ci.org/sgmap/apicarto.svg)](https://travis-ci.org/sgmap/apicarto)

## Installation des dépendances

```
npm install
```

## Création de la base de données PostGIS

```
createdb "apicarto"
psql -d "apicarto" -c "CREATE EXTENSION postgis"
```

## Lancer le service

```
node server.js
```

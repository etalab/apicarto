# APICarto [![Build Status](https://travis-ci.org/sgmap/apicarto.svg)](https://travis-ci.org/sgmap/apicarto)

## Prérequis

Pour faire fonctionner APICarto, vous avez besoin de :
* [Node.js](https://nodejs.org) v4.2+ (utilisation de [nvm](https://github.com/creationix/nvm) recommandée)
* PostgreSQL v9.4+
* PostGIS v2.1+
* [ogr2ogr](http://www.gdal.org/ogr2ogr.html) v1.11+
* wget (inclus dans la plupart des distributions Linux)

Sous Ubuntu 14.04 :
```bash
# Installer ogr2ogr
apt-get install gdal-bin

# Installer PostgreSQL et PostGIS
apt-get postgresql postgis postgresql-9.4-postgis-2.1
```

Sous Mac OS X :
```bash
# Installer ogr2ogr
brew install gdal

# Installer PostgreSQL et PostGIS
brew install postgresql postgis
```

## Installation

### Création de la base de donnée

La base qui contiendra les données locales doit être créée au prélable.
```bash
createdb "apicarto"
psql -d "apicarto" -c "CREATE EXTENSION postgis"
```

### Installation du package
```
npm install
```

### Chargement des données
```bash
# Définir le répertoire distant contenant les données sources
npm config set apicarto:refDataDir http://###:###@apicarto-data.sgmap.fr/prod

# Lancer le script d'import
npm run import
```

### Lancer le service
```
npm start
```

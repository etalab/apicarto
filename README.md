## ⚠️ Ce service est en fin de vie ⚠️

Nous nous concentrons désormais exclusivement sur l'[API Géo](https://geo.api.gouv.fr), qui sera verra bientôt enrichie des fonctionnalités de l'API Carto.

L'IGN continue certains développements de l'API Carto, en lien avec son [Géoportail](https://www.geoportail.gouv.fr). Plus d'information sur [leur site dédié](https://apicarto.ign.fr).

# APICarto

[![Dependency Status](https://david-dm.org/etalab/apicarto.svg?style=flat)](https://david-dm.org/etalab/apicarto)

## Prérequis

Pour faire fonctionner APICarto, vous avez besoin de :
* [Node.js](https://nodejs.org) v6+ (utilisation de [nvm](https://github.com/creationix/nvm) recommandée)
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

### Création de la base de données

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

### Clé Géoportail IGN

Pour accéder aux référentiels publiés sur le Géoportail de l'IGN, vous devez définir la clé d'accès et le compte associé.

```bash
npm config set apicarto:geoportailKey ****ma clé****
npm config set apicarto:geoportailReferer ****mon referer****
```

### Lancer le service
```
npm start
```

## Développement derrière un proxy

En cas de nécessité, utiliser les [variables d'environnement standards](https://www.npmjs.com/package/request#controlling-proxy-behaviour-using-environment-variables).

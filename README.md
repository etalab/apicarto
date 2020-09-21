## ⚠️ Ce service est abandonné ⚠️

L'IGN a repris les développements à son compte. Plus d'information sur [leur site dédié](https://apicarto.ign.fr).

# APICarto

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

## Docker

Vous pouvez aussi installer cette API grâce à Docker.

Quelques variables d'environnement sont requises pour préparer les données et faire tourner le service.
Vous pouvez les définir dans un fichier `production.env` situé à la racine du projet. Le fichier `production.env.sample` est fourni en exemple.

```bash
# Démarrage de PostGIS
docker-compose up -d postgis

# Chargement des données et indexation
docker-compose run import

# Démarrage de l'API
docker-compose up -d app
```

L'API est ensuite disponible sur http://localhost:8091.

## Développement derrière un proxy

En cas de nécessité, utiliser les [variables d'environnement standards](https://www.npmjs.com/package/request#controlling-proxy-behaviour-using-environment-variables).

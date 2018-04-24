# APICarto

[![Circle CI](https://circleci.com/gh/sgmap/apicarto/tree/master.svg?style=shield)](https://circleci.com/gh/sgmap/apicarto/tree/master)
[![Coverage Status](https://coveralls.io/repos/sgmap/apicarto/badge.svg?branch=master&service=github)](https://coveralls.io/github/sgmap/apicarto?branch=master)
[![Dependency Status](https://david-dm.org/sgmap/apicarto.svg?style=flat)](https://david-dm.org/sgmap/apicarto)
[![Join the chat at https://gitter.im/sgmap/apicarto](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sgmap/apicarto?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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


## Variables d'environnements

L'intégration des données dans postgis s'appuie sur l'exécutable `psql` qui utilise les variables suivantes :

| Variable   | Description                   |
|------------|-------------------------------|
| PGHOST     | Host du serveur postgresql    |
| PGDATABASE | Nom de la base de données     |
| PGUSER     | Nom de l'utilisateur          |
| PGPASSWORD | Mot de passe de l'utilisateur |


## Sources de données

| Nom              | Description                                                        | Source                                                                                                 |
|------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| bdparcellaire    | Base de données cadastrale                                         | http://professionnels.ign.fr/bdparcellaire                                                             |
| adminexpress     | Découpage administratif du territoire métropolitain et ultra-marin | http://professionnels.ign.fr/adminexpress                                                              |
| osm-commune      | Découpage administratif issu de openstreetmap                      | https://www.data.gouv.fr/fr/datasets/decoupage-administratif-communal-francais-issu-d-openstreetmap/#  |
| inao-appellation | Appellation viticoles INAO                                         | https://www.data.gouv.fr/fr/datasets/delimitation-parcellaire-des-aoc-viticoles-de-linao/#_            |
| codes-postaux    | Codes postaux associés aux communes                                | Voir https://github.com/etalab/codes-postaux#sources                                                   |



## Installation

### Installation du package

```
npm install
```

### Création de la base de données

La base qui contiendra les données locales doit être créée au prélable.

```bash
createdb "apicarto"
psql -d "apicarto" -c "CREATE EXTENSION postgis"
```


### Chargement des données

```bash
PGDATABASE=apicarto npm run import
```

### Clé Géoportail IGN

Certaines couches de données WFS utilisées par l'API sont en accès restreint (paramètre `apikey`). Veuillez contacter l'IGN via l'espace professionnel pour avoir accès à ces couches via une clé géoportail.

### Lancer le service

```
npm start
```

## Développement derrière un proxy

En cas de nécessité, utiliser les [variables d'environnement standards](https://www.npmjs.com/package/request#controlling-proxy-behaviour-using-environment-variables).

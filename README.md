# APICarto

[![Circle CI](https://circleci.com/gh/sgmap/apicarto/tree/master.svg?style=shield)](https://circleci.com/gh/sgmap/apicarto/tree/master)
[![Coverage Status](https://coveralls.io/repos/sgmap/apicarto/badge.svg?branch=master&service=github)](https://coveralls.io/github/sgmap/apicarto?branch=master)
[![Dependency Status](https://david-dm.org/sgmap/apicarto.svg?style=flat)](https://david-dm.org/sgmap/apicarto)
[![Join the chat at https://gitter.im/sgmap/apicarto](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sgmap/apicarto?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Prérequis

Pour faire fonctionner API Carto, vous avez besoin de :

* [Node.js](https://nodejs.org) v6+ (utilisation de [nvm](https://github.com/creationix/nvm) recommandée)
* PostgreSQL v9.4+
* PostGIS v2.1+
* [ogr2ogr](http://www.gdal.org/ogr2ogr.html) v1.11+
* wget (inclus dans la plupart des distributions Linux)

Sous Ubuntu :
```bash
# Installer ogr2ogr
apt-get install gdal-bin

# Installer PostgreSQL et PostGIS
apt-get postgresql postgis postgresql-13-postgis-3
```

Sous Mac OS X :
```bash
# Installer ogr2ogr
brew install gdal

# Installer PostgreSQL et PostGIS
brew install postgresql postgis
```


## Variables d'environnements

### Configuration de la connexion postgresql

La connexion à la base postgresql est configurée à l'aide des variables d'environnement standard postgresql :

| Variable   | Description                   |
|------------|-------------------------------|
| PGHOST     | Host du serveur postgresql    |
| PGDATABASE | Nom de la base de données     |
| PGUSER     | Nom de l'utilisateur          |
| PGPASSWORD | Mot de passe de l'utilisateur |


### Configuration de la clé géoportail

Les modules faisant appel aux flux geoportail supportent un paramètre `apikey` en paramètre de requête. Il est toutefois possible de déployer un serveur API Carto où les utilisateurs n'ont pas besoin de fournir ce paramètre :

| Variable              | Description                   | Valeur par défaut        |
|-----------------------|-------------------------------|--------------------------|
| GEOPORTAL_API_KEY     | Clé geoportail                | aucune                   |
| GEOPORTAL_REFERER     | Permet d'écraser le referer   | http://localhost         |

L'ordre de priorité dans l'utilisation des variables est le suivant :

* Pour la clé d'API, on utilise d'abord `apikey`, puis la variable d'environnement `GEOPORTAL_API_KEY`
* Pour le referer, si le paramètre `apikey` est utilisé, on utilise le referer de la requête. Sinon, on utilise `GEOPORTAL_REFERER` et en dernier recours la valeur par défaut.

Remarque : Vous n'êtes pas obligé de créer une clé protégée par referer, vous pouvez aussi spécifier une protection par IP (celui du serveur hébergeant API Carto) ou par User-Agent ('apicarto')


## Sources de données

| Nom              | Description                                                        | Source                                                                                                 |
|------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| bdparcellaire    | Base de données cadastrale                                         | http://professionnels.ign.fr/bdparcellaire                                                             |
| adminexpress     | Découpage administratif du territoire métropolitain et ultra-marin | http://professionnels.ign.fr/adminexpress                                                              |
| osm-commune      | Découpage administratif issu de openstreetmap                      | https://www.data.gouv.fr/fr/datasets/decoupage-administratif-communal-francais-issu-d-openstreetmap/#  |
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

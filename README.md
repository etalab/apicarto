# APICarto

[![CI](https://github.com/IGNF/apicarto/actions/workflows/ci.yml/badge.svg)](https://github.com/IGNF/apicarto/actions/workflows/ci.yml)

## Prérequis

Pour faire fonctionner API Carto, vous avez besoin de :

* [Node.js](https://nodejs.org) v14+ (utilisation de [nvm](https://github.com/creationix/nvm) recommandée)
* PostgreSQL v12+
* PostGIS v2.2+
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


## Sources de données

| Nom              | Description                                                        | Source                                                                                                 |
|------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| bdparcellaire    | Base de données cadastrale                                         | http://professionnels.ign.fr/bdparcellaire                                                             |
| adminexpress     | Découpage administratif du territoire métropolitain et ultra-marin | http://professionnels.ign.fr/adminexpress                                                              |
| osm-commune      | Découpage administratif issu de openstreetmap                      | https://www.data.gouv.fr/fr/datasets/decoupage-administratif-communal-francais-issu-d-openstreetmap/#  |
| codes-postaux    | Codes postaux associés aux communes                                | Voir https://github.com/BaseAdresseNationale/codes-postaux                                                   |



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

### Lancer le service

```bash
npm start
```

## Développement derrière un proxy

En cas de nécessité, utiliser les [variables d'environnement standards](https://www.npmjs.com/package/request#controlling-proxy-behaviour-using-environment-variables).

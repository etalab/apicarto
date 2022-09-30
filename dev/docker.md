# APICARTO - déploiement avec docker

## Points clés

* L'image apicarto est définie par le fichier [Dockerfile](../Dockerfile)
* Un exemple de fichier [docker-compose.yml](../docker-compose.yml) est disponible
* Le nom du conteneur PostGIS y est fixé à apicarto-db (simplifie les commandes ci-dessous et ne gêne pas car non scalable)
* Ce conteneur PostGIS est utile uniquement pour le module AOC

## Construction et installation

* Construire l'image apicarto : `docker-compose build`
* Démarrer la stack :
  * `docker-compose up -d` => http://devbox.ign.fr:8091/api/doc/
  * `HOST_HOSTNAME=devbox.ign.fr docker-compose up -d` => https://apicarto.devbox.ign.fr/api/doc/

## Gestion de la base de données

Pour le module AOC :

* Création de la base de données : `docker exec -i apicarto-db createdb -U postgres apicarto`
* Activation de l'extension PostGIS : `docker exec -i apicarto-db psql -U postgres -d apicarto -c "CREATE EXTENSION postgis"`
* Restaurer une sauvegarde :

```bash
cat $APICARTO_FTP_DIR/backup/apicarto_20220829.sql | docker exec -i apicarto-db psql -U postgres -d apicarto
```


-- Renommage de la colonne dont le nom est tronqué
ALTER TABLE appellations RENAME appellatio TO appellation;

-- Enrichissement du schéma de la table
CREATE TYPE type_granularite_appellations AS ENUM('commune', 'exacte');

ALTER TABLE appellations ADD COLUMN instruction_obligatoire boolean;
ALTER TABLE appellations ADD COLUMN granularite type_granularite_appellations;

-- Correction des géométries
UPDATE appellations SET geom = ST_MakeValid(ST_Buffer(geom, 0)) WHERE geom IS NOT NULL AND NOT ST_IsValid(geom);

-- Enrichissement des données
UPDATE appellations SET instruction_obligatoire = FALSE;
UPDATE appellations SET granularite = 'exacte' WHERE segment = '1';
UPDATE appellations SET granularite = 'commune' WHERE segment IN ('3', '4');

-- Marquage de l'appellation Sable de Camargue
UPDATE appellations SET instruction_obligatoire = TRUE WHERE IDApp = '1022';

-- Création des indexes
CREATE INDEX appellations_geom_gist ON appellations USING GIST (geom);
CREATE INDEX appellations_insee ON appellations USING btree (insee);

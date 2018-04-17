-- Renommage de la colonne dont le nom est tronqué
ALTER TABLE appellation RENAME appellatio TO appellation;
ALTER TABLE appellation RENAME id_app TO idapp;

-- Enrichissement du schéma de la table
CREATE TYPE type_granularite_appellation AS ENUM('commune', 'exacte');

ALTER TABLE appellation ADD COLUMN instruction_obligatoire boolean;
ALTER TABLE appellation ADD COLUMN granularite type_granularite_appellation;

-- Correction des géométries
UPDATE appellation SET geom = ST_Multi(ST_MakeValid(ST_Buffer(geom, 0))) WHERE geom IS NOT NULL AND NOT ST_IsValid(geom);

-- Enrichissement des données
UPDATE appellation SET instruction_obligatoire = FALSE;
UPDATE appellation SET granularite = 'exacte' WHERE segment = '1';
UPDATE appellation SET granularite = 'commune' WHERE segment IN ('3', '4');

-- Marquage de l'appellation Sable de Camargue
UPDATE appellation SET instruction_obligatoire = TRUE WHERE IDApp = '1022';

-- Création des indexes
CREATE INDEX appellations_geom_gist ON appellation USING GIST (geom);
CREATE INDEX appellations_insee ON appellation USING btree (insee);

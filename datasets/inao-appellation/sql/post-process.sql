-----------------------------------------------------------------------------------------
-- correction de nom de champ liés à la limite à 10 caractères des shapefiles
-- remarque : les autres champs sont laissés intact (ex : id_app qui était idapp)
-----------------------------------------------------------------------------------------
ALTER TABLE inao.appellation RENAME COLUMN appellatio TO appellation;
ALTER TABLE inao.appellation RENAME COLUMN denominati TO denomination;

-----------------------------------------------------------------------------------------
-- Correction des géométries
-----------------------------------------------------------------------------------------
UPDATE inao.appellation SET 
    geom = ST_MakeValid(ST_Buffer(geom, 0)) 
WHERE geom IS NOT NULL 
AND NOT ST_IsValid(geom)
;

-- Création des indexes
CREATE INDEX ON inao.appellation USING GIST (geom);
--CREATE INDEX ON inao.appellation USING btree (insee);

-----------------------------------------------------------------------------------------
-- Enrichissement du schéma de la table
-- ATTENTION : information métier INAO non restorées en l'absence de "segment" 
--     permettant de calculer "granularite" 
-----------------------------------------------------------------------------------------
-- CREATE TYPE type_granularite_appellation AS ENUM('commune', 'exacte');

-- ALTER TABLE inao.appellation ADD COLUMN instruction_obligatoire boolean;
-- ALTER TABLE inao.appellation ADD COLUMN granularite type_granularite_appellation;

-- Enrichissement des données
-- UPDATE inao.appellation SET instruction_obligatoire = FALSE;
-- UPDATE inao.appellation SET granularite = 'exacte' WHERE segment = '1';
-- UPDATE inao.appellation SET granularite = 'commune' WHERE segment IN ('3', '4');

-- Marquage de l'appellation Sable de Camargue
-- UPDATE Appellation SET instruction_obligatoire = TRUE WHERE IDApp = '1022';



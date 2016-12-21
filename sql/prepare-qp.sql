-- Correction des géométries
UPDATE quartiers_prioritaires SET geom = ST_MakeValid(ST_Buffer(geom, 0)) WHERE geom IS NOT NULL AND NOT ST_IsValid(geom);

-- Création des indexes
CREATE INDEX quartiers_prioritaires_geom_gist ON quartiers_prioritaires USING GIST (geom);

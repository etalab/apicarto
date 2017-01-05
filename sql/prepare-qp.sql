-- Correction des géométries
UPDATE quartiers_prioritaires SET geom = ST_MakeValid(ST_Buffer(geom, 0)) WHERE geom IS NOT NULL AND NOT ST_IsValid(geom);

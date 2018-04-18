-- fix dirty column name (shapefile limitation)
ALTER TABLE inao.appellation RENAME COLUMN appellatio TO appellation;
ALTER TABLE inao.appellation RENAME COLUMN denominati TO denomination;

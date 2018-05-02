const shell = require('shelljs');
const path = require('path');

const config = require('./config');

if (!shell.which('wget')) {
    shell.echo('Sorry, this script requires wget');
    shell.exit(1);
}
if (!shell.which('psql')) {
    shell.echo('Sorry, this script requires psql');
    shell.exit(1);
}
if (!shell.which('ogr2ogr')) {
    shell.echo('Sorry, this script requires shp2pgsql');
    shell.exit(1);
}
if (!shell.which('unzip')) {
    shell.echo('Sorry, this script requires unzip');
    shell.exit(1);
}

/* Download AOC file */
var dataDir = __dirname+'/data/';
shell.rm('-rf', dataDir);
if (shell.exec('mkdir -p '+dataDir).code !== 0) {
    shell.echo('Fail to create data directory : '+dataDir)
    shell.exit(1);
}

/* Change directory to data directory */
shell.cd(dataDir);

/* Download zip file if not exists */
if ( ! shell.test('-e', 'delimitation_inao_EPSG2154.zip') ){ 
    if (shell.exec('wget --progress=bar:force -O delimitation_inao_EPSG2154.zip '+config.download_url).code !== 0) {
        shell.echo('Error: wget failed');
        shell.exit(1);
    }
}

/* Extract zip file */
if (shell.exec('unzip -j -o delimitation_inao_EPSG2154.zip').code !== 0) {
    shell.echo('Error: unzip failed');
    shell.exit(1);
}

/* Convert shapefile to sql */
var command = 'ogr2ogr --config PG_USE_COPY YES -f PGDump /vsistdout/ ';
command += '-a_srs EPSG:2154 -t_srs EPSG:4326 -lco GEOMETRY_NAME=geom -lco DROP_TABLE=ON ';
command += '-lco SCHEMA=inao ';
command += '-nlt PROMOTE_TO_MULTI -nln appellation ';
command += 'delimitation_parcellaire_aoc_viticoles_inao.shp | psql --quiet';
if (shell.exec(command).code !== 0) {
    shell.echo('Error: import failed');
    shell.exit(1);
}

if (shell.exec('psql -f '+__dirname+'/sql/post-process.sql').code !== 0) {
    shell.echo('Error: post-process.sql failed');
    shell.exit(1);
}

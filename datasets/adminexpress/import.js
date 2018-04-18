var shell = require('shelljs');

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
if (!shell.which('7z')) {
	shell.echo('Sorry, this script requires unzip');
	shell.exit(1);
}

/* Download archive */
// TODO resolve latest 
var url = "https://wxs-telechargement.ign.fr/x02uy2aiwjo9bm8ce5plwqmr/telechargement/prepackage/ADMINEXPRESS-PACK_2018-03-14\\$ADMIN-EXPRESS_1-1__SHP__FRA_2018-03-14/file/ADMIN-EXPRESS_1-1__SHP__FRA_2018-03-14.7z";

var dataDir = __dirname+'/../data/adminexpress';
if (shell.exec('mkdir -p '+dataDir).code !== 0) {
	shell.echo('Fail to create data directory : '+dataDir)
	shell.exit(1);
}


/* Change directory to data directory */
shell.cd(dataDir);

/* Download zip file if not exists */
if ( ! shell.test('-e', 'ADMIN-EXPRESS.7z') ){ 
	if (shell.exec('wget --progress=bar:force -O ADMIN-EXPRESS.7z "'+url+'"').code !== 0) {
		shell.echo('Error: wget failed');
		shell.exit(1);
	}
}

/* Extract zip file */
if (shell.exec('7z x -y ADMIN-EXPRESS.7z').code !== 0) {
	shell.echo('Error: archive extraction failed');
	shell.exit(1);
}

/* Création du schéma */
//TODO

/* Import des shapepiles */
var shapefiles = {
    "REGION": [],
    "DEPARTEMENT": [],
    "ARRONDISSEMENT_DEPARTEMENTAL": [],
    "EPCI": [],
    "COMMUNE": [],
    "CHEF_LIEU": []
};
shell.find('.').filter(function(file) {
    for ( var tableName in shapefiles ){
        if ( file.endsWith(tableName+'.shp') ){
            shapefiles[tableName].push(file);
        }
    }
});

for ( var tableName in shapefiles ){
    var tableShapefiles = shapefiles[tableName];
    for ( var i in tableShapefiles ){
        var tableShapefile = tableShapefiles[i];
        var command = 'ogr2ogr ';
        command += '--config PG_USE_COPY YES -f PGDump /vsistdout/ ';
        command += '-t_srs EPSG:4326 -lco GEOMETRY_NAME=geom ';
        if ( i == 0 ){
            command += "-lco DROP_TABLE=ON ";
        }else{
            command += "-lco DROP_TABLE=OFF -lco CREATE_TABLE=OFF ";
        }
        command += '-lco SCHEMA=adminexpress ';
        command += '-nlt PROMOTE_TO_MULTI -nln '+tableName+' ';
        command += '"'+tableShapefile+'"';
        command += ' | psql --quiet';
        
        shell.echo(command);
        if (shell.exec(command).code !== 0) {
        	shell.echo('Error: import failed');
        	shell.exit(1);
        }
    }
}

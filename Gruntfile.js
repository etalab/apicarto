module.exports = function (grunt) {

    const refDataDir = process.env.REF_DATA_DIR || process.env.npm_package_config_refDataDir;

    const pgConfig = {
        user: process.env.PGUSER || process.env.npm_package_config_pgUser,
        dbName: process.env.PGDBNAME || process.env.npm_package_config_pgDbName || 'apicarto',
        password: process.env.PGPASSWORD || process.env.npm_package_config_pgPassword
    };

    const appellationRelease = '20170227_Appellation_deploiement1';

    const sourceFiles = {
        qp: refDataDir + '/qp-politiquedelaville-shp.zip',
        'communes-ign-metrocorse': refDataDir + '/COMMUNE_PARCELLAIRE_METROCORSE.zip',
        'communes-ign-reunion': refDataDir + '/COMMUNE_PARCELLAIRE_REUNION.zip',
        'communes-osm': refDataDir + '/communes-20150101-5m-shp.zip',
        'appellations-viticoles': refDataDir + '/' + appellationRelease + '.zip'
    };

    const rmdir = {};

    const unzip = {};

    const runpg = {
        'appellations-viticoles': 'prepare-appellations.sql',
        'qp': 'prepare-qp.sql'
    };

    const importableLayers = {
        qp: {
            dataSource: '/vsizip/qp-politiquedelaville-shp.zip QP_METROPOLEOUTREMER_WGS84_EPSG4326',
            layerName: 'quartiers_prioritaires'
        },
        'communes-ign-metrocorse': {
            dataSource: '/vsizip/COMMUNE_PARCELLAIRE_METROCORSE.zip',
            layerName: 'communes_ign',
            convertToWgs84: true,
            pgClientEncoding: 'LATIN1'
        },
        'communes-ign-reunion': {
            dataSource: '/vsizip/COMMUNE_PARCELLAIRE_REUNION.zip',
            layerName: 'communes_ign',
            dropTable: 'NO',
            convertToWgs84: true,
            createTable: 'NO',
            pgClientEncoding: 'LATIN1'
        },
        'communes-osm': {
            dataSource: '/vsizip/communes-20150101-5m-shp.zip',
            layerName: 'communes',
            select: 'insee,nom'
        },
        'appellations-viticoles': {
            dataSource: '/vsizip/' + appellationRelease + '.zip',
            layerName: 'appellation',
            convertToWgs84: true,
            spatialIndex: 'NO',
            pgClientEncoding: 'LATIN1',
            append: true
        }
    };

    grunt.initConfig({
        shell: {
            wget: {
                command: (scope) => 'wget -N --quiet ' + sourceFiles[scope]
            },
            importpg: {
                command: (scope) => {
                    const config = importableLayers[scope];

                    const ogrOptions = [
                        '--config PG_USE_COPY YES',
                        '-f PGDump',
                        '/vsistdout',
                        '-lco SRID=4326',
                        '-lco GEOMETRY_NAME=geom',
                        '-lco DROP_TABLE=' + (config.dropTable || 'IF_EXISTS'),
                        '-lco CREATE_TABLE=' + (config.createTable || 'ON'),
                        '-nlt PROMOTE_TO_MULTI',
                        '-nln ' + config.layerName
                    ];
                    if (config.append) ogrOptions.push('-append');
                    if (config.convertToWgs84) ogrOptions.push('-t_srs EPSG:4326');
                    if (config.select) ogrOptions.push('-select ' + config.select);
                    if (config.spatialIndex) ogrOptions.push('-lco SPATIAL_INDEX=' + config.spatialIndex);

                    const psqlOptions = [
                        '-h localhost',
                        '-d ' + pgConfig.dbName
                    ];
                    if (pgConfig.user) psqlOptions.push('-U ' + pgConfig.user);

                    const psqlEnvVars = [];
                    if (pgConfig.password) psqlEnvVars.push('PGPASSWORD=' + pgConfig.password);
                    if (config.pgClientEncoding) psqlEnvVars.push('PGCLIENTENCODING=' + config.pgClientEncoding);

                    return 'ogr2ogr ' + ogrOptions.join(' ') + ' ' + config.dataSource + ' | ' + psqlEnvVars.join(' ') + ' psql ' + psqlOptions.join(' ') + ' -f -';
                },
                options: {
                    failOnError: false
                }
            },
            runpg: {
                command: (scope) => {
                    const psqlOptions = [
                        '-h localhost',
                        '-d ' + pgConfig.dbName
                    ];
                    if (pgConfig.user) psqlOptions.push('-U ' + pgConfig.user);

                    const psqlEnvVars = [];
                    if (pgConfig.password) psqlEnvVars.push('PGPASSWORD=' + pgConfig.password);

                    return psqlEnvVars.join(' ') + ' psql ' + psqlOptions.join(' ') + ' --file=../sql/' + runpg[scope];
                }
            },
            unzip: {
                command: (scope) => 'unzip ' + unzip[scope].src + ' -d ' + unzip[scope].dest
            },
            rmdir: {
                command: (scope) => 'rm -R ' + rmdir[scope]
            },
            options: {
                execOptions: {
                    cwd: 'data'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('import-qp', [
        'shell:wget:qp',
        'shell:importpg:qp',
        'shell:runpg:qp'
    ]);

    grunt.registerTask('import-communes-ign', [
        'shell:wget:communes-ign-metrocorse',
        'shell:wget:communes-ign-reunion',
        'shell:importpg:communes-ign-metrocorse',
        'shell:importpg:communes-ign-reunion'
    ]);

    grunt.registerTask('import-communes-osm', [
        'shell:wget:communes-osm',
        'shell:importpg:communes-osm'
    ]);

    grunt.registerTask('import-appellations-viticoles', [
        'shell:wget:appellations-viticoles',
        'shell:importpg:appellations-viticoles',
        'shell:runpg:appellations-viticoles'
    ]);

    grunt.registerTask('import', [
        'import-qp',
        'import-communes-ign',
        'import-communes-osm',
        'import-appellations-viticoles'
    ]);

};

module.exports = function (grunt) {

    const refDataDir = process.env.REF_DATA_DIR || process.env.npm_package_config_refDataDir;

    const pgConfig = {
        user: process.env.PGUSER || process.env.npm_package_config_pgUser,
        dbName: process.env.PGDBNAME || process.env.npm_package_config_pgDbName || 'apicarto',
        password: process.env.PGPASSWORD || process.env.npm_package_config_pgPassword
    };

    const sourceFiles = {
        qp: refDataDir + '/qp-politiquedelaville-shp.zip'
    };

    const importableLayers = {
        qp: {
            dataSource: '/vsizip/qp-politiquedelaville-shp.zip',
            layerName: 'quartiers_prioritaires',
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
                        '-lco DROP_TABLE=IF_EXISTS',
                        '-nlt PROMOTE_TO_MULTI',
                        '-nln ' + config.layerName
                    ];
                    if (config.append) ogrOptions.push('-append');

                    const psqlOptions = [
                        '-h localhost',
                        '-d ' + pgConfig.dbName
                    ];
                    if (pgConfig.user) psqlOptions.push('- U ' + pgConfig.user);

                    return 'ogr2ogr ' + ogrOptions.join(' ') + ' ' + config.dataSource + ' | psql ' + psqlOptions.join(' ') + ' -f -';
                },
                options: {
                    failOnError: false,
                    execOptions: {
                        cwd: 'data',
                        env: pgConfig.password ? { PGPASSWORD: pgConfig.password } : {}
                    }
                }
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
        'shell:importpg:qp'
    ]);

    grunt.registerTask('import', [
        'import-qp'
    ]);

};

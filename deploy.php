<?php
namespace Deployer;

require 'recipe/common.php';
require 'config/logger.php';

// Config

set('logger', $logger);
set('errorListener', $errorListener);

set('repository', 'https://github.com/JeyHightower/Hotspot-2.0.git');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

host('hotspot-2-0-eiql.onrender.com')
    ->set('remote_user', 'deployer')
    ->set('deploy_path', '/opt/render/project/src')
    ->set('port', 443)
    ->set('http_user', 'deployer')
    ->set('writable_mode', 'chmod')
    ->set('auth_token', 'rnd_5GwQVXOf11fsOS8WhJxuMgM9ZEsU');

// Hooks

after('deploy:failed', 'deploy:unlock');

namespace Deployer;

// Define tasks
task('build', function () {
    run('cd {{release_path}} && composer install');
    run('cd {{release_path}} && npm install');
    run('cd {{release_path}} && npm run build');
});

// Remove the group task and use a simple task definition
task('deploy', [
    'deploy:prepare',
    'deploy:vendors',
    'build',
    'deploy:publish'
]);

namespace Deployer;

task('npm:dev', function() {
    $auth_token = get('auth_token');
    
    // Set proper connection parameters
    set('ssh_multiplexing', false);
    set('http_user', 'deployer');
    
    within('{{release_path}}', function() {
        run('npm run dev');
    });
});
// Add failure handler
after('deploy:failed', 'deploy:unlock');

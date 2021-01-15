const fs = require('fs-extra');
const path = require('path');
const makeRunnable = require('make-runnable/custom');
const scanner = require('sonarqube-scanner');
const { execSync, exec } = require('child_process');

const rootDir = path.join(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const clientDir = path.join(rootDir, 'client');
const clientDistDir = path.join(clientDir, 'dist');
const clientNodeModulesDir = path.join(clientDir, 'node_modules');
const serverDir = path.join(rootDir, 'server');
const serverDistDir = path.join(serverDir, 'dist');
const serverPublicDir = path.join(serverDistDir, 'dist');
const serverNodeModulesDir = path.join(serverDir, 'node_modules');
const sharedDir = path.join(rootDir, 'shared');
const sharedDistDir = path.join(sharedDir, 'dist');
const sharedNodeModulesDir = path.join(sharedDir, 'node_modules');
const buildDir = path.join(rootDir, 'build');
const buildDistDir = path.join(buildDir, 'dist');
const buildNodeModulesDir = path.join(buildDir, 'node_modules');

const command = (cmd) => execSync(cmd, { stdio: 'inherit' });

const scripts = {
    install: function() {
        console.log('Installing dependencies, this may take some time...')
        process.chdir(clientDir);
        command('npm install');
        process.chdir(serverDir);
        command('npm install');
        process.chdir(sharedDir);
        command('npm install');
        console.log('Installation complete');
    },
    build: function() {
        this.clean();
        this.install();
        console.log('Build started...');
        process.chdir(clientDir);
        command('npm run build');
        process.chdir(serverDir);
        command('npm run compile');
        fs.copySync(serverDistDir, buildDir);
        fs.copySync(clientDistDir, buildDistDir);
        fs.copySync(serverNodeModulesDir, buildNodeModulesDir);
        console.log('Build successful');
    },
    prod: function() {
        this.clean();
        this.install();
        console.log('Build started...');
        process.chdir(clientDir);
        command('npm run build:prod');
        process.chdir(serverDir);
        command('npm run compile');
        fs.copySync(serverDistDir, buildDir);
        fs.copySync(clientDistDir, buildDistDir);
        fs.copySync(serverNodeModulesDir, buildNodeModulesDir);
        console.log('Build successful');
    },
    debug: function () {
        this.clean();
        this.install();
        console.log('Build started...');
        process.chdir(serverDir);
        command('npm run build');
        fs.copySync(clientDistDir, serverPublicDir);
        console.log('Build successful');
    },
    dev: function () {
        exec('npm start', { cwd: clientDir });
        exec('npm run watch', { cwd: serverDir });
    },
    clean: function(options) {
        [serverDistDir, clientDistDir, sharedDistDir, buildDir].forEach(dir => fs.rmdirSync(dir, { recursive: true, force: true }));
        if (options && options.all)
            [clientNodeModulesDir, serverNodeModulesDir, sharedNodeModulesDir, nodeModulesDir].forEach(dir => fs.rmdirSync(dir, { recursive: true, force: true }));
    },
    scan: function() {
        process.chdir(serverDir);
        command('npm run test');
        process.chdir(clientDir);
        command('npm run test');
        process.chdir(rootDir);
        scanner({
            serverUrl: 'http://aminsep.disi.unibo.it:9000',
            token: '88d33c465a8db4b6c686f9987d5e29a89fc25798',
            options: {
                'sonar.projectName': 'Twitter Tracker (Team 4)',
                'sonar.projectKey': 'twitter-tracker-team-4',
                'sonar.sources': 'server/src,client/src,shared/src',
                'sonar.tests': 'server/tests,client/tests',
                'sonar.dynamicAnalysis': 'reuseReports',
                'sonar.typescript.lcov.reportPaths': 'server/coverage/lcov.info,client/coverage/lcov.info'
            }
        }, () => process.exit())
    }
};

module.exports = scripts;
makeRunnable({ printOutputFrame: false });
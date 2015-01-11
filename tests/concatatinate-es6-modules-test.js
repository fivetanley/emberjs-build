'use strict';

var chai     = require('chai');
var path     = require('path');
var expect   = chai.expect;
var broccoli = require('broccoli');

chai.use(require('chai-fs'));

var readContent           = require('./helpers/file');
var getES6Package         = require('../lib/get-es6-package');
var concatenateES6Modules = require('../lib/concatenate-es6-modules');

var fixtureTestPath = path.join(__dirname, './fixtures/packages/ember-metal/tests');
var fixtureLibPath  = path.join(__dirname, './fixtures/packages/ember-metal/lib');

describe('concatenate-es6-modules', function() {
  var builder;
  var packages = { 'ember-metal': {} };

  var fullTree = getES6Package(packages, 'ember-metal', {
    libPath:  fixtureLibPath,
    testPath: fixtureTestPath
  });

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });

  it('correctly concats test tree into one file properly', function() {
    var expectedFilePath = path.join(__dirname, './expected/packages/ember-tests.js');
    var expectedContent  = readContent(expectedFilePath);

    var compiledTests = concatenateES6Modules(fullTree.tests, {
      es3Safe:   false,
      derequire: false,
      includeLoader: true,
      inputFiles: ['**/*.js'],
      destFile: '/ember-tests.js'
    });

    builder = new broccoli.Builder(compiledTests);

    return builder.build()
      .then(function(results) {
        var filePath = results.directory + '/ember-tests.js';
        var fileContent = readContent(filePath);

        expect(filePath).to.be.a.path('file exists');
        expect(fileContent).to.equal(expectedContent);
      });
  });
});
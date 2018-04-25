/*eslint-env node, mocha */
const expect = require('expect.js');

const isGeometry = require('../../checker/isGeometry');

describe('Test checker.isGeometry', function() {
    describe('with a string', function() {
        it('should report an error', function() {
            expect(isGeometry).withArgs('test string').to.throwError();
        });
    });

    describe('with a non geometry object', function() {
        it('should report an error', function() {
            expect(isGeometry).withArgs({username: 'toto'}).to.throwError();
        });
    });

    describe('with an invalid Point', function() {
        it('should not report an error', function() {
            expect(isGeometry).withArgs({type: 'Point',coordinates:[3.0]}).to.throwError();
        });
    });
    
    describe('with a valid Point', function() {
        it('should not report an error', function() {
            expect(isGeometry).withArgs({type: 'Point',coordinates:[3.0,5.0]}).to.not.throwError();
        });
    });

    describe('with a valid Point but too many decimals', function() {
        it('should not report an error', function() {
            expect(isGeometry).withArgs({type: 'Point',coordinates:[3.123456789,5.123456789]}).to.not.throwError();
        });
    });

});

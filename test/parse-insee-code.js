/*eslint-env node, mocha */
const expect = require('expect.js');
const parseInseeCode = require('../lib/parse-insee-code.js') ;

describe('#parseCodeInsee()', () => {
    it('should throw an exception for invalid INSEE code (length)', () => {
        expect(parseInseeCode)
            .withArgs('5444')
            .to.throwException('INSEE code must have 5 characters');
    });

    it('should throw an exception for invalid INSEE code (content)', () => {
        expect(parseInseeCode)
            .withArgs('2E001')
            .to.throwException('Invalid INSEE code');

        expect(parseInseeCode)
            .withArgs('24A01')
            .to.throwException('Invalid INSEE code');

        expect(parseInseeCode)
            .withArgs('97801')
            .to.throwException('Invalid DOM INSEE code');

        expect(parseInseeCode)
            .withArgs('00000')
            .to.throwException('Invalid INSEE code');
    });

    it('should parse with success for basic INSEE code', () => {
        expect(parseInseeCode('25349')).to.eql({
            code_dep: '25',
            code_com: '349'
        });
    });

    it('should parse with success for DOM/TOM INSEE code', () => {
        expect(parseInseeCode('97123')).to.eql({
            code_dep: '971',
            code_com: '23'
        });
    });

    it('should parse with success for Corse INSEE code', () => {
        expect(parseInseeCode('2A001')).to.eql({
            code_dep: '2A',
            code_com: '001'
        });
    });
});

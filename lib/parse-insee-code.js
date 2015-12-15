module.exports = function parseInseeCode(inseeCode) {
    const parts = inseeCode.match(/^(?:(?:([1345678][0-9]|0[1-9]|9[1-5]|2[AB1-9])([0-9]{3}))|(?:(97[1-5])([0-9]{2})))$/);

    if (! parts)
        throw new SyntaxError('Invalid INSEE code');

    return {
        code_dep: parts[1] || parts[3],
        code_com: parts[2] || parts[4],
    };
};

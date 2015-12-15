'use strict';
const collectionIncludes = require('lodash/collection/includes');

module.exports = function parseInseeCode(inseeCode) {
    if (inseeCode.length !== 5) throw new Error('INSEE code must have 5 characters');

    inseeCode = inseeCode.toUpperCase();
    let prefix = inseeCode.substr(0, 2);
    let suffix = inseeCode.substr(2, 3);

    // Vérifie que le suffixe (3 derniers caractères) ne contient bien que des chiffres
    if (! suffix.match(/[0-9]{3}/)) throw new Error('Invalid INSEE code');

    // Corse
    if (prefix === '2A' || prefix === '2B') {
        return { code_dep: prefix, code_com: suffix };
    }

    // Vérifie que le préfixe (2 premiers caractères) ne contient bien que des chiffres (Corse exclus)
    if (! prefix.match(/[0-9]{2}/)) throw new Error('Invalid INSEE code');

    // DOM
    if (prefix === '97') {
        prefix = inseeCode.substr(0, 3);
        suffix = inseeCode.substr(3, 2);
        if (! collectionIncludes(['971', '972', '973', '974', '975'], prefix)) throw new Error('Invalid DOM INSEE code');
        return { code_dep: prefix, code_com: suffix };
    }

    if (collectionIncludes(['96', '98', '99', '00', '20'], prefix)) throw new Error('Invalid INSEE code');

    return { code_dep: prefix, code_com: suffix };

};

## ⚠️ Ce service est abandonné ⚠️

L'IGN a repris les développements à son compte. Plus d'information sur [leur site dédié](https://apicarto.ign.fr).

# APICarto

## Prérequis

Pour faire fonctionner APICarto, vous avez besoin de :
* [Node.js](https://nodejs.org) v6+ (utilisation de [nvm](https://github.com/creationix/nvm) recommandée)

## Installation

### Installation du package
```
npm install
```

### Clé Géoportail IGN

Pour accéder aux référentiels publiés sur le Géoportail de l'IGN, vous devez définir la clé d'accès et le compte associé.

```bash
npm config set apicarto:geoportailKey ****ma clé****
npm config set apicarto:geoportailReferer ****mon referer****
```

### Lancer le service
```
npm start
```

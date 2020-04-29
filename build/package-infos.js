const pkg = require('../package.json');

const vNameParts = pkg.name.split("/");

const owner = vNameParts[0].replace("@", "");
const name = vNameParts[vNameParts.length - 1];
const version = pkg.version;

module.exports = {
	owner,
	name,
	version
}
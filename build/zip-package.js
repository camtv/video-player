const zip = require('bestzip');
const { name, version } = require("./package-infos");

module.exports = function createPackage() {
	return zip({
		source: '../dist/*',
		destination: `../${name}-${version}.zip`
	})
		.catch((err) => {
			console.error(err.stack);
			process.exit(1);
		});
}
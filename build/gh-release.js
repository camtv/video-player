
const ghrelease = require('gh-release');
const { owner, name, version } = require('./package-infos');
const currentChangelog = require('./current-changelog.js');
const createPackage = require("./zip-package");
const prompt = require('prompt');

function askCredentials(cb) {
	const properties = [
		{ name: 'username' },
		{ name: 'password', hidden: true }
	];

	prompt.start().get(properties, function (err, result) {
		const { username, password } = result;
		cb(username, password);
	})
};

function publishToGithub() {
	const options = {
		owner: owner, // Repository owner
		repo: name, // Repository name
		body: currentChangelog(),
		assets: [`./dist/${name}-${version}.zip`],
		endpoint: 'https://api.github.com',
		// auth: {
		// 	username: username, //process.env.GITHUB_USER,
		// 	password: password, //process.env.GITHUB_TOKEN
		// }
	};

	ghrelease(options, function (err, result) {
		if (err) {
			console.error('Unable to publish release to github');
			console.error('err:', err);
			console.error('result:', result);
			process.exit(1);
		} else {
			console.log('Publish release to github!');
		}
	});
}

createPackage()
	.then(() => {
		// askCredentials(() => {
		publishToGithub();
		// })
	});
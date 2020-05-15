const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYmF5YW5hQGNvcHlsZWFrcy5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjRhNGFjMmIwLWQ1ZWQtNDYzNS1iMTM2LTk0NTI4MDQyN2UyOCIsInJlZnJlc2gtc2VjcmV0IjoiWVBBRUU5T3d0YmhjWk9SQUREL01aMmorZnkzTVpnR2JjcjRiUktidURRVT0iLCJleHAiOjE1ODY4Njk5NTUsImlzcyI6ImlkLmNvcHlsZWFrcy5jb20iLCJhdWQiOiJhcGktdjMuY29weWxlYWtzLmNvbSJ9.Q5Z7XXhx0y9wpcRWnp5n6r_ga7tb7MKqxeaYXQ_qgBU-EWPFcuCq3RRVwUdtSb0YhyQWy-GfI6zT_peJNnv-JXqT5FpbXTzfs7KfVcsXplI3qsmpKGtuowqXMnUq3iTydYbViSc1KouJ3gLYBaXv0M1u50d_Nikigwbkd6qGYuS9pVUIbDOHyY2vuysr_WVeWXhaCDFwfbZAH0NQo5mouCCXvuw8AXvYcmqvOsVl-Rg3cPG-C2q0jpUkrf9ebL1rlFDtuBlFlKVNXcjXm23zgxkdt7iEAtaVoWE5FdeffRAwXiAo-q786Ss67TwctuFkYzDZ-PL92W7ODukOZU_wgg";

function ensureDirectoryExistence(filePath) {
	var dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

async function downloadFile(url, path, token) {
	const res = await fetch(url, {
		headers: {
			Authorization: `bearer ${token}`
		}
	});
	ensureDirectoryExistence(path);
	const fileStream = fs.createWriteStream(path);
	await new Promise((resolve, reject) => {
		res.body.pipe(fileStream);
		res.body.on("error", err => {
			reject(err);
		});
		fileStream.on("finish", function () {
			resolve();
		});
	});
}

async function downloadResults(metaPath) {
	const meta = JSON.parse(fs.readFileSync(metaPath));
	const {
		scannedDocument: { scanId },
		results: { internet, database, batch }
	} = meta;
	const source = downloadFile(
		`https://api.copyleaks.com/v3/downloads/${scanId}`,
		`scans/${scanId}/source.json`,
		bearerToken
	);
	const failed = [];
	[...internet, ...database].forEach(async ({ id }) => {
		try {
			await downloadFile(
				`https://api.copyleaks.com/v3/downloads/${scanId}/results/${id}`,
				`scans/${scanId}/results/${id}.json`,
				bearerToken
			);
		} catch (err) {
			failed.push(id);
		}
	});
	console.log(failed);
}
const args = process.argv.slice(2);
if (args.length !== 1) {
	console.error("Error: Download should take exactly one argument which is a scan-id");
	process.exit(1);
}
const completePath = `scans/${args[0]}/complete.json`;
if (!fs.existsSync(completePath)) {
	throw new Error(`file: ${completePath} is missing`);
}
downloadResults(completePath);

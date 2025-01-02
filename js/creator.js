import * as nono from './util/nono-utils.js';
// https://www.steamgifts.com/giveaway/OIKOh/figment-2-creed-valley
const regex = /(?:https?:\/\/)?www\.steamgifts\.com\/giveaway\/([a-zA-Z0-9]{5})\//;
        
document.addEventListener("DOMContentLoaded", () => {
    const creationForm = document.getElementById("creationForm");
    const createButton = creationForm.querySelector("button[type='button']");

    createButton.addEventListener("click", createNonogram);
});

function createNonogram() {
	const secretText = document.getElementById("secretText").value;
	let isSG = document.getElementById("sg").checked;
	const numRows = parseInt(document.getElementById("numRows").value, 10);
	const numCols = parseInt(document.getElementById("numCols").value, 10);

	// Validate numRows and numCols
	if (numRows < 4 || numRows > 25) {
		numRows = 10;
	}
	if (numCols < 4 || numCols > 25) {
		numCols = 10;
	}

	let msg = secretText;
	if(isSG) {
		const match = secretText.match(regex);
		if(match) {
			msg = match[1];
		}
		console.log(msg);
		if(msg.length != 5)
			isSG = 0;
	}

	let id = nono.generateNonogram(numRows, numCols, msg, isSG ? 1 : 0);
	console.log(id);

	const linkCmp = document.getElementById("link");
	linkCmp.innerHTML = '';
	linkCmp.appendChild(getAnchor(nono.getPageURL(id)));
	document.getElementById("linkDiv").style.display = "block";
}

function getAnchor(link, text = null) {
	const anchor = document.createElement('a');
	anchor.setAttribute('href', link);
	anchor.textContent = text || link;
	return anchor;
}

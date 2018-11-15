// created by Eylon Yogev.
// modified by Vu Quoc Huy.


browser.browserAction.onClicked.addListener(function (tab) {
	try {
		HandleTab(tab);
	}
	catch (err) {
		console.log(err);
	}
});

var handlers = {};
init();


function init() {
	handlers['eprint.iacr.org'] = ePrintScraper;
	handlers['arxiv.org'] = arxivScraper;
	handlers["eccc.weizmann.ac.il"] = ecccScraper;
	handlers['epubs.siam.org'] = siamScraper;
	handlers['research.microsoft.com'] = msrScraper;
	handlers['citeseerx.ist.psu.edu'] = citeseerxScraper;
	handlers['ac.els-cdn.com'] = sciencedirectScraper;
	handlers['www.sciencedirect.com'] = sciencedirectScraper;
	handlers['download.springer.com'] = springerScraper;
	handlers['link.springer.com'] = springerScraper;
	handlers['delivery.acm.org'] = acmScraper;
	handlers['proceedings.mlr.press'] = mlrScraper;
	handlers['journals.aps.org'] = apsScraper;
}


function HandleTab(tab) {
	var url = tab.url;
	chrome.bookmarks.search(url, function (results) {
		if (results.length == 0) {
			try {
				var host = getHost(url);
				if (handlers[host] != null) {
					handlers[host](tab, url);
				}
			}
			catch (err) {
				console.log(err);
			}
		}
	});
}

function getHost(url) {
	var parser = document.createElement('a');
	parser.href = url;
	return parser.host;
}

function AddBookmarks(url, title, authors, year) {
	var ref = '[' + getInitials(authors) + year.substr(2, 2) + ']';
	var fullTitle = ref + ' - ' + title + " - " + authors.join(' and ');

	getYearFolderId(year, function (id) {
		AddBookmark(url, fullTitle, id);
	});
}


function getYearFolderId(year, callback) {
	getRepositoryFolderId(function (id) {
		chrome.bookmarks.getChildren(id, function (children) {
			var found = false;
			children.forEach(element => {
				if (element.title == year) {
					callback(element.id);
					found = true;
					return;
				}
			});
			if (!found) {
				chrome.bookmarks.create({
					'parentId': id,
					'title': year
				}, function (newfolder) {
					callback(newfolder.id);
				});
			}
		});
	});
}

function getRepositoryFolderId(callback) {
	chrome.bookmarks.search('Repository', function (results) {
		var found = false;
		for (var i = 0; i < results.length; i++) {
			if (results[i].title == 'Repository') {
				found = true;
				var id = results[i].id;
				callback(id);
				return;
			}
		}
		if (!found) {
			var createBookmark = browser.bookmarks.create({
				'parentId': 'toolbar_____',
				'title': 'Repository',
				'type': 'folder'
			});
			createBookmark.then(function (newfolder) {
				callback(newfolder.id);
			});
		}
	});
}

function AddBookmark(url, title, folderId) {
	chrome.bookmarks.getChildren(folderId, function (children) {
		var found = false;
		children.forEach(function (bookmark) {
			if (bookmark.url == url)
				found = true;
		});
		if (!found) {
			chrome.bookmarks.create({
				'parentId': folderId,
				'title': title,
				'url': url,
				'index': 0
			});
		}
	});
}

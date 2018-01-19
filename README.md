# glowing-spoon

This script is an answer to Bankin's Engineering Challenge (https://blog.bankin.com/challenge-engineering-web-scrapping-dc5839543117).

It **only** uses [CasperJS](https://github.com/casperjs/casperjs) + [PhantomJS](https://github.com/ariya/phantomjs/) :ghost:.
(Tested with casperjs-1.1.0 + phantomjs-2.1.1)

To run the script (assuming you already have casperjs+phantomjs installed) :

`casperjs mmbcews.js [--url=https://web.bankin.com/challenge/index.html] [--outputFile=result.json] [--start=0] [--follow] [--groupByAccount]`

You can use the following optionnal arguments :

- **url** : URL to scrape (default https://web.bankin.com/challenge/index.html, target URL should have the same behaviour/layout of course)
- **outputFile** : If you want the JSON in a file (default outputs to the console)
- **start** : If you want to begin the process at a specific transaction (default 0)
- **follow** : If you **REALLY** want to use the fake "Next" link... (default not following)
- **groupByAccount** : If you want a nice JSON with transactions grouped by Account type  (default not grouped)


The script will scrape the url argument and print (or save) a json with the following format :
```
[{
		"Account": "Checking",
		"Amount": 73,
		"Currency": "€",
		"Id": 1
	},
	{
		"Account": "Checking",
		"Amount": 54,
		"Currency": "€",
		"Id": 2
	}
]
```

or the following format if you use the **--groupByAccount** argument :
```
{
	"Accounts": [{
		"Type": "Checking",
		"Transactions": [{
			"Amount": 73,
			"Currency": "€",
			"Id": 1
		}, {
			"Amount": 54,
			"Currency": "€",
			"Id": 2
		}]
	}, {
		"Type": "Savings",
		"Transactions": [{
			"Amount": 122,
			"Currency": "€",
			"Id": 450
		}, {
			"Amount": 37,
			"Currency": "€",
			"Id": 451
		}]
	}]
}
```


## Note

We are asked to retrieve ***EVERY available*** transaction. 

- Does this mean we have to follow the fake "Next" button even if it's skipping some (every :satisfied:) transactions ? 
- Does this mean we have to retrieve transactions with a negative ID which are not directly available and infinite because of the generation script ? Example below (and you can put **any** negative value in the url...)

![Example of negative transactions](https://i.imgur.com/yx5648A.png)

Since I'm a helpful guy, my script has arguments that will let you choose what you want... If you want negative transactions, just pass a negative value to the *start* argument... If you want to follow the fake "Next" link instead of using the transaction number, use the *follow* argument !


## Note #2

Parallelism...

You may ask why I didn't implement any parallelism/thread mechanic on the script when half the notation is based on speed ?

The answer is simple : Quality > Speed

More to come later about this... (too many clones :eyes:)

---

I Hope you will like my work and get this iPhone X :iphone:

### Author 
**Mehdi M** (https://twitter.com/MehdiMasrour)

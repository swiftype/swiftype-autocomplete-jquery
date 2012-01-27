Swiftype jQuery Autocomplete Plugin
=========

The official [Swiftype](http://www.swiftype.com) jQuery plugin for adding autocomplete functionality to a search input field, backed by data from the Swiftype Search API. Learn more about Swiftype by visiting [swiftype.com](http://www.swiftype.com) and creating an account.

Prerequisites
------------
1. A Swiftype account. Sign up at [swiftype.com](http://www.swiftype.com).
2. A Swiftype search engine with some data in it.


Installation
------------

Include the following in the header of your webpage:

* the latest version of jQuery
* the Swiftype jQuery plugin
* (optional) the Swiftype autocomplete styles if you want it to look nice

All together it should look something like this:

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.swiftype.autocomplete.js"></script>
	<link type="text/css" rel="stylesheet" href="autocomplete.css" media="all" />


Basic Usage
-----

Simply apply the swiftype method to an existing search input field on your webpage. For example, add it to a search input field with id `st-search-input` as follows:

	$('#st-search-input').swiftype({ 
	  searchEngineName: 'bookstore'
	});

Be sure to change the `engineKey` attribute shown above to match the one assigned to your Swiftype search engine.


Customization
-------------

This plugin is written to be flexible based on your specific use-case. 
For example you might want to retrieve more data for each element in the dropdown, customize
the way data is display to the user, or restrict the autocomplete query to certain elements of your search engine. 
Let's go through an example that does all 3.

#### Fetching additional data

To specify the additional fields you would like returned from the API, set the `fetchFields` attribute in the options dictionary to a comma-delimited list of the fields you want. For example, if you have indexed a `subtitle` and `url` for each document in your index, you can ask to have them returned as follows:

	$('#st-search-input').swiftype({ 
		fetchFields: 'title,author,price',
		searchEngineName: 'bookstore'
	});

Now the JSON response from the Swiftype API will include those fields for each element returned:

	[{ "author": "sefan buttcher", "title": "information retrieval", "price" : "39.99" }]

#### Customizing the display

Now that you have more data for each autocomplete item, you'll want to customize the item rendering function to make use of it.

The default rendering function is shown below:

	var defaultRenderFunction = function(item, config) {
		return '<p class="title">' + item['title'] + '</p>';
	};

The additional fields are available as keys in the item dictionary. You could customize this to make use of the `url` field as follows:

	var customRenderFunction = function(item, config) {
		var out = '<p class="title">' + item['title'] + '</p>';
		out = out.concat('<p class="author">' + item['author'] + '</p>')
		return out.concat('<p class="price">$' + item['price'] + '</p>');
	};

Now set the `renderFunction` attribute in the options dictionary to your `customRenderFunction`:

	$('#st-search-input').swiftype({ 
		renderFunction: customRenderFunction,
		fetchFields: 'title,author,price',
		searchEngineName: 'bookstore'
	});

#### Specifying additional query parameters
The Swiftype query API is very powerful, so you may want to add a few search parameters to the query in addition to the prefix the user has typed.

Specify additional parameters by setting `extraSearchParams`:

	$('#st-search-input').swiftype({ 
		renderFunction: customRenderFunction,
		fetchFields: 'title,author,price',
		searchEngineName: 'bookstore'
		extraSearchParams: 'in_stock:true and on_sale:false'
	});

Questions?
----------
Get in touch! We would be happy to help you get up and running. 

[Quin](mailto:quin@swiftype.com) and [Matt](mailto:matt@swiftype.com) from [Swiftype](http://www.swiftype.com)
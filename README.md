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
* (optional) the Swiftype Autocomplete stylesheet

All together it should look like this:

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.swiftype.autocomplete.js"></script>
	<link type="text/css" rel="stylesheet" href="autocomplete.css" media="all" />


Basic Usage
-----

Simply apply the swiftype method to an existing search input field on your webpage. For example, add it to a search input field with id `st-search-input` as follows:

	$('#st-search-input').swiftype({ 
	  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
	});

Be sure to change the `engineKey` attribute shown above to match the one assigned to your Swiftype search engine. If you are using the web interface, the search engine key is listed on the first page of your dashboard.

This simple installation will by default match the string a user is typing into your search input to any of the items indexed in your search engine. By default, the string is matched against any fields you have indexed with type `string`.


Customization Tutorial
-------------

This plugin is written to be flexible based on your specific use-case. 
For example you might want to retrieve more data for each element in the dropdown, customize
the way data is display to the user, or restrict the autocomplete query to certain elements of your search engine. 

Let's go through an example that does all of this. For this example, let's assume you followed the QuickStart tutorial for our [Ruby Gem](https://github.com/swiftype/swiftype-rb), and now you have data for a Bookstore indexed in your example search engine.

#### Changing the number of results

To specify the number of results you would like returned from the API, set the `resultLimit` attribute as follows:

	$('#st-search-input').swiftype({ 
		engineKey: 'jaDGyzkR6iYHkfNsPpNK',
		resultLimit: 20
	});


#### Fetching only the fields you specify

To specify the fields you would like returned from the API, set the `fetchFields` attribute to a hash containing an array listing the fields you want returned for each document type. For example, if you have indexed `title`, `genre`, and `published_on` fields for each document, you can have them returned as follows:

	$('#st-search-input').swiftype({ 
		fetchFields: {'books': ['title','genre','published_on']},
		engineKey: 'jaDGyzkR6iYHkfNsPpNK'
	});

These additional fields will be returned with each item in the autocomplete, and they can be accessed in the rendering function as shown in the next section.

#### Customizing the display

Now that you have more data for each autocomplete item, you'll want to customize the item rendering function to make use of them.

The default rendering function is shown below:

	var defaultRenderFunction = function(document_type, item) {
		return '<p class="title">' + item['title'] + '</p>';
	};

The additional fields are available as keys in the item dictionary, so you could customize this to make use of the `genre` field as follows:

	var customRenderFunction = function(document_type, item) {
		var out = '<p class="title">' + item['title'] + '</p>';
		return out.concat('<p class="genre">' + item['genre'] + '</p>');
	};

Now simply set the `renderFunction` attribute in the options dictionary to your `customRenderFunction` to tell our plugin to use your function to render results:

	$('#st-search-input').swiftype({ 
		renderFunction: customRenderFunction,
		fetchFields: {'books': ['title','genre','published_on']},
		engineKey: 'jaDGyzkR6iYHkfNsPpNK'
	});


#### Restricting matching to particular fields

By default, the Swiftype autocomplete library will match the string the user is typing to any `string` field indexed for your documents. So if you would like to ensure that it only matches entries in the `title` field, for example, you can specify the `searchFields` option:

	$('#st-search-input').swiftype({ 
		renderFunction: customRenderFunction,
		fetchFields: {'books': ['title','genre','published_on']},
		searchFields: {'books': ['title']},
		engineKey: 'jaDGyzkR6iYHkfNsPpNK'
	});

Similarly to the `fetchFields` option, `searchFields` accepts a hash containing an array of fields for each document_type on which you would like the user's query to match. 

#### Specifying additional query conditions

Now let's say you only want your autocomplete to display books that are of the **fiction** `genre` and are **in_stock**. In order to restrict search results, you can pass additional query conditions to the search API by specifying them as a dictionary in the `filters` field. Multiple clauses in the filters field are combined with AND logic:


	$('#st-search-input').swiftype({ 
		renderFunction: customRenderFunction,
		fetchFields: {'books': ['title','genre','published_on']},
		filters: {'books': {'genre': 'fiction', 'in_stock': true}},
		searchFields: {'books': ['title']},
		engineKey: 'jaDGyzkR6iYHkfNsPpNK'
	});



Questions?
----------
Get in touch! We would be happy to help you get up and running. 
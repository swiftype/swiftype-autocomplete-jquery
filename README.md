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
* the Swiftype autocomplete styles if you want it to look nice (optional)

All together it should look something like this:

	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.swiftype.autocomplete.js"></script>
	<link type="text/css" rel="stylesheet" href="autocomplete.css" media="all" />


Basic
-----

Simply apply the swiftype method to an existing search input field on your webpage. For example, add it a search input field with id `st-search-input` as follows:

	$('#st-search-input').swiftype({ 
	  endpoint: 'http://api.swiftype.com/search/suggest.json',
	  engineKey: 'LGsQSwkiHXhWHqo6UHCB'
	});

Be sure to change the `engineKey` attribute shown above to match the one assigned to your Swiftype search engine.

All together it should look something like this:

	<input type="text" id="st-search-input" class="st-search-input" />
    <script type="text/javascript">
    $(function() {
      $('#st-search-input').swiftype({ 
        endpoint: 'http://api.swiftype.com/search/suggest.json',
        engineKey: 'LGsQSwkiHXhWHqo6UHCB' 
      });
    });
    </script>


Customization
-------------

This plugin is written to be flexible based on your specific use-case. 
For example you might want to retrieve more data for each autocomplete result and customize
the way it is displayed to the user. 

#### Fetching additional data

To specify the additional fields you would like returned from the API, set the `fetchFields` attribute in the options dictionary to a comma-delimited list of the fields you want. For example, to return `subtitle` and `url`:

	$('#st-search-input').swiftype({ 
		endpoint: 'http://api.swiftype.com/search/suggest.json',
		engineKey: 'LGsQSwkiHXhWHqo6UHCB',
		fetchFields: 'subtitle,url'
	});

Now the JSON response from the Swiftype API will include those fields for each element returned:

	{ example json response }

#### Customizing the display

Now that you have more data for each autocomplete item, you'll want to customize the item rendering function to make use of it.

To do this, you'll want to write a custom rendering function. The default rendering function is shown below:

	var defaultRenderFunction = function(item, config) {
		return '<p class="title">' + item['title'] + '</p>';
	};

You could customize this to make use of the `url` field as follows:

	var customRenderFunction = function(item, config) {
		var out = '<p class="title">' + item['title'] + '</p>';
		return out.concat('<p class="url">' + item['url'] + '</p>');
	};

Now set the `renderFunction` attribute in the options dictionary to your `customRenderFunction`:

	$('#st-search-input').swiftype({ 
		renderFunction: customRenderFunction,
		fetchFields: 'subtitle,url',
		endpoint: 'http://api.swiftype.com/search/suggest.json',
		engineKey: "LGsQSwkiHXhWHqo6UHCB" 
	});

Matt Riley and Quin Hoxie of [Swiftype](http://www.swiftype.com)
<p align="center"><img src="https://github.com/swiftype/swiftype-autocomplete-jquery/blob/master/logo-site-search.png?raw=true" alt="Elastic Site Search Logo"></p>

> A first-party [Elastic Site Search](https://swiftype.com/documentation/site-search/overview) jQuery plugin for search autocomplete.

## Contents

+ [Getting started](#getting-started-)
+ [Usage](#usage)
+ [Customization Tutorial](#customization-tutorial)
+ [FAQ](#faq-)
+ [Contribute](#contribute-)
+ [License](#license-)

***

## Getting started 🐣

Requirements:

1. Site Search account. Sign up at [swiftype.com](https://app.swiftype.com/signup).
2. Site Search engine with some data in it.

Include the following in the header of your webpage:

* the latest version of jQuery
* the Swiftype jQuery plugin
* (optional) the Swiftype Autocomplete stylesheet

All together it should look like this:

```html
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script type="text/javascript" src="jquery.swiftype.autocomplete.js"></script>
<link type="text/css" rel="stylesheet" href="autocomplete.css" media="all" />
```

> **Note:** This client has been developed for the [Elastic Site Search](https://www.swiftype.com/site-search) API endpoints only. You may refer to the [Elastic Site Search API Documentation](https://swiftype.com/documentation/site-search/overview) for additional context.

## Usage

Simply apply the swiftype method to an existing search input field on your webpage. For example, add it to a search input field with id `st-search-input` as follows:

```javascript
$('#st-search-input').swiftype({
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

Be sure to change the `engineKey` attribute shown above to match the one assigned to your Swiftype search engine. If you are using the web interface, the search engine key is listed on the first page of your dashboard.

This simple installation will by default match the string a user is typing into your search input to any of the items indexed in your search engine. By default, the string is matched against any fields you have indexed with type `string`.

## Customization tutorial

This plugin is written to be flexible based on your specific use-case.
For example you might want to retrieve more data for each element in the dropdown, customize
the way data is display to the user, or restrict the autocomplete query to certain elements of your search engine.

Let's go through an example that does all of this. For this example, let's assume you followed the QuickStart tutorial for our [Ruby Gem](https://github.com/swiftype/swiftype-rb), and now you have data for a Bookstore indexed in your example search engine.

### Changing the number of results

To specify the number of results you would like returned from the API, set the `resultLimit` attribute as follows:

```javascript
$('#st-search-input').swiftype({
  engineKey: 'jaDGyzkR6iYHkfNsPpNK',
  resultLimit: 20
});
```

### Fetching only the fields you specify

To specify the fields you would like returned from the API, set the `fetchFields` attribute to a hash containing an array listing the fields you want returned for each document type. For example, if you have indexed `title`, `genre`, and `published_on` fields for each document, you can have them returned as follows:

```javascript
$('#st-search-input').swiftype({
  fetchFields: { 'books': ['title', 'genre', 'published_on'] },
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

These additional fields will be returned with each item in the autocomplete, and they can be accessed in the rendering function as shown in the next section.

### Customizing the display

Now that you have more data for each autocomplete item, you'll want to customize the item rendering function to make use of them.

The default rendering function is shown below:

```javascript
var defaultRenderFunction = function(document_type, item) {
  return '<p class="title">' + Swiftype.htmlEscape(item['title']) + '</p>';
};
```

The additional fields are available as keys in the item dictionary, so you could customize this to make use of the `genre` field as follows:

```javascript
var customRenderFunction = function(document_type, item) {
  var out = '<a href="' + Swiftype.htmlEscape(item['url']) + '" class="st-search-result-link">' + item.highlight['title'] + '</a>';
  return out.concat('<p class="genre">' + item.highlight['genre'] + '</p>');
};
```

Now simply set the `renderFunction` attribute in the options dictionary to your `customRenderFunction` to tell our plugin to use your function to render results:

```javascript
$('#st-search-input').swiftype({
  renderFunction: customRenderFunction,
  fetchFields: { 'books': ['url'] }, // Fetch the URL field as a raw field.
  highlightFields: { 'books': { 'title': { 'size': 60, 'fallback': true }, 'genre': { 'size': 60, 'fallback': true }, 'published_on': { 'size': 15, 'fallback':true } } },
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

#### Restricting matching to particular fields

By default, the Swiftype autocomplete library will match the string the user is typing to any `string` field indexed for your documents. So if you would like to ensure that it only matches entries in the `title` field, for example, you can specify the `searchFields` option:

```javascript
$('#st-search-input').swiftype({
  renderFunction: customRenderFunction,
  fetchFields: { 'books': ['title', 'genre', 'published_on'] },
  searchFields: { 'books': ['title'] },
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

Similarly to the `fetchFields` option, `searchFields` accepts a hash containing an array of fields for each document_type on which you would like the user's query to match.

### Specifying additional query conditions

Now let's say you only want your autocomplete to display books that are of the **fiction** `genre` and are **in_stock**. In order to restrict search results, you can pass additional query conditions to the search API by specifying them as a dictionary in the `filters` field. Multiple clauses in the filters field are combined with AND logic:

```javascript
$('#st-search-input').swiftype({
  renderFunction: customRenderFunction,
  fetchFields: { 'books': ['title', 'genre', 'published_on'] },
  filters: { 'books': { 'genre': 'fiction', 'in_stock': true } },
  searchFields: { 'books': ['title'] },
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

### Changing what happens when an item is selected in the dropdown

In order to change what happens when clicking on an item, you need to provide an `onComplete` handler function.

By default, clicking on an item in the dropdown will execute the following `onComplete` handler, which routes a user to the `url` property of the selected item:

```javascript
var defaultOnComplete = function(item, prefix) {
  window.location = item['url'];
};
```

To change this, simply provide a new handler function in the `onComplete` option when initializing your autocomplete.

Here is an example that updates the input value with the selected item's title:

```javascript
var input; // Save a reference to the autocomplete dropdown
input = $('#st-search-input').swiftype({
  onComplete: function(selectedItem) {
    input.val(selectedItem['title']); // Update the autocomplete dropdown's value
  },
  fetchFields: { 'books': ['title'] },
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

## FAQ 🔮

### Can I use this with the Swiftype Search Plugin?

Yes! If you are looking for core search functionality, checkout out the [Swiftype Search Plugin](https://github.com/swiftype/swiftype-search-jquery).

### Where do I report issues with the client?

If something is not working as expected, please open an [issue](https://github.com/swiftype/swiftype-autocomplete-jquery/issues/new).

### Where can I learn more about Site Search?

Your best bet is to read the [documentation](https://swiftype.com/documentation/site-search).

### Where else can I go to get help?

You can checkout the [Elastic Site Search community discuss forums](https://discuss.elastic.co/c/site-search).

## Contribute 🚀

We welcome contributors to the project. Before you begin, a couple notes...

+ Before opening a pull request, please create an issue to [discuss the scope of your proposal](https://github.com/swiftype/swiftype-autocomplete-jquery/issues).
+ Please write simple code and concise documentation, when appropriate.

## License 📗

[MIT](https://github.com/swiftype/swiftype-autocomplete-jquery/blob/master/LICENSE) © [Elastic](https://github.com/elastic)

Thank you to all the [contributors](https://github.com/swiftype/swiftype-autocomplete-jquery/graphs/contributors)!

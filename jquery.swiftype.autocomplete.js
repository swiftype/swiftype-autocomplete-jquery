(function ($) {
  var ident = 0;

  window.Swiftype = window.Swiftype || {};
  Swiftype.root_url = 'http://api.swiftype.com';
  Swiftype.pingUrl = function(endpoint, callback) {
    var img  = new Image();
    img.onload = img.onerror = callback;
    img.src = endpoint;
    setTimeout(callback, 350);
    return false;
  };
  Swiftype.pingAutoSelection = function(engineKey, entryId, value, callback) {
    var params = {
      t: new Date().getTime(),
      engine_key: engineKey,
      entry_id: entryId,
      prefix: value
    };
    var url = Swiftype.root_url + '/api/v1/public/analytics/pas?' + $.param(params);
    Swiftype.pingUrl(url, callback);
  };

  $.fn.swiftype = function (options) {
    var options = $.extend({}, $.fn.swiftype.defaults, options);

    return this.each(function () {
      var $this = $(this);
      var config = $.meta ? $.extend({}, options, $this.data()) : options;
      $this.attr('autocomplete', 'off');
      $this.data('swiftype-config', config);
      $this.submitted = false;
      $this.cache = new LRUCache(10);
      $this.emptyQueries = [];

      $this.isEmpty = function(query) {
	   return $.inArray(normalize(query), this.emptyQueries) >= 0
      };

      $this.addEmpty = function(query) {
        $this.emptyQueries.unshift(normalize(query));
      };

      var $attachEl = config.attachTo ? $(config.attachTo) : $this;
      var offset = $attachEl.offset();
      var styles = {
        'position': 'absolute',
        'z-index': 999,
        'top': offset.top + $attachEl.outerHeight() + 1,
        'left': offset.left
      };
      if (config.setWidth) {
        styles['width'] = $attachEl.outerWidth() - 2;
      }

      var $list = $('<' + config.suggestionListType + ' />').addClass(config.suggestionListClass).appendTo('body').hide().css(styles);
      $this.data('swiftype-list', $list);

      $this.abortCurrent = function() {
        if ($this.currentRequest) {
          $this.currentRequest.abort();
        }
      };

      $this.hideList = function() {
        setTimeout(function() { $list.hide(); }, 10);
      };

      $this.focused = function() {
        return $this.is(':focus');
      };

      $this.submitting = function() {
        $this.submitted = true;
      };

      $this.listResults = function() {
        return $(config.resultListSelector, $list);
      };

      $this.activeResult = function() {
        return $this.listResults().filter('.' + config.activeItemClass).first();
      };

      $this.prevResult = function() {
        var list = $this.listResults(),
          currentIdx = list.index($this.activeResult()),
          nextIdx = currentIdx - 1,
          next = list.eq(nextIdx);
        $this.listResults().removeClass(config.activeItemClass);
        if (nextIdx >= 0) {
          next.addClass(config.activeItemClass);
        }
      };

      $this.nextResult = function() {
        var list = $this.listResults(),
          currentIdx = list.index($this.activeResult()),
          nextIdx = currentIdx + 1,
          next = list.eq(nextIdx);
        $this.listResults().removeClass(config.activeItemClass);
        if (nextIdx >= 0) {
          next.addClass(config.activeItemClass);
        }
      };

      $this.selectedCallback = function(data) {
        return function() {
          var value = $this.val(),
            callback = function() {
              config.onComplete(data, value);
            };
          Swiftype.pingAutoSelection(config.engineKey, data['id'], value, callback);
        };
      };

      $this.registerResult = function($element, data) {
        $element.data('swiftype-item', data);
        $element.click($this.selectedCallback(data)).mouseover(function () {
          $this.listResults().removeClass(config.activeItemClass);
          $element.addClass(config.activeItemClass);
        });
      };

      $this.getContext = function() {
        return {
          config: config,
          list: $list,
          registerResult: $this.registerResult
        };
      };

      var typingDelayPointer;
      var suppressKey = false;
      $this.lastValue = '';
      $this.keyup(function (event) {
        if (suppressKey) {
          suppressKey = false;
          return;
        }

        // ignore arrow keys, shift
        if (((event.which > 36) && (event.which < 41)) || (event.which == 16)) return;

        if (config.typingDelay > 0) {
          clearTimeout(typingDelayPointer);
          typingDelayPointer = setTimeout(function () {
            processInput($this);
          }, config.typingDelay);
        } else {
          processInput($this);
        }
      });

      $this.keydown(function (event) {
        // enter = 13; up = 38; down = 40; esc = 27
        var $active = $this.activeResult();
        switch (event.which) {
        case 13:
          if (($active.length !== 0) && ($list.is(':visible'))) {
            event.preventDefault();
            $this.selectedCallback($active.data('swiftype-item'))();
          } else if ($this.currentRequest) {
            $this.submitting();
          }
          $this.hideList();
          suppressKey = true;
          break;
        case 38:
          event.preventDefault();
          if ($active.length === 0) {
            $this.listResults().last().addClass(config.activeItemClass);
          } else {
            $this.prevResult();
          }
          break;
        case 40:
          event.preventDefault();
          if ($active.length === 0) {
            $this.listResults().first().addClass(config.activeItemClass);
          } else if ($active != $this.listResults().last()) {
            $this.nextResult();
          }
          break;
        case 27:
          $this.hideList();
          suppressKey = true;
          break;
        default:
          $this.submitted = false;
          break;
        }
      });

      // opera wants keypress rather than keydown to prevent the form submit
      $this.keypress(function (event) {
        if ((event.which == 13) && ($this.activeResult().length > 0)) {
          event.preventDefault();
        }
      });

      // stupid hack to get around loss of focus on mousedown
      var mouseDown = false;
      var blurWait = false;
      $(document).bind('mousedown.swiftype' + ++ident, function () {
        mouseDown = true;
      });
      $(document).bind('mouseup.swiftype' + ident, function () {
        mouseDown = false;
        if (blurWait) {
          blurWait = false;
          $this.hideList();
        }
      });
      $this.blur(function () {
        if (mouseDown) {
          blurWait = true;
        } else {
          $this.hideList();
        }
      });
      $this.focus(function () {
        setTimeout(function() { $this.select() }, 10);
        if ($this.listResults().filter(':not(.' + config.noResultsClass + ')').length > 0) {
          $list.show();
        }
      });
    });
  };

  var normalize = function(str) {
    return $.trim(str).toLowerCase();
  };

  var callRemote = function ($this, term) {
    $this.abortCurrent();

    var params = {},
      config = $this.data('swiftype-config');

    params['q'] = term;
    params['engine_key'] = config.engineKey;

    if(config.searchFields !== undefined) {
      params['search_fields'] = config.searchFields;
    }
    if(config.fetchFields !== undefined) {
      params['fetch_fields'] = config.fetchFields;
    }
    if(config.filters !== undefined) {
      params['filters'] = config.filters;
    }
    if(config.documentTypes !== undefined) {
      params['document_types'] = config.documentTypes;
    }
    if(config.functionalBoosts !== undefined) {
      params['functional_boosts'] = config.functionalBoosts;
    }

    var endpoint = Swiftype.root_url + '/api/v1/public/engines/suggest.json';
    $this.currentRequest = $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: endpoint,
      data: params
    }).success(function(data) {
      var norm = normalize(term);
      if (data.record_count > 0) {
        $this.cache.put(norm, data.records);
      } else {
        $this.addEmpty(norm);
        $this.data('swiftype-list').empty().hide();
        return;
      }
      processData($this, data.records, term);
    });
  };

  var getResults = function($this, term) {
    var norm = normalize(term);
    if ($this.isEmpty(norm)) {
      $this.data('swiftype-list').empty().hide();
      return;
    }
    var cached = $this.cache.get(norm);
    if (cached) {
      processData($this, cached, term);
    } else {
      callRemote($this, term);
    }
  };

  // private helpers
  var processInput = function ($this) {
      var term = $this.val();
      if (term === $this.lastValue) {
        return;
      }
      $this.lastValue = term;
      if ($.trim(term) === '') {
        $this.data('swiftype-list').empty().hide();
        return;
      }
      if (typeof $this.data('swiftype-config').engineKey !== 'undefined') {
        getResults($this, term);
      }
    };

  var processData = function ($this, data, term) {
      var $list = $this.data('swiftype-list'),
        config = $this.data('swiftype-config');

      $list.empty().hide();
      config.resultRenderFunction($this.getContext(), data);

      var totalItems = $this.listResults().length;
      if ((totalItems > 0 && $this.focused()) || (config.noResultsMessage !== undefined)) {
        if ($this.submitted) {
          $this.submitted = false;
        } else {
          $list.show();
        }
      }
    };

  var defaultResultRenderFunction = function(ctx, results) {
    var $list = ctx.list,
      config = ctx.config;

    $.each(results, function(document_type, items) {
      $.each(items, function(idx, item) {
        ctx.registerResult($('<li>' + config.renderFunction(document_type, item) + '</li>').appendTo($list), item);
      });
    });
  };

  var defaultRenderFunction = function(document_type, item) {
    return '<p class="title">' + item['title'] + '</p>';
  };

  var defaultOnComplete = function(item, prefix) {
    window.location = item['url'];
  };

	// simple client-side LRU Cache, based on https://github.com/rsms/js-lru

	function LRUCache(limit) {
	  this.size = 0;
	  this.limit = limit;
	  this._keymap = {};
	}

  LRUCache.prototype.put = function (key, value) {
    var entry = {
      key: key,
      value: value
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    if (this.size === this.limit) {
      return this.shift();
    } else {
      this.size++;
    }
  };

  LRUCache.prototype.shift = function () {
    var entry = this.head;
    if (entry) {
      if (this.head.newer) {
        this.head = this.head.newer;
        this.head.older = undefined;
      } else {
        this.head = undefined;
      }
      entry.newer = entry.older = undefined;
      delete this._keymap[entry.key];
    }
    return entry;
  };

  LRUCache.prototype.get = function (key, returnEntry) {
    var entry = this._keymap[key];
    if (entry === undefined) return;
    if (entry === this.tail) {
      return entry.value;
    }
    if (entry.newer) {
      if (entry === this.head) this.head = entry.newer;
      entry.newer.older = entry.older;
    }
    if (entry.older) entry.older.newer = entry.newer;
    entry.newer = undefined;
    entry.older = this.tail;
    if (this.tail) this.tail.newer = entry;
    this.tail = entry;
    return returnEntry ? entry : entry.value;
  };

  LRUCache.prototype.remove = function (key) {
    var entry = this._keymap[key];
    if (!entry) return;
    delete this._keymap[entry.key];
    if (entry.newer && entry.older) {
      entry.older.newer = entry.newer;
      entry.newer.older = entry.older;
    } else if (entry.newer) {
      entry.newer.older = undefined;
      this.head = entry.newer;
    } else if (entry.older) {
      entry.older.newer = undefined;
      this.tail = entry.older;
    } else {
      this.head = this.tail = undefined;
    }

    this.size--;
    return entry.value;
  };

  LRUCache.prototype.clear = function () {
    this.head = this.tail = undefined;
    this.size = 0;
    this._keymap = {};
  };

  if (typeof Object.keys === 'function') {
    LRUCache.prototype.keys = function () {
      return Object.keys(this._keymap);
    };
  } else {
    LRUCache.prototype.keys = function () {
      var keys = [];
      for (var k in this._keymap) keys.push(k);
      return keys;
    };
  }

  $.fn.swiftype.defaults = {
    activeItemClass: 'active',
    attachTo: undefined,
    documentTypes: undefined,
    filters: undefined,
    engineKey: undefined,
    searchFields: undefined,
    functionalBoosts: undefined,
    fetchFields: undefined,
    noResultsClass: 'noResults',
    noResultsMessage: undefined,
    onComplete: defaultOnComplete,
    resultRenderFunction: defaultResultRenderFunction,
    renderFunction: defaultRenderFunction,
    resultLimit: 10,
    suggestionListType: 'ul',
    suggestionListClass: 'st-autocomplete',
    resultListSelector: 'li',
    setWidth: true,
    typingDelay: 80
  };

})(jQuery);

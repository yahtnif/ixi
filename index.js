/**
 * Fork: [x-ray-select](https://github.com/lapwinglabs/x-ray-select)
 */

const type = require('component-type');
const omitBy = require('lodash/omitBy');
const zip = require('lodash/zip');
const cheerio = require('cheerio');

const rdom = /^(tagName|nodeType)$/;
const rselector = /^([^@]*)(?:@\s*([\w-_:]+))?$/;
const rfilters = /\s*\|(?!\=)\s*/;

function parseArgs(str) {
  const args = [];
  const re = /"([^"]*)"|'([^']*)'|([^ \t,]+)/g;
  let m;

  while ((m = re.exec(str))) {
    args.push(m[2] || m[1] || m[0]);
  }

  return args;
}

function filterParser(str) {
  return str.split(/ *\| */).map(function(call) {
    const parts = call.split(':');
    const name = parts.shift();
    const args = parseArgs(parts.join(':'));

    return {
      name: name,
      args: args
    };
  });
}

/**
 * Initialize `parse`
 */
function parser(str) {
  const filters = str.split(rfilters);
  const z = filters.shift();
  const m = z.match(rselector) || [];

  return {
    selector: m[1] ? m[1].trim() : m[1],
    attribute: m[2],
    filters: filters.length ? filterParser(filters.join('|')) : []
  };
}

/**
 * Single 'selector'
 */
function stringFindOne($root, str, filters) {
  const select = parse(str, filters);

  const $el = select.selector ? $root.find(select.selector).eq(0) : $root.eq(0);

  return $el.length ? render($el, select) : undefined;
}

/**
 * Single Object { key: 'selector' }
 */
function objectFindOne($root, obj, filter) {
  $root = obj.$root ? $root.find(obj.$root) : $root;
  const x = this;
  const out = {};

  Object.keys(obj).forEach(function(k) {
    const v = obj[k];
    const str =
      'string' == typeof v
        ? stringFindOne.call(x, $root, v, filter)
        : x(v, $root);

    if (str !== undefined) out[k] = str;
  });

  return out;
}

/**
 * Select an array of strings ['selector']
 */
function stringFindMany($root, str, filter) {
  const select = parse(str, filter);
  const $els = select.selector ? $root.find(select.selector) : $root;
  const out = [];

  $els.each(function(i) {
    const $el = $els.eq(i);
    $el.length && out.push(render($el, select));
  });

  return out;
}

/**
 * Select an array of objects
 */
function objectFindMany($root, obj, filter) {
  return obj.$root
    ? objectFindManyWithRoot.call(this, $root, obj, filter)
    : objectFindManyWithoutRoot.call(this, $root, obj, filter);
}

/**
 * Select an array of objects [{ $root: '...', key: 'selector' }]
 */
function objectFindManyWithRoot($root, obj, filter) {
  const $els = $root.find(obj.$root);
  if (!$els.length) return [];
  const x = this;
  const out = [];

  // reject any special characters
  const o = omitBy(obj, function(v, k) {
    return k[0] === '$';
  });

  $els.each(function(i) {
    const $el = $els.eq(i);
    out.push(objectFindOne.call(x, $el, o, filter));
  });

  return out;
}

/**
 * Select an array of objects (w/o $root) [{ key: 'selector' }]
 */
function objectFindManyWithoutRoot($root, obj, filter) {
  const ks = Object.keys(obj);

  let arr = ks.map(function(k) {
    const v = obj[k];

    switch (type(v)) {
      case 'string':
        return stringFindMany.call(this, $root, v, filter);
      case 'object':
        return objectFindMany.call(this, $root, v, filter);
      default:
        return [];
    }
  });

  // TODO: is there a more optimized way to group these elements?
  arr = zip.apply(zip, arr);

  return arr.map(function(values) {
    const o = {};
    values.forEach(function(value, i) {
      if (value !== undefined) o[ks[i]] = value;
    });
    return o;
  });
}

function format(str, filter) {
  return filter.reduce(function(out, format) {
    return format.fn.apply(format.fn, [out].concat(format.args));
  }, str);
}

function parse(str, filters) {
  const obj = parser(str);
  obj.filters = obj.filters
    .filter(function(filter) {
      return filters[filter.name];
    })
    .map(function(filter) {
      filter.fn = filters[filter.name];
      return filter;
    });

  return obj;
}

function render($el, select) {
  switch (select.attribute) {
    case 'html':
      return fmt($el.html());
    case undefined:
      return fmt($el.text());
    default:
      return rdom.test(select.attribute)
        ? fmt($el[0][select.attribute])
        : fmt($el.attr(select.attribute));
  }

  function fmt(str) {
    return format(str && str.trim(), select.filters);
  }
}

const defaultFilters = {
  trim(value) {
    return typeof value === 'string' ? value.trim() : value;
  },
  reverse(value) {
    return typeof value === 'string'
      ? value
          .split('')
          .reverse()
          .join('')
      : value;
  },
  slice(value, start, end) {
    return typeof value === 'string' ? value.slice(start, end) : value;
  },
  lowercase(value) {
    return value.toLowerCase();
  },
  uppercase(value) {
    return value.toUpperCase();
  },
  date(value) {
    return new Date(value);
  }
};

function X(html = '', formatters) {
  let filters = { ...defaultFilters };
  if (formatters) {
    filters = {
      ...filters,
      ...formatters
    };
  }

  const $ = html.html ? html : cheerio.load(html);
  const $document = $.root();
  return x;

  function x(obj, $scope) {
    $scope = $scope || $document;

    if (typeof $scope === 'string') {
      $scope = $($scope);
    }

    // switch between the types of objects
    switch (type(obj)) {
      case 'string':
        return stringFindOne.call(x, $scope, obj, filters);
      case 'object':
        return objectFindOne.call(x, $scope, obj, filters);
      case 'array':
        switch (type(obj[0])) {
          case 'string':
            return stringFindMany.call(x, $scope, obj[0], filters);
          case 'object':
            return objectFindMany.call(x, $scope, obj[0], filters);
          default:
            return [];
        }
    }
  }
}

module.exports = X;
module.exports.default = X;

var rulematrix = (function (exports) {
    'use strict';

    // import { nBins } from '../config';
    function isSurrogate(model) {
        return model.target !== undefined;
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);
    var bisectRight = ascendingBisect.right;

    function sequence(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        start = Math.floor(start * step);
        stop = Math.ceil(stop * step);
        ticks = new Array(n = Math.ceil(start - stop + 1));
        while (++i < n) ticks[i] = (start - i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function max(values, valueof) {
      var n = values.length,
          i = -1,
          value,
          max;

      if (valueof == null) {
        while (++i < n) { // Find the first comparable value.
          if ((value = values[i]) != null && value >= value) {
            max = value;
            while (++i < n) { // Compare the remaining values.
              if ((value = values[i]) != null && value > max) {
                max = value;
              }
            }
          }
        }
      }

      else {
        while (++i < n) { // Find the first comparable value.
          if ((value = valueof(values[i], i, values)) != null && value >= value) {
            max = value;
            while (++i < n) { // Compare the remaining values.
              if ((value = valueof(values[i], i, values)) != null && value > max) {
                max = value;
              }
            }
          }
        }
      }

      return max;
    }

    function min(values, valueof) {
      var n = values.length,
          i = -1,
          value,
          min;

      if (valueof == null) {
        while (++i < n) { // Find the first comparable value.
          if ((value = values[i]) != null && value >= value) {
            min = value;
            while (++i < n) { // Compare the remaining values.
              if ((value = values[i]) != null && min > value) {
                min = value;
              }
            }
          }
        }
      }

      else {
        while (++i < n) { // Find the first comparable value.
          if ((value = valueof(values[i], i, values)) != null && value >= value) {
            min = value;
            while (++i < n) { // Compare the remaining values.
              if ((value = valueof(values[i], i, values)) != null && min > value) {
                min = value;
              }
            }
          }
        }
      }

      return min;
    }

    function transpose(matrix) {
      if (!(n = matrix.length)) return [];
      for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
        for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
          row[j] = matrix[j][i];
        }
      }
      return transpose;
    }

    function length(d) {
      return d.length;
    }

    var slice$1 = Array.prototype.slice;

    function identity$1(x) {
      return x;
    }

    var top = 1,
        right = 2,
        bottom = 3,
        left = 4,
        epsilon = 1e-6;

    function translateX(x) {
      return "translate(" + (x + 0.5) + ",0)";
    }

    function translateY(y) {
      return "translate(0," + (y + 0.5) + ")";
    }

    function number$1(scale) {
      return function(d) {
        return +scale(d);
      };
    }

    function center(scale) {
      var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
      if (scale.round()) offset = Math.round(offset);
      return function(d) {
        return +scale(d) + offset;
      };
    }

    function entering() {
      return !this.__axis;
    }

    function axis(orient, scale) {
      var tickArguments = [],
          tickValues = null,
          tickFormat = null,
          tickSizeInner = 6,
          tickSizeOuter = 6,
          tickPadding = 3,
          k = orient === top || orient === left ? -1 : 1,
          x = orient === left || orient === right ? "x" : "y",
          transform = orient === top || orient === bottom ? translateX : translateY;

      function axis(context) {
        var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
            format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$1) : tickFormat,
            spacing = Math.max(tickSizeInner, 0) + tickPadding,
            range = scale.range(),
            range0 = +range[0] + 0.5,
            range1 = +range[range.length - 1] + 0.5,
            position = (scale.bandwidth ? center : number$1)(scale.copy()),
            selection = context.selection ? context.selection() : context,
            path = selection.selectAll(".domain").data([null]),
            tick = selection.selectAll(".tick").data(values, scale).order(),
            tickExit = tick.exit(),
            tickEnter = tick.enter().append("g").attr("class", "tick"),
            line = tick.select("line"),
            text = tick.select("text");

        path = path.merge(path.enter().insert("path", ".tick")
            .attr("class", "domain")
            .attr("stroke", "#000"));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append("line")
            .attr("stroke", "#000")
            .attr(x + "2", k * tickSizeInner));

        text = text.merge(tickEnter.append("text")
            .attr("fill", "#000")
            .attr(x, k * spacing)
            .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

        if (context !== selection) {
          path = path.transition(context);
          tick = tick.transition(context);
          line = line.transition(context);
          text = text.transition(context);

          tickExit = tickExit.transition(context)
              .attr("opacity", epsilon)
              .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

          tickEnter
              .attr("opacity", epsilon)
              .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
        }

        tickExit.remove();

        path
            .attr("d", orient === left || orient == right
                ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter
                : "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter);

        tick
            .attr("opacity", 1)
            .attr("transform", function(d) { return transform(position(d)); });

        line
            .attr(x + "2", k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format);

        selection.filter(entering)
            .attr("fill", "none")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

        selection
            .each(function() { this.__axis = position; });
      }

      axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
      };

      axis.ticks = function() {
        return tickArguments = slice$1.call(arguments), axis;
      };

      axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : slice$1.call(_), axis) : tickArguments.slice();
      };

      axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : slice$1.call(_), axis) : tickValues && tickValues.slice();
      };

      axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
      };

      axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
      };

      axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
      };

      axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
      };

      axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
      };

      return axis;
    }

    function axisTop(scale) {
      return axis(top, scale);
    }

    var noop = {value: function() {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function empty() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty : function() {
        return this.querySelectorAll(selector);
      };
    }

    function selection_selectAll(select) {
      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection(subgroups, parents);
    }

    var matcher = function(selector) {
      return function() {
        return this.matches(selector);
      };
    };

    if (typeof document !== "undefined") {
      var element = document.documentElement;
      if (!element.matches) {
        var vendorMatches = element.webkitMatchesSelector
            || element.msMatchesSelector
            || element.mozMatchesSelector
            || element.oMatchesSelector;
        matcher = function(selector) {
          return function() {
            return vendorMatches.call(this, selector);
          };
        };
      }
    }

    var matcher$1 = matcher;

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher$1(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    var keyPrefix = "$"; // Protect against keys like “__proto__”.

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = {},
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
          if (keyValue in nodeByKeyValue) {
            exit[i] = node;
          } else {
            nodeByKeyValue[keyValue] = node;
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = keyPrefix + key.call(parent, data[i], i, data);
        if (node = nodeByKeyValue[keyValue]) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue[keyValue] = null;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
          exit[i] = node;
        }
      }
    }

    function selection_data(value, key) {
      if (!value) {
        data = new Array(this.size()), j = -1;
        this.each(function(d) { data[++j] = d; });
        return data;
      }

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant$1(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = value.call(parent, parent && parent.__data__, j, parents),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_merge(selection$$1) {

      for (var groups0 = this._groups, groups1 = selection$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending$1;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection(sortgroups, this._parents).order();
    }

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      var nodes = new Array(this.size()), i = -1;
      this.each(function() { nodes[++i] = this; });
      return nodes;
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      var size = 0;
      this.each(function() { ++size; });
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      return this.parentNode.insertBefore(this.cloneNode(false), this.nextSibling);
    }

    function selection_cloneDeep() {
      return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    var filterEvents = {};

    var event = null;

    if (typeof document !== "undefined") {
      var element$1 = document.documentElement;
      if (!("onmouseenter" in element$1)) {
        filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
      }
    }

    function filterContextListener(listener, index, group) {
      listener = contextListener(listener, index, group);
      return function(event) {
        var related = event.relatedTarget;
        if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
          listener.call(this, event);
        }
      };
    }

    function contextListener(listener, index, group) {
      return function(event1) {
        var event0 = event; // Events can be reentrant (e.g., focus).
        event = event1;
        try {
          listener.call(this, this.__data__, index, group);
        } finally {
          event = event0;
        }
      };
    }

    function parseTypenames$1(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, capture) {
      var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
      return function(d, i, group) {
        var on = this.__on, o, listener = wrap(value, i, group);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
            this.addEventListener(o.type, o.listener = listener, o.capture = capture);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, capture);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, capture) {
      var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      if (capture == null) capture = false;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
      return this;
    }

    function customEvent(event1, listener, that, args) {
      var event0 = event;
      event1.sourceEvent = event;
      event = event1;
      try {
        return listener.apply(that, args);
      } finally {
        event = event0;
      }
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    var root = [null];

    function Selection(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection([[document.documentElement]], root);
    }

    Selection.prototype = selection.prototype = {
      constructor: Selection,
      select: selection_select,
      selectAll: selection_selectAll,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      merge: selection_merge,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection([[document.querySelector(selector)]], [document.documentElement])
          : new Selection([[selector]], root);
    }

    function sourceEvent() {
      var current = event, source;
      while (source = current.sourceEvent) current = source;
      return current;
    }

    function point(node, event) {
      var svg = node.ownerSVGElement || node;

      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }

      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }

    function mouse(node) {
      var event = sourceEvent();
      if (event.changedTouches) event = event.changedTouches[0];
      return point(node, event);
    }

    function touch(node, touches, identifier) {
      if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

      for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
        if ((touch = touches[i]).identifier === identifier) {
          return point(node, touch);
        }
      }

      return null;
    }

    function noevent() {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function dragDisable(view) {
      var root = view.document.documentElement,
          selection$$1 = select(view).on("dragstart.drag", noevent, true);
      if ("onselectstart" in root) {
        selection$$1.on("selectstart.drag", noevent, true);
      } else {
        root.__noselect = root.style.MozUserSelect;
        root.style.MozUserSelect = "none";
      }
    }

    function yesdrag(view, noclick) {
      var root = view.document.documentElement,
          selection$$1 = select(view).on("dragstart.drag", null);
      if (noclick) {
        selection$$1.on("click.drag", noevent, true);
        setTimeout(function() { selection$$1.on("click.drag", null); }, 0);
      }
      if ("onselectstart" in root) {
        selection$$1.on("selectstart.drag", null);
      } else {
        root.style.MozUserSelect = root.__noselect;
        delete root.__noselect;
      }
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex3 = /^#([0-9a-f]{3})$/,
        reHex6 = /^#([0-9a-f]{6})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      displayable: function() {
        return this.rgb().displayable();
      },
      toString: function() {
        return this.rgb() + "";
      }
    });

    function color(format) {
      var m;
      format = (format + "").trim().toLowerCase();
      return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
          : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format])
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (0 <= this.r && this.r <= 255)
            && (0 <= this.g && this.g <= 255)
            && (0 <= this.b && this.b <= 255)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      toString: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "rgb(" : "rgba(")
            + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.b) || 0))
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var deg2rad = Math.PI / 180;
    var rad2deg = 180 / Math.PI;

    var Kn = 18,
        Xn = 0.950470, // D65 standard referent
        Yn = 1,
        Zn = 1.088830,
        t0 = 4 / 29,
        t1 = 6 / 29,
        t2 = 3 * t1 * t1,
        t3 = t1 * t1 * t1;

    function labConvert(o) {
      if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
      if (o instanceof Hcl) {
        var h = o.h * deg2rad;
        return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
      }
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var b = rgb2xyz(o.r),
          a = rgb2xyz(o.g),
          l = rgb2xyz(o.b),
          x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
          y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
          z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
      return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
    }

    function lab(l, a, b, opacity) {
      return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
    }

    function Lab(l, a, b, opacity) {
      this.l = +l;
      this.a = +a;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Lab, lab, extend(Color, {
      brighter: function(k) {
        return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      darker: function(k) {
        return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      rgb: function() {
        var y = (this.l + 16) / 116,
            x = isNaN(this.a) ? y : y + this.a / 500,
            z = isNaN(this.b) ? y : y - this.b / 200;
        y = Yn * lab2xyz(y);
        x = Xn * lab2xyz(x);
        z = Zn * lab2xyz(z);
        return new Rgb(
          xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
          xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
          xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
          this.opacity
        );
      }
    }));

    function xyz2lab(t) {
      return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
    }

    function lab2xyz(t) {
      return t > t1 ? t * t * t : t2 * (t - t0);
    }

    function xyz2rgb(x) {
      return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    }

    function rgb2xyz(x) {
      return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }

    function hclConvert(o) {
      if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
      if (!(o instanceof Lab)) o = labConvert(o);
      var h = Math.atan2(o.b, o.a) * rad2deg;
      return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
    }

    function hcl(h, c, l, opacity) {
      return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
    }

    function Hcl(h, c, l, opacity) {
      this.h = +h;
      this.c = +c;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hcl, hcl, extend(Color, {
      brighter: function(k) {
        return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
      },
      darker: function(k) {
        return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
      },
      rgb: function() {
        return labConvert(this).rgb();
      }
    }));

    var A = -0.14861,
        B = +1.78277,
        C = -0.29227,
        D = -0.90649,
        E = +1.97294,
        ED = E * D,
        EB = E * B,
        BC_DA = B * C - D * A;

    function cubehelixConvert(o) {
      if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
          bl = b - l,
          k = (E * (g - l) - C * bl) / D,
          s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
          h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
      return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
    }

    function cubehelix(h, s, l, opacity) {
      return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
    }

    function Cubehelix(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Cubehelix, cubehelix, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
            l = +this.l,
            a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
            cosh = Math.cos(h),
            sinh = Math.sin(h);
        return new Rgb(
          255 * (l + a * (A * cosh + B * sinh)),
          255 * (l + a * (C * cosh + D * sinh)),
          255 * (l + a * (E * cosh)),
          this.opacity
        );
      }
    }));

    function basis(t1, v0, v1, v2, v3) {
      var t2 = t1 * t1, t3 = t2 * t1;
      return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
    }

    function basis$1(values) {
      var n = values.length - 1;
      return function(t) {
        var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
            v1 = values[i],
            v2 = values[i + 1],
            v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
            v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
        return basis((t - i / n) * n, v0, v1, v2, v3);
      };
    }

    function constant$3(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function hue(a, b) {
      var d = b - a;
      return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$3(isNaN(a) ? b : a);
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$3(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant$3(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color$$1 = gamma(y);

      function rgb$$1(start, end) {
        var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
            g = color$$1(start.g, end.g),
            b = color$$1(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$$1.gamma = rgbGamma;

      return rgb$$1;
    })(1);

    function rgbSpline(spline) {
      return function(colors) {
        var n = colors.length,
            r = new Array(n),
            g = new Array(n),
            b = new Array(n),
            i, color$$1;
        for (i = 0; i < n; ++i) {
          color$$1 = rgb(colors[i]);
          r[i] = color$$1.r || 0;
          g[i] = color$$1.g || 0;
          b[i] = color$$1.b || 0;
        }
        r = spline(r);
        g = spline(g);
        b = spline(b);
        color$$1.opacity = 1;
        return function(t) {
          color$$1.r = r(t);
          color$$1.g = g(t);
          color$$1.b = b(t);
          return color$$1 + "";
        };
      };
    }

    var rgbBasis = rgbSpline(basis$1);

    function array$1(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b -= a, function(t) {
        return d.setTime(a + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b -= a, function(t) {
        return a + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolateValue(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolateValue(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$3(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
          : b instanceof color ? interpolateRgb
          : b instanceof Date ? date
          : Array.isArray(b) ? array$1
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b -= a, function(t) {
        return Math.round(a + b * t);
      };
    }

    var degrees = 180 / Math.PI;

    var identity$2 = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees,
        skewX: Math.atan(skewX) * degrees,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var cssNode,
        cssRoot,
        cssView,
        svgNode;

    function parseCss(value) {
      if (value === "none") return identity$2;
      if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
      cssNode.style.transform = value;
      value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
      cssRoot.removeChild(cssNode);
      value = value.slice(7, -1).split(",");
      return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
    }

    function parseSvg(value) {
      if (value == null) return identity$2;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity$2;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    var rho = Math.SQRT2,
        rho2 = 2,
        rho4 = 4,
        epsilon2 = 1e-12;

    function cosh(x) {
      return ((x = Math.exp(x)) + 1 / x) / 2;
    }

    function sinh(x) {
      return ((x = Math.exp(x)) - 1 / x) / 2;
    }

    function tanh(x) {
      return ((x = Math.exp(2 * x)) - 1) / (x + 1);
    }

    // p0 = [ux0, uy0, w0]
    // p1 = [ux1, uy1, w1]
    function interpolateZoom(p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
          ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
          dx = ux1 - ux0,
          dy = uy1 - uy0,
          d2 = dx * dx + dy * dy,
          i,
          S;

      // Special case for u0 ≅ u1.
      if (d2 < epsilon2) {
        S = Math.log(w1 / w0) / rho;
        i = function(t) {
          return [
            ux0 + t * dx,
            uy0 + t * dy,
            w0 * Math.exp(rho * t * S)
          ];
        };
      }

      // General case.
      else {
        var d1 = Math.sqrt(d2),
            b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
            b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
            r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
            r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r1 - r0) / rho;
        i = function(t) {
          var s = t * S,
              coshr0 = cosh(r0),
              u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / cosh(rho * s + r0)
          ];
        };
      }

      i.duration = S * 1000;

      return i;
    }

    function cubehelix$1(hue$$1) {
      return (function cubehelixGamma(y) {
        y = +y;

        function cubehelix$$1(start, end) {
          var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
              s = nogamma(start.s, end.s),
              l = nogamma(start.l, end.l),
              opacity = nogamma(start.opacity, end.opacity);
          return function(t) {
            start.h = h(t);
            start.s = s(t);
            start.l = l(Math.pow(t, y));
            start.opacity = opacity(t);
            return start + "";
          };
        }

        cubehelix$$1.gamma = cubehelixGamma;

        return cubehelix$$1;
      })(1);
    }

    cubehelix$1(hue);
    var cubehelixLong = cubehelix$1(nogamma);

    var frame = 0, // is an animation frame pending?
        timeout = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout) timeout = clearTimeout(timeout);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout$1(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(function(elapsed) {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create$1(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > STARTING) throw new Error("too late; already started");
      return schedule;
    }

    function get$1(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create$1(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout$1(start);

          // Interrupt the active transition, if any.
          // Dispatch the interrupt event.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions. No interrupt event is dispatched
          // because the cancelled transitions never started. Note that this also
          // removes this transition from the pending list!
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout$1(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(null, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule$$1,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule$$1 = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule$$1.state > STARTING && schedule$$1.state < ENDING;
        schedule$$1.state = ENDED;
        schedule$$1.timer.stop();
        if (active) schedule$$1.on.call("interrupt", node, node.__data__, schedule$$1.index, schedule$$1.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule$$1 = set$1(this, id),
            tween = schedule$$1.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule$$1.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule$$1 = set$1(this, id),
            tween = schedule$$1.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule$$1.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get$1(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule$$1 = set$1(this, id);
        (schedule$$1.value || (schedule$$1.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get$1(node, id).value[name];
      };
    }

    function interpolate(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, interpolate$$1, value1) {
      var value00,
          interpolate0;
      return function() {
        var value0 = this.getAttribute(name);
        return value0 === value1 ? null
            : value0 === value00 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value1);
      };
    }

    function attrConstantNS$1(fullname, interpolate$$1, value1) {
      var value00,
          interpolate0;
      return function() {
        var value0 = this.getAttributeNS(fullname.space, fullname.local);
        return value0 === value1 ? null
            : value0 === value00 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value1);
      };
    }

    function attrFunction$1(name, interpolate$$1, value) {
      var value00,
          value10,
          interpolate0;
      return function() {
        var value0, value1 = value(this);
        if (value1 == null) return void this.removeAttribute(name);
        value0 = this.getAttribute(name);
        return value0 === value1 ? null
            : value0 === value00 && value1 === value10 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
      };
    }

    function attrFunctionNS$1(fullname, interpolate$$1, value) {
      var value00,
          value10,
          interpolate0;
      return function() {
        var value0, value1 = value(this);
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        value0 = this.getAttributeNS(fullname.space, fullname.local);
        return value0 === value1 ? null
            : value0 === value00 && value1 === value10 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value + ""));
    }

    function attrTweenNS(fullname, value) {
      function tween() {
        var node = this, i = value.apply(node, arguments);
        return i && function(t) {
          node.setAttributeNS(fullname.space, fullname.local, i(t));
        };
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      function tween() {
        var node = this, i = value.apply(node, arguments);
        return i && function(t) {
          node.setAttribute(name, i(t));
        };
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get$1(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set$1(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set$1(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get$1(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set$1(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get$1(this.node(), id).ease;
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher$1(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition$$1) {
      if (transition$$1._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init : set$1;
      return function() {
        var schedule$$1 = sit(this, id),
            on = schedule$$1.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule$$1.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get$1(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select$$1) {
      var name = this._name,
          id = this._id;

      if (typeof select$$1 !== "function") select$$1 = selector(select$$1);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select$$1.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select$$1) {
      var name = this._name,
          id = this._id;

      if (typeof select$$1 !== "function") select$$1 = selectorAll(select$$1);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select$$1.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection$1 = selection.prototype.constructor;

    function transition_selection() {
      return new Selection$1(this._groups, this._parents);
    }

    function styleRemove$1(name, interpolate$$1) {
      var value00,
          value10,
          interpolate0;
      return function() {
        var value0 = styleValue(this, name),
            value1 = (this.style.removeProperty(name), styleValue(this, name));
        return value0 === value1 ? null
            : value0 === value00 && value1 === value10 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
      };
    }

    function styleRemoveEnd(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, interpolate$$1, value1) {
      var value00,
          interpolate0;
      return function() {
        var value0 = styleValue(this, name);
        return value0 === value1 ? null
            : value0 === value00 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value1);
      };
    }

    function styleFunction$1(name, interpolate$$1, value) {
      var value00,
          value10,
          interpolate0;
      return function() {
        var value0 = styleValue(this, name),
            value1 = value(this);
        if (value1 == null) value1 = (this.style.removeProperty(name), styleValue(this, name));
        return value0 === value1 ? null
            : value0 === value00 && value1 === value10 ? interpolate0
            : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
      return value == null ? this
              .styleTween(name, styleRemove$1(name, i))
              .on("end.style." + name, styleRemoveEnd(name))
          : this.styleTween(name, typeof value === "function"
              ? styleFunction$1(name, i, tweenValue(this, "style." + name, value))
              : styleConstant$1(name, i, value + ""), priority);
    }

    function styleTween(name, value, priority) {
      function tween() {
        var node = this, i = value.apply(node, arguments);
        return i && function(t) {
          node.style.setProperty(name, i(t), priority);
        };
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction$1(tweenValue(this, "text", value))
          : textConstant$1(value == null ? "" : value + ""));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get$1(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function transition(name) {
      return selection().transition(name);
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease
    };

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var pi = Math.PI;

    var tau = 2 * Math.PI;

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          return defaultTiming.time = now(), defaultTiming;
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    var pi$1 = Math.PI;

    var pi$2 = Math.PI,
        tau$2 = 2 * pi$2,
        epsilon$1 = 1e-6,
        tauEpsilon = tau$2 - epsilon$1;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon$1)) ;

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi$2 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon$1) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau$2 + tau$2;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon$1) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi$2)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    var prefix = "$";

    function Map$1() {}

    Map$1.prototype = map$1.prototype = {
      constructor: Map$1,
      has: function(key) {
        return (prefix + key) in this;
      },
      get: function(key) {
        return this[prefix + key];
      },
      set: function(key, value) {
        this[prefix + key] = value;
        return this;
      },
      remove: function(key) {
        var property = prefix + key;
        return property in this && delete this[property];
      },
      clear: function() {
        for (var property in this) if (property[0] === prefix) delete this[property];
      },
      keys: function() {
        var keys = [];
        for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
        return keys;
      },
      values: function() {
        var values = [];
        for (var property in this) if (property[0] === prefix) values.push(this[property]);
        return values;
      },
      entries: function() {
        var entries = [];
        for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
        return entries;
      },
      size: function() {
        var size = 0;
        for (var property in this) if (property[0] === prefix) ++size;
        return size;
      },
      empty: function() {
        for (var property in this) if (property[0] === prefix) return false;
        return true;
      },
      each: function(f) {
        for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
      }
    };

    function map$1(object, f) {
      var map = new Map$1;

      // Copy constructor.
      if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

      // Index array by numeric index or specified key function.
      else if (Array.isArray(object)) {
        var i = -1,
            n = object.length,
            o;

        if (f == null) while (++i < n) map.set(i, object[i]);
        else while (++i < n) map.set(f(o = object[i], i, object), o);
      }

      // Convert object to map.
      else if (object) for (var key in object) map.set(key, object[key]);

      return map;
    }

    function Set$1() {}

    var proto = map$1.prototype;

    Set$1.prototype = set$2.prototype = {
      constructor: Set$1,
      has: proto.has,
      add: function(value) {
        value += "";
        this[prefix + value] = value;
        return this;
      },
      remove: proto.remove,
      clear: proto.clear,
      values: proto.keys,
      size: proto.size,
      empty: proto.empty,
      each: proto.each
    };

    function set$2(object, f) {
      var set = new Set$1;

      // Copy constructor.
      if (object instanceof Set$1) object.each(function(value) { set.add(value); });

      // Otherwise, assume it’s an array.
      else if (object) {
        var i = -1, n = object.length;
        if (f == null) while (++i < n) set.add(object[i]);
        else while (++i < n) set.add(f(object[i], i, object));
      }

      return set;
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "]";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        })).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(text) {
        return text == null ? ""
            : reFormat.test(text += "") ? "\"" + text.replace(/"/g, "\"\"") + "\""
            : text;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatRows: formatRows
      };
    }

    var csv = dsv(",");

    var tsv = dsv("\t");

    function tree_add(d) {
      var x = +this._x.call(null, d),
          y = +this._y.call(null, d);
      return add(this.cover(x, y), x, y, d);
    }

    function add(tree, x, y, d) {
      if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

      var parent,
          node = tree._root,
          leaf = {data: d},
          x0 = tree._x0,
          y0 = tree._y0,
          x1 = tree._x1,
          y1 = tree._y1,
          xm,
          ym,
          xp,
          yp,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return tree._root = leaf, tree;

      // Find the existing leaf for the new point, or add it.
      while (node.length) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
      }

      // Is the new point is exactly coincident with the existing point?
      xp = +tree._x.call(null, node.data);
      yp = +tree._y.call(null, node.data);
      if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

      // Otherwise, split the leaf node until the old and new point are separated.
      do {
        parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
      return parent[j] = node, parent[i] = leaf, tree;
    }

    function addAll(data) {
      var d, i, n = data.length,
          x,
          y,
          xz = new Array(n),
          yz = new Array(n),
          x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;

      // Compute the points and their extent.
      for (i = 0; i < n; ++i) {
        if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
        xz[i] = x;
        yz[i] = y;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

      // If there were no (valid) points, inherit the existing extent.
      if (x1 < x0) x0 = this._x0, x1 = this._x1;
      if (y1 < y0) y0 = this._y0, y1 = this._y1;

      // Expand the tree to cover the new points.
      this.cover(x0, y0).cover(x1, y1);

      // Add the new points.
      for (i = 0; i < n; ++i) {
        add(this, xz[i], yz[i], data[i]);
      }

      return this;
    }

    function tree_cover(x, y) {
      if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

      var x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1;

      // If the quadtree has no extent, initialize them.
      // Integer extent are necessary so that if we later double the extent,
      // the existing quadrant boundaries don’t change due to floating point error!
      if (isNaN(x0)) {
        x1 = (x0 = Math.floor(x)) + 1;
        y1 = (y0 = Math.floor(y)) + 1;
      }

      // Otherwise, double repeatedly to cover.
      else if (x0 > x || x > x1 || y0 > y || y > y1) {
        var z = x1 - x0,
            node = this._root,
            parent,
            i;

        switch (i = (y < (y0 + y1) / 2) << 1 | (x < (x0 + x1) / 2)) {
          case 0: {
            do parent = new Array(4), parent[i] = node, node = parent;
            while (z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1);
            break;
          }
          case 1: {
            do parent = new Array(4), parent[i] = node, node = parent;
            while (z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1);
            break;
          }
          case 2: {
            do parent = new Array(4), parent[i] = node, node = parent;
            while (z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y);
            break;
          }
          case 3: {
            do parent = new Array(4), parent[i] = node, node = parent;
            while (z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y);
            break;
          }
        }

        if (this._root && this._root.length) this._root = node;
      }

      // If the quadtree covers the point already, just return.
      else return this;

      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      return this;
    }

    function tree_data() {
      var data = [];
      this.visit(function(node) {
        if (!node.length) do data.push(node.data); while (node = node.next)
      });
      return data;
    }

    function tree_extent(_) {
      return arguments.length
          ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
          : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
    }

    function Quad(node, x0, y0, x1, y1) {
      this.node = node;
      this.x0 = x0;
      this.y0 = y0;
      this.x1 = x1;
      this.y1 = y1;
    }

    function tree_find(x, y, radius) {
      var data,
          x0 = this._x0,
          y0 = this._y0,
          x1,
          y1,
          x2,
          y2,
          x3 = this._x1,
          y3 = this._y1,
          quads = [],
          node = this._root,
          q,
          i;

      if (node) quads.push(new Quad(node, x0, y0, x3, y3));
      if (radius == null) radius = Infinity;
      else {
        x0 = x - radius, y0 = y - radius;
        x3 = x + radius, y3 = y + radius;
        radius *= radius;
      }

      while (q = quads.pop()) {

        // Stop searching if this quadrant can’t contain a closer node.
        if (!(node = q.node)
            || (x1 = q.x0) > x3
            || (y1 = q.y0) > y3
            || (x2 = q.x1) < x0
            || (y2 = q.y1) < y0) continue;

        // Bisect the current quadrant.
        if (node.length) {
          var xm = (x1 + x2) / 2,
              ym = (y1 + y2) / 2;

          quads.push(
            new Quad(node[3], xm, ym, x2, y2),
            new Quad(node[2], x1, ym, xm, y2),
            new Quad(node[1], xm, y1, x2, ym),
            new Quad(node[0], x1, y1, xm, ym)
          );

          // Visit the closest quadrant first.
          if (i = (y >= ym) << 1 | (x >= xm)) {
            q = quads[quads.length - 1];
            quads[quads.length - 1] = quads[quads.length - 1 - i];
            quads[quads.length - 1 - i] = q;
          }
        }

        // Visit this point. (Visiting coincident points isn’t necessary!)
        else {
          var dx = x - +this._x.call(null, node.data),
              dy = y - +this._y.call(null, node.data),
              d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            var d = Math.sqrt(radius = d2);
            x0 = x - d, y0 = y - d;
            x3 = x + d, y3 = y + d;
            data = node.data;
          }
        }
      }

      return data;
    }

    function tree_remove(d) {
      if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

      var parent,
          node = this._root,
          retainer,
          previous,
          next,
          x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1,
          x,
          y,
          xm,
          ym,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return this;

      // Find the leaf node for the point.
      // While descending, also retain the deepest parent with a non-removed sibling.
      if (node.length) while (true) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
        if (!node.length) break;
        if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
      }

      // Find the point to remove.
      while (node.data !== d) if (!(previous = node, node = node.next)) return this;
      if (next = node.next) delete node.next;

      // If there are multiple coincident points, remove just the point.
      if (previous) return (next ? previous.next = next : delete previous.next), this;

      // If this is the root point, remove it.
      if (!parent) return this._root = next, this;

      // Remove this leaf.
      next ? parent[i] = next : delete parent[i];

      // If the parent now contains exactly one leaf, collapse superfluous parents.
      if ((node = parent[0] || parent[1] || parent[2] || parent[3])
          && node === (parent[3] || parent[2] || parent[1] || parent[0])
          && !node.length) {
        if (retainer) retainer[j] = node;
        else this._root = node;
      }

      return this;
    }

    function removeAll(data) {
      for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
      return this;
    }

    function tree_root() {
      return this._root;
    }

    function tree_size() {
      var size = 0;
      this.visit(function(node) {
        if (!node.length) do ++size; while (node = node.next)
      });
      return size;
    }

    function tree_visit(callback) {
      var quads = [], q, node = this._root, child, x0, y0, x1, y1;
      if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
          var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        }
      }
      return this;
    }

    function tree_visitAfter(callback) {
      var quads = [], next = [], q;
      if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        var node = q.node;
        if (node.length) {
          var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        }
        next.push(q);
      }
      while (q = next.pop()) {
        callback(q.node, q.x0, q.y0, q.x1, q.y1);
      }
      return this;
    }

    function defaultX(d) {
      return d[0];
    }

    function tree_x(_) {
      return arguments.length ? (this._x = _, this) : this._x;
    }

    function defaultY(d) {
      return d[1];
    }

    function tree_y(_) {
      return arguments.length ? (this._y = _, this) : this._y;
    }

    function quadtree(nodes, x, y) {
      var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
      return nodes == null ? tree : tree.addAll(nodes);
    }

    function Quadtree(x, y, x0, y0, x1, y1) {
      this._x = x;
      this._y = y;
      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      this._root = undefined;
    }

    function leaf_copy(leaf) {
      var copy = {data: leaf.data}, next = copy;
      while (leaf = leaf.next) next = next.next = {data: leaf.data};
      return copy;
    }

    var treeProto = quadtree.prototype = Quadtree.prototype;

    treeProto.copy = function() {
      var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
          node = this._root,
          nodes,
          child;

      if (!node) return copy;

      if (!node.length) return copy._root = leaf_copy(node), copy;

      nodes = [{source: node, target: copy._root = new Array(4)}];
      while (node = nodes.pop()) {
        for (var i = 0; i < 4; ++i) {
          if (child = node.source[i]) {
            if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
            else node.target[i] = leaf_copy(child);
          }
        }
      }

      return copy;
    };

    treeProto.add = tree_add;
    treeProto.addAll = addAll;
    treeProto.cover = tree_cover;
    treeProto.data = tree_data;
    treeProto.extent = tree_extent;
    treeProto.find = tree_find;
    treeProto.remove = tree_remove;
    treeProto.removeAll = removeAll;
    treeProto.root = tree_root;
    treeProto.size = tree_size;
    treeProto.visit = tree_visit;
    treeProto.visitAfter = tree_visitAfter;
    treeProto.x = tree_x;
    treeProto.y = tree_y;

    var initialAngle = Math.PI * (3 - Math.sqrt(5));

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimal(1.23) returns ["123", 0].
    function formatDecimal(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent$1(x) {
      return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    function formatDefault(x, p) {
      x = x.toPrecision(p);

      out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (x[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          case "e": break out;
          default: if (i0 > 0) i0 = 0; break;
        }
      }

      return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "": formatDefault,
      "%": function(x, p) { return (x * 100).toFixed(p); },
      "b": function(x) { return Math.round(x).toString(2); },
      "c": function(x) { return x + ""; },
      "d": function(x) { return Math.round(x).toString(10); },
      "e": function(x, p) { return x.toExponential(p); },
      "f": function(x, p) { return x.toFixed(p); },
      "g": function(x, p) { return x.toPrecision(p); },
      "o": function(x) { return Math.round(x).toString(8); },
      "p": function(x, p) { return formatRounded(x * 100, p); },
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
      "x": function(x) { return Math.round(x).toString(16); }
    };

    // [[fill]align][sign][symbol][0][width][,][.precision][type]
    var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      return new FormatSpecifier(specifier);
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

      var match,
          fill = match[1] || " ",
          align = match[2] || ">",
          sign = match[3] || "-",
          symbol = match[4] || "",
          zero = !!match[5],
          width = match[6] && +match[6],
          comma = !!match[7],
          precision = match[8] && +match[8].slice(1),
          type = match[9] || "";

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // Map invalid types to the default format.
      else if (!formatTypes[type]) type = "";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      this.fill = fill;
      this.align = align;
      this.sign = sign;
      this.symbol = symbol;
      this.zero = zero;
      this.width = width;
      this.comma = comma;
      this.precision = precision;
      this.type = type;
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width == null ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
          + this.type;
    };

    function identity$3(x) {
      return x;
    }

    var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$3,
          currency = locale.currency,
          decimal = locale.decimal,
          numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$3,
          percent = locale.percent || "%";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            type = specifier.type;

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = !type || /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision == null ? (type ? 6 : 12)
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Perform the initial formatting.
            var valueNegative = value < 0;
            value = formatType(Math.abs(value), precision);

            // If a negative value rounds to zero during formatting, treat as positive.
            if (valueNegative && +value === 0) valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent$1(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3 - exponent$1(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent$1(max) - exponent$1(step)) + 1;
    }

    // Adds floating point numbers with twice the normal precision.
    // Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
    // Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
    // 305–363 (1997).
    // Code adapted from GeographicLib by Charles F. F. Karney,
    // http://geographiclib.sourceforge.net/

    function adder() {
      return new Adder;
    }

    function Adder() {
      this.reset();
    }

    Adder.prototype = {
      constructor: Adder,
      reset: function() {
        this.s = // rounded value
        this.t = 0; // exact error
      },
      add: function(y) {
        add$1(temp, y, this.t);
        add$1(this, temp.s, this.s);
        if (this.s) this.t += temp.t;
        else this.s = temp.t;
      },
      valueOf: function() {
        return this.s;
      }
    };

    var temp = new Adder;

    function add$1(adder, a, b) {
      var x = adder.s = a + b,
          bv = x - a,
          av = x - bv;
      adder.t = (a - av) + (b - bv);
    }

    var pi$3 = Math.PI;

    var areaRingSum = adder();

    var areaSum = adder();

    var deltaSum = adder();

    var sum$1 = adder();

    var lengthSum = adder();

    var areaSum$1 = adder(),
        areaRingSum$1 = adder();

    var lengthSum$1 = adder();

    // Returns the 2D cross product of AB and AC vectors, i.e., the z-component of

    var array$2 = Array.prototype;

    var map$2 = array$2.map;
    var slice$5 = array$2.slice;

    var implicit = {name: "implicit"};

    function ordinal(range) {
      var index = map$1(),
          domain = [],
          unknown = implicit;

      range = range == null ? [] : slice$5.call(range);

      function scale(d) {
        var key = d + "", i = index.get(key);
        if (!i) {
          if (unknown !== implicit) return unknown;
          index.set(key, i = domain.push(d));
        }
        return range[(i - 1) % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = map$1();
        var i = -1, n = _.length, d, key;
        while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = slice$5.call(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal()
            .domain(domain)
            .range(range)
            .unknown(unknown);
      };

      return scale;
    }

    function band() {
      var scale = ordinal().unknown(undefined),
          domain = scale.domain,
          ordinalRange = scale.range,
          range$$1 = [0, 1],
          step,
          bandwidth,
          round = false,
          paddingInner = 0,
          paddingOuter = 0,
          align = 0.5;

      delete scale.unknown;

      function rescale() {
        var n = domain().length,
            reverse = range$$1[1] < range$$1[0],
            start = range$$1[reverse - 0],
            stop = range$$1[1 - reverse];
        step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
        if (round) step = Math.floor(step);
        start += (stop - start - step * (n - paddingInner)) * align;
        bandwidth = step * (1 - paddingInner);
        if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
        var values = sequence(n).map(function(i) { return start + step * i; });
        return ordinalRange(reverse ? values.reverse() : values);
      }

      scale.domain = function(_) {
        return arguments.length ? (domain(_), rescale()) : domain();
      };

      scale.range = function(_) {
        return arguments.length ? (range$$1 = [+_[0], +_[1]], rescale()) : range$$1.slice();
      };

      scale.rangeRound = function(_) {
        return range$$1 = [+_[0], +_[1]], round = true, rescale();
      };

      scale.bandwidth = function() {
        return bandwidth;
      };

      scale.step = function() {
        return step;
      };

      scale.round = function(_) {
        return arguments.length ? (round = !!_, rescale()) : round;
      };

      scale.padding = function(_) {
        return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
      };

      scale.paddingInner = function(_) {
        return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
      };

      scale.paddingOuter = function(_) {
        return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
      };

      scale.align = function(_) {
        return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
      };

      scale.copy = function() {
        return band()
            .domain(domain())
            .range(range$$1)
            .round(round)
            .paddingInner(paddingInner)
            .paddingOuter(paddingOuter)
            .align(align);
      };

      return rescale();
    }

    function pointish(scale) {
      var copy = scale.copy;

      scale.padding = scale.paddingOuter;
      delete scale.paddingInner;
      delete scale.paddingOuter;

      scale.copy = function() {
        return pointish(copy());
      };

      return scale;
    }

    function point$1() {
      return pointish(band().paddingInner(1));
    }

    function constant$9(x) {
      return function() {
        return x;
      };
    }

    function number$2(x) {
      return +x;
    }

    var unit = [0, 1];

    function deinterpolateLinear(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constant$9(b);
    }

    function deinterpolateClamp(deinterpolate) {
      return function(a, b) {
        var d = deinterpolate(a = +a, b = +b);
        return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
      };
    }

    function reinterpolateClamp(reinterpolate) {
      return function(a, b) {
        var r = reinterpolate(a = +a, b = +b);
        return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
      };
    }

    function bimap(domain, range, deinterpolate, reinterpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
      else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, deinterpolate, reinterpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = deinterpolate(domain[i], domain[i + 1]);
        r[i] = reinterpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp());
    }

    // deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
    function continuous(deinterpolate, reinterpolate) {
      var domain = unit,
          range = unit,
          interpolate$$1 = interpolateValue,
          clamp = false,
          piecewise,
          output,
          input;

      function rescale() {
        piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return (output || (output = piecewise(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
      }

      scale.invert = function(y) {
        return (input || (input = piecewise(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = map$2.call(_, number$2), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = slice$5.call(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = slice$5.call(_), interpolate$$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = !!_, rescale()) : clamp;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
      };

      return rescale();
    }

    function tickFormat(domain, count, specifier) {
      var start = domain[0],
          stop = domain[domain.length - 1],
          step = tickStep(start, stop, count == null ? 10 : count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        return tickFormat(domain(), count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain(),
            i0 = 0,
            i1 = d.length - 1,
            start = d[i0],
            stop = d[i1],
            step;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }

        step = tickIncrement(start, stop, count);

        if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
          step = tickIncrement(start, stop, count);
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
          step = tickIncrement(start, stop, count);
        }

        if (step > 0) {
          d[i0] = Math.floor(start / step) * step;
          d[i1] = Math.ceil(stop / step) * step;
          domain(d);
        } else if (step < 0) {
          d[i0] = Math.ceil(start * step) / step;
          d[i1] = Math.floor(stop * step) / step;
          domain(d);
        }

        return scale;
      };

      return scale;
    }

    function linear$2() {
      var scale = continuous(deinterpolateLinear, interpolateNumber);

      scale.copy = function() {
        return copy(scale, linear$2());
      };

      return linearish(scale);
    }

    var t0$1 = new Date,
        t1$1 = new Date;

    function newInterval(floori, offseti, count, field) {

      function interval(date) {
        return floori(date = new Date(+date)), date;
      }

      interval.floor = interval;

      interval.ceil = function(date) {
        return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
      };

      interval.round = function(date) {
        var d0 = interval(date),
            d1 = interval.ceil(date);
        return date - d0 < d1 - date ? d0 : d1;
      };

      interval.offset = function(date, step) {
        return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
      };

      interval.range = function(start, stop, step) {
        var range = [], previous;
        start = interval.ceil(start);
        step = step == null ? 1 : Math.floor(step);
        if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
        do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
        while (previous < start && start < stop);
        return range;
      };

      interval.filter = function(test) {
        return newInterval(function(date) {
          if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
        }, function(date, step) {
          if (date >= date) {
            if (step < 0) while (++step <= 0) {
              while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
            } else while (--step >= 0) {
              while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
            }
          }
        });
      };

      if (count) {
        interval.count = function(start, end) {
          t0$1.setTime(+start), t1$1.setTime(+end);
          floori(t0$1), floori(t1$1);
          return Math.floor(count(t0$1, t1$1));
        };

        interval.every = function(step) {
          step = Math.floor(step);
          return !isFinite(step) || !(step > 0) ? null
              : !(step > 1) ? interval
              : interval.filter(field
                  ? function(d) { return field(d) % step === 0; }
                  : function(d) { return interval.count(0, d) % step === 0; });
        };
      }

      return interval;
    }

    var millisecond = newInterval(function() {
      // noop
    }, function(date, step) {
      date.setTime(+date + step);
    }, function(start, end) {
      return end - start;
    });

    // An optimized implementation for this simple case.
    millisecond.every = function(k) {
      k = Math.floor(k);
      if (!isFinite(k) || !(k > 0)) return null;
      if (!(k > 1)) return millisecond;
      return newInterval(function(date) {
        date.setTime(Math.floor(date / k) * k);
      }, function(date, step) {
        date.setTime(+date + step * k);
      }, function(start, end) {
        return (end - start) / k;
      });
    };
    var milliseconds = millisecond.range;

    var durationSecond = 1e3;
    var durationMinute = 6e4;
    var durationHour = 36e5;
    var durationDay = 864e5;
    var durationWeek = 6048e5;

    var second = newInterval(function(date) {
      date.setTime(Math.floor(date / durationSecond) * durationSecond);
    }, function(date, step) {
      date.setTime(+date + step * durationSecond);
    }, function(start, end) {
      return (end - start) / durationSecond;
    }, function(date) {
      return date.getUTCSeconds();
    });
    var seconds = second.range;

    var minute = newInterval(function(date) {
      date.setTime(Math.floor(date / durationMinute) * durationMinute);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getMinutes();
    });
    var minutes = minute.range;

    var hour = newInterval(function(date) {
      var offset = date.getTimezoneOffset() * durationMinute % durationHour;
      if (offset < 0) offset += durationHour;
      date.setTime(Math.floor((+date - offset) / durationHour) * durationHour + offset);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getHours();
    });
    var hours = hour.range;

    var day = newInterval(function(date) {
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
    }, function(date) {
      return date.getDate() - 1;
    });
    var days = day.range;

    function weekday(i) {
      return newInterval(function(date) {
        date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setDate(date.getDate() + step * 7);
      }, function(start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      });
    }

    var sunday = weekday(0);
    var monday = weekday(1);
    var tuesday = weekday(2);
    var wednesday = weekday(3);
    var thursday = weekday(4);
    var friday = weekday(5);
    var saturday = weekday(6);

    var sundays = sunday.range;

    var month = newInterval(function(date) {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setMonth(date.getMonth() + step);
    }, function(start, end) {
      return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
    }, function(date) {
      return date.getMonth();
    });
    var months = month.range;

    var year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start, end) {
      return end.getFullYear() - start.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });

    // An optimized implementation for this simple case.
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };
    var years = year.range;

    var utcMinute = newInterval(function(date) {
      date.setUTCSeconds(0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getUTCMinutes();
    });
    var utcMinutes = utcMinute.range;

    var utcHour = newInterval(function(date) {
      date.setUTCMinutes(0, 0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getUTCHours();
    });
    var utcHours = utcHour.range;

    var utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start, end) {
      return (end - start) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });
    var utcDays = utcDay.range;

    function utcWeekday(i) {
      return newInterval(function(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      }, function(start, end) {
        return (end - start) / durationWeek;
      });
    }

    var utcSunday = utcWeekday(0);
    var utcMonday = utcWeekday(1);
    var utcTuesday = utcWeekday(2);
    var utcWednesday = utcWeekday(3);
    var utcThursday = utcWeekday(4);
    var utcFriday = utcWeekday(5);
    var utcSaturday = utcWeekday(6);

    var utcSundays = utcSunday.range;

    var utcMonth = newInterval(function(date) {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCMonth(date.getUTCMonth() + step);
    }, function(start, end) {
      return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
    }, function(date) {
      return date.getUTCMonth();
    });
    var utcMonths = utcMonth.range;

    var utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });

    // An optimized implementation for this simple case.
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };
    var utcYears = utcYear.range;

    function localDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
      }
      return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }

    function utcDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
      }
      return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }

    function newYear(y) {
      return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
    }

    function formatLocale$1(locale) {
      var locale_dateTime = locale.dateTime,
          locale_date = locale.date,
          locale_time = locale.time,
          locale_periods = locale.periods,
          locale_weekdays = locale.days,
          locale_shortWeekdays = locale.shortDays,
          locale_months = locale.months,
          locale_shortMonths = locale.shortMonths;

      var periodRe = formatRe(locale_periods),
          periodLookup = formatLookup(locale_periods),
          weekdayRe = formatRe(locale_weekdays),
          weekdayLookup = formatLookup(locale_weekdays),
          shortWeekdayRe = formatRe(locale_shortWeekdays),
          shortWeekdayLookup = formatLookup(locale_shortWeekdays),
          monthRe = formatRe(locale_months),
          monthLookup = formatLookup(locale_months),
          shortMonthRe = formatRe(locale_shortMonths),
          shortMonthLookup = formatLookup(locale_shortMonths);

      var formats = {
        "a": formatShortWeekday,
        "A": formatWeekday,
        "b": formatShortMonth,
        "B": formatMonth,
        "c": null,
        "d": formatDayOfMonth,
        "e": formatDayOfMonth,
        "f": formatMicroseconds,
        "H": formatHour24,
        "I": formatHour12,
        "j": formatDayOfYear,
        "L": formatMilliseconds,
        "m": formatMonthNumber,
        "M": formatMinutes,
        "p": formatPeriod,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatSeconds,
        "u": formatWeekdayNumberMonday,
        "U": formatWeekNumberSunday,
        "V": formatWeekNumberISO,
        "w": formatWeekdayNumberSunday,
        "W": formatWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatYear,
        "Y": formatFullYear,
        "Z": formatZone,
        "%": formatLiteralPercent
      };

      var utcFormats = {
        "a": formatUTCShortWeekday,
        "A": formatUTCWeekday,
        "b": formatUTCShortMonth,
        "B": formatUTCMonth,
        "c": null,
        "d": formatUTCDayOfMonth,
        "e": formatUTCDayOfMonth,
        "f": formatUTCMicroseconds,
        "H": formatUTCHour24,
        "I": formatUTCHour12,
        "j": formatUTCDayOfYear,
        "L": formatUTCMilliseconds,
        "m": formatUTCMonthNumber,
        "M": formatUTCMinutes,
        "p": formatUTCPeriod,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatUTCSeconds,
        "u": formatUTCWeekdayNumberMonday,
        "U": formatUTCWeekNumberSunday,
        "V": formatUTCWeekNumberISO,
        "w": formatUTCWeekdayNumberSunday,
        "W": formatUTCWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatUTCYear,
        "Y": formatUTCFullYear,
        "Z": formatUTCZone,
        "%": formatLiteralPercent
      };

      var parses = {
        "a": parseShortWeekday,
        "A": parseWeekday,
        "b": parseShortMonth,
        "B": parseMonth,
        "c": parseLocaleDateTime,
        "d": parseDayOfMonth,
        "e": parseDayOfMonth,
        "f": parseMicroseconds,
        "H": parseHour24,
        "I": parseHour24,
        "j": parseDayOfYear,
        "L": parseMilliseconds,
        "m": parseMonthNumber,
        "M": parseMinutes,
        "p": parsePeriod,
        "Q": parseUnixTimestamp,
        "s": parseUnixTimestampSeconds,
        "S": parseSeconds,
        "u": parseWeekdayNumberMonday,
        "U": parseWeekNumberSunday,
        "V": parseWeekNumberISO,
        "w": parseWeekdayNumberSunday,
        "W": parseWeekNumberMonday,
        "x": parseLocaleDate,
        "X": parseLocaleTime,
        "y": parseYear,
        "Y": parseFullYear,
        "Z": parseZone,
        "%": parseLiteralPercent
      };

      // These recursive directive definitions must be deferred.
      formats.x = newFormat(locale_date, formats);
      formats.X = newFormat(locale_time, formats);
      formats.c = newFormat(locale_dateTime, formats);
      utcFormats.x = newFormat(locale_date, utcFormats);
      utcFormats.X = newFormat(locale_time, utcFormats);
      utcFormats.c = newFormat(locale_dateTime, utcFormats);

      function newFormat(specifier, formats) {
        return function(date) {
          var string = [],
              i = -1,
              j = 0,
              n = specifier.length,
              c,
              pad,
              format;

          if (!(date instanceof Date)) date = new Date(+date);

          while (++i < n) {
            if (specifier.charCodeAt(i) === 37) {
              string.push(specifier.slice(j, i));
              if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
              else pad = c === "e" ? " " : "0";
              if (format = formats[c]) c = format(date, pad);
              string.push(c);
              j = i + 1;
            }
          }

          string.push(specifier.slice(j, i));
          return string.join("");
        };
      }

      function newParse(specifier, newDate) {
        return function(string) {
          var d = newYear(1900),
              i = parseSpecifier(d, specifier, string += "", 0),
              week, day$$1;
          if (i != string.length) return null;

          // If a UNIX timestamp is specified, return it.
          if ("Q" in d) return new Date(d.Q);

          // The am-pm flag is 0 for AM, and 1 for PM.
          if ("p" in d) d.H = d.H % 12 + d.p * 12;

          // Convert day-of-week and week-of-year to day-of-year.
          if ("V" in d) {
            if (d.V < 1 || d.V > 53) return null;
            if (!("w" in d)) d.w = 1;
            if ("Z" in d) {
              week = utcDate(newYear(d.y)), day$$1 = week.getUTCDay();
              week = day$$1 > 4 || day$$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
              week = utcDay.offset(week, (d.V - 1) * 7);
              d.y = week.getUTCFullYear();
              d.m = week.getUTCMonth();
              d.d = week.getUTCDate() + (d.w + 6) % 7;
            } else {
              week = newDate(newYear(d.y)), day$$1 = week.getDay();
              week = day$$1 > 4 || day$$1 === 0 ? monday.ceil(week) : monday(week);
              week = day.offset(week, (d.V - 1) * 7);
              d.y = week.getFullYear();
              d.m = week.getMonth();
              d.d = week.getDate() + (d.w + 6) % 7;
            }
          } else if ("W" in d || "U" in d) {
            if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
            day$$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
            d.m = 0;
            d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$$1 + 5) % 7 : d.w + d.U * 7 - (day$$1 + 6) % 7;
          }

          // If a time zone is specified, all fields are interpreted as UTC and then
          // offset according to the specified time zone.
          if ("Z" in d) {
            d.H += d.Z / 100 | 0;
            d.M += d.Z % 100;
            return utcDate(d);
          }

          // Otherwise, all fields are in local time.
          return newDate(d);
        };
      }

      function parseSpecifier(d, specifier, string, j) {
        var i = 0,
            n = specifier.length,
            m = string.length,
            c,
            parse;

        while (i < n) {
          if (j >= m) return -1;
          c = specifier.charCodeAt(i++);
          if (c === 37) {
            c = specifier.charAt(i++);
            parse = parses[c in pads ? specifier.charAt(i++) : c];
            if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
          } else if (c != string.charCodeAt(j++)) {
            return -1;
          }
        }

        return j;
      }

      function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, locale_dateTime, string, i);
      }

      function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, locale_date, string, i);
      }

      function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, locale_time, string, i);
      }

      function formatShortWeekday(d) {
        return locale_shortWeekdays[d.getDay()];
      }

      function formatWeekday(d) {
        return locale_weekdays[d.getDay()];
      }

      function formatShortMonth(d) {
        return locale_shortMonths[d.getMonth()];
      }

      function formatMonth(d) {
        return locale_months[d.getMonth()];
      }

      function formatPeriod(d) {
        return locale_periods[+(d.getHours() >= 12)];
      }

      function formatUTCShortWeekday(d) {
        return locale_shortWeekdays[d.getUTCDay()];
      }

      function formatUTCWeekday(d) {
        return locale_weekdays[d.getUTCDay()];
      }

      function formatUTCShortMonth(d) {
        return locale_shortMonths[d.getUTCMonth()];
      }

      function formatUTCMonth(d) {
        return locale_months[d.getUTCMonth()];
      }

      function formatUTCPeriod(d) {
        return locale_periods[+(d.getUTCHours() >= 12)];
      }

      return {
        format: function(specifier) {
          var f = newFormat(specifier += "", formats);
          f.toString = function() { return specifier; };
          return f;
        },
        parse: function(specifier) {
          var p = newParse(specifier += "", localDate);
          p.toString = function() { return specifier; };
          return p;
        },
        utcFormat: function(specifier) {
          var f = newFormat(specifier += "", utcFormats);
          f.toString = function() { return specifier; };
          return f;
        },
        utcParse: function(specifier) {
          var p = newParse(specifier, utcDate);
          p.toString = function() { return specifier; };
          return p;
        }
      };
    }

    var pads = {"-": "", "_": " ", "0": "0"},
        numberRe = /^\s*\d+/, // note: ignores next directive
        percentRe = /^%/,
        requoteRe = /[\\^$*+?|[\]().{}]/g;

    function pad(value, fill, width) {
      var sign = value < 0 ? "-" : "",
          string = (sign ? -value : value) + "",
          length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }

    function requote(s) {
      return s.replace(requoteRe, "\\$&");
    }

    function formatRe(names) {
      return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
    }

    function formatLookup(names) {
      var map = {}, i = -1, n = names.length;
      while (++i < n) map[names[i].toLowerCase()] = i;
      return map;
    }

    function parseWeekdayNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.w = +n[0], i + n[0].length) : -1;
    }

    function parseWeekdayNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.u = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.U = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberISO(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.V = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.W = +n[0], i + n[0].length) : -1;
    }

    function parseFullYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 4));
      return n ? (d.y = +n[0], i + n[0].length) : -1;
    }

    function parseYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }

    function parseZone(d, string, i) {
      var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
      return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }

    function parseMonthNumber(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
    }

    function parseDayOfMonth(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.d = +n[0], i + n[0].length) : -1;
    }

    function parseDayOfYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }

    function parseHour24(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.H = +n[0], i + n[0].length) : -1;
    }

    function parseMinutes(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.M = +n[0], i + n[0].length) : -1;
    }

    function parseSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.S = +n[0], i + n[0].length) : -1;
    }

    function parseMilliseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.L = +n[0], i + n[0].length) : -1;
    }

    function parseMicroseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 6));
      return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
    }

    function parseLiteralPercent(d, string, i) {
      var n = percentRe.exec(string.slice(i, i + 1));
      return n ? i + n[0].length : -1;
    }

    function parseUnixTimestamp(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }

    function parseUnixTimestampSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
    }

    function formatDayOfMonth(d, p) {
      return pad(d.getDate(), p, 2);
    }

    function formatHour24(d, p) {
      return pad(d.getHours(), p, 2);
    }

    function formatHour12(d, p) {
      return pad(d.getHours() % 12 || 12, p, 2);
    }

    function formatDayOfYear(d, p) {
      return pad(1 + day.count(year(d), d), p, 3);
    }

    function formatMilliseconds(d, p) {
      return pad(d.getMilliseconds(), p, 3);
    }

    function formatMicroseconds(d, p) {
      return formatMilliseconds(d, p) + "000";
    }

    function formatMonthNumber(d, p) {
      return pad(d.getMonth() + 1, p, 2);
    }

    function formatMinutes(d, p) {
      return pad(d.getMinutes(), p, 2);
    }

    function formatSeconds(d, p) {
      return pad(d.getSeconds(), p, 2);
    }

    function formatWeekdayNumberMonday(d) {
      var day$$1 = d.getDay();
      return day$$1 === 0 ? 7 : day$$1;
    }

    function formatWeekNumberSunday(d, p) {
      return pad(sunday.count(year(d), d), p, 2);
    }

    function formatWeekNumberISO(d, p) {
      var day$$1 = d.getDay();
      d = (day$$1 >= 4 || day$$1 === 0) ? thursday(d) : thursday.ceil(d);
      return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
    }

    function formatWeekdayNumberSunday(d) {
      return d.getDay();
    }

    function formatWeekNumberMonday(d, p) {
      return pad(monday.count(year(d), d), p, 2);
    }

    function formatYear(d, p) {
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatFullYear(d, p) {
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatZone(d) {
      var z = d.getTimezoneOffset();
      return (z > 0 ? "-" : (z *= -1, "+"))
          + pad(z / 60 | 0, "0", 2)
          + pad(z % 60, "0", 2);
    }

    function formatUTCDayOfMonth(d, p) {
      return pad(d.getUTCDate(), p, 2);
    }

    function formatUTCHour24(d, p) {
      return pad(d.getUTCHours(), p, 2);
    }

    function formatUTCHour12(d, p) {
      return pad(d.getUTCHours() % 12 || 12, p, 2);
    }

    function formatUTCDayOfYear(d, p) {
      return pad(1 + utcDay.count(utcYear(d), d), p, 3);
    }

    function formatUTCMilliseconds(d, p) {
      return pad(d.getUTCMilliseconds(), p, 3);
    }

    function formatUTCMicroseconds(d, p) {
      return formatUTCMilliseconds(d, p) + "000";
    }

    function formatUTCMonthNumber(d, p) {
      return pad(d.getUTCMonth() + 1, p, 2);
    }

    function formatUTCMinutes(d, p) {
      return pad(d.getUTCMinutes(), p, 2);
    }

    function formatUTCSeconds(d, p) {
      return pad(d.getUTCSeconds(), p, 2);
    }

    function formatUTCWeekdayNumberMonday(d) {
      var dow = d.getUTCDay();
      return dow === 0 ? 7 : dow;
    }

    function formatUTCWeekNumberSunday(d, p) {
      return pad(utcSunday.count(utcYear(d), d), p, 2);
    }

    function formatUTCWeekNumberISO(d, p) {
      var day$$1 = d.getUTCDay();
      d = (day$$1 >= 4 || day$$1 === 0) ? utcThursday(d) : utcThursday.ceil(d);
      return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
    }

    function formatUTCWeekdayNumberSunday(d) {
      return d.getUTCDay();
    }

    function formatUTCWeekNumberMonday(d, p) {
      return pad(utcMonday.count(utcYear(d), d), p, 2);
    }

    function formatUTCYear(d, p) {
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCFullYear(d, p) {
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCZone() {
      return "+0000";
    }

    function formatLiteralPercent() {
      return "%";
    }

    function formatUnixTimestamp(d) {
      return +d;
    }

    function formatUnixTimestampSeconds(d) {
      return Math.floor(+d / 1000);
    }

    var locale$1;
    var timeFormat;
    var timeParse;
    var utcFormat;
    var utcParse;

    defaultLocale$1({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });

    function defaultLocale$1(definition) {
      locale$1 = formatLocale$1(definition);
      timeFormat = locale$1.format;
      timeParse = locale$1.parse;
      utcFormat = locale$1.utcFormat;
      utcParse = locale$1.utcParse;
      return locale$1;
    }

    var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

    function formatIsoNative(date) {
      return date.toISOString();
    }

    var formatIso = Date.prototype.toISOString
        ? formatIsoNative
        : utcFormat(isoSpecifier);

    function parseIsoNative(string) {
      var date = new Date(string);
      return isNaN(date) ? null : date;
    }

    var parseIso = +new Date("2000-01-01T00:00:00.000Z")
        ? parseIsoNative
        : utcParse(isoSpecifier);

    function colors(s) {
      return s.match(/.{6}/g).map(function(x) {
        return "#" + x;
      });
    }

    colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

    colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

    colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

    colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

    cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

    var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var rainbow = cubehelix();

    function ramp(range) {
      var n = range.length;
      return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
      };
    }

    ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

    var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

    var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

    var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

    function constant$a(x) {
      return function constant() {
        return x;
      };
    }

    var abs$1 = Math.abs;
    var atan2$1 = Math.atan2;
    var cos$2 = Math.cos;
    var max$2 = Math.max;
    var min$1 = Math.min;
    var sin$2 = Math.sin;
    var sqrt$2 = Math.sqrt;

    var epsilon$3 = 1e-12;
    var pi$4 = Math.PI;
    var halfPi$3 = pi$4 / 2;
    var tau$4 = 2 * pi$4;

    function acos$1(x) {
      return x > 1 ? 0 : x < -1 ? pi$4 : Math.acos(x);
    }

    function asin$1(x) {
      return x >= 1 ? halfPi$3 : x <= -1 ? -halfPi$3 : Math.asin(x);
    }

    function arcInnerRadius(d) {
      return d.innerRadius;
    }

    function arcOuterRadius(d) {
      return d.outerRadius;
    }

    function arcStartAngle(d) {
      return d.startAngle;
    }

    function arcEndAngle(d) {
      return d.endAngle;
    }

    function arcPadAngle(d) {
      return d && d.padAngle; // Note: optional!
    }

    function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
      var x10 = x1 - x0, y10 = y1 - y0,
          x32 = x3 - x2, y32 = y3 - y2,
          t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / (y32 * x10 - x32 * y10);
      return [x0 + t * x10, y0 + t * y10];
    }

    // Compute perpendicular offset line of length rc.
    // http://mathworld.wolfram.com/Circle-LineIntersection.html
    function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
      var x01 = x0 - x1,
          y01 = y0 - y1,
          lo = (cw ? rc : -rc) / sqrt$2(x01 * x01 + y01 * y01),
          ox = lo * y01,
          oy = -lo * x01,
          x11 = x0 + ox,
          y11 = y0 + oy,
          x10 = x1 + ox,
          y10 = y1 + oy,
          x00 = (x11 + x10) / 2,
          y00 = (y11 + y10) / 2,
          dx = x10 - x11,
          dy = y10 - y11,
          d2 = dx * dx + dy * dy,
          r = r1 - rc,
          D = x11 * y10 - x10 * y11,
          d = (dy < 0 ? -1 : 1) * sqrt$2(max$2(0, r * r * d2 - D * D)),
          cx0 = (D * dy - dx * d) / d2,
          cy0 = (-D * dx - dy * d) / d2,
          cx1 = (D * dy + dx * d) / d2,
          cy1 = (-D * dx + dy * d) / d2,
          dx0 = cx0 - x00,
          dy0 = cy0 - y00,
          dx1 = cx1 - x00,
          dy1 = cy1 - y00;

      // Pick the closer of the two intersection points.
      // TODO Is there a faster way to determine which intersection to use?
      if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

      return {
        cx: cx0,
        cy: cy0,
        x01: -ox,
        y01: -oy,
        x11: cx0 * (r1 / r - 1),
        y11: cy0 * (r1 / r - 1)
      };
    }

    function arc() {
      var innerRadius = arcInnerRadius,
          outerRadius = arcOuterRadius,
          cornerRadius = constant$a(0),
          padRadius = null,
          startAngle = arcStartAngle,
          endAngle = arcEndAngle,
          padAngle = arcPadAngle,
          context = null;

      function arc() {
        var buffer,
            r,
            r0 = +innerRadius.apply(this, arguments),
            r1 = +outerRadius.apply(this, arguments),
            a0 = startAngle.apply(this, arguments) - halfPi$3,
            a1 = endAngle.apply(this, arguments) - halfPi$3,
            da = abs$1(a1 - a0),
            cw = a1 > a0;

        if (!context) context = buffer = path();

        // Ensure that the outer radius is always larger than the inner radius.
        if (r1 < r0) r = r1, r1 = r0, r0 = r;

        // Is it a point?
        if (!(r1 > epsilon$3)) context.moveTo(0, 0);

        // Or is it a circle or annulus?
        else if (da > tau$4 - epsilon$3) {
          context.moveTo(r1 * cos$2(a0), r1 * sin$2(a0));
          context.arc(0, 0, r1, a0, a1, !cw);
          if (r0 > epsilon$3) {
            context.moveTo(r0 * cos$2(a1), r0 * sin$2(a1));
            context.arc(0, 0, r0, a1, a0, cw);
          }
        }

        // Or is it a circular or annular sector?
        else {
          var a01 = a0,
              a11 = a1,
              a00 = a0,
              a10 = a1,
              da0 = da,
              da1 = da,
              ap = padAngle.apply(this, arguments) / 2,
              rp = (ap > epsilon$3) && (padRadius ? +padRadius.apply(this, arguments) : sqrt$2(r0 * r0 + r1 * r1)),
              rc = min$1(abs$1(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
              rc0 = rc,
              rc1 = rc,
              t0,
              t1;

          // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
          if (rp > epsilon$3) {
            var p0 = asin$1(rp / r0 * sin$2(ap)),
                p1 = asin$1(rp / r1 * sin$2(ap));
            if ((da0 -= p0 * 2) > epsilon$3) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
            else da0 = 0, a00 = a10 = (a0 + a1) / 2;
            if ((da1 -= p1 * 2) > epsilon$3) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
            else da1 = 0, a01 = a11 = (a0 + a1) / 2;
          }

          var x01 = r1 * cos$2(a01),
              y01 = r1 * sin$2(a01),
              x10 = r0 * cos$2(a10),
              y10 = r0 * sin$2(a10);

          // Apply rounded corners?
          if (rc > epsilon$3) {
            var x11 = r1 * cos$2(a11),
                y11 = r1 * sin$2(a11),
                x00 = r0 * cos$2(a00),
                y00 = r0 * sin$2(a00);

            // Restrict the corner radius according to the sector angle.
            if (da < pi$4) {
              var oc = da0 > epsilon$3 ? intersect(x01, y01, x00, y00, x11, y11, x10, y10) : [x10, y10],
                  ax = x01 - oc[0],
                  ay = y01 - oc[1],
                  bx = x11 - oc[0],
                  by = y11 - oc[1],
                  kc = 1 / sin$2(acos$1((ax * bx + ay * by) / (sqrt$2(ax * ax + ay * ay) * sqrt$2(bx * bx + by * by))) / 2),
                  lc = sqrt$2(oc[0] * oc[0] + oc[1] * oc[1]);
              rc0 = min$1(rc, (r0 - lc) / (kc - 1));
              rc1 = min$1(rc, (r1 - lc) / (kc + 1));
            }
          }

          // Is the sector collapsed to a line?
          if (!(da1 > epsilon$3)) context.moveTo(x01, y01);

          // Does the sector’s outer ring have rounded corners?
          else if (rc1 > epsilon$3) {
            t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
            t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

            context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2$1(t0.y01, t0.x01), atan2$1(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc1, atan2$1(t0.y01, t0.x01), atan2$1(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r1, atan2$1(t0.cy + t0.y11, t0.cx + t0.x11), atan2$1(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
              context.arc(t1.cx, t1.cy, rc1, atan2$1(t1.y11, t1.x11), atan2$1(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the outer ring just a circular arc?
          else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

          // Is there no inner ring, and it’s a circular sector?
          // Or perhaps it’s an annular sector collapsed due to padding?
          if (!(r0 > epsilon$3) || !(da0 > epsilon$3)) context.lineTo(x10, y10);

          // Does the sector’s inner ring (or point) have rounded corners?
          else if (rc0 > epsilon$3) {
            t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
            t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

            context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2$1(t0.y01, t0.x01), atan2$1(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc0, atan2$1(t0.y01, t0.x01), atan2$1(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r0, atan2$1(t0.cy + t0.y11, t0.cx + t0.x11), atan2$1(t1.cy + t1.y11, t1.cx + t1.x11), cw);
              context.arc(t1.cx, t1.cy, rc0, atan2$1(t1.y11, t1.x11), atan2$1(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the inner ring just a circular arc?
          else context.arc(0, 0, r0, a10, a00, cw);
        }

        context.closePath();

        if (buffer) return context = null, buffer + "" || null;
      }

      arc.centroid = function() {
        var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
            a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi$4 / 2;
        return [cos$2(a) * r, sin$2(a) * r];
      };

      arc.innerRadius = function(_) {
        return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant$a(+_), arc) : innerRadius;
      };

      arc.outerRadius = function(_) {
        return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant$a(+_), arc) : outerRadius;
      };

      arc.cornerRadius = function(_) {
        return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant$a(+_), arc) : cornerRadius;
      };

      arc.padRadius = function(_) {
        return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant$a(+_), arc) : padRadius;
      };

      arc.startAngle = function(_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$a(+_), arc) : startAngle;
      };

      arc.endAngle = function(_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$a(+_), arc) : endAngle;
      };

      arc.padAngle = function(_) {
        return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$a(+_), arc) : padAngle;
      };

      arc.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), arc) : context;
      };

      return arc;
    }

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // proceed
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x$3(p) {
      return p[0];
    }

    function y$3(p) {
      return p[1];
    }

    function line() {
      var x$$1 = x$3,
          y$$1 = y$3,
          defined = constant$a(true),
          context = null,
          curve = curveLinear,
          output = null;

      function line(data) {
        var i,
            n = data.length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x$$1(d, i, data), +y$$1(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x$$1 = typeof _ === "function" ? _ : constant$a(+_), line) : x$$1;
      };

      line.y = function(_) {
        return arguments.length ? (y$$1 = typeof _ === "function" ? _ : constant$a(+_), line) : y$$1;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant$a(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

    function area$2() {
      var x0 = x$3,
          x1 = null,
          y0 = constant$a(0),
          y1 = y$3,
          defined = constant$a(true),
          context = null,
          curve = curveLinear,
          output = null;

      function area(data) {
        var i,
            j,
            k,
            n = data.length,
            d,
            defined0 = false,
            buffer,
            x0z = new Array(n),
            y0z = new Array(n);

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) {
              j = i;
              output.areaStart();
              output.lineStart();
            } else {
              output.lineEnd();
              output.lineStart();
              for (k = i - 1; k >= j; --k) {
                output.point(x0z[k], y0z[k]);
              }
              output.lineEnd();
              output.areaEnd();
            }
          }
          if (defined0) {
            x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
            output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
          }
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      function arealine() {
        return line().defined(defined).curve(curve).context(context);
      }

      area.x = function(_) {
        return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$a(+_), x1 = null, area) : x0;
      };

      area.x0 = function(_) {
        return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$a(+_), area) : x0;
      };

      area.x1 = function(_) {
        return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$a(+_), area) : x1;
      };

      area.y = function(_) {
        return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$a(+_), y1 = null, area) : y0;
      };

      area.y0 = function(_) {
        return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$a(+_), area) : y0;
      };

      area.y1 = function(_) {
        return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$a(+_), area) : y1;
      };

      area.lineX0 =
      area.lineY0 = function() {
        return arealine().x(x0).y(y0);
      };

      area.lineY1 = function() {
        return arealine().x(x0).y(y1);
      };

      area.lineX1 = function() {
        return arealine().x(x1).y(y0);
      };

      area.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant$a(!!_), area) : defined;
      };

      area.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
      };

      area.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
      };

      return area;
    }

    var slice$6 = Array.prototype.slice;

    function point$3(that, x, y) {
      that._context.bezierCurveTo(
        that._x1 + that._k * (that._x2 - that._x0),
        that._y1 + that._k * (that._y2 - that._y0),
        that._x2 + that._k * (that._x1 - x),
        that._y2 + that._k * (that._y1 - y),
        that._x2,
        that._y2
      );
    }

    function Cardinal(context, tension) {
      this._context = context;
      this._k = (1 - tension) / 6;
    }

    Cardinal.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 = this._x2 =
        this._y0 = this._y1 = this._y2 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 2: this._context.lineTo(this._x2, this._y2); break;
          case 3: point$3(this, this._x1, this._y1); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
          case 2: this._point = 3; // proceed
          default: point$3(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var cardinal = (function custom(tension) {

      function cardinal(context) {
        return new Cardinal(context, tension);
      }

      cardinal.tension = function(tension) {
        return custom(+tension);
      };

      return cardinal;
    })(0);

    function sign$1(x) {
      return x < 0 ? -1 : 1;
    }

    // Calculate the slopes of the tangents (Hermite-type interpolation) based on
    // the following paper: Steffen, M. 1990. A Simple Method for Monotonic
    // Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
    // NOV(II), P. 443, 1990.
    function slope3(that, x2, y2) {
      var h0 = that._x1 - that._x0,
          h1 = x2 - that._x1,
          s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
          s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
          p = (s0 * h1 + s1 * h0) / (h0 + h1);
      return (sign$1(s0) + sign$1(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
    }

    // Calculate a one-sided slope.
    function slope2(that, t) {
      var h = that._x1 - that._x0;
      return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
    }

    // According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
    // "you can express cubic Hermite interpolation in terms of cubic Bézier curves
    // with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
    function point$5(that, t0, t1) {
      var x0 = that._x0,
          y0 = that._y0,
          x1 = that._x1,
          y1 = that._y1,
          dx = (x1 - x0) / 3;
      that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
    }

    function MonotoneX(context) {
      this._context = context;
    }

    MonotoneX.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 =
        this._y0 = this._y1 =
        this._t0 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 2: this._context.lineTo(this._x1, this._y1); break;
          case 3: point$5(this, this._t0, slope2(this, this._t0)); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        var t1 = NaN;

        x = +x, y = +y;
        if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; point$5(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
          default: point$5(this, this._t0, t1 = slope3(this, x, y)); break;
        }

        this._x0 = this._x1, this._x1 = x;
        this._y0 = this._y1, this._y1 = y;
        this._t0 = t1;
      }
    };

    function MonotoneY(context) {
      this._context = new ReflectContext(context);
    }

    (MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
      MonotoneX.prototype.point.call(this, y, x);
    };

    function ReflectContext(context) {
      this._context = context;
    }

    ReflectContext.prototype = {
      moveTo: function(x, y) { this._context.moveTo(y, x); },
      closePath: function() { this._context.closePath(); },
      lineTo: function(x, y) { this._context.lineTo(y, x); },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
    };

    function none$1(series, order) {
      if (!((n = series.length) > 1)) return;
      for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
        s0 = s1, s1 = series[order[i]];
        for (j = 0; j < m; ++j) {
          s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
        }
      }
    }

    function none$2(series) {
      var n = series.length, o = new Array(n);
      while (--n >= 0) o[n] = n;
      return o;
    }

    function stackValue(d, key) {
      return d[key];
    }

    function stack() {
      var keys = constant$a([]),
          order = none$2,
          offset = none$1,
          value = stackValue;

      function stack(data) {
        var kz = keys.apply(this, arguments),
            i,
            m = data.length,
            n = kz.length,
            sz = new Array(n),
            oz;

        for (i = 0; i < n; ++i) {
          for (var ki = kz[i], si = sz[i] = new Array(m), j = 0, sij; j < m; ++j) {
            si[j] = sij = [0, +value(data[j], ki, j, data)];
            sij.data = data[j];
          }
          si.key = ki;
        }

        for (i = 0, oz = order(sz); i < n; ++i) {
          sz[oz[i]].index = i;
        }

        offset(sz, oz);
        return sz;
      }

      stack.keys = function(_) {
        return arguments.length ? (keys = typeof _ === "function" ? _ : constant$a(slice$6.call(_)), stack) : keys;
      };

      stack.value = function(_) {
        return arguments.length ? (value = typeof _ === "function" ? _ : constant$a(+_), stack) : value;
      };

      stack.order = function(_) {
        return arguments.length ? (order = _ == null ? none$2 : typeof _ === "function" ? _ : constant$a(slice$6.call(_)), stack) : order;
      };

      stack.offset = function(_) {
        return arguments.length ? (offset = _ == null ? none$1 : _, stack) : offset;
      };

      return stack;
    }

    function silhouette(series, order) {
      if (!((n = series.length) > 0)) return;
      for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
        for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
        s0[j][1] += s0[j][0] = -y / 2;
      }
      none$1(series, order);
    }

    function constant$c(x) {
      return function() {
        return x;
      };
    }

    function ZoomEvent(target, type, transform) {
      this.target = target;
      this.type = type;
      this.transform = transform;
    }

    function Transform(k, x, y) {
      this.k = k;
      this.x = x;
      this.y = y;
    }

    Transform.prototype = {
      constructor: Transform,
      scale: function(k) {
        return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
      },
      translate: function(x, y) {
        return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
      },
      apply: function(point) {
        return [point[0] * this.k + this.x, point[1] * this.k + this.y];
      },
      applyX: function(x) {
        return x * this.k + this.x;
      },
      applyY: function(y) {
        return y * this.k + this.y;
      },
      invert: function(location) {
        return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
      },
      invertX: function(x) {
        return (x - this.x) / this.k;
      },
      invertY: function(y) {
        return (y - this.y) / this.k;
      },
      rescaleX: function(x) {
        return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
      },
      rescaleY: function(y) {
        return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
      },
      toString: function() {
        return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
      }
    };

    var identity$8 = new Transform(1, 0, 0);

    function nopropagation$2() {
      event.stopImmediatePropagation();
    }

    function noevent$2() {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // Ignore right-click, since that should open the context menu.
    function defaultFilter$2() {
      return !event.button;
    }

    function defaultExtent$1() {
      var e = this, w, h;
      if (e instanceof SVGElement) {
        e = e.ownerSVGElement || e;
        w = e.width.baseVal.value;
        h = e.height.baseVal.value;
      } else {
        w = e.clientWidth;
        h = e.clientHeight;
      }
      return [[0, 0], [w, h]];
    }

    function defaultTransform() {
      return this.__zoom || identity$8;
    }

    function defaultWheelDelta() {
      return -event.deltaY * (event.deltaMode ? 120 : 1) / 500;
    }

    function defaultTouchable$1() {
      return "ontouchstart" in this;
    }

    function defaultConstrain(transform, extent, translateExtent) {
      var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
          dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
          dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
          dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
      return transform.translate(
        dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
        dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
      );
    }

    function zoom() {
      var filter = defaultFilter$2,
          extent = defaultExtent$1,
          constrain = defaultConstrain,
          wheelDelta = defaultWheelDelta,
          touchable = defaultTouchable$1,
          scaleExtent = [0, Infinity],
          translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
          duration = 250,
          interpolate = interpolateZoom,
          gestures = [],
          listeners = dispatch("start", "zoom", "end"),
          touchstarting,
          touchending,
          touchDelay = 500,
          wheelDelay = 150,
          clickDistance2 = 0;

      function zoom(selection$$1) {
        selection$$1
            .property("__zoom", defaultTransform)
            .on("wheel.zoom", wheeled)
            .on("mousedown.zoom", mousedowned)
            .on("dblclick.zoom", dblclicked)
          .filter(touchable)
            .on("touchstart.zoom", touchstarted)
            .on("touchmove.zoom", touchmoved)
            .on("touchend.zoom touchcancel.zoom", touchended)
            .style("touch-action", "none")
            .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
      }

      zoom.transform = function(collection, transform) {
        var selection$$1 = collection.selection ? collection.selection() : collection;
        selection$$1.property("__zoom", defaultTransform);
        if (collection !== selection$$1) {
          schedule(collection, transform);
        } else {
          selection$$1.interrupt().each(function() {
            gesture(this, arguments)
                .start()
                .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
                .end();
          });
        }
      };

      zoom.scaleBy = function(selection$$1, k) {
        zoom.scaleTo(selection$$1, function() {
          var k0 = this.__zoom.k,
              k1 = typeof k === "function" ? k.apply(this, arguments) : k;
          return k0 * k1;
        });
      };

      zoom.scaleTo = function(selection$$1, k) {
        zoom.transform(selection$$1, function() {
          var e = extent.apply(this, arguments),
              t0 = this.__zoom,
              p0 = centroid(e),
              p1 = t0.invert(p0),
              k1 = typeof k === "function" ? k.apply(this, arguments) : k;
          return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
        });
      };

      zoom.translateBy = function(selection$$1, x, y) {
        zoom.transform(selection$$1, function() {
          return constrain(this.__zoom.translate(
            typeof x === "function" ? x.apply(this, arguments) : x,
            typeof y === "function" ? y.apply(this, arguments) : y
          ), extent.apply(this, arguments), translateExtent);
        });
      };

      zoom.translateTo = function(selection$$1, x, y) {
        zoom.transform(selection$$1, function() {
          var e = extent.apply(this, arguments),
              t = this.__zoom,
              p = centroid(e);
          return constrain(identity$8.translate(p[0], p[1]).scale(t.k).translate(
            typeof x === "function" ? -x.apply(this, arguments) : -x,
            typeof y === "function" ? -y.apply(this, arguments) : -y
          ), e, translateExtent);
        });
      };

      function scale(transform, k) {
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
        return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
      }

      function translate(transform, p0, p1) {
        var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
        return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
      }

      function centroid(extent) {
        return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
      }

      function schedule(transition$$1, transform, center) {
        transition$$1
            .on("start.zoom", function() { gesture(this, arguments).start(); })
            .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).end(); })
            .tween("zoom", function() {
              var that = this,
                  args = arguments,
                  g = gesture(that, args),
                  e = extent.apply(that, args),
                  p = center || centroid(e),
                  w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
                  a = that.__zoom,
                  b = typeof transform === "function" ? transform.apply(that, args) : transform,
                  i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
              return function(t) {
                if (t === 1) t = b; // Avoid rounding error on end.
                else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
                g.zoom(null, t);
              };
            });
      }

      function gesture(that, args) {
        for (var i = 0, n = gestures.length, g; i < n; ++i) {
          if ((g = gestures[i]).that === that) {
            return g;
          }
        }
        return new Gesture(that, args);
      }

      function Gesture(that, args) {
        this.that = that;
        this.args = args;
        this.index = -1;
        this.active = 0;
        this.extent = extent.apply(that, args);
      }

      Gesture.prototype = {
        start: function() {
          if (++this.active === 1) {
            this.index = gestures.push(this) - 1;
            this.emit("start");
          }
          return this;
        },
        zoom: function(key, transform) {
          if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
          if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
          if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
          this.that.__zoom = transform;
          this.emit("zoom");
          return this;
        },
        end: function() {
          if (--this.active === 0) {
            gestures.splice(this.index, 1);
            this.index = -1;
            this.emit("end");
          }
          return this;
        },
        emit: function(type) {
          customEvent(new ZoomEvent(zoom, type, this.that.__zoom), listeners.apply, listeners, [type, this.that, this.args]);
        }
      };

      function wheeled() {
        if (!filter.apply(this, arguments)) return;
        var g = gesture(this, arguments),
            t = this.__zoom,
            k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
            p = mouse(this);

        // If the mouse is in the same location as before, reuse it.
        // If there were recent wheel events, reset the wheel idle timeout.
        if (g.wheel) {
          if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
            g.mouse[1] = t.invert(g.mouse[0] = p);
          }
          clearTimeout(g.wheel);
        }

        // If this wheel event won’t trigger a transform change, ignore it.
        else if (t.k === k) return;

        // Otherwise, capture the mouse point and location at the start.
        else {
          g.mouse = [p, t.invert(p)];
          interrupt(this);
          g.start();
        }

        noevent$2();
        g.wheel = setTimeout(wheelidled, wheelDelay);
        g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

        function wheelidled() {
          g.wheel = null;
          g.end();
        }
      }

      function mousedowned() {
        if (touchending || !filter.apply(this, arguments)) return;
        var g = gesture(this, arguments),
            v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
            p = mouse(this),
            x0 = event.clientX,
            y0 = event.clientY;

        dragDisable(event.view);
        nopropagation$2();
        g.mouse = [p, this.__zoom.invert(p)];
        interrupt(this);
        g.start();

        function mousemoved() {
          noevent$2();
          if (!g.moved) {
            var dx = event.clientX - x0, dy = event.clientY - y0;
            g.moved = dx * dx + dy * dy > clickDistance2;
          }
          g.zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = mouse(g.that), g.mouse[1]), g.extent, translateExtent));
        }

        function mouseupped() {
          v.on("mousemove.zoom mouseup.zoom", null);
          yesdrag(event.view, g.moved);
          noevent$2();
          g.end();
        }
      }

      function dblclicked() {
        if (!filter.apply(this, arguments)) return;
        var t0 = this.__zoom,
            p0 = mouse(this),
            p1 = t0.invert(p0),
            k1 = t0.k * (event.shiftKey ? 0.5 : 2),
            t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, arguments), translateExtent);

        noevent$2();
        if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0);
        else select(this).call(zoom.transform, t1);
      }

      function touchstarted() {
        if (!filter.apply(this, arguments)) return;
        var g = gesture(this, arguments),
            touches$$1 = event.changedTouches,
            started,
            n = touches$$1.length, i, t, p;

        nopropagation$2();
        for (i = 0; i < n; ++i) {
          t = touches$$1[i], p = touch(this, touches$$1, t.identifier);
          p = [p, this.__zoom.invert(p), t.identifier];
          if (!g.touch0) g.touch0 = p, started = true;
          else if (!g.touch1) g.touch1 = p;
        }

        // If this is a dbltap, reroute to the (optional) dblclick.zoom handler.
        if (touchstarting) {
          touchstarting = clearTimeout(touchstarting);
          if (!g.touch1) {
            g.end();
            p = select(this).on("dblclick.zoom");
            if (p) p.apply(this, arguments);
            return;
          }
        }

        if (started) {
          touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
          interrupt(this);
          g.start();
        }
      }

      function touchmoved() {
        var g = gesture(this, arguments),
            touches$$1 = event.changedTouches,
            n = touches$$1.length, i, t, p, l;

        noevent$2();
        if (touchstarting) touchstarting = clearTimeout(touchstarting);
        for (i = 0; i < n; ++i) {
          t = touches$$1[i], p = touch(this, touches$$1, t.identifier);
          if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
          else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
        }
        t = g.that.__zoom;
        if (g.touch1) {
          var p0 = g.touch0[0], l0 = g.touch0[1],
              p1 = g.touch1[0], l1 = g.touch1[1],
              dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
              dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
          t = scale(t, Math.sqrt(dp / dl));
          p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
          l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
        }
        else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
        else return;
        g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
      }

      function touchended() {
        var g = gesture(this, arguments),
            touches$$1 = event.changedTouches,
            n = touches$$1.length, i, t;

        nopropagation$2();
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, touchDelay);
        for (i = 0; i < n; ++i) {
          t = touches$$1[i];
          if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
          else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
        }
        if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
        if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
        else g.end();
      }

      zoom.wheelDelta = function(_) {
        return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant$c(+_), zoom) : wheelDelta;
      };

      zoom.filter = function(_) {
        return arguments.length ? (filter = typeof _ === "function" ? _ : constant$c(!!_), zoom) : filter;
      };

      zoom.touchable = function(_) {
        return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$c(!!_), zoom) : touchable;
      };

      zoom.extent = function(_) {
        return arguments.length ? (extent = typeof _ === "function" ? _ : constant$c([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
      };

      zoom.scaleExtent = function(_) {
        return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
      };

      zoom.translateExtent = function(_) {
        return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
      };

      zoom.constrain = function(_) {
        return arguments.length ? (constrain = _, zoom) : constrain;
      };

      zoom.duration = function(_) {
        return arguments.length ? (duration = +_, zoom) : duration;
      };

      zoom.interpolate = function(_) {
        return arguments.length ? (interpolate = _, zoom) : interpolate;
      };

      zoom.on = function() {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? zoom : value;
      };

      zoom.clickDistance = function(_) {
        return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
      };

      return zoom;
    }

    function createStreams(raw) {
        raw.forEach(function (stream) {
            if (!stream.processed) {
                stream.stream = transpose(stream.stream);
                stream.processed = true;
            }
        });
        return raw;
    }
    function createConditionalStreams(raw) {
        return raw.map(function (streams) { return createStreams(streams); });
    }
    function isConditionalStreams(streams) {
        return Array.isArray(streams[0]);
    }
    var DataSet = /** @class */ (function () {
        function DataSet(raw) {
            var data = raw.data, target = raw.target, hists = raw.hists, name = raw.name, ratios = raw.ratios;
            this.data = data.map(function (d) { return new Float32Array(d); });
            this.target = new Int32Array(target);
            this.hists = hists;
            this.name = name;
            this.ratios = ratios;
            // this.discretizers = discretizers;
            // this.categoryInterval = this.categoryInterval.bind(this);
            // this.categoryDescription = this.categoryDescription.bind(this);
            // this.categoryHistRange = this.categoryHistRange.bind(this);
            // this.interval2HistRange = this.interval2HistRange.bind(this);
            // this.categorical = categorical;
        }
        return DataSet;
    }());
    var Matrix = /** @class */ (function () {
        function Matrix(size1, size2) {
            this.data = new Float32Array(size1 * size2);
        }
        return Matrix;
    }());
    function isSupportMat(support) {
        return Array.isArray(support[0][0]);
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    // export type DType = 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';
    // export interface Array2D<T extends Vector> {
    //   size: number;
    //   shape: [number, number];
    //   dtype: DType;
    //   data: T;
    // }
    // export class Matrix<T extends Vector> implements Array2D<T> {
    //   public size: number;
    //   public shape: [number, number];
    //   public dtype: DType;
    //   public data: T;
    //   public get(i: number, j: number) {
    //     return this.data[i * this.shape[0] + j];
    //   }
    //   public set(i: number, j: number, v: number) {
    //     this.data[i * this.shape[0] + j] = v;
    //   }
    // }
    function isMat(a) {
        if (a.length)
            return Array.isArray(a[0]);
        return false;
    }
    function muls(a, b, copy) {
        if (copy === void 0) { copy = true; }
        var ret = copy ? a.slice() : a;
        for (var i = 0; i < ret.length; ++i)
            ret[i] *= b;
        return ret;
    }
    function add$2(a, b, copy) {
        if (copy === void 0) { copy = true; }
        if (a.length !== b.length) {
            throw 'Length of a and b must be equal!';
        }
        var ret = copy ? a.slice() : a;
        for (var i = 0; i < ret.length; ++i)
            ret[i] += b[i];
        return ret;
    }
    function minus(a, b, copy) {
        if (copy === void 0) { copy = true; }
        if (a.length !== b.length) {
            throw 'Length of a and b must be equal!';
        }
        var ret = copy ? a.slice() : a;
        for (var i = 0; i < ret.length; ++i)
            ret[i] -= b[i];
        return ret;
    }
    function addMat(a, b, copy) {
        if (copy === void 0) { copy = true; }
        if (a.length !== b.length) {
            throw 'Length of a and b must be equal!';
        }
        var ret = copy ? a.map(function (_a) { return _a.slice(); }) : a;
        for (var i = 0; i < ret.length; ++i)
            add$2(ret[i], b[i], false);
        return ret;
    }
    function sum$3(arr) {
        var _sum = 0;
        for (var i = 0; i < arr.length; ++i) {
            _sum += arr[i];
        }
        return _sum;
    }
    function cumsum(a) {
        // if (a instanceof nj.NdArray)
        var arr = a.slice();
        for (var i = 1; i < arr.length; ++i) {
            arr[i] += arr[i - 1];
        }
        return arr;
    }
    function stack$1(arrs) {
        var ret = arrs.map(function (arr) { return arr.slice(); });
        for (var i = 1; i < ret.length; i++) {
            add$2(ret[i], ret[i - 1], false);
        }
        return ret;
    }
    function sumVec(arrs) {
        // if (arrs.length === 0) return ;
        var _sum = arrs[0].slice();
        for (var i = 1; i < arrs.length; ++i) {
            add$2(_sum, arrs[i], false);
        }
        return _sum;
    }
    function sumMat(arrs) {
        var _sum = arrs[0].map(function (arr) { return arr.slice(); });
        for (var i = 1; i < arrs.length; ++i) {
            addMat(_sum, arrs[i], false);
        }
        return _sum;
    }
    function argMax(arr) {
        if (arr.length === 0)
            return -1;
        var maxIdx = 0;
        for (var i = 1; i < arr.length; i++) {
            if (arr[maxIdx] < arr[i])
                maxIdx = i;
        }
        return maxIdx;
    }
    // export function 
    // export function sum<T = number>(a: nj.NdArrayLike<T>, axis?: number): nj.NdArray<T> {
    //   // if (axis === undefined) return _sum(a);
    //   const dim = axis ? axis : 0;
    //   const arr = nj.array<T>(a);
    //   const ret = nj.zeros<T>([...(arr.shape.slice(0, dim)), ...(arr.shape.slice(dim + 1))], arr.dtype);
    //   const nulls = arr.shape.map(() => null);
    //   const starts  = nulls.slice(0, dim);
    //   const ends = nulls.slice(dim + 1, 0);
    //   for (let i = 0; i < arr.shape[dim]; i++) {
    //     ret.add(arr.pick(...starts, i, ...ends), false);
    //   }
    //   return ret;
    // }

    var nBins = 20;

    function isRuleGroup$$1(rule) {
        return rule.rules !== undefined;
    }
    function isRuleModel$$1(model) {
        return model.type === 'rule';
    }
    function toString(n, precision) {
        if (precision === void 0) { precision = 1; }
        var bit = Math.floor(Math.log10(n));
        if (bit < -precision - 1)
            return n.toExponential(precision);
        if (bit < precision)
            return n.toFixed(precision - bit);
        if (bit < precision + 3)
            return n.toFixed(0);
        return n.toPrecision(precision + 1);
    }
    var RuleList$$1 = /** @class */ (function () {
        function RuleList$$1(raw) {
            var type = raw.type, name = raw.name, nFeatures = raw.nFeatures, nClasses = raw.nClasses, meta = raw.meta, rules = raw.rules, supports = raw.supports, discretizers = raw.discretizers;
            this.type = type;
            this.name = name;
            this.nFeatures = nFeatures;
            this.nClasses = nClasses;
            this.meta = meta;
            this.rules = rules;
            this.supports = supports;
            this.discretizers = discretizers;
            this.rules.forEach(function (r, i) {
                r._support = isMat(r.support) ? r.support.map(function (s) { return sum$3(s); }) : r.support;
            });
            this.maxSupport = max(supports, sum$3) || 0.1;
            // this.minSupport = 0.01;
            this.useSupportMat = false;
            // if (target) this.target = target;
            // bind this
            this.categoryInterval = this.categoryInterval.bind(this);
            this.categoryDescription = this.categoryDescription.bind(this);
            this.categoryHistRange = this.categoryHistRange.bind(this);
            this.interval2HistRange = this.interval2HistRange.bind(this);
        }
        RuleList$$1.prototype.support = function (newSupport) {
            if (newSupport.length !== this.rules.length) {
                throw "Shape not match! newSupport has length " + newSupport.length + ", but " + this.rules.length + " is expected";
            }
            if (isSupportMat(newSupport)) {
                this.supportMats = newSupport;
                this.rules.forEach(function (r, i) { return (r.support = newSupport[i]); });
                this.useSupportMat = true;
                this.maxSupport = max(newSupport, function (mat) { return sum$3(sumVec(mat)); }) || 0.1;
            }
            else {
                this.supports = newSupport;
                this.useSupportMat = false;
                this.maxSupport = max(newSupport, sum$3) || 0.1;
            }
            this.rules.forEach(function (r, i) {
                var support = newSupport[i];
                r.support = support;
                if (isMat(support)) {
                    r._support = support.map(function (s) { return sum$3(s); });
                }
                else {
                    r._support = support;
                }
                r.totalSupport = sum$3(r._support);
            });
            // console.log('Support changed'); // tslint:disable-line
            return this;
        };
        RuleList$$1.prototype.getSupport = function () {
            return this.supports;
        };
        RuleList$$1.prototype.predict = function (data) {
            if (data.length !== this.meta.featureNames.length) {
                console.warn('The input data does not has the same length as the featureNames!');
            }
            var rules = this.rules;
            var discretizers = this.discretizers;
            for (var i = 0; i < rules.length; i++) {
                var conditions = rules[i].conditions;
                var flags = conditions.map(function (_a) {
                    var feature = _a.feature, category = _a.category;
                    var intervals = discretizers[feature].intervals;
                    if (intervals) {
                        var interval = intervals[category];
                        var low = interval[0] || -Infinity;
                        var high = interval[1] || Infinity;
                        return low < data[feature] && data[feature] < high;
                    }
                    return data[feature] === category;
                });
                if (flags.every(function (f) { return f; }))
                    return i;
            }
            return rules.length - 1;
        };
        RuleList$$1.prototype.getRules = function () {
            return this.rules;
        };
        RuleList$$1.prototype.categoryInterval = function (f, c) {
            if (f < 0 || c < 0)
                return [0, 0];
            var ranges = this.meta.ranges;
            var intervals = this.discretizers[f].intervals;
            if (intervals) {
                var _a = __read(intervals[c], 2), r0 = _a[0], r1 = _a[1];
                return [r0 === null ? ranges[f][0] : r0, r1 === null ? ranges[f][1] : r1];
            }
            return [c - 0.5, c + 0.5];
        };
        RuleList$$1.prototype.categoryMathDesc = function (f, c) {
            if (f < 0 || c < 0)
                return 'default';
            var intervals = this.discretizers[f].intervals;
            if (intervals) {
                // console.log(c); // tslint:disable-line
                var _a = __read(intervals[c], 2), r0 = _a[0], r1 = _a[1];
                return (r0 === null ? '(∞' : "[" + toString(r0)) + "," + (r1 === null ? '∞' : toString(r1)) + ")";
            }
            var categories = this.meta.categories[f];
            return categories ? categories[c] : 'error!';
        };
        RuleList$$1.prototype.categoryDescription = function (f, c, abr, maxLength) {
            if (abr === void 0) { abr = false; }
            if (maxLength === void 0) { maxLength = 20; }
            if (f < 0 || c < 0)
                return '';
            var _a = this.meta, featureNames = _a.featureNames, categories = _a.categories;
            var cutSize = Math.round((maxLength - 2) / 2);
            var featureName = featureNames[f];
            var intervals = this.discretizers[f].intervals;
            var category = intervals ? intervals[c] : c;
            var featureMap = function (feature) { return feature + " is any"; };
            if (typeof category === 'number' && categories) {
                featureMap = function (feature) { return feature + " = " + categories[f][c]; };
            }
            else {
                var low = category[0];
                var high = category[1];
                if (low === null && high === null)
                    featureMap = function (feature) { return feature + " is any"; };
                else {
                    var lowString_1 = low !== null ? low.toPrecision(3) + " < " : '';
                    var highString_1 = high !== null ? " < " + high.toPrecision(3) : '';
                    featureMap = function (feature) { return lowString_1 + feature + highString_1; };
                }
            }
            if (abr) {
                var abrString = featureName.length > maxLength
                    ? "\"" + featureName.substr(0, cutSize) + "\u2026" + featureName.substr(-cutSize, cutSize) + "\""
                    : featureName;
                return featureMap(abrString);
            }
            return featureMap(featureName);
        };
        RuleList$$1.prototype.categoryHistRange = function (f, c) {
            if (this.meta.isCategorical[f])
                return [c - 0.5, c + 0.5];
            return this.interval2HistRange(f, this.categoryInterval(f, c));
        };
        RuleList$$1.prototype.interval2HistRange = function (f, interval) {
            if (this.meta.isCategorical[f])
                console.warn("categorical feature " + f + " cannot call this function!");
            var range = this.meta.ranges[f];
            var i0 = interval[0] || range[0];
            var i1 = interval[1] || range[1];
            var step$$1 = (range[1] - range[0]) / nBins;
            return [(i0 - range[0]) / step$$1, (i1 - range[0]) / step$$1];
        };
        return RuleList$$1;
    }());

    /**
     * A function that group an array of rules to a single RuleGroup.
     * The input rules can contain RuleGroup, which will be handled properly.
     * @export
     * @param {Rule[]} rules
     * @returns {(Rule | RuleGroup)}
     */
    function groupRules(rules) {
        if (rules.length === 0)
            throw 'The length of the rules to be grouped should be at least 1';
        if (rules.length === 1) {
            var _ret = __assign({}, (rules[0]), { rules: rules });
            _ret.rules[0].parent = _ret;
            return _ret;
        }
        var nested = [];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (isRuleGroup$$1(rule)) {
                nested = nested.concat(rule.rules);
            }
            else {
                nested.push(rule);
            }
        }
        var supports = nested.map(function (rule) { return rule.support; });
        var support;
        var supportSums;
        var _support;
        // let fidelity: number;
        if (Array.isArray(supports[0][0])) {
            support = sumMat(supports);
            supportSums = supports.map(function (s) { return sum$3(sumVec(s)); });
            // _support = nt.sumVec(support);
            _support = support.map(function (s) { return sum$3(s); });
        }
        else {
            support = sumVec(supports);
            supportSums = supports.map(function (s) { return sum$3(s); });
            _support = support;
        }
        var totalSupport = sum$3(supportSums);
        var cover = sum$3(rules.map(function (r) { return r.cover; }));
        var output = sumVec(nested.map(function (r) { return muls(r.output, r.cover / cover); }));
        var label = argMax(output);
        var conditions = [];
        rules.forEach(function (r, i) {
            var conds = r.conditions.map(function (c) { return (__assign({}, c, { rank: i })); });
            conditions.push.apply(conditions, __spread(conds));
        });
        var ret = { rules: rules, support: support, _support: _support, output: output, label: label, totalSupport: totalSupport, conditions: conditions, idx: rules[0].idx, cover: cover };
        rules.forEach(function (r) { return r.parent = ret; });
        return ret;
    }
    /**
     * Filter unsatisfied rules.
     * The filter function will be called for each rule.
     * If `filter` return false, then the rule will be grouped.
     * Multiple false rules will be grouped together.
     *
     * @export
     * @param {Rule[]} rules
     * @param {(rule: Rule, i?: number, rules?: Rule[]) => boolean} filter
     * @returns {Rule[]}
     */
    function groupRulesBy(rules, filter) {
        var retRules = new Array();
        // let prevSum = 0.;
        var tmpRules = [];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (filter(rule, i, rules)) {
                if (tmpRules.length > 0) {
                    retRules.push(groupRules(tmpRules));
                    tmpRules = [];
                    // prevSum = 0.;
                }
                retRules.push(rule);
            }
            else {
                tmpRules.push(rule);
                // prevSum += rule.totalSupport;
            }
        }
        if (tmpRules.length) {
            retRules.push(groupRules(tmpRules));
        }
        return retRules;
    }
    function groupBySupport(rules, minSupport) {
        // const retRules: Rule[] = new Array();
        if (minSupport === void 0) { minSupport = 0.01; }
        // // let prevSum = 0.;
        // let tmpRules: Rule[] = [];
        // for (let i = 0; i < rules.length; i++) {
        //   const rule = rules[i];
        //   if (rule.totalSupport >= minSupport) {
        //     if (tmpRules.length > 0) {
        //       retRules.push(groupRules(tmpRules));
        //       tmpRules = [];
        //       // prevSum = 0.;
        //     }
        //     retRules.push(rule);
        //   } else {
        //     tmpRules.push(rule);
        //     // prevSum += rule.totalSupport;
        //   }
        // }
        // if (tmpRules.length) {
        //   retRules.push(groupRules(tmpRules));
        // }
        // return retRules;
        return groupRulesBy(rules, function (rule) { return rule.totalSupport >= minSupport; });
    }
    // export function groupBy

    function rankRuleFeatures(rules, nFeatures) {
        var featureImportance = new Array(nFeatures).fill(0);
        rules.forEach(function (r) {
            r.conditions.forEach(function (c) {
                featureImportance[c.feature] += r.cover;
            });
        });
        var features = sequence(nFeatures);
        features.sort(function (i, j) { return featureImportance[j] - featureImportance[i]; });
        return features;
    }
    function rankModelFeatures(model) {
        if (isRuleModel$$1(model))
            return rankRuleFeatures(model.rules, model.nFeatures);
        else {
            console.warn('Not Implemented!');
            return sequence(model.nFeatures);
        }
    }

    function colors$1(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    }

    colors$1("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

    colors$1("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

    colors$1("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

    colors$1("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

    colors$1("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

    colors$1("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

    var Set1 = colors$1("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

    colors$1("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

    colors$1("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

    function ramp$1(scheme) {
      return rgbBasis(scheme[scheme.length - 1]);
    }

    var scheme = new Array(3).concat(
      "d8b365f5f5f55ab4ac",
      "a6611adfc27d80cdc1018571",
      "a6611adfc27df5f5f580cdc1018571",
      "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
      "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
      "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
      "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
      "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
      "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
    ).map(colors$1);

    ramp$1(scheme);

    var scheme$1 = new Array(3).concat(
      "af8dc3f7f7f77fbf7b",
      "7b3294c2a5cfa6dba0008837",
      "7b3294c2a5cff7f7f7a6dba0008837",
      "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
      "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
      "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
      "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
      "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
      "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
    ).map(colors$1);

    ramp$1(scheme$1);

    var scheme$2 = new Array(3).concat(
      "e9a3c9f7f7f7a1d76a",
      "d01c8bf1b6dab8e1864dac26",
      "d01c8bf1b6daf7f7f7b8e1864dac26",
      "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
      "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
      "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
      "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
      "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
      "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
    ).map(colors$1);

    ramp$1(scheme$2);

    var scheme$3 = new Array(3).concat(
      "998ec3f7f7f7f1a340",
      "5e3c99b2abd2fdb863e66101",
      "5e3c99b2abd2f7f7f7fdb863e66101",
      "542788998ec3d8daebfee0b6f1a340b35806",
      "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
      "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
      "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
      "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
      "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
    ).map(colors$1);

    ramp$1(scheme$3);

    var scheme$4 = new Array(3).concat(
      "ef8a62f7f7f767a9cf",
      "ca0020f4a58292c5de0571b0",
      "ca0020f4a582f7f7f792c5de0571b0",
      "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
      "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
      "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
      "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
      "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
      "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
    ).map(colors$1);

    ramp$1(scheme$4);

    var scheme$5 = new Array(3).concat(
      "ef8a62ffffff999999",
      "ca0020f4a582bababa404040",
      "ca0020f4a582ffffffbababa404040",
      "b2182bef8a62fddbc7e0e0e09999994d4d4d",
      "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
      "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
      "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
      "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
      "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
    ).map(colors$1);

    ramp$1(scheme$5);

    var scheme$6 = new Array(3).concat(
      "fc8d59ffffbf91bfdb",
      "d7191cfdae61abd9e92c7bb6",
      "d7191cfdae61ffffbfabd9e92c7bb6",
      "d73027fc8d59fee090e0f3f891bfdb4575b4",
      "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
      "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
      "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
      "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
      "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
    ).map(colors$1);

    ramp$1(scheme$6);

    var scheme$7 = new Array(3).concat(
      "fc8d59ffffbf91cf60",
      "d7191cfdae61a6d96a1a9641",
      "d7191cfdae61ffffbfa6d96a1a9641",
      "d73027fc8d59fee08bd9ef8b91cf601a9850",
      "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
      "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
      "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
      "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
      "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
    ).map(colors$1);

    ramp$1(scheme$7);

    var scheme$8 = new Array(3).concat(
      "fc8d59ffffbf99d594",
      "d7191cfdae61abdda42b83ba",
      "d7191cfdae61ffffbfabdda42b83ba",
      "d53e4ffc8d59fee08be6f59899d5943288bd",
      "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
      "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
      "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
      "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
      "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
    ).map(colors$1);

    ramp$1(scheme$8);

    var scheme$9 = new Array(3).concat(
      "e5f5f999d8c92ca25f",
      "edf8fbb2e2e266c2a4238b45",
      "edf8fbb2e2e266c2a42ca25f006d2c",
      "edf8fbccece699d8c966c2a42ca25f006d2c",
      "edf8fbccece699d8c966c2a441ae76238b45005824",
      "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
      "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
    ).map(colors$1);

    ramp$1(scheme$9);

    var scheme$a = new Array(3).concat(
      "e0ecf49ebcda8856a7",
      "edf8fbb3cde38c96c688419d",
      "edf8fbb3cde38c96c68856a7810f7c",
      "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
      "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
      "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
      "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
    ).map(colors$1);

    ramp$1(scheme$a);

    var scheme$b = new Array(3).concat(
      "e0f3dba8ddb543a2ca",
      "f0f9e8bae4bc7bccc42b8cbe",
      "f0f9e8bae4bc7bccc443a2ca0868ac",
      "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
      "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
      "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
      "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
    ).map(colors$1);

    ramp$1(scheme$b);

    var scheme$c = new Array(3).concat(
      "fee8c8fdbb84e34a33",
      "fef0d9fdcc8afc8d59d7301f",
      "fef0d9fdcc8afc8d59e34a33b30000",
      "fef0d9fdd49efdbb84fc8d59e34a33b30000",
      "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
      "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
      "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
    ).map(colors$1);

    ramp$1(scheme$c);

    var scheme$d = new Array(3).concat(
      "ece2f0a6bddb1c9099",
      "f6eff7bdc9e167a9cf02818a",
      "f6eff7bdc9e167a9cf1c9099016c59",
      "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
      "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
      "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
      "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
    ).map(colors$1);

    ramp$1(scheme$d);

    var scheme$e = new Array(3).concat(
      "ece7f2a6bddb2b8cbe",
      "f1eef6bdc9e174a9cf0570b0",
      "f1eef6bdc9e174a9cf2b8cbe045a8d",
      "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
      "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
      "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
      "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
    ).map(colors$1);

    ramp$1(scheme$e);

    var scheme$f = new Array(3).concat(
      "e7e1efc994c7dd1c77",
      "f1eef6d7b5d8df65b0ce1256",
      "f1eef6d7b5d8df65b0dd1c77980043",
      "f1eef6d4b9dac994c7df65b0dd1c77980043",
      "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
      "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
      "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
    ).map(colors$1);

    ramp$1(scheme$f);

    var scheme$g = new Array(3).concat(
      "fde0ddfa9fb5c51b8a",
      "feebe2fbb4b9f768a1ae017e",
      "feebe2fbb4b9f768a1c51b8a7a0177",
      "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
      "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
      "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
      "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
    ).map(colors$1);

    ramp$1(scheme$g);

    var scheme$h = new Array(3).concat(
      "edf8b17fcdbb2c7fb8",
      "ffffcca1dab441b6c4225ea8",
      "ffffcca1dab441b6c42c7fb8253494",
      "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
      "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
      "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
      "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
    ).map(colors$1);

    ramp$1(scheme$h);

    var scheme$i = new Array(3).concat(
      "f7fcb9addd8e31a354",
      "ffffccc2e69978c679238443",
      "ffffccc2e69978c67931a354006837",
      "ffffccd9f0a3addd8e78c67931a354006837",
      "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
      "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
      "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
    ).map(colors$1);

    ramp$1(scheme$i);

    var scheme$j = new Array(3).concat(
      "fff7bcfec44fd95f0e",
      "ffffd4fed98efe9929cc4c02",
      "ffffd4fed98efe9929d95f0e993404",
      "ffffd4fee391fec44ffe9929d95f0e993404",
      "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
      "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
      "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
    ).map(colors$1);

    ramp$1(scheme$j);

    var scheme$k = new Array(3).concat(
      "ffeda0feb24cf03b20",
      "ffffb2fecc5cfd8d3ce31a1c",
      "ffffb2fecc5cfd8d3cf03b20bd0026",
      "ffffb2fed976feb24cfd8d3cf03b20bd0026",
      "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
      "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
      "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
    ).map(colors$1);

    ramp$1(scheme$k);

    var scheme$l = new Array(3).concat(
      "deebf79ecae13182bd",
      "eff3ffbdd7e76baed62171b5",
      "eff3ffbdd7e76baed63182bd08519c",
      "eff3ffc6dbef9ecae16baed63182bd08519c",
      "eff3ffc6dbef9ecae16baed64292c62171b5084594",
      "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
      "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
    ).map(colors$1);

    ramp$1(scheme$l);

    var scheme$m = new Array(3).concat(
      "e5f5e0a1d99b31a354",
      "edf8e9bae4b374c476238b45",
      "edf8e9bae4b374c47631a354006d2c",
      "edf8e9c7e9c0a1d99b74c47631a354006d2c",
      "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
      "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
      "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
    ).map(colors$1);

    ramp$1(scheme$m);

    var scheme$n = new Array(3).concat(
      "f0f0f0bdbdbd636363",
      "f7f7f7cccccc969696525252",
      "f7f7f7cccccc969696636363252525",
      "f7f7f7d9d9d9bdbdbd969696636363252525",
      "f7f7f7d9d9d9bdbdbd969696737373525252252525",
      "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
      "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
    ).map(colors$1);

    ramp$1(scheme$n);

    var scheme$o = new Array(3).concat(
      "efedf5bcbddc756bb1",
      "f2f0f7cbc9e29e9ac86a51a3",
      "f2f0f7cbc9e29e9ac8756bb154278f",
      "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
      "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
      "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
      "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
    ).map(colors$1);

    ramp$1(scheme$o);

    var scheme$p = new Array(3).concat(
      "fee0d2fc9272de2d26",
      "fee5d9fcae91fb6a4acb181d",
      "fee5d9fcae91fb6a4ade2d26a50f15",
      "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
      "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
      "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
      "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
    ).map(colors$1);

    ramp$1(scheme$p);

    var scheme$q = new Array(3).concat(
      "fee6cefdae6be6550d",
      "feeddefdbe85fd8d3cd94701",
      "feeddefdbe85fd8d3ce6550da63603",
      "feeddefdd0a2fdae6bfd8d3ce6550da63603",
      "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
      "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
      "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
    ).map(colors$1);

    ramp$1(scheme$q);

    cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

    var warm$1 = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var cool$1 = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var c$1 = cubehelix();

    var c$2 = rgb(),
        pi_1_3 = Math.PI / 3,
        pi_2_3 = Math.PI * 2 / 3;

    function ramp$2(range) {
      var n = range.length;
      return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
      };
    }

    ramp$2(colors$1("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

    var magma$1 = ramp$2(colors$1("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

    var inferno$1 = ramp$2(colors$1("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

    var plasma$1 = ramp$2(colors$1("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

    var gColor = [
        '#3366cc',
        '#ff9900',
        '#109618',
        '#990099',
        '#dc3912',
        '#0099c6',
        '#dd4477',
        '#66aa00',
        '#b82e2e',
        '#316395',
        '#994499',
        '#22aa99',
        '#aaaa11',
        '#6633cc',
        '#e67300',
        '#8b0707',
        '#651067',
        '#329262',
        '#5574a6',
        '#3b3eac'
    ];
    var googleColor = function (n) { return gColor[n % gColor.length]; };
    var defaultColor = ordinal(Set1);
    // export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
    // export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory20 as string[]);
    var labelColor = googleColor;
    var sequentialColors = function (n) {
        return (ordinal(scheme$l[n]));
    };
    var divergingColors = function (n) {
        return (ordinal(scheme$4[n]));
    };
    var defaultDuration = 400;

    function checkBins(hists) {
        var nBins = hists[0].length;
        var equalBins = true;
        for (var i = 0; i < hists.length; ++i) {
            if (nBins !== hists[i].length)
                equalBins = false;
        }
        if (!equalBins) {
            console.warn('Hists not having the same number of bins!');
            hists.forEach(function (h) { return (nBins = Math.max(nBins, h.length)); });
        }
        return { nBins: nBins, equalBins: equalBins };
    }
    function brush$2(range, bars, x) {
        bars.classed('hp-hist-active', function (d, i) {
            var pos = x(d, i);
            return range[0] <= pos && pos < range[1];
        });
    }
    function computeLayout(hists, params) {
        var width = params.width, height = params.height, margin = params.margin, interval = params.interval, padding = params.padding, range = params.range;
        var nBins = checkBins(hists).nBins;
        var xs = params.xs || sequence(nBins);
        var step$$1 = xs[1] - xs[0];
        var xRange = range || [xs[0] - step$$1 / 2, xs[xs.length - 1] + step$$1 / 2];
        var yMax = Math.max(max(hists, function (hist) { return max(hist); }) || 0, params.yMax || 0);
        var xScaler = linear$2()
            .domain(xRange)
            .range([margin.left, width - margin.right]);
        var yScaler = linear$2()
            .domain([yMax, 0])
            .range([margin.bottom, height - margin.top]);
        var bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
        var r0 = interval ? interval[0] : 0;
        var r1 = interval ? interval[1] : nBins;
        return { xs: xs, step: step$$1, xScaler: xScaler, yScaler: yScaler, bandWidth: bandWidth, interval: [r0, r1] };
    }
    var HistPainter$$1 = /** @class */ (function () {
        function HistPainter$$1() {
        }
        HistPainter$$1.prototype.update = function (params) {
            this.params = __assign({}, HistPainter$$1.defaultParams, this.params, params);
            return this;
        };
        HistPainter$$1.prototype.data = function (newData) {
            this.hists = newData;
            return this;
        };
        HistPainter$$1.prototype.render = function (selector$$1) {
            switch (this.params.mode) {
                case 'overlay':
                    this.renderOverlay(selector$$1);
                    break;
                case 'stack':
                    this.renderStack(selector$$1);
                    break;
                default:
                    break;
            }
            return this;
        };
        HistPainter$$1.prototype.renderBrush = function (selector$$1, xScaler) {
            var _a = this.params, interval = _a.interval, duration = _a.duration, margin = _a.margin, height = _a.height;
            var rangeRect = selector$$1.selectAll('rect.hp-brush')
                .data((interval && this.hists.length) ? [interval] : []);
            rangeRect.exit().transition().duration(duration)
                .attr('height', 1e-6).attr('y', height / 2).remove();
            if (!(interval && xScaler))
                return this;
            var rangeEnter = rangeRect.enter().append('rect').attr('class', 'hp-brush');
            var rangeUpdate = rangeEnter.merge(rangeRect);
            rangeUpdate.transition().duration(duration)
                .attr('width', xScaler(interval[1]) - xScaler(interval[0])).attr('x', xScaler(interval[0]))
                .attr('height', height - margin.top - margin.bottom).attr('y', margin.top);
            return this;
        };
        HistPainter$$1.prototype.renderOverlay = function (selector$$1) {
            var _a = this.params, height = _a.height, color$$1 = _a.color, margin = _a.margin, duration = _a.duration, padding = _a.padding, opacity = _a.opacity;
            var hists = this.hists;
            // const histsPacked = packHists(hists, pack);
            var histG = selector$$1.selectAll('g.hp-hists').data(hists);
            // Exit
            var exitTransition = histG
                .exit()
                .transition()
                .duration(duration)
                .remove();
            exitTransition.selectAll('rect').attr('y', height - margin.top).attr('height', 0);
            if (hists.length === 0) {
                this.renderBrush(selector$$1);
                return this;
            }
            // Compute layout stuff
            var _b = computeLayout(hists, this.params), xs = _b.xs, step$$1 = _b.step, xScaler = _b.xScaler, yScaler = _b.yScaler, bandWidth = _b.bandWidth, interval = _b.interval;
            // const { nBins } = checkBins(hists);
            // const xs = this.params.xs || d3.range(nBins);
            // const step = xs[1] - xs[0];
            // const xRange = range || [xs[0] - step / 2, xs[xs.length - 1] + step / 2];
            // const yMax = d3.max(hists, hist => d3.max(hist)) as number;
            // // const chartWidth = width - margin.left - margin.right;
            // const xScaler = d3
            //   .scaleLinear()
            //   .domain(xRange)
            //   .range([margin.left, width - margin.right]);
            // const yScaler = d3
            //   .scaleLinear()
            //   .domain([yMax, 0])
            //   .range([margin.bottom, height - margin.top]);
            // const hScaler = d3
            //   .scaleLinear()
            //   .domain([0, yMax])
            //   .range([0, height - margin.top - margin.bottom]);
            // const bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
            // const r0 = interval ? interval[0] : 0;
            // const r1 = interval ? interval[1] : nBins;
            // Enter
            var histGEnter = histG
                .enter()
                .append('g')
                .attr('class', 'hp-hists');
            // console.log(color(0), color(1)); // tslint:disable-line
            // Merge
            var histGUpdate = histGEnter.merge(histG);
            histGUpdate
                .transition()
                .duration(duration)
                .style('fill', function (d, i) { return color$$1(i); });
            /* RECTS START */
            var rects = histGUpdate
                .selectAll('rect')
                .data(function (d) { return Array.from(d, function (v, i) { return v; }); });
            // Enter
            var rectsEnter = rects
                .enter()
                .append('rect')
                .attr('x', function (d, i) { return xScaler(xs[i] - step$$1 / 2) + padding / 2; })
                .attr('y', height - margin.top)
                .attr('fill-opacity', opacity)
                .attr('width', bandWidth)
                .attr('height', 0);
            // Update
            var rectsUpdate = rectsEnter
                .merge(rects);
            // Transition
            rectsUpdate
                .transition()
                .duration(duration)
                .attr('x', function (d, i) { return xScaler(xs[i] - step$$1 / 2) + padding / 2; })
                .attr('y', yScaler)
                .attr('width', bandWidth)
                .attr('height', function (d) { return yScaler(0) - yScaler(d); });
            brush$2(interval, rectsUpdate, function (d, i) { return xs[i]; });
            // Rects Exit
            rects
                .exit()
                .transition()
                .duration(duration)
                .attr('y', height - margin.top)
                .attr('height', 0)
                .remove();
            /* RECTS END */
            // drawBrush
            this.renderBrush(selector$$1, xScaler);
            return this;
        };
        HistPainter$$1.prototype.renderStack = function (selector$$1) {
            var _a = this.params, interval = _a.interval, width = _a.width, height = _a.height, color$$1 = _a.color, margin = _a.margin, duration = _a.duration, padding = _a.padding;
            var hists = this.hists;
            var histG = selector$$1.selectAll('g.hp-hists').data(hists);
            // Exit
            var exitTransition = histG
                .exit()
                .transition()
                .duration(duration)
                .remove();
            exitTransition.attr('y', height - margin.top).attr('height', 0);
            if (hists.length === 0) {
                this.renderBrush(selector$$1);
                return this;
            }
            var nBins = checkBins(hists).nBins;
            var xs = this.params.xs || sequence(nBins);
            var y1s = stack$1(hists);
            var y0s = __spread([new Array(hists[0].length).fill(0)], y1s.slice(0, -1));
            var yMax = max(y1s[y1s.length - 1]);
            // const chartWidth = width - margin.left - margin.right;
            var xScaler = linear$2()
                .domain([xs[0], xs[xs.length - 1]])
                .range([margin.left, width - margin.right]);
            var yScaler = linear$2()
                .domain([yMax, 0])
                .range([margin.bottom, height - margin.top]);
            var bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
            var r0 = interval ? interval[0] : 0;
            var r1 = interval ? interval[1] : nBins;
            // Enter
            var histGEnter = histG
                .enter()
                .append('g')
                .attr('class', 'hists');
            // Merge
            var histGUpdate = histGEnter.merge(histG);
            histGUpdate
                .transition()
                .duration(duration)
                .style('fill', function (d, i) { return color$$1(i); });
            /* RECTS START */
            var rects = histGUpdate
                .selectAll('rect')
                .data(function (d, i) {
                return Array.from(d, function (v, j) { return [y0s[i][j], y1s[i][j]]; });
            });
            // Enter
            var rectsEnter = rects
                .enter()
                .append('rect')
                .attr('y', height - margin.top)
                .attr('height', 0);
            // Update
            var rectsUpdate = rectsEnter
                .merge(rects)
                .attr('x', function (d, i) { return xScaler(xs[i]) + padding / 2; })
                .attr('width', bandWidth);
            // Transition
            rectsUpdate
                .transition()
                .duration(duration)
                .attr('y', function (d, i) { return yScaler(d[1]); })
                .attr('height', function (d, i) { return yScaler(d[0]) - yScaler(d[1]); });
            if (interval) {
                brush$2([r0, r1], rectsUpdate, function (d, i) { return xs[i]; });
            }
            // Rects Exit
            rects
                .exit()
                .transition()
                .duration(duration)
                .attr('y', height - margin.top)
                .attr('height', 0)
                .remove();
            /* RECTS END */
            // drawBrush
            this.renderBrush(selector$$1, xScaler);
            return this;
        };
        HistPainter$$1.defaultParams = {
            color: labelColor,
            duration: defaultDuration,
            mode: 'overlay',
            padding: 4,
            margin: { top: 5, bottom: 5, left: 5, right: 5 },
            height: 50,
            width: 100,
            opacity: 0.35,
        };
        return HistPainter$$1;
    }());

    var StreamPainter$$1 = /** @class */ (function () {
        function StreamPainter$$1() {
            this.params = __assign({}, (StreamPainter$$1.defaultParams));
        }
        StreamPainter$$1.prototype.update = function (params) {
            this.params = __assign({}, (StreamPainter$$1.defaultParams), (this.params), params);
            return this;
        };
        StreamPainter$$1.prototype.data = function (newData) {
            this.stream = newData;
            return this;
        };
        StreamPainter$$1.prototype.render = function (selector$$1) {
            var _a = this.params, margin = _a.margin, color$$1 = _a.color, duration = _a.duration, width = _a.width, height = _a.height, range = _a.range;
            var streamData = this.stream;
            var xs = this.params.xs || sequence(streamData.length);
            // const step = xs[1] - xs[0];
            var xRange = range || [xs[0], xs[xs.length - 1]];
            // xs = [xRange[0], ...xs, xRange[1]];
            var nStreams = streamData.length ? streamData[0].length : 0;
            var stackLayout = stack()
                .keys(sequence(nStreams)).offset(silhouette);
            var stackedStream = stackLayout(streamData);
            var yMin = min(stackedStream, function (stream) { return min(stream, function (d) { return d[0]; }); }) || 0;
            var yMax = max(stackedStream, function (stream) { return max(stream, function (d) { return d[1]; }); }) || 0;
            var diff = Math.max(0, (this.params.yMax || 0) - (yMax - yMin));
            // if (streamData.length) {
            //   console.log(yMax); // tslint:disable-line
            //   console.log(yMin); // tslint:disable-line
            //   console.log(diff);  // tslint:disable-line
            //   console.log(streamData.map(s => nt.sum(s))); // tslint:disable-line
            // }
            var xScaler = linear$2()
                .domain(xRange).range([margin.left, width - margin.right]);
            var yScaler = linear$2()
                .domain([yMin - diff / 2, yMax + diff / 2]).range([margin.bottom, height - margin.top]);
            var area$$1 = area$2()
                .x(function (d, i) { return xScaler(xs[i]); })
                .y0(function (d, i) { return yScaler(d[0]); })
                .y1(function (d, i) { return yScaler(d[1]); })
                .curve(cardinal.tension(0.3));
            var initPos = area$$1(new Array(streamData.length).fill([0, 1e-6]));
            // Join
            var paths = selector$$1.selectAll('path').data(stackedStream);
            // Enter
            var pathEnter = paths.enter().append('path')
                .attr('d', initPos);
            // Update
            var pathUpdate = pathEnter.merge(paths).style('fill', function (d, i) { return color$$1(i); });
            pathUpdate.transition().duration(duration)
                .attr('d', area$$1);
            // Exit
            paths.exit().transition().duration(duration)
                .attr('d', this.initPos).remove();
            this.renderBrush(selector$$1, xScaler);
            this.initPos = initPos;
            return this;
        };
        StreamPainter$$1.prototype.renderBrush = function (selector$$1, xScaler) {
            var _a = this.params, interval = _a.interval, duration = _a.duration, margin = _a.margin, height = _a.height;
            var rangeRect = selector$$1.selectAll('rect.hp-brush')
                .data((interval && this.stream.length) ? [interval] : []);
            rangeRect.exit().transition().duration(duration)
                .attr('height', 1e-6).attr('y', height / 2).remove();
            if (!(interval && xScaler))
                return this;
            var rangeEnter = rangeRect.enter().append('rect').attr('class', 'hp-brush');
            var rangeUpdate = rangeEnter.merge(rangeRect);
            rangeUpdate.transition().duration(duration)
                .attr('width', xScaler(interval[1]) - xScaler(interval[0])).attr('x', xScaler(interval[0]))
                .attr('height', height - margin.top - margin.bottom).attr('y', margin.top);
            return this;
        };
        StreamPainter$$1.defaultParams = {
            color: defaultColor,
            duration: defaultDuration,
            // mode: 'overlay',
            // padding: 4,
            margin: { top: 5, bottom: 5, left: 5, right: 5 },
            height: 50,
            width: 100,
        };
        return StreamPainter$$1;
    }());

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */

    /**
     * Use invariant() to assert state which your program assumes to be true.
     *
     * Provide sprintf-style format (only %s is supported) and arguments
     * to provide information about what broke and what you were
     * expecting.
     *
     * The invariant message will be stripped in production, but the invariant
     * will remain to ensure logic does not differ in production.
     */

    var validateFormat = function validateFormat(format) {};

    function invariant(condition, format, a, b, c, d, e, f) {
      validateFormat(format);

      if (!condition) {
        var error;
        if (format === undefined) {
          error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error(format.replace(/%s/g, function () {
            return args[argIndex++];
          }));
          error.name = 'Invariant Violation';
        }

        error.framesToPop = 1; // we don't care about invariant's own frame
        throw error;
      }
    }

    var invariant_1 = invariant;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */

    var emptyObject = {};

    var emptyObject_1 = emptyObject;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * 
     */

    function makeEmptyFunction(arg) {
      return function () {
        return arg;
      };
    }

    /**
     * This function accepts and discards inputs; it has no side effects. This is
     * primarily useful idiomatically for overridable function endpoints which
     * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
     */
    var emptyFunction = function emptyFunction() {};

    emptyFunction.thatReturns = makeEmptyFunction;
    emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
    emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
    emptyFunction.thatReturnsNull = makeEmptyFunction(null);
    emptyFunction.thatReturnsThis = function () {
      return this;
    };
    emptyFunction.thatReturnsArgument = function (arg) {
      return arg;
    };

    var emptyFunction_1 = emptyFunction;

    var r="function"===typeof Symbol&&Symbol["for"],t=r?Symbol["for"]("react.element"):60103,u=r?Symbol["for"]("react.portal"):60106,v=r?Symbol["for"]("react.fragment"):60107,w=r?Symbol["for"]("react.strict_mode"):60108,x$5=r?Symbol["for"]("react.provider"):60109,y$5=r?Symbol["for"]("react.context"):60110,z=r?Symbol["for"]("react.async_mode"):60111,A$1=r?Symbol["for"]("react.forward_ref"):
    60112,B$1="function"===typeof Symbol&&Symbol.iterator;function C$1(a){for(var b=arguments.length-1,e="http://reactjs.org/docs/error-decoder.html?invariant\x3d"+a,c=0;c<b;c++)e+="\x26args[]\x3d"+encodeURIComponent(arguments[c+1]);invariant_1(!1,"Minified React error #"+a+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",e);}var D$1={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}};
    function E$1(a,b,e){this.props=a;this.context=b;this.refs=emptyObject_1;this.updater=e||D$1;}E$1.prototype.isReactComponent={};E$1.prototype.setState=function(a,b){"object"!==typeof a&&"function"!==typeof a&&null!=a?C$1("85"):void 0;this.updater.enqueueSetState(this,a,b,"setState");};E$1.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};function F(){}F.prototype=E$1.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=emptyObject_1;this.updater=e||D$1;}var H=G.prototype=new F;
    H.constructor=G;objectAssign(H,E$1.prototype);H.isPureReactComponent=!0;var I={current:null},J=Object.prototype.hasOwnProperty,K={key:!0,ref:!0,__self:!0,__source:!0};
    function L(a,b,e){var c=void 0,d={},g=null,h=null;if(null!=b)for(c in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(g=""+b.key),b)J.call(b,c)&&!K.hasOwnProperty(c)&&(d[c]=b[c]);var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){for(var k=Array(f),l=0;l<f;l++)k[l]=arguments[l+2];d.children=k;}if(a&&a.defaultProps)for(c in f=a.defaultProps,f)void 0===d[c]&&(d[c]=f[c]);return {$$typeof:t,type:a,key:g,ref:h,props:d,_owner:I.current}}
    function M(a){return "object"===typeof a&&null!==a&&a.$$typeof===t}function escape(a){var b={"\x3d":"\x3d0",":":"\x3d2"};return "$"+(""+a).replace(/[=:]/g,function(a){return b[a]})}var N=/\/+/g,O=[];function P(a,b,e,c){if(O.length){var d=O.pop();d.result=a;d.keyPrefix=b;d.func=e;d.context=c;d.count=0;return d}return {result:a,keyPrefix:b,func:e,context:c,count:0}}function Q(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>O.length&&O.push(a);}
    function R(a,b,e,c){var d=typeof a;if("undefined"===d||"boolean"===d)a=null;var g=!1;if(null===a)g=!0;else switch(d){case "string":case "number":g=!0;break;case "object":switch(a.$$typeof){case t:case u:g=!0;}}if(g)return e(c,a,""===b?"."+S(a,0):b),1;g=0;b=""===b?".":b+":";if(Array.isArray(a))for(var h=0;h<a.length;h++){d=a[h];var f=b+S(d,h);g+=R(d,f,e,c);}else if(null===a||"undefined"===typeof a?f=null:(f=B$1&&a[B$1]||a["@@iterator"],f="function"===typeof f?f:null),"function"===typeof f)for(a=f.call(a),
    h=0;!(d=a.next()).done;)d=d.value,f=b+S(d,h++),g+=R(d,f,e,c);else"object"===d&&(e=""+a,C$1("31","[object Object]"===e?"object with keys {"+Object.keys(a).join(", ")+"}":e,""));return g}function S(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape(a.key):b.toString(36)}function T(a,b){a.func.call(a.context,b,a.count++);}
    function U(a,b,e){var c=a.result,d=a.keyPrefix;a=a.func.call(a.context,b,a.count++);Array.isArray(a)?V(a,c,e,emptyFunction_1.thatReturnsArgument):null!=a&&(M(a)&&(b=d+(!a.key||b&&b.key===a.key?"":(""+a.key).replace(N,"$\x26/")+"/")+e,a={$$typeof:t,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}),c.push(a));}function V(a,b,e,c,d){var g="";null!=e&&(g=(""+e).replace(N,"$\x26/")+"/");b=P(b,g,c,d);null==a||R(a,"",U,b);Q(b);}
    var W={Children:{map:function(a,b,e){if(null==a)return a;var c=[];V(a,c,null,b,e);return c},forEach:function(a,b,e){if(null==a)return a;b=P(null,null,b,e);null==a||R(a,"",T,b);Q(b);},count:function(a){return null==a?0:R(a,"",emptyFunction_1.thatReturnsNull,null)},toArray:function(a){var b=[];V(a,b,null,emptyFunction_1.thatReturnsArgument);return b},only:function(a){M(a)?void 0:C$1("143");return a}},createRef:function(){return {current:null}},Component:E$1,PureComponent:G,createContext:function(a,b){void 0===b&&(b=null);a={$$typeof:y$5,
    _calculateChangedBits:b,_defaultValue:a,_currentValue:a,_changedBits:0,Provider:null,Consumer:null};a.Provider={$$typeof:x$5,_context:a};return a.Consumer=a},forwardRef:function(a){return {$$typeof:A$1,render:a}},Fragment:v,StrictMode:w,unstable_AsyncMode:z,createElement:L,cloneElement:function(a,b,e){null===a||void 0===a?C$1("267",a):void 0;var c=void 0,d=objectAssign({},a.props),g=a.key,h=a.ref,f=a._owner;if(null!=b){void 0!==b.ref&&(h=b.ref,f=I.current);void 0!==b.key&&(g=""+b.key);var k=void 0;a.type&&a.type.defaultProps&&
    (k=a.type.defaultProps);for(c in b)J.call(b,c)&&!K.hasOwnProperty(c)&&(d[c]=void 0===b[c]&&void 0!==k?k[c]:b[c]);}c=arguments.length-2;if(1===c)d.children=e;else if(1<c){k=Array(c);for(var l=0;l<c;l++)k[l]=arguments[l+2];d.children=k;}return {$$typeof:t,type:a.type,key:g,ref:h,props:d,_owner:f}},createFactory:function(a){var b=L.bind(null,a);b.type=a;return b},isValidElement:M,version:"16.3.2",__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:I,assign:objectAssign}},X$1=Object.freeze({default:W}),
    Y$1=X$1&&W||X$1;var react_production_min=Y$1["default"]?Y$1["default"]:Y$1;

    var react = createCommonjsModule(function (module) {

    {
      module.exports = react_production_min;
    }
    });

    var React = /*#__PURE__*/Object.freeze({
        default: react,
        __moduleExports: react
    });

    // type ConditionData = (d: any, i: number ) => ConditionX;
    var ConditionPainter = /** @class */ (function () {
        function ConditionPainter() {
            this.histPainter = new HistPainter$$1();
            this.streamPainter = new StreamPainter$$1();
        }
        ConditionPainter.prototype.update = function (params) {
            this.params = __assign({}, (this.params), params);
            return this;
        };
        ConditionPainter.prototype.data = function (newData) {
            // this.condition = newData;
            return this;
        };
        ConditionPainter.prototype.render = function (selector$$1) {
            var _this = this;
            var _a = this.params, color$$1 = _a.color, duration = _a.duration;
            // Default BG Rect
            // const rects = selector.selectAll('rect.matrix-bg').data(c => ['data']);
            // rects.enter().append('rect').attr('class', 'matrix-bg');
            // rects.exit().transition().duration(duration).remove();
            selector$$1.select('rect.matrix-bg')
                .classed('matrix-bg-active', function (c) { return Boolean(c.active); })
                .attr('display', null)
                .transition().duration(duration)
                .attr('width', function (c) { return c.width; }).attr('height', function (c) { return c.height; });
            // const text = selector.select('text.glyph-desc')
            //   .attr('text-anchor', 'middle').attr('font-size', 9);
            // text.transition().duration(duration)
            //   .attr('x', c => c.width / 2).attr('y', c => c.height - 2);
            // text.text(d => d.desc);
            // selector.selectAll('g.matrix-glyph').data(['g'])
            //   .enter().append('g').attr('class', 'matrix-glyph');
            // selector.selectAll('g.matrix-glyph-expand').data(['g'])
            //   .enter().append('g').attr('class', 'matrix-glyph-expand');
            selector$$1.each(function (c, i, nodes) {
                // const maskId = `mask-${c.ruleIdx}-${c.feature}-${c.category}`;
                var stream = c.stream;
                var paddingOut = c.expanded ? 5 : 1;
                var margin = { top: paddingOut, bottom: paddingOut, left: 1, right: 1 };
                var params = { width: c.width, height: c.height, interval: c.interval, margin: margin };
                var base = c.range[1] - c.range[0];
                var root = select(nodes[i]);
                // // Make sure two groups exists
                // root.selectAll('g.matrix-glyph').data(['g'])
                //   .enter().append('g').attr('class', 'matrix-glyph');
                // root.selectAll('g.matrix-glyph-expand').data(['g'])
                //   .enter().append('g').attr('class', 'matrix-glyph-expand');
                // Groups
                var expandGlyph = root.select('g.matrix-glyph-expand');
                var glyph = root.select('g.matrix-glyph');
                var inputValue = root.selectAll('rect.glyph-value').data(c.value ? [c.value] : []);
                var inputValueUpdate = inputValue.enter()
                    .append('rect').attr('class', 'glyph-value').attr('width', 2).attr('y', 0)
                    .style('fill-opacity', 0.5)
                    .merge(inputValue);
                inputValueUpdate.attr('x', function (v) { return (1 + (c.width - 2) / base * (v - c.range[0])); })
                    .attr('height', c.height)
                    .style('fill', function (v) { return (c.interval[0] < v && v < c.interval[1]) ? '#52c41a' : '#f5222d'; })
                    .style('stroke', 'none');
                inputValue.exit().remove();
                // console.log(c); // tslint:disable-line
                var xs = stream && stream.xs;
                var streamXs = xs;
                var yMax = stream && stream.yMax;
                var streamData = [];
                if (c.expanded && stream && !c.isCategorical && xs) {
                    var endPadding = new Array(stream.stream[0].length).fill(0);
                    streamData = __spread([endPadding], (stream.stream), [endPadding]);
                    var step$$1 = xs[1] - xs[0];
                    streamXs = __spread([xs[0] - step$$1 / 2], xs, [xs[xs.length - 1] + step$$1 / 2]);
                }
                _this.streamPainter
                    .update(__assign({}, params, { xs: streamXs, yMax: yMax, color: color$$1 }))
                    .data(streamData)
                    .render(expandGlyph);
                var padding = 0;
                if (c.isCategorical && stream) {
                    var nBars = stream.stream.length;
                    padding = c.width / (2 * nBars);
                }
                _this.histPainter
                    .update(__assign({ padding: padding }, params, { xs: xs, yMax: yMax }))
                    .data(((!c.expanded || c.isCategorical) && stream) ? [stream.stream.map(function (s) { return sum$3(s); })] : [])
                    .render(glyph);
            });
            return this;
        };
        return ConditionPainter;
    }());
    var RuleRowPainter = /** @class */ (function () {
        // private rule: RuleX;
        function RuleRowPainter() {
            this.conditionPainter = new ConditionPainter();
        }
        RuleRowPainter.prototype.update = function (params) {
            this.params = __assign({}, (RuleRowPainter.defaultParams), (this.params), params);
            return this;
        };
        RuleRowPainter.prototype.data = function (newData) {
            this.rule = newData;
            return this;
        };
        RuleRowPainter.prototype.render = function (selector$$1) {
            var _a = this.params, duration = _a.duration, labelColor$$1 = _a.labelColor, onClick = _a.onClick, tooltip = _a.tooltip;
            var rule = this.rule;
            // Background Rectangle
            var bgRect = selector$$1.selectAll('rect.matrix-bg').data([this.rule]);
            var bgRectUpdate = bgRect.enter()
                .append('rect').attr('class', 'matrix-bg').attr('width', 0).attr('height', 0)
                .merge(bgRect);
            bgRectUpdate.classed('matrix-bg-highlight', function (d) { return Boolean(d.highlight); });
            bgRectUpdate.transition().duration(duration)
                .attr('width', function (d) { return d.width; }).attr('height', function (d) { return d.height; });
            // Button Group
            this.renderButton(selector$$1);
            /* CONDITIONS */
            // JOIN
            var conditions = selector$$1.selectAll('g.matrix-condition')
                .data(isRuleGroup$$1(rule) ? [] : rule.conditions);
            // ENTER
            var conditionsEnter = conditions.enter()
                .append('g').attr('class', 'matrix-condition')
                .attr('transform', function (c) { return "translate(" + c.x + ", 0)"; });
            conditionsEnter.append('rect').attr('class', 'matrix-bg');
            conditionsEnter.append('g').attr('class', 'matrix-glyph');
            conditionsEnter.append('g').attr('class', 'matrix-glyph-expand');
            // conditionsEnter.append('text').attr('class', 'glyph-desc');
            // UPDATE
            var conditionsUpdate = conditionsEnter.merge(conditions)
                .classed('hidden', false).classed('visible', true).attr('display', null);
            // conditionsUpdate.select('title').text(d => d.title);
            // Register listener to click for expanding
            if (onClick)
                conditionsUpdate.on('click', function (c) { return onClick(c.feature); });
            // Transition
            conditionsUpdate
                .transition().duration(duration)
                .attr('transform', function (c) { return "translate(" + c.x + ", 0)"; });
            this.conditionPainter.update({ color: labelColor$$1, duration: duration })
                .render(conditionsUpdate);
            // conditionsUpdate.each((d: ConditionX, i, nodes) => 
            //   painter.data(d).render(d3.select(nodes[i]))
            // );
            // EXIT
            conditions.exit().classed('hidden', true)
                .transition().delay(300)
                .attr('display', 'none');
            // Add listeners to update tooltip
            if (tooltip) {
                var renderTooltip_1 = function (texts) {
                    tooltip.attr('display', null);
                    // texts
                    var tspan = tooltip.select('text').selectAll('tspan').data(texts);
                    var tspanUpdate = tspan
                        .enter().append('tspan').attr('x', 5).attr('dx', '0.1em').attr('dy', '1.2em')
                        .merge(tspan);
                    tspanUpdate.text(function (t) { return t; });
                    tspan.exit().remove();
                    // rect-bg
                    var textNode = tooltip.select('text').node();
                    var bBox = textNode ? textNode.getBoundingClientRect() : null;
                    // console.log(bBox);  // tslint:disable-line
                    var width = bBox ? bBox.width : 50;
                    var height = bBox ? bBox.height : 20;
                    // const x = 4;
                    // const y = 4;
                    // const x = bBox ? bBox.left : 0;
                    // const y = bBox ? bBox.top : 0;
                    // const height = textNode ? textNode.clientHeight : 0;
                    tooltip.select('rect').attr('width', width + 10).attr('height', height * 1.2)
                        .attr('y', 4 - height * 0.1).attr('x', 3);
                };
                var hideTooltip = function () { return tooltip.attr('display', 'none'); };
                conditionsUpdate.on('mouseover', function (d) { return renderTooltip_1([d.title]); })
                    .on('mouseout', hideTooltip);
                bgRectUpdate.on('mouseover', function (d) { return renderTooltip_1(d.conditions.map(function (c) { return c.title; })); })
                    .on('mouseout', hideTooltip);
            }
            else {
                conditionsUpdate.on('mouseover', null).on('mouseout', null);
            }
            return this;
        };
        RuleRowPainter.prototype.renderButton = function (selector$$1) {
            var _a = this.params, duration = _a.duration, buttonSize = _a.buttonSize, onClickButton = _a.onClickButton;
            var rule = this.rule;
            // Enter
            var groupEnter = selector$$1.selectAll('g.row-button').data(['rule']).enter()
                .append('g').attr('class', 'row-button');
            // Collapse Button Enter
            groupEnter.append('g').attr('class', 'collapse-button')
                .append('rect').attr('class', 'button-bg')
                .attr('height', buttonSize / 2).attr('y', -buttonSize / 4).attr('x', -2).attr('fill', 'white');
            // Rule Button Enter
            groupEnter.append('g').attr('class', 'rule-button')
                .append('text').attr('class', 'rule-no').attr('text-anchor', 'start').attr('dx', 2);
            var buttonRoot = selector$$1.select('g.row-button');
            var collapseButton = buttonRoot.select('g.collapse-button');
            var ruleButton = buttonRoot.select('g.rule-button');
            if (!isRuleGroup$$1(rule) && !rule.expanded) {
                collapseButton.attr('display', 'none').on('click', null);
                ruleButton.attr('display', null);
                ruleButton.select('text.rule-no').attr('dy', rule.height / 2 + 6).text(rule.idx + 1);
                // selector.on('mouseover.button', () => {
                // }).on('mouseout.button', () => {
                //   ruleButton.select('text.rule-no').text('');
                // });
            }
            else {
                ruleButton.attr('display', 'none').on('mouseover.button', null).on('mouseout.button', null);
                collapseButton.attr('display', null)
                    .on('click', onClickButton);
                collapseButton.transition().duration(duration)
                    .attr('transform', "translate(" + (rule.expanded ? -20 : 4) + "," + rule.height / 2 + ")");
                collapseButton.select('rect.button-bg').attr('width', 20);
                var rects = collapseButton.selectAll('rect.row-button')
                    .data(isRuleGroup$$1(rule) ? rule.rules : []);
                rects.exit().transition().duration(duration)
                    .attr('fill-opacity', 1e-6).remove();
                if (isRuleGroup$$1(rule)) {
                    // const nNested = rule.rules.length;
                    var height = 4;
                    var width = 4;
                    var step_1 = width + 3;
                    // const height = Math.min(rule.height / (2 * nNested - 1), 2);
                    var rectsEnter = rects.enter()
                        .append('rect').attr('class', 'row-button')
                        .attr('rx', 2).attr('ry', 2)
                        .attr('fill', '#bbb');
                    rectsEnter
                        .transition().duration(duration)
                        .attr('x', function (d, i) { return buttonSize + 4 + i * step_1; }).attr('width', width)
                        .attr('y', -height / 2).attr('height', height);
                    collapseButton.select('rect.button-bg').attr('width', 20 + rule.rules.length * step_1);
                }
                collapseButton.selectAll('path.row-button')
                    .data(['path']).enter().append('path')
                    .attr('class', 'row-button')
                    .attr('stroke-width', 2).attr('stroke', '#bbb').attr('fill', 'none');
                collapseButton.select('path.row-button').transition().duration(duration)
                    .attr('d', rule.expanded
                    ? "M 0 " + buttonSize / 4 + " L " + buttonSize / 2 + " " + -buttonSize / 4 + " L " + buttonSize + " " + buttonSize / 4
                    : "M 0 " + -buttonSize / 4 + " L " + buttonSize / 2 + " " + buttonSize / 4 + " L " + buttonSize + " " + -buttonSize / 4);
            }
        };
        RuleRowPainter.defaultParams = {
            labelColor: labelColor,
            duration: defaultDuration,
            buttonSize: 10,
            onClickButton: function () { return null; },
        };
        return RuleRowPainter;
    }());

    var originPoint = { x: 0, y: 0 };
    var curve = function (s, t) {
        if (s === void 0) { s = originPoint; }
        if (t === void 0) { t = originPoint; }
        var dy = t.y - s.y;
        var dx = t.x - s.x;
        var r = Math.min(Math.abs(dx), Math.abs(dy));
        if (Math.abs(dx) > Math.abs(dy))
            return "M" + s.x + "," + s.y + " A" + r + "," + r + " 0 0 0 " + (s.x + r) + " " + t.y + " H " + t.x;
        else
            return "M " + s.x + "," + s.y + " V " + (s.y - r) + " A" + r + "," + r + " 0 0 0 " + t.x + " " + t.y + " ";
    };
    var flowCurve = function (d) {
        if (d)
            return curve(d.s, d.t);
        return curve();
    };
    var FlowPainter = /** @class */ (function () {
        function FlowPainter() {
        }
        FlowPainter.prototype.update = function (params) {
            this.params = __assign({}, FlowPainter.defaultParams, this.params, params);
            return this;
        };
        FlowPainter.prototype.data = function (flows) {
            var _this = this;
            this.flows = flows;
            var nClasses = flows.length > 0 ? flows[0].support.length : 0;
            this.flowSums = flows.map(function (r) { return sum$3(r.support); });
            var reserves = Array.from({ length: nClasses }, function (_, i) { return flows.map(function (flow) { return flow.support[i]; }); });
            reserves = reserves.map(function (reserve) { return cumsum(reserve.reverse()).reverse(); });
            this.reserveSums = new Array(flows.length).fill(0);
            reserves.forEach(function (reserve) { return add$2(_this.reserveSums, reserve, false); });
            // const multiplier = width / reserveSums[0];
            this.reserves = Array.from({ length: flows.length }, function (_, i) { return reserves.map(function (reserve) { return reserve[i]; }); });
            // console.log(this.reserves); // tslint:disable-line
            // console.log(this.reserveSums); // tslint:disable-line
            return this;
        };
        FlowPainter.prototype.render = function (selector) {
            // const {width} = this.params;
            // Make sure the root group exits
            // selector
            //   .selectAll('g.flows')
            //   .data(['flows'])
            //   .enter()
            //   .append('g')
            //   .attr('class', 'flows');
            // const rootGroup = selector.select<SVGGElement>('g.flows')
            //   .attr('transform', `translate(${-width}, 0)`);
            // Render Rects
            this.renderRects(selector);
            // Render Flows
            this.renderFlows(selector);
            return this;
        };
        FlowPainter.prototype.renderRects = function (root) {
            var _a = this.params, duration = _a.duration, height = _a.height, width = _a.width, dy = _a.dy, color = _a.color, divideHeight = _a.divideHeight;
            var _b = this, flows = _b.flows, reserves = _b.reserves, reserveSums = _b.reserveSums;
            // Compute pos
            var heights = flows.map(function (f, i) { return i > 0 ? f.y - flows[i - 1].y : height; });
            var multiplier = width / reserveSums[0];
            // JOIN
            var reserve = root.selectAll('g.v-reserves').data(flows);
            // ENTER
            var reserveEnter = reserve.enter().append('g').attr('class', 'v-reserves');
            reserveEnter.append('title');
            reserveEnter.append('rect').attr('class', 'v-divide')
                .attr('rx', 3).attr('ry', 3);
            // UPDATE
            var reserveUpdate = reserveEnter.merge(reserve)
                .classed('hidden', false).classed('visible', true);
            reserveUpdate.select('title').text(function (d, i) { return reserves[i].join('/'); });
            reserveUpdate.select('rect.v-divide')
                .attr('width', function (d, i) { return reserveSums[i] * multiplier + 4; }).attr('x', -2)
                .attr('y', function (d, i) { return heights[i] - divideHeight; })
                .attr('height', divideHeight);
            // Transition groups
            reserveUpdate.transition().duration(duration)
                .attr('transform', function (d, i) { return "translate(0," + (d.y - heights[i] - dy) + ")"; });
            // EXIT
            reserve.exit()
                .classed('hidden', true).classed('visible', false)
                .transition().duration(duration)
                .attr('transform', function (d) { return "translate(0," + (d.y - dy - 60) + ")"; });
            // *RECTS START*
            // JOIN RECT DATA
            // console.warn(reserves);
            var rects = reserveUpdate.selectAll('rect.v-reserve')
                .data(function (d, i) {
                var widths = reserves[i].map(function (r) { return r * multiplier; });
                var xs = __spread([0], (cumsum(widths.slice(0, -1))));
                return d.support.map(function (s, j) {
                    return {
                        width: widths[j], height: heights[i] - divideHeight, x: xs[j]
                    };
                });
            });
            // RECT ENTER
            var rectsEnter = rects.enter()
                .append('rect').attr('class', 'v-reserve')
                .attr('width', function (d) { return d.width; });
            // RECT UPDATE
            var rectsUpdate = rectsEnter.merge(rects)
                .style('fill', function (d, i) { return color(i); });
            rectsUpdate.transition().duration(duration)
                .attr('width', function (d) { return d.width; }).attr('height', function (d) { return d.height; }).attr('x', function (d) { return d.x; });
            // RECT EXIT
            rects.exit().remove();
            // *RECTS END*
            return this;
        };
        FlowPainter.prototype.renderFlows = function (root) {
            var _a = this.params, duration = _a.duration, width = _a.width, dy = _a.dy, dx = _a.dx, color = _a.color;
            var _b = this, flows = _b.flows, reserves = _b.reserves, reserveSums = _b.reserveSums, flowSums = _b.flowSums;
            // Compute pos
            // const heights = flows.map((f, i) => i > 0 ? f.y - flows[i - 1].y : height);
            var multiplier = width / reserveSums[0];
            // JOIN
            var flow = root.selectAll('g.v-flows').data(flows);
            // ENTER
            var flowEnter = flow.enter().append('g').attr('class', 'v-flows');
            flowEnter.append('title');
            // UPDATE
            var flowUpdate = flowEnter.merge(flow)
                .classed('hidden', false).classed('visible', true);
            flowUpdate.select('title').text(function (d) { return d.support.join('/'); });
            // Transition groups
            flowUpdate.transition().duration(duration)
                .attr('transform', function (d, i) { return "translate(0," + d.y + ")"; });
            // EXIT
            flow.exit()
                .classed('hidden', true).classed('visible', false)
                .transition().duration(duration)
                .attr('transform', function (d) { return "translate(0," + (d.y - dy - 60) + ")"; });
            // *PATHS START*
            // JOIN PATH DATA
            var paths = flowUpdate.selectAll('path')
                .data(function (d, i) {
                var x0 = ((i === reserves.length - 1) ? 0 : reserveSums[i + 1]) * multiplier;
                var y1 = flowSums[i] * multiplier / 2;
                return flows[i].support.map(function (f) {
                    var pathWidth = f * multiplier;
                    var s = { x: x0 + pathWidth / 2, y: -dy };
                    var t = { x: dx + width, y: y1 - pathWidth / 2 };
                    x0 += pathWidth;
                    y1 -= pathWidth;
                    return { s: s, t: t, width: pathWidth };
                });
            });
            // PATH ENTER
            var pathsEnter = paths.enter()
                .append('path')
                .attr('d', flowCurve())
                .style('stroke-width', 1e-6);
            // PATH UPDATE
            var pathsUpdate = pathsEnter.merge(paths)
                .style('stroke', function (d, i) { return color(i); });
            pathsUpdate.transition().duration(duration)
                .attr('d', flowCurve)
                .style('stroke-width', function (d) { return d.width + "px"; });
            // PATH EXIT
            paths.exit().transition().duration(duration)
                .attr('d', flowCurve()).style('stroke-width', 1e-6)
                .remove();
            // *PATHS END*
            return this;
        };
        FlowPainter.defaultParams = {
            width: 100,
            height: 50,
            duration: defaultDuration,
            dy: -30,
            dx: -40,
            color: labelColor,
            divideHeight: 8,
        };
        return FlowPainter;
    }());

    // export function max
    function registerStripePattern(color$$1, key, strokeWidth, padding) {
        if (strokeWidth === void 0) { strokeWidth = 2; }
        if (padding === void 0) { padding = 4; }
        var defs = select('svg#main').select('defs');
        var patternName = "stripe-" + key + "-" + strokeWidth + "-" + padding;
        var patternNode = defs.select("#" + patternName).node();
        var pattern = patternNode === null
            ? defs.append('pattern').attr('id', patternName)
            : defs.select("#" + patternName);
        pattern.attr('width', padding).attr('height', padding)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform', 'rotate(-45)');
        var path$$1 = pattern.select('path').node() === null
            ? pattern.append('path') : pattern.select('path');
        path$$1.attr('d', "M 0 " + padding / 2 + " H " + padding)
            .style('stroke-linecap', 'square')
            .style('stroke-width', strokeWidth + "px")
            .style('stroke', color$$1);
        // defs.append('pattern')
        return patternName;
    }

    // Returns a tween for a transition’s "d" attribute, transitioning any selected
    // arcs from their current angle to the specified new angle.
    function arcTween(startAngle, newAngle, arc$$1) {
        // The function passed to attrTween is invoked for each selected element when
        // the transition starts, and for each element returns the interpolator to use
        // over the course of transition. This function is thus responsible for
        // determining the starting angle of the transition (which is pulled from the
        // element’s bound datum, d.endAngle), and the ending angle (simply the
        // newAngle argument to the enclosing function).
        // return function() {
        // To interpolate between the two angles, we use the default d3.interpolate.
        // (Internally, this maps to d3.interpolateNumber, since both of the
        // arguments to d3.interpolate are numbers.) The returned function takes a
        // single argument t and returns a number between the starting angle and the
        // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
        // newAngle; and for 0 < t < 1 it returns an angle in-between.
        var interpolate = interpolateValue(startAngle, newAngle);
        // The return value of the attrTween is also a function: the function that
        // we want to run for each tick of the transition. Because we used
        // attrTween("d"), the return value of this last function will be set to the
        // "d" attribute at every tick. (It’s also possible to use transition.tween
        // to run arbitrary code for every tick, say if you want to set multiple
        // attributes from a single function.) The argument t ranges from 0, at the
        // start of the transition, to 1, at the end.
        return function (t) {
            // Calculate the current arc angle based on the transition time, t. Since
            // the t for the transition and the t for the interpolate both range from
            // 0 to 1, we can pass t directly to the interpolator.
            //
            // Note that the interpolated angle is written into the element’s bound
            // data object! This is important: it means that if the transition were
            // interrupted, the data bound to the element would still be consistent
            // with its appearance. Whenever we start a new arc transition, the
            // correct starting angle can be inferred from the data.
            // d.endAngle = interpolate(t);
            // Lastly, compute the arc path given the updated data! In effect, this
            // transition uses data-space interpolation: the data is interpolated
            // (that is, the end angle) rather than the path string itself.
            // Interpolating the angles in polar coordinates, rather than the raw path
            // string, produces valid intermediate arcs during the transition.
            return arc$$1({ endAngle: interpolate(t) }) || '';
        };
        // };
    }
    function isMat$1(a) {
        return Array.isArray(a[0]);
    }
    function registerPatterns(color$$1, keys$$1) {
        return keys$$1.map(function (key) { return registerStripePattern(color$$1(key), key, 3, 5); });
    }
    var SupportPainter = /** @class */ (function () {
        function SupportPainter() {
        }
        SupportPainter.prototype.update = function (params) {
            this.params = __assign({}, (SupportPainter.defaultParams), (this.params), params);
            return this;
        };
        SupportPainter.prototype.data = function (newData) {
            this.support = newData;
            return this;
        };
        SupportPainter.prototype.render = function (selector$$1) {
            var support = this.support;
            if (isMat$1(support)) {
                this.renderSimple(selector$$1, []);
                this.renderMat(selector$$1, support);
            }
            else {
                this.renderMat(selector$$1, []);
                this.renderSimple(selector$$1, support);
            }
            return this;
        };
        SupportPainter.prototype.renderSimple = function (selector$$1, support) {
            var _a = this.params, duration = _a.duration, height = _a.height, widthFactor = _a.widthFactor, color$$1 = _a.color;
            var xs = __spread([0], (cumsum(support)));
            // Render
            // Join
            var rects = selector$$1.selectAll('rect.mo-support').data(support);
            // Enter
            var rectsEnter = rects.enter().append('rect').attr('class', 'mo-support')
                .attr('height', height);
            // Update
            var rectsUpdate = rectsEnter.merge(rects)
                .style('fill', function (d, i) { return color$$1(i); });
            // Transition
            rectsUpdate.transition().duration(duration)
                .attr('width', function (d) { return d * widthFactor; })
                .attr('x', function (d, i) { return xs[i] * widthFactor + i * 1.5; })
                .attr('height', height);
            // Exit
            rects.exit().transition().duration(duration)
                .attr('width', 1e-6).remove();
            return this;
        };
        SupportPainter.prototype.renderMat = function (selector$$1, support) {
            var _a = this.params, height = _a.height, widthFactor = _a.widthFactor, duration = _a.duration, color$$1 = _a.color;
            var trueLabels = support.map(function (s) { return sum$3(s); });
            var predictions = support.length ? sumVec(support) : [];
            var truePredictions = support.map(function (s, i) { return s[i]; });
            var total = sum$3(predictions);
            var falsePredictions = minus(predictions, truePredictions);
            var width = total * widthFactor;
            var widths = predictions.map(function (l) { return l * widthFactor; });
            var xs = __spread([0], (cumsum(widths)));
            // const ys = support.map((s, i) => s[i] / trueLabels[i] * height);
            // const heights = ys.map((y) => height - y);
            var acc = selector$$1.selectAll('text.mo-acc')
                .data(total ? [sum$3(truePredictions) / (total + 1e-6)] : []);
            var accUpdate = acc.enter().append('text')
                .attr('class', 'mo-acc')
                .attr('display', 'none')
                .merge(acc);
            accUpdate.attr('x', width + 5).attr('y', height / 2 + 5).text(function (d) { return "acc: " + d.toFixed(2); });
            selector$$1.on('mouseover', function () {
                accUpdate.attr('display', null);
            }).on('mouseout', function () {
                accUpdate.attr('display', 'none');
            });
            // acc.exit().remove();
            // Render True Rects
            var trueData = support
                .map(function (s, i) { return ({ width: widths[i], x: xs[i], data: [truePredictions[i], falsePredictions[i]], label: i }); })
                .filter(function (v) { return v.width > 0; });
            // // Join
            // const rects = selector.selectAll('rect.mo-support-true')
            //   .data(trueData);
            // // Enter
            // const rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
            //   .attr('height', height);
            // // Update
            // const rectsUpdate = rectsEnter.merge(rects)
            //   .style('fill', d => color(d.label))
            //   .style('stroke', d => color(d.label));
            // // Transition
            // rectsUpdate.transition().duration(duration)
            //   .attr('width', d => d.width)
            //   .attr('x', (d, i) => d.x + i * 1.5)
            //   .attr('height', d => d.height);
            // // Exit
            // rects.exit().transition().duration(duration)
            //   .attr('width', 1e-6).remove();
            // Register the stripes
            var stripeNames = registerPatterns(color$$1, sequence(trueLabels.length));
            // Render the misclassified part using stripes
            var root = selector$$1.selectAll('g.mo-support-mat')
                .data(trueData);
            // enter
            var rootEnter = root.enter().append('g')
                .attr('class', 'mo-support-mat');
            // update
            var rootUpdate = rootEnter.merge(root).style('stroke', function (d) { return color$$1(d.label); });
            // update transition
            rootUpdate.transition().duration(duration)
                .attr('transform', function (d, i) { return "translate(" + (d.x + i * 1.5) + ",0)"; });
            // root exit
            var exitTransition = root.exit().transition().duration(duration).remove();
            exitTransition.selectAll('rect.mo-support-mat').attr('width', 1e-6).attr('x', 1e-6);
            // stripe rects
            var rects = rootUpdate.selectAll('rect.mo-support-mat')
                .data(function (d) {
                // const xs = [0, ...(nt.cumsum(d))];
                var base = sum$3(d.data);
                var factor = base ? d.width / base : 0;
                var _widths = d.data.map(function (v) { return v * factor; });
                var _xs = __spread([0], cumsum(_widths));
                // console.log(factor); // tslint:disable-line
                var ret = d.data.map(function (v, j) { return ({
                    width: _widths[j], x: _xs[j], label: d.label,
                    fill: j === 0 ? color$$1(d.label) : "url(\"#" + stripeNames[d.label] + "\")"
                }); });
                return ret.filter(function (r) { return r.width > 0; });
            });
            var stripeEnter = rects.enter().append('rect')
                .attr('class', 'mo-support-mat').attr('height', function (d) { return height; });
            var stripeUpdate = stripeEnter.merge(rects)
                // .classed('striped', d => d.striped)
                // .style('stroke', d => color(d.label))
                // .style('display', d => d.striped ? 'inline' : 'none')
                .style('fill', function (d) { return d.fill; });
            stripeUpdate.transition().duration(duration)
                .attr('height', function (d) { return height; })
                .attr('width', function (d) { return d.width; }).attr('x', function (d) { return d.x; });
            rects.exit().transition().duration(duration)
                .attr('width', 1e-6).attr('x', 1e-6).remove();
            return this;
        };
        SupportPainter.prototype.renderMatBack = function (selector$$1, support) {
            var _a = this.params, height = _a.height, widthFactor = _a.widthFactor, duration = _a.duration, color$$1 = _a.color;
            var trueLabels = support.map(function (s) { return sum$3(s); });
            // const total = nt.sum(trueLabels);
            // const width = total * widthFactor;
            var widths = trueLabels.map(function (l) { return l * widthFactor; });
            var xs = __spread([0], (cumsum(widths)));
            var ys = support.map(function (s, i) { return s[i] / trueLabels[i] * height; });
            // const heights = ys.map((y) => height - y);
            // Render True Rects
            var trueData = support
                .map(function (s, i) { return ({ width: widths[i], x: xs[i], height: ys[i], data: s, label: i }); })
                .filter(function (v) { return v.width > 0; });
            // Join
            var rects = selector$$1.selectAll('rect.mo-support-true')
                .data(trueData);
            // Enter
            var rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
                .attr('height', height);
            // Update
            var rectsUpdate = rectsEnter.merge(rects)
                .style('fill', function (d) { return color$$1(d.label); })
                .style('stroke', function (d) { return color$$1(d.label); });
            // Transition
            rectsUpdate.transition().duration(duration)
                .attr('width', function (d) { return d.width; })
                .attr('x', function (d, i) { return d.x + i * 1.5; })
                .attr('height', function (d) { return d.height; });
            // Exit
            rects.exit().transition().duration(duration)
                .attr('width', 1e-6).remove();
            // Register the stripes
            var stripeNames = registerPatterns(color$$1, sequence(trueLabels.length));
            // Render the misclassified part using stripes
            var root = selector$$1.selectAll('g.mo-support-mat')
                .data(trueData);
            // enter
            var rootEnter = root.enter().append('g')
                .attr('class', 'mo-support-mat');
            // update
            var rootUpdate = rootEnter.merge(root).style('stroke', function (d) { return color$$1(d.label); });
            // update transition
            rootUpdate.transition().duration(duration)
                .attr('transform', function (d, i) { return "translate(" + (d.x + i * 1.5) + "," + d.height + ")"; });
            // root exit
            var exitTransition = root.exit().transition().duration(duration).remove();
            exitTransition.selectAll('rect.mo-support-mat').attr('width', 1e-6).attr('x', 1e-6);
            // stripe rects
            var stripeRects = rootUpdate.selectAll('rect.mo-support-mat')
                .data(function (d) {
                // const xs = [0, ...(nt.cumsum(d))];
                var base = sum$3(d.data) - d.data[d.label];
                var factor = base ? d.width / base : 0;
                var _widths = d.data.map(function (v, j) { return j === d.label ? 0 : v * factor; });
                var _xs = __spread([0], cumsum(_widths));
                // console.log(factor); // tslint:disable-line
                var ret = d.data.map(function (v, j) { return ({
                    height: height - d.height,
                    width: _widths[j], x: _xs[j], label: j
                }); });
                return ret.filter(function (r) { return r.width > 0; });
            });
            var stripeEnter = stripeRects.enter().append('rect')
                .attr('class', 'mo-support-mat').attr('height', function (d) { return d.height; });
            var stripeUpdate = stripeEnter.merge(stripeRects)
                // .classed('striped', d => d.striped)
                // .style('stroke', d => color(d.label))
                // .style('display', d => d.striped ? 'inline' : 'none')
                .style('fill', function (d) { return "url(#" + stripeNames[d.label] + ")"; });
            stripeUpdate.transition().duration(duration)
                .attr('height', function (d) { return d.height; })
                .attr('width', function (d) { return d.width; }).attr('x', function (d) { return d.x; });
            stripeRects.exit().transition().duration(duration)
                .attr('width', 1e-6).attr('x', 1e-6).remove();
            return this;
        };
        SupportPainter.defaultParams = {
            color: labelColor,
            duration: defaultDuration,
        };
        return SupportPainter;
    }());
    var OutputPainter = /** @class */ (function () {
        function OutputPainter() {
            this.params = __assign({}, (OutputPainter.defaultParams));
            this.supportPainter = new SupportPainter();
        }
        OutputPainter.prototype.update = function (params) {
            this.params = __assign({}, (OutputPainter.defaultParams), (this.params), params);
            return this;
        };
        OutputPainter.prototype.data = function (newData) {
            this.rules = newData;
            return this;
        };
        OutputPainter.prototype.render = function (selector$$1) {
            var duration = this.params.duration;
            var rules = this.rules;
            this.useMat = rules.length > 0 && isMat$1(rules[0].support);
            // console.log('useMat', rules[0].support); // tslint:disable-line
            // console.log('useMat', this.useMat); // tslint:disable-line
            var collapseYs = new Map();
            rules.forEach(function (r) { return isRuleGroup$$1(r) && r.rules.forEach(function (_r) { return collapseYs.set("o-" + _r.idx, r.y); }); });
            this.renderHeader(selector$$1);
            // ROOT Group
            var groups = selector$$1.selectAll('g.matrix-outputs')
                .data(rules, function (r) { return r ? "o-" + r.idx : this.id; });
            // Enter
            var groupsEnter = groups.enter()
                .append('g')
                .attr('class', 'matrix-outputs')
                .attr('id', function (d) { return "o-" + d.idx; })
                .attr('transform', function (d) { return d.parent ? "translate(10, " + (d.y - 40) + ")" : 'translate(10, 0)'; });
            // Update
            var groupsUpdate = groupsEnter.merge(groups)
                .classed('hidden', false).classed('visible', true);
            var updateTransition = groupsUpdate.transition().duration(duration)
                .attr('transform', function (d) { return "translate(10," + d.y + ")"; });
            this.renderOutputs(groupsEnter, groupsUpdate, updateTransition);
            this.renderFidelity(groupsEnter, groupsUpdate, updateTransition);
            this.renderSupports(groupsEnter, groupsUpdate);
            // Exit
            groups.exit()
                .classed('hidden', true).classed('visible', false)
                .transition().duration(duration)
                .attr('transform', function (d, i, nodes) {
                return "translate(10," + collapseYs.get(nodes[i].id) + ")";
            });
            return this;
        };
        OutputPainter.prototype.renderHeader = function (root) {
            // make sure the group exists
            // console.log('here'); // tslint:disable-line
            var _a = this.params, duration = _a.duration, displayEvidence = _a.displayEvidence, displayFidelity = _a.displayFidelity;
            var rules = this.rules;
            // const confidence = nt.sum(rules.map((r) => r.totalSupport * r.output[r.label])) / totalSupport;
            root.selectAll('g.mo-headers').data(['g']).enter()
                .append('g').attr('class', 'mo-headers').attr('transform', 'translate(0,-20)');
            var headerTexts = ['Output (Pr)', 'Evidence'];
            var headerXs = [15, 80];
            var fillRatios = [0, 0];
            var rectWidths = [80, 67];
            if (this.useMat) {
                var totalSupport = sum$3(rules.map(function (r) { return r.totalSupport; }));
                var fidelity = sum$3(rules.map(function (r) { return isMat$1(r.support) ? sum$3(r.support.map(function (s) { return s[r.label]; })) : 0; })) / totalSupport;
                var acc = sum$3(rules.map(function (r) { return isMat$1(r.support) ? sum$3(r.support.map(function (s, i) { return s[i]; })) : 0; })) / totalSupport;
                headerTexts = ['Output (Pr)', "Fidelity (" + (fidelity * 100).toFixed(0) + "/100)",
                    "Evidence (Acc: " + acc.toFixed(2) + ")"];
                headerXs = [15, 75, 125];
                rectWidths = [80, 110, 135];
                fillRatios = [0, fidelity, acc];
            }
            if (!displayEvidence && headerTexts.length === 3) {
                headerTexts = headerTexts.slice(0, 2);
                if (!displayFidelity) {
                    headerTexts = headerTexts.slice(0, 1);
                }
            }
            else if (!displayFidelity) {
                headerTexts = headerTexts.slice(0, 1);
            }
            var headers = root.select('g.mo-headers');
            var header = headers.selectAll('g.mo-header').data(headerTexts);
            var headerEnter = header.enter().append('g').attr('class', 'mo-header')
                .attr('transform', function (d, i) { return "translate(" + headerXs[i] + ",0) rotate(-50)"; })
                .style('font-size', 14);
            // rects
            headerEnter.append('rect')
                .attr('class', 'mo-header-box')
                .style('stroke-width', 1).style('stroke', '#1890ff').style('fill', '#fff')
                .attr('width', function (d, i) { return rectWidths[i]; }).attr('height', 20)
                .attr('rx', 2).attr('ry', 2);
            // rects
            headerEnter.append('rect').attr('class', 'mo-header-fill')
                .style('stroke-width', 1).style('stroke', '#1890ff')
                .style('fill', '#1890ff').style('fill-opacity', 0.1)
                .attr('height', 20)
                .attr('rx', 2).attr('ry', 2);
            // texts
            headerEnter.append('text')
                .attr('class', 'mo-header-text')
                .attr('text-anchor', 'start')
                .attr('fill', '#1890ff')
                .attr('dx', 3).attr('dy', 15);
            // Update
            var headerUpdate = headerEnter.merge(header);
            headerUpdate.select('text.mo-header-text').text(function (d) { return d; });
            var transition$$1 = headerUpdate.transition().duration(duration)
                .attr('transform', function (d, i) { return "translate(" + headerXs[i] + ",0) rotate(-50)"; });
            transition$$1.select('rect.mo-header-box').attr('width', function (d, i) { return rectWidths[i]; });
            transition$$1.select('rect.mo-header-fill')
                .attr('width', function (d, i) { return fillRatios[i] * rectWidths[i]; });
            // textsEnter.merge(texts).text(d => d);
            return this;
        };
        OutputPainter.prototype.renderOutputs = function (enter, update, updateTransition) {
            var _a = this.params, fontSize = _a.fontSize, color$$1 = _a.color, duration = _a.duration;
            // const outputWidth = fontSize * 2;
            // *Output Texts*
            // Enter
            enter.append('text').attr('class', 'mo-output').attr('text-anchor', 'middle').attr('dx', 15);
            // Update
            update.select('text.mo-output')
                .attr('font-size', function (d) { return isRuleGroup$$1(d) ? fontSize * 0.8 : fontSize; })
                .text(function (d) {
                return isRuleGroup$$1(d) ? '' : (Math.round(d.output[d.label] * 100) / 100).toFixed(2);
            }); // confidence as text
            // Transition
            updateTransition.select('text.mo-output')
                .style('fill', function (d) {
                return color$$1(d.label);
            }
            // d3.interpolateRgb.gamma(2.2)('#ccc', '#000')(d.output[d.label] * 2 - 1)
            // d3.interpolateRgb.gamma(2.2)('#ddd', color(d.label))(d.output[d.label] * 2 - 1)
            )
                .attr('dy', function (d) { return d.height / 2 + fontSize * 0.4; });
            // *Output Bars*
            var rectHeight = fontSize;
            enter.append('g').attr('class', 'mo-outputs');
            // Transition
            updateTransition.select('g.mo-outputs')
                .attr('transform', function (d) { return "translate(30," + (d.height / 2 - fontSize * 0.4) + ")"; });
            // Rects
            var rects = update.select('g.mo-outputs')
                .selectAll('rect')
                .data(function (d) {
                if (isRuleGroup$$1(d))
                    return [];
                var y = 0;
                return d.output.map(function (o) {
                    var ret = { o: o, y: y };
                    y += o * rectHeight;
                    return ret;
                });
            });
            var rectsUpdate = rects.enter().append('rect')
                .merge(rects);
            rectsUpdate.attr('width', 3).style('fill', function (d, i) { return color$$1(i); })
                .transition().duration(duration)
                .attr('height', function (d) { return d.o * rectHeight; })
                .attr('y', function (d) { return d.y; });
            rects.exit().transition().duration(duration)
                .style('fill-opacity', 1e-6).remove();
            enter.append('path').attr('class', 'mo-divider')
                .attr('stroke-width', 0.5)
                .attr('stroke', '#444')
                .attr('d', function (d) { return "M 60 0 V " + d.height; });
            update.select('path.mo-divider').attr('d', function (d) { return "M 50 0 V " + d.height; });
            return this;
        };
        OutputPainter.prototype.renderFidelity = function (enter, update, updateTransition) {
            var _a = this.params, duration = _a.duration, displayFidelity = _a.displayFidelity;
            if (!displayFidelity) {
                update.select('g.mo-fidelity').attr('display', 'none');
                return this;
            }
            var fontSize = 13;
            var innerRadius = fontSize * 0.9;
            // const outputWidth = fontSize * 2;
            var dx = 80;
            var arc$$1 = arc().innerRadius(innerRadius).outerRadius(innerRadius + 2).startAngle(0);
            // *Output Texts*
            // Enter
            var enterGroup = enter.append('g').attr('class', 'mo-fidelity');
            enterGroup.append('text').attr('class', 'mo-fidelity').attr('text-anchor', 'middle');
            enterGroup.append('path').attr('class', 'mo-fidelity')
                .attr('angle', 1e-4)
                .attr('d', arc$$1({ endAngle: 1e-4 }));
            // Update
            var updateGroup = update.select('g.mo-fidelity')
                .datum(function (d) {
                var fidelity = isMat$1(d.support)
                    ? (sum$3(d.support.map(function (s) { return s[d.label]; })) / (d.totalSupport + 1e-6)) : undefined;
                var color$$1 = fidelity !== undefined
                    ? (fidelity > 0.8 ? '#52c41a' : fidelity > 0.5 ? '#faad14' : '#f5222d') : null;
                var angle = (!isRuleGroup$$1(d) && fidelity !== undefined) ? (Math.PI * fidelity * 2 - 1e-3) : 0;
                return __assign({}, d, { fidelity: fidelity, color: color$$1, angle: angle });
            });
            updateGroup.select('text.mo-fidelity')
                .attr('font-size', function (d) { return isRuleGroup$$1(d) ? fontSize * 0.8 : fontSize; })
                .attr('dy', fontSize * 0.4)
                // .attr('dx', dx)
                .text(function (d) {
                return (!isRuleGroup$$1(d) && d.fidelity !== undefined) ? (Math.round(d.fidelity * 100)).toFixed(0) : '';
            })
                .style('fill', function (d) { return d.color; });
            // Join
            updateGroup.transition().duration(duration)
                .attr('transform', function (d) { return "translate(" + dx + ", " + d.height / 2 + ")"; })
                .select('path.mo-fidelity')
                // update pos
                .attrTween('d', function (d) {
                var angle = Number(select(this).attr('angle'));
                return arcTween(angle, (!isRuleGroup$$1(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0, arc$$1);
            })
                // .attr('d', d => arc({endAngle: (!isRuleGroup(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0}))
                .style('fill', function (d) { return d.color; })
                .attr('angle', function (d) { return d.angle; });
            // Enter + Merge
            // const pathsUpdate = paths.enter()
            //   .append('path').attr('d', d => arc({endAngle: 0}))
            //   .attr('class', 'mo-fidelity')
            //   .merge(paths);
            // // transition
            // pathsUpdate.transition().duration(duration)
            //   .attr('d', d => arc({endAngle: Math.PI * d * 2}));
            // paths.exit().transition().duration(duration)
            //   .style('fill-opacity', 1e-6).remove();
            return this;
        };
        OutputPainter.prototype.renderSupports = function (enter, update) {
            var _this = this;
            var _a = this.params, duration = _a.duration, fontSize = _a.fontSize, widthFactor = _a.widthFactor, color$$1 = _a.color, elemHeight = _a.elemHeight, displayEvidence = _a.displayEvidence;
            if (!displayEvidence) {
                update.select('g.mo-supports').attr('display', 'none');
                return this;
            }
            var useMat = this.useMat;
            // Enter
            enter.append('g').attr('class', 'mo-supports');
            // Update
            var supports = update.select('g.mo-supports');
            supports.transition().duration(duration)
                .attr('transform', function (_a) {
                var height = _a.height;
                var x = useMat ? (fontSize * 8) : (fontSize * 5);
                var y = (elemHeight && elemHeight < height) ? ((height - elemHeight) / 2) : 0;
                return "translate(" + x + "," + y + ")";
            });
            // const height = supports.each
            // supports
            supports.each(function (_a, i, nodes) {
                var support = _a.support, height = _a.height;
                return support && _this.supportPainter
                    .update({ widthFactor: widthFactor, height: (elemHeight && elemHeight < height) ? elemHeight : height, color: color$$1 })
                    .data(support)
                    .render(select(nodes[i]));
            });
            return this;
        };
        OutputPainter.defaultParams = {
            color: labelColor,
            duration: defaultDuration,
            fontSize: 14,
            widthFactor: 200,
            displayEvidence: true,
            displayFidelity: true,
        };
        return OutputPainter;
    }());

    var HeaderPainter = /** @class */ (function () {
        function HeaderPainter() {
            this.params = __assign({}, (HeaderPainter.defaultParams));
        }
        HeaderPainter.prototype.update = function (params) {
            this.params = __assign({}, (HeaderPainter.defaultParams), (this.params), params);
            return this;
        };
        HeaderPainter.prototype.data = function (newData) {
            this.features = newData;
            return this;
        };
        HeaderPainter.prototype.render = function (selector$$1) {
            var _a = this.params, duration = _a.duration, headerSize = _a.headerSize, rotate = _a.rotate, margin = _a.margin, maxHeight = _a.maxHeight, onClick = _a.onClick;
            var maxCount = max(this.features, function (f) { return f.count; });
            var multiplier = maxHeight / (maxCount || 5);
            /* TEXT GROUP */
            var textG = selector$$1.selectAll('g.header').data(this.features);
            // ENTER
            var textGEnter = textG.enter().append('g').attr('class', 'header')
                .attr('transform', function (d) { return "translate(" + (d.x + d.width / 2) + "," + -10 + ") rotate(" + rotate + ")"; });
            // Append rects
            textGEnter.append('rect').attr('class', 'header-bg')
                .attr('rx', 1).attr('ry', 1)
                .attr('height', headerSize * 1.3).attr('x', -2).attr('y', -headerSize);
            // Append texts
            textGEnter.append('text').attr('class', 'header-text').attr('text-anchor', 'start');
            // UPDATE
            var textGUpdate = textGEnter.merge(textG)
                .on('click', (onClick ? (function (d) { return onClick(d.feature); }) : null));
            textGUpdate.select('text.header-text').style('font-size', headerSize)
                .classed('header-expanded', function (d) { return Boolean(d.expanded); })
                .text(function (d) { return d.text + " (" + d.count + ")"; });
            // TRANSITION
            var updateTransition = textGUpdate.transition().duration(duration)
                .attr('transform', function (d) {
                return "translate(" + (d.x + d.width / 2) + "," + (d.expanded ? -40 : -10) + ") rotate(" + rotate + ")";
            });
            // Text transition
            updateTransition.select('text.header-text')
                .style('font-size', headerSize);
            // Rect transition
            updateTransition.select('rect.header-bg')
                .attr('height', headerSize * 1.3).attr('width', function (d) { return d.count * multiplier; })
                .attr('y', -headerSize);
            // EXIT
            textG.exit().transition().duration(duration)
                .attr('transform', "translate(0,-10) rotate(" + rotate + ")").remove();
            /*AXIS*/
            var expandedFeatures = this.features.filter(function (f) { return f.expanded; });
            var axis = selector$$1.selectAll('g.header-axis').data(expandedFeatures);
            // Enter + Merge
            var axisUpdate = axis.enter()
                .append('g').attr('class', 'header-axis')
                .merge(axis)
                .attr('transform', function (d) { return "translate(" + d.x + ", -5)"; });
            axisUpdate.each(function (d, i, nodes) {
                if (d.expanded) {
                    var featureAxis = null;
                    if (d.range && d.cutPoints) {
                        var ticks$$1 = __spread([d.range[0]], (d.cutPoints), [d.range[1]]);
                        var scale = linear$2().domain(d.range).range([margin.left, d.width - margin.right]);
                        featureAxis = axisTop(scale).tickValues(ticks$$1).tickSize(2);
                    }
                    if (d.categories) {
                        var scale = point$1().domain(d.categories).range([margin.left, d.width - margin.right]);
                        featureAxis = axisTop(scale).tickValues(d.categories).tickSize(2);
                    }
                    if (featureAxis)
                        select(nodes[i]).call(featureAxis)
                            .selectAll('text').style('text-anchor', 'start')
                            .attr('dx', '.4em')
                            .attr('dy', '.5em')
                            .attr('transform', 'rotate(-50)');
                }
            });
            axis.exit().remove();
            return this;
        };
        HeaderPainter.defaultParams = {
            duration: defaultDuration,
            rotate: -50,
            headerSize: 13,
            margin: { left: 1, right: 1 },
            maxHeight: 80,
        };
        return HeaderPainter;
    }());

    function computeExistingFeatures(rules, nFeatures) {
        var featureCounts = new Array(nFeatures).fill(0);
        for (var i = 0; i < rules.length - 1; ++i) {
            if (isRuleGroup$$1(rules[i]))
                continue; // do not display the these features
            var conditions = rules[i].conditions;
            for (var j = 0; j < conditions.length; ++j) {
                featureCounts[conditions[j].feature] += 1;
            }
        }
        var sortedIdx = rankRuleFeatures(rules, nFeatures);
        var features = sortedIdx.filter(function (f) { return featureCounts[f] > 0; });
        return { features: features, featureCounts: featureCounts };
    }
    /**
     * Convert the rules of Rule type to RuleX type (used for presentation only)
     */
    function initRuleXs(rules, model) {
        return rules.map(function (r, i) {
            var conditions = r.conditions, rest = __rest(r, ["conditions"]);
            var conditionXs = [];
            // if (i !== rules.length - 1) 
            var conditionsFiltered = conditions.filter(function (c) { return c.feature >= 0; });
            conditionXs = conditionsFiltered.map(function (c) { return (__assign({}, c, { ruleIdx: r.idx, desc: model.categoryMathDesc(c.feature, c.category), title: model.categoryDescription(c.feature, c.category), x: 0, width: 0, height: 0, interval: model.categoryInterval(c.feature, c.category), expanded: false, range: model.meta.ranges[c.feature], 
                // histRange: model.categoryHistRange(c.feature, c.category),
                isCategorical: model.meta.isCategorical[c.feature] })); });
            return __assign({}, rest, { conditions: conditionXs, height: 0, x: 0, y: 0, width: 0, expanded: false });
        });
    }
    var RuleMatrixPainter = /** @class */ (function () {
        function RuleMatrixPainter() {
            this.expandedElements = new Set();
            this.activeFeatures = new Set();
            this.rowPainter = new RuleRowPainter();
            this.flowPainter = new FlowPainter();
            this.outputPainter = new OutputPainter();
            this.headerPainter = new HeaderPainter();
            this.collapseAll = this.collapseAll.bind(this);
            this.clickExpand = this.clickExpand.bind(this);
            this.clickFeature = this.clickFeature.bind(this);
            this.clickCondition = this.clickCondition.bind(this);
        }
        RuleMatrixPainter.prototype.feature2Idx = function (f) {
            return this.f2Idx[f];
        };
        RuleMatrixPainter.prototype.update = function (params) {
            this.params = __assign({}, (RuleMatrixPainter.defaultParams), (this.params), params);
            return this;
        };
        RuleMatrixPainter.prototype.collapseAll = function () {
            if (this.expandedElements.size) {
                this.expandedElements.clear();
                this.render(this.selector);
            }
        };
        RuleMatrixPainter.prototype.clickExpand = function (r) {
            var rules = this.rules;
            var rule = rules[r];
            // Clicking on the button of a group to expand
            if (isRuleGroup$$1(rule)) {
                // console.log(`Expand rule group ${r}`); // tslint:disable-line
                var nested = initRuleXs(rule.rules, this.model);
                nested[0].expanded = true; // this flag is used for drawing the button
                this.rules = __spread(rules.slice(0, r), nested, rules.slice(r + 1));
            }
            else {
                // Clicking on the button to collapse
                var i = r + 1;
                var nested = [rule];
                while (i < rules.length && rules[i].parent === rule.parent) {
                    nested.push(rules[i]);
                    i++;
                }
                // console.log(`Collapse rules [${r}, ${i})`); // tslint:disable-line
                var grouped = initRuleXs([groupRules(nested)], this.model);
                this.rules = __spread(rules.slice(0, r), grouped, rules.slice(i));
            }
            this.render(this.selector);
        };
        RuleMatrixPainter.prototype.clickCondition = function (r, f) {
            var key = r + "," + f;
            // console.log(`clicked ${key}`); // tslint:disable-line
            if (this.expandedElements.has(key)) {
                this.expandedElements.delete(key);
            }
            else {
                this.expandedElements.add(key);
            }
            this.render(this.selector);
        };
        RuleMatrixPainter.prototype.clickFeature = function (f) {
            if (this.activeFeatures.has(f)) {
                this.activeFeatures.delete(f);
                this.clickCondition(-1, f);
            }
            else {
                this.activeFeatures.add(f);
                this.clickCondition(-1, f);
            }
            // this.render(this.selector);
        };
        RuleMatrixPainter.prototype.updateRules = function () {
            var _a = this.params, model = _a.model, minSupport = _a.minSupport, support = _a.support;
            if (this.model !== model || this.minSupport !== minSupport || this.support !== support) {
                // console.log('Updating Rules'); // tslint:disable-line
                var rules = model.getRules();
                var nFeatures = model.nFeatures;
                // Filter rules by grouping
                var supportSum = sum$3(rules.map(function (r) { return r.totalSupport; }));
                var groupedRules = groupBySupport(rules, minSupport * supportSum);
                this.rules = initRuleXs(groupedRules, model);
                // compute feature Mapping
                var _b = computeExistingFeatures(this.rules, nFeatures), features = _b.features, featureCounts = _b.featureCounts;
                var f2Idx_1 = new Array(nFeatures).fill(-1);
                features.forEach(function (f, i) { return f2Idx_1[f] = i; });
                this.features = features;
                this.featureCounts = featureCounts;
                this.f2Idx = f2Idx_1;
            }
            this.support = support;
            this.minSupport = minSupport;
            this.model = model;
            return this;
        };
        RuleMatrixPainter.prototype.updatePresentation = function () {
            var _a = this.params, expandFactor = _a.expandFactor, elemWidth = _a.elemWidth, elemHeight = _a.elemHeight, paddingX = _a.paddingX, paddingY = _a.paddingY, paddingLeft = _a.paddingLeft;
            // compute active sets
            var expandedRules = new Set();
            var expandedFeatures = new Set();
            this.expandedElements.forEach(function (s) {
                var rf = s.split(',');
                expandedRules.add(Number(rf[0]));
                expandedFeatures.add(Number(rf[1]));
            });
            // compute the widths and heights
            var expandWidth = elemWidth * expandFactor[0];
            var expandHeight = elemHeight * expandFactor[1];
            var groupedHeight = Math.min(elemHeight, Math.max(elemHeight / 2, 10) - 2);
            var padX = paddingX * elemWidth;
            var padY = paddingY * elemHeight;
            var padLeft = paddingLeft * elemWidth;
            var featureWidths = this.features.map(function (f) { return (expandedFeatures.has(f) ? expandWidth : elemWidth); });
            var ruleHeights = this.rules.map(function (r, i) {
                return (expandedRules.has(i) ? expandHeight : (isRuleGroup$$1(r) ? groupedHeight : elemHeight));
            });
            var ys = ruleHeights.map(function (h) { return h + padY; });
            ys = __spread([0], (cumsum(ys.slice(0, -1))));
            var xs = __spread([padLeft], (featureWidths.map(function (w) { return w + padX; })));
            xs = cumsum(xs.slice(0, -1));
            this.xs = xs;
            this.ys = ys;
            this.widths = featureWidths;
            this.heights = ruleHeights;
            // this.activeRules = activeRules;
            this.expandedFeatures = expandedFeatures;
            return this;
        };
        RuleMatrixPainter.prototype.updatePos = function () {
            var _this = this;
            var _a = this.params, streams = _a.streams, input = _a.input;
            var _b = this, xs = _b.xs, ys = _b.ys, widths = _b.widths, heights = _b.heights, expandedElements = _b.expandedElements, activeFeatures = _b.activeFeatures, model = _b.model;
            var width = xs[xs.length - 1] + widths[widths.length - 1];
            var lastIdx = input ? model.predict(input) : -1;
            // const support = model.getSupportOrSupportMat();
            // console.log(lastIdx); // tslint:disable-line
            // update ruleX positions
            this.rules.forEach(function (r, i) {
                r.y = ys[i];
                r.height = heights[i];
                r.width = isRuleGroup$$1(r) ? width - 10 : width; // isRuleGroup(r) ? (width - 10) : width;
                r.x = isRuleGroup$$1(r) ? 10 : 0;
                r.highlight = i === lastIdx;
                // r.support = support[i];
            });
            // update conditionX positions
            this.rules.forEach(function (r, i) {
                r.conditions.forEach(function (c) {
                    if (c.feature !== -1) {
                        c.x = xs[_this.feature2Idx(c.feature)];
                        c.width = widths[_this.feature2Idx(c.feature)];
                        c.height = heights[i];
                        c.expanded = expandedElements.has(i + "," + c.feature);
                        c.active = activeFeatures.has(c.feature);
                        c.value = (i <= lastIdx && input) ? input[c.feature] : undefined;
                    }
                    if (streams) {
                        if (isConditionalStreams(streams))
                            c.stream = streams[i][c.feature];
                        else
                            c.stream = streams[c.feature];
                    }
                });
            });
            return this;
        };
        RuleMatrixPainter.prototype.render = function (selector$$1) {
            var _a = this.params, x0 = _a.x0, y0 = _a.y0;
            this.selector = selector$$1;
            this.updateRules().updatePresentation().updatePos();
            // Global Transform
            selector$$1.attr('transform', "translate(" + x0 + ", " + y0 + ")");
            // selector.selectAll('rect.bg').data(['rect-bg']).enter()
            //   .append('rect').attr('class', 'bg');
            // Root Container
            selector$$1.selectAll('g.container').data(['container']).enter()
                .append('g').attr('class', 'container');
            var container = selector$$1.select('g.container');
            // Rule Root
            container.selectAll('g.rules').data(['rules']).enter()
                .append('g').attr('class', 'rules');
            var ruleRoot = container.select('g.rules');
            // Flow Root
            container.selectAll('g.flows').data(['flows']).enter()
                .append('g').attr('class', 'flows');
            var flowRoot = container.select('g.flows');
            // Header Root
            container.selectAll('g.headers').data(['headers']).enter()
                .append('g').attr('class', 'headers');
            var headerRoot = container.select('g.headers');
            // Output
            container.selectAll('g.outputs').data(['outputs']).enter()
                .append('g').attr('class', 'outputs');
            var outputRoot = container.select('g.outputs');
            // CursorFollow
            container.selectAll('g.cursor-follow').data(['cursor-follow']).enter()
                .append('g').attr('class', 'cursor-follow');
            var cursorFollow = container.select('g.cursor-follow');
            // Render cursorFollow first, because the we need to register tooltip to rowPainter
            this.renderCursorFollow(container, cursorFollow);
            this.renderRows(ruleRoot);
            this.renderFlows(flowRoot);
            this.renderHeader(headerRoot);
            this.renderOutputs(outputRoot);
            // Button
            selector$$1.selectAll('g.buttons').data(['buttons']).enter()
                .append('g').attr('class', 'buttons');
            var buttons = selector$$1.select('g.buttons');
            this.renderButton(buttons);
            this.registerZoom(selector$$1, container);
            // selector.select('rect.bg')
            //   .attr('width', this.getWidth() + 400)
            //   .attr('height', this.getHeight() + 400)
            //   .attr('fill', 'white')
            //   .attr('fill-opacity', 1e-6);
            return this;
        };
        RuleMatrixPainter.prototype.renderRows = function (root) {
            var _this = this;
            var _a = this.params, duration = _a.duration, flowWidth = _a.flowWidth, color$$1 = _a.color;
            var rules = this.rules;
            var collapseYs = new Map();
            rules.forEach(function (r) { return isRuleGroup$$1(r) && r.rules.forEach(function (_r) { return collapseYs.set("r-" + _r.idx, r.y); }); });
            // const flatRules = flattenRules(rules);
            root.attr('transform', "translate(" + (flowWidth * 2 + 10) + ",0)");
            // Joined
            var rule = root
                .selectAll('g.matrix-rule')
                .data(this.rules, function (r) { return r ? "r-" + r.idx : this.id; });
            // Enter
            var ruleEnter = rule.enter().append('g').attr('id', function (d) { return "r-" + d.idx; })
                .attr('class', 'matrix-rule')
                .attr('transform', function (d) { return d.parent ? "translate(" + d.x + "," + (d.y - 40) + ")" : 'translate(0,0)'; });
            // Update
            var ruleUpdate = ruleEnter.merge(rule)
                .attr('display', null).classed('hidden', false).classed('visible', true);
            ruleUpdate
                .transition()
                .duration(duration)
                .attr('transform', function (d) { return "translate(" + d.x + "," + d.y + ")"; });
            // Exit
            rule.exit()
                .classed('visible', false)
                .classed('hidden', true)
                .transition()
                .duration(duration)
                .attr('transform', function (d, i, nodes) {
                return "translate(0," + collapseYs.get(nodes[i].id) + ")";
            }).transition().delay(300)
                .attr('display', 'none');
            var painter = this.rowPainter;
            ruleUpdate.each(function (d, i, nodes) {
                // if (i === this.rules.length - 1) return;
                painter.data(d)
                    .update({
                    labelColor: color$$1,
                    // feature2Idx: this.feature2Idx, 
                    onClick: function (f) { return _this.clickCondition(i, f); },
                    onClickButton: function () { return _this.clickExpand(i); },
                })
                    .render(select(nodes[i]));
            });
            return this;
        };
        RuleMatrixPainter.prototype.renderOutputs = function (root) {
            var _a = this.params, evidenceWidth = _a.evidenceWidth, duration = _a.duration, color$$1 = _a.color, flowWidth = _a.flowWidth, elemHeight = _a.elemHeight, displayEvidence = _a.displayEvidence, displayFidelity = _a.displayFidelity;
            var widthFactor = evidenceWidth / this.model.maxSupport;
            var width = this.getWidth();
            root.transition().duration(duration)
                .attr('transform', "translate(" + (width + flowWidth * 2 + 10) + ",0)");
            this.outputPainter.update({ widthFactor: widthFactor, duration: duration, color: color$$1, elemHeight: elemHeight, displayEvidence: displayEvidence, displayFidelity: displayFidelity })
                .data(this.rules).render(root);
            return this;
        };
        RuleMatrixPainter.prototype.renderFlows = function (root) {
            var _a = this.params, flowWidth = _a.flowWidth, color$$1 = _a.color, displayFlow = _a.displayFlow;
            if (!displayFlow) {
                root.remove();
                return this;
            }
            var rules = this.rules;
            var dx = flowWidth + 10; // Math.max(50, flowWidth + 10);
            var flows = rules.map(function (_a) {
                var _support = _a._support, y = _a.y, height = _a.height;
                return ({
                    support: _support, y: y + height / 2
                });
            });
            this.flowPainter.update({ dx: dx, dy: flowWidth, width: flowWidth, color: color$$1 })
                .data(flows).render(root);
            return this;
        };
        RuleMatrixPainter.prototype.renderHeader = function (root) {
            var _a = this.params, duration = _a.duration, headerSize = _a.headerSize, headerRotate = _a.headerRotate, flowWidth = _a.flowWidth;
            var _b = this, xs = _b.xs, widths = _b.widths, features = _b.features, expandedFeatures = _b.expandedFeatures, featureCounts = _b.featureCounts, model = _b.model;
            root.attr('transform', "translate(" + (flowWidth * 2 + 10) + ",0)");
            var featureData = features.map(function (f, i) { return ({
                text: model.meta.featureNames[f],
                x: xs[i],
                width: widths[i],
                count: featureCounts[f],
                cutPoints: model.discretizers[f].cutPoints,
                range: model.meta.ranges[f],
                categories: model.meta.categories[f],
                expanded: expandedFeatures.has(f),
                feature: f
            }); });
            this.headerPainter.data(featureData)
                .update({ duration: duration, rotate: headerRotate, headerSize: headerSize, onClick: this.clickFeature })
                .render(root);
            return this;
        };
        RuleMatrixPainter.prototype.renderCursorFollow = function (root, cursorFollow) {
            cursorFollow.attr('display', 'none');
            var tooltip = this.renderToolTip(cursorFollow);
            var ruler = this.renderLine(cursorFollow);
            var height = this.getHeight();
            var width = this.getWidth();
            var flowWidth = this.params.flowWidth;
            root
                .on('mousemove', function () {
                var pos = mouse(this);
                cursorFollow.attr('transform', "translate(" + pos[0] + ",0)");
                tooltip.attr('transform', "translate(4," + (pos[1] - 6) + ")");
                if (pos[0] < flowWidth || pos[0] > flowWidth + width) {
                    ruler.attr('display', 'none');
                }
                else {
                    ruler.select('line').attr('y2', height);
                    ruler.attr('display', null);
                }
            })
                .on('mouseover', function () { return cursorFollow.attr('display', null); })
                .on('mouseout', function () { return cursorFollow.attr('display', 'none'); });
            this.rowPainter.update({ tooltip: tooltip });
            return this;
        };
        RuleMatrixPainter.prototype.renderToolTip = function (cursorFollow) {
            var tooltipEnter = cursorFollow.selectAll('g.tooltip')
                .data(['tooltip']).enter()
                .append('g').attr('class', 'tooltip')
                .attr('transform', "translate(4,-6)");
            tooltipEnter.append('rect').attr('class', 'tooltip');
            // .attr('stroke', '#444').attr('stroke-opacity', 0.4);
            tooltipEnter.append('text').attr('class', 'tooltip')
                .attr('text-anchor', 'start').attr('dx', 5).attr('dy', -2);
            var tooltip = cursorFollow.select('g.tooltip');
            return tooltip;
        };
        RuleMatrixPainter.prototype.renderLine = function (cursorFollow) {
            // root.
            var ruler = cursorFollow.selectAll('g.cursor-ruler').data(['g'])
                .enter().append('g').attr('class', 'cursor-ruler');
            ruler.append('line').attr('x1', -2).attr('x2', -2).attr('y1', 0).attr('y2', 100);
            // root.on('mouseover.line', () => cursorFollow.attr('display', null));
            // root.on('mouseout.line', )
            return cursorFollow.select('g.cursor-ruler');
            // return this;
        };
        RuleMatrixPainter.prototype.renderButton = function (buttonGroup) {
            buttonGroup.attr('transform', "translate(0,-150)");
            var g = buttonGroup.selectAll('g.reset-button').data(['g']).enter()
                .append('g').attr('class', 'reset-button')
                .on('click', this.collapseAll);
            var rect = g.append('rect').attr('rx', 3).attr('ry', 3)
                .attr('stroke', '#888').attr('fill', 'white');
            var text$$1 = g.append('text')
                .attr('text-anchor', 'start').text('Collapse All')
                .attr('fill', '#444')
                .attr('y', 17).attr('dx', 5);
            var node = text$$1.node();
            var box = node ? node.getBBox() : null;
            rect.attr('width', box ? box.width + 10 : 40)
                .attr('height', box ? box.height + 8 : 20);
            return this;
        };
        RuleMatrixPainter.prototype.registerZoom = function (root, container) {
            var zoomable = this.params.zoomable;
            if (!zoomable) {
                root.on('zoom', null);
                return this;
            }
            // const {x0, y0} = this.params;
            var rootNode = container.node();
            var zoomed = function () {
                if (rootNode) {
                    container.attr('transform', event.transform);
                }
            };
            // console.log(width); // tslint:disable-line
            // console.log(height); // tslint:disable-line
            var zoom$$1 = zoom()
                .scaleExtent([0.5, 2])
                // .translateExtent([[-2000, -2000], [2000, 2000]])
                .on('zoom', zoomed);
            root.call(zoom$$1);
            return this;
        };
        RuleMatrixPainter.prototype.getHeight = function () {
            var lastRule = this.rules[this.rules.length - 1];
            return lastRule.y + lastRule.height;
        };
        RuleMatrixPainter.prototype.getWidth = function () {
            var _a = this, xs = _a.xs, widths = _a.widths;
            return xs[xs.length - 1] + widths[widths.length - 1];
        };
        RuleMatrixPainter.defaultParams = {
            minSupport: 0.01,
            color: labelColor,
            elemWidth: 30,
            elemHeight: 30,
            x0: 20,
            y0: 160,
            duration: defaultDuration,
            fontSize: 12,
            headerSize: 13,
            headerRotate: -50,
            paddingX: 0.1,
            paddingY: 0.2,
            paddingLeft: 0.5,
            evidenceWidth: 150,
            expandFactor: [3, 2],
            flowWidth: 50,
            displayFlow: true,
            displayFidelity: true,
            displayEvidence: true,
            zoomable: false,
            tooltip: true
        };
        return RuleMatrixPainter;
    }());

    var RuleMatrix = /** @class */ (function (_super) {
        __extends(RuleMatrix, _super);
        // private painter: RuleMatrixPainter;
        function RuleMatrix(props) {
            var _this = _super.call(this, props) || this;
            // this.stateUpdated = false;
            var painter = new RuleMatrixPainter();
            _this.state = { painter: painter };
            return _this;
        }
        RuleMatrix.prototype.componentDidUpdate = function () {
            // this.stateUpdated = false;
            this.painterUpdate();
        };
        RuleMatrix.prototype.componentDidMount = function () {
            // if (!this.props.react) {
            this.painterUpdate();
            // }
        };
        RuleMatrix.prototype.painterUpdate = function () {
            var _a = this.props, streams = _a.streams, model = _a.model, x0 = _a.x0, y0 = _a.y0, rectWidth = _a.rectWidth, rectHeight = _a.rectHeight, flowWidth = _a.flowWidth, evidenceWidth = _a.evidenceWidth;
            var _b = this.props, minSupport = _b.minSupport, support = _b.support, input = _b.input, color$$1 = _b.color, displayFlow = _b.displayFlow, displayEvidence = _b.displayEvidence, zoomable = _b.zoomable;
            console.log('updating matrix'); // tslint:disable-line
            this.state.painter.update({
                // dataset,
                streams: streams,
                support: support,
                x0: x0, y0: y0,
                input: input,
                color: color$$1,
                // transform: `translate(100, 160)`,
                elemWidth: rectWidth,
                elemHeight: rectHeight,
                evidenceWidth: evidenceWidth,
                flowWidth: displayFlow ? flowWidth : 0,
                displayFlow: displayFlow,
                displayEvidence: displayEvidence,
                // displayFidelity,
                model: model,
                minSupport: minSupport,
                zoomable: zoomable,
            })
                .render(select(this.ref));
        };
        RuleMatrix.prototype.render = function () {
            var _this = this;
            var _a = this.props, width = _a.width, height = _a.height, x0 = _a.x0, y0 = _a.y0;
            return (undefined("g", { ref: function (ref) { return ref && (_this.ref = ref); }, className: "rule-matrix" },
                undefined("rect", { className: "bg", width: width, height: height, fill: "white", fillOpacity: 1e-6, transform: "translate(" + -(x0 || 0) + ", " + -(y0 || 0) + ")" })));
        };
        RuleMatrix.defaultProps = {
            transform: '',
            flowWidth: 40,
            evidenceWidth: 150,
            rectWidth: 30,
            rectHeight: 30,
            displayFlow: true,
            // displayFidelity: true,
            displayEvidence: true,
            zoomable: true,
            color: labelColor,
            minSupport: 0.02,
            intervalY: 10,
            intervalX: 0.2,
            width: 960,
            height: 800,
            x0: 20,
            y0: 160,
        };
        return RuleMatrix;
    }(undefined));

    function Patterns(props) {
        return (undefined("defs", null,
            undefined("pattern", { id: "pattern-stripe", width: "3", height: "3", patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
                undefined("rect", { width: "1", height: "3", transform: "translate(0,0)", fill: "white" })),
            undefined("mask", { id: "mask-stripe" },
                undefined("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: "url(#pattern-stripe)" }))));
    }

    var Legend = /** @class */ (function (_super) {
        __extends(Legend, _super);
        function Legend(props) {
            return _super.call(this, props) || this;
        }
        Legend.prototype.update = function () {
            var _a = this.props, labels = _a.labels, labelSize = _a.labelSize, fontSize = _a.fontSize, color$$1 = _a.color, duration = _a.duration;
            var delta = labelSize + 80;
            var selector$$1 = select(this.ref);
            var label = selector$$1.selectAll('g.label').data(labels);
            // ENTER
            var labelEnter = label.enter().append('g').attr('class', 'label');
            labelEnter.append('rect')
                // .attr('x', (d: string, i: number) => delta * i)
                .attr('y', -(fontSize + labelSize) / 2)
                .attr('width', labelSize)
                .attr('height', labelSize);
            labelEnter.append('text').attr('text-anchor', 'start').attr('x', labelSize * 1.2);
            var labelUpdate = labelEnter.merge(label)
                .attr('fill', function (d, i) { return color$$1(i); });
            labelUpdate.transition()
                .duration(duration)
                .attr('transform', function (d, i) { return "translate(" + i * delta + ", " + fontSize * 1.2 + ")"; });
            labelUpdate.select('text').text(function (d) { return d; });
            label.exit()
                .transition()
                .duration(duration)
                .style('fill-opacity', 1e-6)
                .remove();
        };
        Legend.prototype.componentDidMount = function () {
            this.update();
        };
        Legend.prototype.componentDidUpdate = function () {
            this.update();
        };
        Legend.prototype.render = function () {
            var _this = this;
            return (undefined("g", { ref: function (ref) { return _this.ref = ref; }, className: "labels", transform: this.props.transform }));
        };
        Legend.defaultProps = {
            labelSize: 10,
            fontSize: 12,
            color: labelColor,
            duration: 400,
            transform: '',
        };
        return Legend;
    }(undefined));

    /**
     * RuleMatrixApp is a functional svg component that wraps RuleMatrix (which renders a group element).
     *
     * @export
     * @class RuleMatrixApp
     * @extends {React.Component<AppProps, AppState>}
     */
    var RuleMatrixApp = /** @class */ (function (_super) {
        __extends(RuleMatrixApp, _super);
        function RuleMatrixApp(props) {
            return _super.call(this, props) || this;
        }
        RuleMatrixApp.prototype.render = function () {
            var _a = this.props, model = _a.model, streams = _a.streams, support = _a.support, input = _a.input, styles = _a.styles;
            var height = (styles && styles.height) ? styles.height : 960;
            var width = (styles && styles.width) ? styles.width : 800;
            return (
            // <div className="App">
            undefined("svg", { id: "main", height: height, width: width },
                undefined(Patterns, null),
                model &&
                    undefined(Legend, { labels: model.meta.labelNames, color: styles && styles.color, transform: "translate(150, 10)" }),
                model && streams && support &&
                    undefined(RuleMatrix, __assign({ model: model, streams: streams, support: support, input: input }, styles)))
            // </div>
            );
        };
        return RuleMatrixApp;
    }(undefined));

    exports.RuleMatrix = RuleMatrix;
    exports.RuleMatrixApp = RuleMatrixApp;
    exports.isSurrogate = isSurrogate;
    exports.createStreams = createStreams;
    exports.createConditionalStreams = createConditionalStreams;
    exports.isConditionalStreams = isConditionalStreams;
    exports.DataSet = DataSet;
    exports.Matrix = Matrix;
    exports.isSupportMat = isSupportMat;
    exports.isRuleGroup = isRuleGroup$$1;
    exports.isRuleModel = isRuleModel$$1;
    exports.RuleList = RuleList$$1;
    exports.groupRules = groupRules;
    exports.groupRulesBy = groupRulesBy;
    exports.groupBySupport = groupBySupport;
    exports.rankRuleFeatures = rankRuleFeatures;
    exports.rankModelFeatures = rankModelFeatures;
    exports.HistPainter = HistPainter$$1;
    exports.StreamPainter = StreamPainter$$1;
    exports.googleColor = googleColor;
    exports.defaultColor = defaultColor;
    exports.labelColor = labelColor;
    exports.sequentialColors = sequentialColors;
    exports.divergingColors = divergingColors;
    exports.defaultDuration = defaultDuration;

    return exports;

}({}));

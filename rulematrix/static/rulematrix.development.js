/* rulematrix.js version 1.0.8 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3'), require('react'), require('react-dom')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3', 'react', 'react-dom'], factory) :
    (factory((global.rulematrix = {}),global.d3,global.React,global.ReactDOM));
}(this, (function (exports,d3,React,ReactDOM) { 'use strict';

    var React__default = 'default' in React ? React['default'] : React;
    var ReactDOM__default = 'default' in ReactDOM ? ReactDOM['default'] : ReactDOM;

    // import { nBins } from '../config';
    function isSurrogate(model) {
        return model.target !== undefined;
    }

    function createStreams(raw) {
        raw.forEach(function (stream) {
            if (!stream.processed) {
                stream.stream = d3.transpose(stream.stream);
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

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
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
        if (a && a.length)
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
    function add(a, b, copy) {
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
            add(ret[i], b[i], false);
        return ret;
    }
    function sum(arr) {
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
    function stack(arrs) {
        var ret = arrs.map(function (arr) { return arr.slice(); });
        for (var i = 1; i < ret.length; i++) {
            add(ret[i], ret[i - 1], false);
        }
        return ret;
    }
    function sumVec(arrs) {
        // if (arrs.length === 0) return ;
        var _sum = arrs[0].slice();
        for (var i = 1; i < arrs.length; ++i) {
            add(_sum, arrs[i], false);
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

    function updateRuleSupport(r, support) {
        if (support) {
            if (isMat(support)) {
                r.support = support;
                r._support = sumVec(r.support);
                r.totalSupport = sum(r._support);
                r.fidelity = r._support[r.label] / r.totalSupport;
            }
            else {
                r.support = undefined;
                r._support = support;
                r.totalSupport = sum(r._support);
                r.fidelity = undefined;
            }
        }
        else {
            r.support = r._support = r.totalSupport = r.fidelity = undefined;
        }
    }
    function isRuleGroup(rule) {
        return rule.rules !== undefined;
    }
    function isRuleModel(model) {
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
    var RuleList = /** @class */ (function () {
        function RuleList(raw) {
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
                if (r.support) {
                    if (isMat(r.support)) {
                        r._support = r.support.map(function (s) { return sum(s); });
                    }
                    else {
                        r._support = r.support;
                        r.support = undefined;
                    }
                }
            });
            this.maxSupport = d3.max(supports, sum) || 0.1;
            // this.minSupport = 0.01;
            this.useSupportMat = false;
            // if (target) this.target = target;
            // bind this
            this.categoryInterval = this.categoryInterval.bind(this);
            this.categoryDescription = this.categoryDescription.bind(this);
            this.categoryHistRange = this.categoryHistRange.bind(this);
            this.interval2HistRange = this.interval2HistRange.bind(this);
        }
        RuleList.prototype.support = function (newSupport) {
            if (newSupport.length !== this.rules.length) {
                throw "Shape not match! newSupport has length " + newSupport.length + ", but " + this.rules.length + " is expected";
            }
            if (isSupportMat(newSupport)) {
                this.supportMats = newSupport;
                this.rules.forEach(function (r, i) { return (r.support = newSupport[i]); });
                this.useSupportMat = true;
                this.maxSupport = d3.max(newSupport, function (mat) { return sum(sumVec(mat)); }) || 0.1;
            }
            else {
                this.supports = newSupport;
                this.useSupportMat = false;
                this.maxSupport = d3.max(newSupport, sum) || 0.1;
            }
            this.rules.forEach(function (r, i) {
                updateRuleSupport(r, newSupport[i]);
            });
            // console.log('Support changed'); // tslint:disable-line
            return this;
        };
        RuleList.prototype.getSupport = function () {
            return this.supports;
        };
        RuleList.prototype.predict = function (data) {
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
        RuleList.prototype.getRules = function () {
            return this.rules;
        };
        RuleList.prototype.categoryInterval = function (f, c) {
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
        RuleList.prototype.categoryMathDesc = function (f, c) {
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
        RuleList.prototype.categoryDescription = function (f, c, abr, maxLength) {
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
        RuleList.prototype.categoryHistRange = function (f, c) {
            if (this.meta.isCategorical[f])
                return [c - 0.5, c + 0.5];
            return this.interval2HistRange(f, this.categoryInterval(f, c));
        };
        RuleList.prototype.interval2HistRange = function (f, interval) {
            if (this.meta.isCategorical[f])
                console.warn("categorical feature " + f + " cannot call this function!");
            var range = this.meta.ranges[f];
            var i0 = interval[0] || range[0];
            var i1 = interval[1] || range[1];
            var step = (range[1] - range[0]) / nBins;
            return [(i0 - range[0]) / step, (i1 - range[0]) / step];
        };
        return RuleList;
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
            if (isRuleGroup(rule)) {
                nested = nested.concat(rule.rules);
            }
            else {
                nested.push(rule);
            }
        }
        var supports = [];
        var _supports = [];
        nested.forEach(function (rule) {
            if (rule.support)
                supports.push(rule.support);
            if (rule._support) {
                _supports.push(rule._support);
            }
        });
        var support;
        var _support;
        // let fidelity: number;
        if (supports.length > 0) {
            support = sumMat(supports);
            // _support = nt.sumVec(support);
            _support = sumVec(support);
        }
        else if (_supports.length > 0) {
            _support = sumVec(_supports);
        }
        var totalSupport = _support && sum(_support);
        var cover = sum(rules.map(function (r) { return r.cover; }));
        var output = sumVec(nested.map(function (r) { return muls(r.output, r.cover / cover); }));
        var label = argMax(output);
        var fidelity = (_support && totalSupport) && (_support[label] / totalSupport);
        var conditions = [];
        rules.forEach(function (r, i) {
            var conds = r.conditions.map(function (c) { return (__assign({}, c, { rank: i })); });
            conditions.push.apply(conditions, __spread(conds));
        });
        var ret = { rules: rules, support: support, _support: _support, output: output, label: label, totalSupport: totalSupport, conditions: conditions, idx: rules[0].idx, cover: cover, fidelity: fidelity };
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
        return groupRulesBy(rules, function (rule) { return rule.totalSupport === undefined ? true : rule.totalSupport >= minSupport; });
    }
    // export function groupBy

    function rankRuleFeatures(rules, nFeatures) {
        var featureImportance = new Array(nFeatures).fill(0);
        rules.forEach(function (r) {
            r.conditions.forEach(function (c) {
                featureImportance[c.feature] += r.cover;
            });
        });
        var features = d3.range(nFeatures);
        features.sort(function (i, j) { return featureImportance[j] - featureImportance[i]; });
        return features;
    }
    function rankModelFeatures(model) {
        if (isRuleModel(model))
            return rankRuleFeatures(model.rules, model.nFeatures);
        else {
            console.warn('Not Implemented!');
            return d3.range(model.nFeatures);
        }
    }

    function colors(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    }

    colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

    colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

    colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

    colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

    colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

    colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

    var Set1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

    colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

    colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

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

    function constant(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function hue(a, b) {
      var d = b - a;
      return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

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

    var degrees = 180 / Math.PI;

    var rho = Math.SQRT2;

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

    function ramp(scheme) {
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
    ).map(colors);

    ramp(scheme);

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
    ).map(colors);

    ramp(scheme$1);

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
    ).map(colors);

    ramp(scheme$2);

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
    ).map(colors);

    ramp(scheme$3);

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
    ).map(colors);

    ramp(scheme$4);

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
    ).map(colors);

    ramp(scheme$5);

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
    ).map(colors);

    ramp(scheme$6);

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
    ).map(colors);

    ramp(scheme$7);

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
    ).map(colors);

    ramp(scheme$8);

    var scheme$9 = new Array(3).concat(
      "e5f5f999d8c92ca25f",
      "edf8fbb2e2e266c2a4238b45",
      "edf8fbb2e2e266c2a42ca25f006d2c",
      "edf8fbccece699d8c966c2a42ca25f006d2c",
      "edf8fbccece699d8c966c2a441ae76238b45005824",
      "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
      "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
    ).map(colors);

    ramp(scheme$9);

    var scheme$a = new Array(3).concat(
      "e0ecf49ebcda8856a7",
      "edf8fbb3cde38c96c688419d",
      "edf8fbb3cde38c96c68856a7810f7c",
      "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
      "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
      "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
      "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
    ).map(colors);

    ramp(scheme$a);

    var scheme$b = new Array(3).concat(
      "e0f3dba8ddb543a2ca",
      "f0f9e8bae4bc7bccc42b8cbe",
      "f0f9e8bae4bc7bccc443a2ca0868ac",
      "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
      "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
      "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
      "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
    ).map(colors);

    ramp(scheme$b);

    var scheme$c = new Array(3).concat(
      "fee8c8fdbb84e34a33",
      "fef0d9fdcc8afc8d59d7301f",
      "fef0d9fdcc8afc8d59e34a33b30000",
      "fef0d9fdd49efdbb84fc8d59e34a33b30000",
      "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
      "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
      "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
    ).map(colors);

    ramp(scheme$c);

    var scheme$d = new Array(3).concat(
      "ece2f0a6bddb1c9099",
      "f6eff7bdc9e167a9cf02818a",
      "f6eff7bdc9e167a9cf1c9099016c59",
      "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
      "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
      "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
      "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
    ).map(colors);

    ramp(scheme$d);

    var scheme$e = new Array(3).concat(
      "ece7f2a6bddb2b8cbe",
      "f1eef6bdc9e174a9cf0570b0",
      "f1eef6bdc9e174a9cf2b8cbe045a8d",
      "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
      "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
      "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
      "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
    ).map(colors);

    ramp(scheme$e);

    var scheme$f = new Array(3).concat(
      "e7e1efc994c7dd1c77",
      "f1eef6d7b5d8df65b0ce1256",
      "f1eef6d7b5d8df65b0dd1c77980043",
      "f1eef6d4b9dac994c7df65b0dd1c77980043",
      "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
      "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
      "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
    ).map(colors);

    ramp(scheme$f);

    var scheme$g = new Array(3).concat(
      "fde0ddfa9fb5c51b8a",
      "feebe2fbb4b9f768a1ae017e",
      "feebe2fbb4b9f768a1c51b8a7a0177",
      "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
      "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
      "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
      "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
    ).map(colors);

    ramp(scheme$g);

    var scheme$h = new Array(3).concat(
      "edf8b17fcdbb2c7fb8",
      "ffffcca1dab441b6c4225ea8",
      "ffffcca1dab441b6c42c7fb8253494",
      "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
      "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
      "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
      "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
    ).map(colors);

    ramp(scheme$h);

    var scheme$i = new Array(3).concat(
      "f7fcb9addd8e31a354",
      "ffffccc2e69978c679238443",
      "ffffccc2e69978c67931a354006837",
      "ffffccd9f0a3addd8e78c67931a354006837",
      "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
      "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
      "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
    ).map(colors);

    ramp(scheme$i);

    var scheme$j = new Array(3).concat(
      "fff7bcfec44fd95f0e",
      "ffffd4fed98efe9929cc4c02",
      "ffffd4fed98efe9929d95f0e993404",
      "ffffd4fee391fec44ffe9929d95f0e993404",
      "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
      "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
      "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
    ).map(colors);

    ramp(scheme$j);

    var scheme$k = new Array(3).concat(
      "ffeda0feb24cf03b20",
      "ffffb2fecc5cfd8d3ce31a1c",
      "ffffb2fecc5cfd8d3cf03b20bd0026",
      "ffffb2fed976feb24cfd8d3cf03b20bd0026",
      "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
      "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
      "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
    ).map(colors);

    ramp(scheme$k);

    var scheme$l = new Array(3).concat(
      "deebf79ecae13182bd",
      "eff3ffbdd7e76baed62171b5",
      "eff3ffbdd7e76baed63182bd08519c",
      "eff3ffc6dbef9ecae16baed63182bd08519c",
      "eff3ffc6dbef9ecae16baed64292c62171b5084594",
      "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
      "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
    ).map(colors);

    ramp(scheme$l);

    var scheme$m = new Array(3).concat(
      "e5f5e0a1d99b31a354",
      "edf8e9bae4b374c476238b45",
      "edf8e9bae4b374c47631a354006d2c",
      "edf8e9c7e9c0a1d99b74c47631a354006d2c",
      "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
      "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
      "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
    ).map(colors);

    ramp(scheme$m);

    var scheme$n = new Array(3).concat(
      "f0f0f0bdbdbd636363",
      "f7f7f7cccccc969696525252",
      "f7f7f7cccccc969696636363252525",
      "f7f7f7d9d9d9bdbdbd969696636363252525",
      "f7f7f7d9d9d9bdbdbd969696737373525252252525",
      "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
      "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
    ).map(colors);

    ramp(scheme$n);

    var scheme$o = new Array(3).concat(
      "efedf5bcbddc756bb1",
      "f2f0f7cbc9e29e9ac86a51a3",
      "f2f0f7cbc9e29e9ac8756bb154278f",
      "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
      "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
      "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
      "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
    ).map(colors);

    ramp(scheme$o);

    var scheme$p = new Array(3).concat(
      "fee0d2fc9272de2d26",
      "fee5d9fcae91fb6a4acb181d",
      "fee5d9fcae91fb6a4ade2d26a50f15",
      "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
      "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
      "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
      "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
    ).map(colors);

    ramp(scheme$p);

    var scheme$q = new Array(3).concat(
      "fee6cefdae6be6550d",
      "feeddefdbe85fd8d3cd94701",
      "feeddefdbe85fd8d3ce6550da63603",
      "feeddefdd0a2fdae6bfd8d3ce6550da63603",
      "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
      "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
      "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
    ).map(colors);

    ramp(scheme$q);

    cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

    var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

    var c = cubehelix();

    var c$1 = rgb(),
        pi_1_3 = Math.PI / 3,
        pi_2_3 = Math.PI * 2 / 3;

    function ramp$1(range) {
      var n = range.length;
      return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
      };
    }

    ramp$1(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

    var magma = ramp$1(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

    var inferno = ramp$1(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

    var plasma = ramp$1(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

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
    var defaultColor = d3.scaleOrdinal(Set1);
    // export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
    // export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory20 as string[]);
    var labelColor = googleColor;
    var sequentialColors = function (n) {
        return (d3.scaleOrdinal(scheme$l[n]));
    };
    var divergingColors = function (n) {
        return (d3.scaleOrdinal(scheme$4[n]));
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
    function brush(range, bars, x) {
        bars.classed('hp-hist-active', function (d, i) {
            var pos = x(d, i);
            return range[0] <= pos && pos < range[1];
        });
    }
    function computeLayout(hists, params) {
        var width = params.width, height = params.height, margin = params.margin, interval = params.interval, padding = params.padding, range = params.range;
        var nBins = checkBins(hists).nBins;
        var xs = params.xs || d3.range(nBins);
        var step = xs[1] - xs[0];
        var xRange = range || [xs[0] - step / 2, xs[xs.length - 1] + step / 2];
        var yMax = Math.max(d3.max(hists, function (hist) { return d3.max(hist); }) || 0, params.yMax || 0);
        var xScaler = d3.scaleLinear()
            .domain(xRange)
            .range([margin.left, width - margin.right]);
        var yScaler = d3.scaleLinear()
            .domain([yMax, 0])
            .range([margin.bottom, height - margin.top]);
        var bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
        var r0 = interval ? interval[0] : 0;
        var r1 = interval ? interval[1] : nBins;
        return { xs: xs, step: step, xScaler: xScaler, yScaler: yScaler, bandWidth: bandWidth, interval: [r0, r1] };
    }
    var HistPainter = /** @class */ (function () {
        function HistPainter() {
        }
        HistPainter.prototype.update = function (params) {
            this.params = __assign({}, HistPainter.defaultParams, this.params, params);
            return this;
        };
        HistPainter.prototype.data = function (newData) {
            this.hists = newData;
            return this;
        };
        HistPainter.prototype.render = function (selector) {
            switch (this.params.mode) {
                case 'overlay':
                    this.renderOverlay(selector);
                    break;
                case 'stack':
                    this.renderStack(selector);
                    break;
                default:
                    break;
            }
            return this;
        };
        HistPainter.prototype.renderBrush = function (selector, xScaler) {
            var _a = this.params, interval = _a.interval, duration = _a.duration, margin = _a.margin, height = _a.height;
            var rangeRect = selector.selectAll('rect.hp-brush')
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
        HistPainter.prototype.renderOverlay = function (selector) {
            var _a = this.params, height = _a.height, color = _a.color, margin = _a.margin, duration = _a.duration, padding = _a.padding, opacity = _a.opacity;
            var hists = this.hists;
            // const histsPacked = packHists(hists, pack);
            var histG = selector.selectAll('g.hp-hists').data(hists);
            // Exit
            var exitTransition = histG
                .exit()
                .transition()
                .duration(duration)
                .remove();
            exitTransition.selectAll('rect').attr('y', height - margin.top).attr('height', 0);
            if (hists.length === 0) {
                this.renderBrush(selector);
                return this;
            }
            // Compute layout stuff
            var _b = computeLayout(hists, this.params), xs = _b.xs, step = _b.step, xScaler = _b.xScaler, yScaler = _b.yScaler, bandWidth = _b.bandWidth, interval = _b.interval;
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
                .style('fill', function (d, i) { return color(i); });
            /* RECTS START */
            var rects = histGUpdate
                .selectAll('rect')
                .data(function (d) { return Array.from(d, function (v, i) { return v; }); });
            // Enter
            var rectsEnter = rects
                .enter()
                .append('rect')
                .attr('x', function (d, i) { return xScaler(xs[i] - step / 2) + padding / 2; })
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
                .attr('x', function (d, i) { return xScaler(xs[i] - step / 2) + padding / 2; })
                .attr('y', yScaler)
                .attr('width', bandWidth)
                .attr('height', function (d) { return yScaler(0) - yScaler(d); });
            brush(interval, rectsUpdate, function (d, i) { return xs[i]; });
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
            this.renderBrush(selector, xScaler);
            return this;
        };
        HistPainter.prototype.renderStack = function (selector) {
            var _a = this.params, interval = _a.interval, width = _a.width, height = _a.height, color = _a.color, margin = _a.margin, duration = _a.duration, padding = _a.padding;
            var hists = this.hists;
            var histG = selector.selectAll('g.hp-hists').data(hists);
            // Exit
            var exitTransition = histG
                .exit()
                .transition()
                .duration(duration)
                .remove();
            exitTransition.attr('y', height - margin.top).attr('height', 0);
            if (hists.length === 0) {
                this.renderBrush(selector);
                return this;
            }
            var nBins = checkBins(hists).nBins;
            var xs = this.params.xs || d3.range(nBins);
            var y1s = stack(hists);
            var y0s = __spread([new Array(hists[0].length).fill(0)], y1s.slice(0, -1));
            var yMax = d3.max(y1s[y1s.length - 1]);
            // const chartWidth = width - margin.left - margin.right;
            var xScaler = d3.scaleLinear()
                .domain([xs[0], xs[xs.length - 1]])
                .range([margin.left, width - margin.right]);
            var yScaler = d3.scaleLinear()
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
                .style('fill', function (d, i) { return color(i); });
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
                brush([r0, r1], rectsUpdate, function (d, i) { return xs[i]; });
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
            this.renderBrush(selector, xScaler);
            return this;
        };
        HistPainter.defaultParams = {
            color: labelColor,
            duration: defaultDuration,
            mode: 'overlay',
            padding: 4,
            margin: { top: 5, bottom: 5, left: 5, right: 5 },
            height: 50,
            width: 100,
            opacity: 0.35,
        };
        return HistPainter;
    }());

    var StreamPainter = /** @class */ (function () {
        function StreamPainter() {
            this.params = __assign({}, (StreamPainter.defaultParams));
        }
        StreamPainter.prototype.update = function (params) {
            this.params = __assign({}, (StreamPainter.defaultParams), (this.params), params);
            return this;
        };
        StreamPainter.prototype.data = function (newData) {
            this.stream = newData;
            return this;
        };
        StreamPainter.prototype.render = function (selector) {
            var _a = this.params, margin = _a.margin, color = _a.color, duration = _a.duration, width = _a.width, height = _a.height, range = _a.range;
            var streamData = this.stream;
            var xs = this.params.xs || d3.range(streamData.length);
            // const step = xs[1] - xs[0];
            var xRange = range || [xs[0], xs[xs.length - 1]];
            // xs = [xRange[0], ...xs, xRange[1]];
            var nStreams = streamData.length ? streamData[0].length : 0;
            var stackLayout = d3.stack()
                .keys(d3.range(nStreams)).offset(d3.stackOffsetSilhouette);
            var stackedStream = stackLayout(streamData);
            var yMin = d3.min(stackedStream, function (stream) { return d3.min(stream, function (d) { return d[0]; }); }) || 0;
            var yMax = d3.max(stackedStream, function (stream) { return d3.max(stream, function (d) { return d[1]; }); }) || 0;
            var diff = Math.max(0, (this.params.yMax || 0) - (yMax - yMin));
            // if (streamData.length) {
            //   console.log(yMax); // tslint:disable-line
            //   console.log(yMin); // tslint:disable-line
            //   console.log(diff);  // tslint:disable-line
            //   console.log(streamData.map(s => nt.sum(s))); // tslint:disable-line
            // }
            var xScaler = d3.scaleLinear()
                .domain(xRange).range([margin.left, width - margin.right]);
            var yScaler = d3.scaleLinear()
                .domain([yMin - diff / 2, yMax + diff / 2]).range([margin.bottom, height - margin.top]);
            var area = d3.area()
                .x(function (d, i) { return xScaler(xs[i]); })
                .y0(function (d, i) { return yScaler(d[0]); })
                .y1(function (d, i) { return yScaler(d[1]); })
                .curve(d3.curveCardinal.tension(0.3));
            var initPos = area(new Array(streamData.length).fill([0, 1e-6]));
            // Join
            var paths = selector.selectAll('path').data(stackedStream);
            // Enter
            var pathEnter = paths.enter().append('path')
                .attr('d', initPos);
            // Update
            var pathUpdate = pathEnter.merge(paths).style('fill', function (d, i) { return color(i); });
            pathUpdate.transition().duration(duration)
                .attr('d', area);
            // Exit
            paths.exit().transition().duration(duration)
                .attr('d', this.initPos).remove();
            this.renderBrush(selector, xScaler);
            this.initPos = initPos;
            return this;
        };
        StreamPainter.prototype.renderBrush = function (selector, xScaler) {
            var _a = this.params, interval = _a.interval, duration = _a.duration, margin = _a.margin, height = _a.height;
            var rangeRect = selector.selectAll('rect.hp-brush')
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
        StreamPainter.defaultParams = {
            color: defaultColor,
            duration: defaultDuration,
            // mode: 'overlay',
            // padding: 4,
            margin: { top: 5, bottom: 5, left: 5, right: 5 },
            height: 50,
            width: 100,
        };
        return StreamPainter;
    }());

    // type ConditionData = (d: any, i: number ) => ConditionX;
    var ConditionPainter = /** @class */ (function () {
        function ConditionPainter() {
            this.histPainter = new HistPainter();
            this.streamPainter = new StreamPainter();
        }
        ConditionPainter.prototype.update = function (params) {
            this.params = __assign({}, (this.params), params);
            return this;
        };
        ConditionPainter.prototype.data = function (newData) {
            // this.condition = newData;
            return this;
        };
        ConditionPainter.prototype.render = function (selector) {
            var _this = this;
            var _a = this.params, color = _a.color, duration = _a.duration;
            // Default BG Rect
            // const rects = selector.selectAll('rect.matrix-bg').data(c => ['data']);
            // rects.enter().append('rect').attr('class', 'matrix-bg');
            // rects.exit().transition().duration(duration).remove();
            selector.select('rect.matrix-bg')
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
            selector.each(function (c, i, nodes) {
                // const maskId = `mask-${c.ruleIdx}-${c.feature}-${c.category}`;
                var stream = c.stream;
                var paddingOut = c.expanded ? 5 : 1;
                var margin = { top: paddingOut, bottom: paddingOut, left: 1, right: 1 };
                var params = { width: c.width, height: c.height, interval: c.interval, margin: margin };
                var base = c.range[1] - c.range[0];
                var root = d3.select(nodes[i]);
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
                    var step = xs[1] - xs[0];
                    streamXs = __spread([xs[0] - step / 2], xs, [xs[xs.length - 1] + step / 2]);
                }
                _this.streamPainter
                    .update(__assign({}, params, { xs: streamXs, yMax: yMax, color: color }))
                    .data(streamData)
                    .render(expandGlyph);
                var padding = 0;
                if (c.isCategorical && stream) {
                    var nBars = stream.stream.length;
                    padding = c.width / (2 * nBars);
                }
                _this.histPainter
                    .update(__assign({ padding: padding }, params, { xs: xs, yMax: yMax }))
                    .data(((!c.expanded || c.isCategorical) && stream) ? [stream.stream.map(function (s) { return sum(s); })] : [])
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
        RuleRowPainter.prototype.render = function (selector) {
            var _a = this.params, duration = _a.duration, labelColor$$1 = _a.labelColor, onClick = _a.onClick, tooltip = _a.tooltip;
            var rule = this.rule;
            // Background Rectangle
            var bgRect = selector.selectAll('rect.matrix-bg').data([this.rule]);
            var bgRectUpdate = bgRect.enter()
                .append('rect').attr('class', 'matrix-bg').attr('width', 0).attr('height', 0)
                .merge(bgRect);
            bgRectUpdate.classed('matrix-bg-highlight', function (d) { return Boolean(d.highlight); });
            bgRectUpdate.transition().duration(duration)
                .attr('width', function (d) { return d.width; }).attr('height', function (d) { return d.height; });
            // Button Group
            this.renderButton(selector);
            /* CONDITIONS */
            // JOIN
            var conditions = selector.selectAll('g.matrix-condition')
                .data(isRuleGroup(rule) ? [] : rule.conditions);
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
        RuleRowPainter.prototype.renderButton = function (selector) {
            var _a = this.params, duration = _a.duration, buttonSize = _a.buttonSize, onClickButton = _a.onClickButton;
            var rule = this.rule;
            // Enter
            var groupEnter = selector.selectAll('g.row-button').data(['rule']).enter()
                .append('g').attr('class', 'row-button');
            // Collapse Button Enter
            groupEnter.append('g').attr('class', 'collapse-button')
                .append('rect').attr('class', 'button-bg')
                .attr('height', buttonSize / 2).attr('y', -buttonSize / 4).attr('x', -2).attr('fill', 'white');
            // Rule Button Enter
            groupEnter.append('g').attr('class', 'rule-button')
                .append('text').attr('class', 'rule-no').attr('text-anchor', 'start').attr('dx', 2);
            var buttonRoot = selector.select('g.row-button');
            var collapseButton = buttonRoot.select('g.collapse-button');
            var ruleButton = buttonRoot.select('g.rule-button');
            if (!isRuleGroup(rule) && !rule.expanded) {
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
                    .data(isRuleGroup(rule) ? rule.rules : []);
                rects.exit().transition().duration(duration)
                    .attr('fill-opacity', 1e-6).remove();
                if (isRuleGroup(rule)) {
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
            this.flowSums = flows.map(function (r) { return sum(r.support); });
            var reserves = Array.from({ length: nClasses }, function (_, i) { return flows.map(function (flow) { return flow.support[i]; }); });
            reserves = reserves.map(function (reserve) { return cumsum(reserve.reverse()).reverse(); });
            this.reserveSums = new Array(flows.length).fill(0);
            reserves.forEach(function (reserve) { return add(_this.reserveSums, reserve, false); });
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
                .attr('transform', function (d, i) { return "translate(0," + ((d.y - heights[i] - dy) || 0) + ")"; });
            // EXIT
            reserve.exit()
                .classed('hidden', true).classed('visible', false)
                .transition().duration(duration)
                .attr('transform', function (d) { return "translate(0," + ((d.y - dy - 60) || 0) + ")"; });
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
                .attr('transform', function (d, i) { return "translate(0," + (d.y || 0) + ")"; });
            // EXIT
            flow.exit()
                .classed('hidden', true).classed('visible', false)
                .transition().duration(duration)
                .attr('transform', function (d) { return "translate(0," + ((d.y - dy - 60) || 0) + ")"; });
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

    // Returns a tween for a transition’s "d" attribute, transitioning any selected
    // arcs from their current angle to the specified new angle.
    function arcTween(startAngle, newAngle, arc) {
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
        var interpolate = d3.interpolate(startAngle, newAngle);
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
            return arc({ endAngle: interpolate(t) }) || '';
        };
        // };
    }
    function getPatternIds(color, keys) {
        return keys.map(function (key) { return "stripe-" + color(key).slice(1); });
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
        SupportPainter.prototype.render = function (selector) {
            var support = this.support;
            if (isMat(support)) {
                this.renderSimple(selector, []);
                this.renderMat(selector, support);
            }
            else {
                this.renderMat(selector, []);
                this.renderSimple(selector, support);
            }
            return this;
        };
        SupportPainter.prototype.renderSimple = function (selector, support) {
            var _a = this.params, duration = _a.duration, height = _a.height, widthFactor = _a.widthFactor, color = _a.color;
            var xs = __spread([0], (cumsum(support)));
            // Render
            // Join
            var rects = selector.selectAll('rect.mo-support').data(support);
            // Enter
            var rectsEnter = rects.enter().append('rect').attr('class', 'mo-support')
                .attr('height', height);
            // Update
            var rectsUpdate = rectsEnter.merge(rects)
                .style('fill', function (d, i) { return color(i); });
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
        SupportPainter.prototype.renderMat = function (selector, support) {
            // Support is a confusion matrix
            // The (i, j) of support means the number of data with label i predicted as label j
            var _a = this.params, height = _a.height, widthFactor = _a.widthFactor, duration = _a.duration, color = _a.color;
            // const trueLabels = support.map((s: number[]) => nt.sum(s));
            var predictions = support.length ? sumVec(support) : [];
            var truePredictions = support.map(function (s, i) { return s[i]; });
            var total = sum(predictions);
            var falsePredictions = minus(predictions, truePredictions);
            var width = total * widthFactor;
            var widths = predictions.map(function (l) { return l * widthFactor; });
            var xs = __spread([0], (cumsum(widths)));
            // const ys = support.map((s, i) => s[i] / trueLabels[i] * height);
            // const heights = ys.map((y) => height - y);
            var acc = selector.selectAll('text.mo-acc')
                .data(total ? [sum(truePredictions) / (total + 1e-6)] : []);
            var accUpdate = acc.enter().append('text')
                .attr('class', 'mo-acc')
                .attr('display', 'none')
                .merge(acc);
            accUpdate.attr('x', width + 5).attr('y', height / 2 + 5).text(function (d) { return "acc: " + d.toFixed(2); });
            selector.on('mouseover', function () {
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
            var stripeNames = getPatternIds(color, d3.range(support.length));
            // Render the misclassified part using stripes
            var root = selector.selectAll('g.mo-support-mat')
                .data(trueData);
            // enter
            var rootEnter = root.enter().append('g')
                .attr('class', 'mo-support-mat');
            // update
            var rootUpdate = rootEnter.merge(root).style('stroke', function (d) { return color(d.label); });
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
                var base = sum(d.data);
                var factor = base ? d.width / base : 0;
                var _widths = d.data.map(function (v) { return v * factor; });
                var _xs = __spread([0], cumsum(_widths));
                // console.log(factor); // tslint:disable-line
                var ret = d.data.map(function (v, j) { return ({
                    width: _widths[j], x: _xs[j], label: d.label,
                    fill: j === 0 ? color(d.label) : "url(\"#" + stripeNames[d.label] + "\")"
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
        SupportPainter.prototype.renderMatBack = function (selector, support) {
            var _a = this.params, height = _a.height, widthFactor = _a.widthFactor, duration = _a.duration, color = _a.color;
            var trueLabels = support.map(function (s) { return sum(s); });
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
            var rects = selector.selectAll('rect.mo-support-true')
                .data(trueData);
            // Enter
            var rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
                .attr('height', height);
            // Update
            var rectsUpdate = rectsEnter.merge(rects)
                .style('fill', function (d) { return color(d.label); })
                .style('stroke', function (d) { return color(d.label); });
            // Transition
            rectsUpdate.transition().duration(duration)
                .attr('width', function (d) { return d.width; })
                .attr('x', function (d, i) { return d.x + i * 1.5; })
                .attr('height', function (d) { return d.height; });
            // Exit
            rects.exit().transition().duration(duration)
                .attr('width', 1e-6).remove();
            // Register the stripes
            var stripeNames = getPatternIds(color, d3.range(trueLabels.length));
            // Render the misclassified part using stripes
            var root = selector.selectAll('g.mo-support-mat')
                .data(trueData);
            // enter
            var rootEnter = root.enter().append('g')
                .attr('class', 'mo-support-mat');
            // update
            var rootUpdate = rootEnter.merge(root).style('stroke', function (d) { return color(d.label); });
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
                var base = sum(d.data) - d.data[d.label];
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
        OutputPainter.prototype.render = function (selector) {
            var duration = this.params.duration;
            var rules = this.rules;
            this.useMat = rules.length > 0 && isMat(rules[0].support);
            // console.log('useMat', rules[0].support); // tslint:disable-line
            // console.log('useMat', this.useMat); // tslint:disable-line
            var collapseYs = new Map();
            rules.forEach(function (r) { return isRuleGroup(r) && r.rules.forEach(function (_r) { return collapseYs.set("o-" + _r.idx, r.y); }); });
            this.renderHeader(selector);
            // ROOT Group
            var groups = selector.selectAll('g.matrix-outputs')
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
                var totalSupport = sum(rules.map(function (r) { return r.totalSupport || 0; }));
                var fidelity = sum(rules.map(function (r) { return r._support[r.label]; })) / totalSupport;
                var acc = sum(rules.map(function (r) { return isMat(r.support) ? sum(r.support.map(function (s, i) { return s[i]; })) : 0; })) / totalSupport;
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
            var transition = headerUpdate.transition().duration(duration)
                .attr('transform', function (d, i) { return "translate(" + headerXs[i] + ",0) rotate(-50)"; });
            transition.select('rect.mo-header-box').attr('width', function (d, i) { return rectWidths[i]; });
            transition.select('rect.mo-header-fill')
                .attr('width', function (d, i) { return fillRatios[i] * rectWidths[i]; });
            // textsEnter.merge(texts).text(d => d);
            return this;
        };
        OutputPainter.prototype.renderOutputs = function (enter, update, updateTransition) {
            var _a = this.params, fontSize = _a.fontSize, color = _a.color, duration = _a.duration;
            // const outputWidth = fontSize * 2;
            // *Output Texts*
            // Enter
            enter.append('text').attr('class', 'mo-output').attr('text-anchor', 'middle').attr('dx', 15);
            // Update
            update.select('text.mo-output')
                .attr('font-size', function (d) { return isRuleGroup(d) ? fontSize * 0.8 : fontSize; })
                .text(function (d) {
                return isRuleGroup(d) ? '' : (Math.round(d.output[d.label] * 100) / 100).toFixed(2);
            }); // confidence as text
            // Transition
            updateTransition.select('text.mo-output')
                .style('fill', function (d) {
                return color(d.label);
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
                if (isRuleGroup(d))
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
            rectsUpdate.attr('width', 3).style('fill', function (d, i) { return color(i); })
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
            var arc = d3.arc().innerRadius(innerRadius).outerRadius(innerRadius + 2).startAngle(0);
            // *Output Texts*
            // Enter
            var enterGroup = enter.append('g').attr('class', 'mo-fidelity');
            enterGroup.append('text').attr('class', 'mo-fidelity').attr('text-anchor', 'middle');
            enterGroup.append('path').attr('class', 'mo-fidelity')
                .attr('angle', 1e-4)
                .attr('d', arc({ endAngle: 1e-4 }));
            // Update
            var updateGroup = update.select('g.mo-fidelity')
                .datum(function (d) {
                var fidelity = d.fidelity || 0;
                var color = fidelity
                    ? (fidelity > 0.8 ? '#52c41a' : fidelity > 0.5 ? '#faad14' : '#f5222d') : null;
                var angle = (!isRuleGroup(d) && fidelity) ? (Math.PI * fidelity * 2 - 1e-3) : 0;
                return __assign({}, d, { color: color, angle: angle });
            });
            updateGroup.select('text.mo-fidelity')
                .attr('font-size', function (d) { return isRuleGroup(d) ? fontSize * 0.8 : fontSize; })
                .attr('dy', fontSize * 0.4)
                // .attr('dx', dx)
                .text(function (d) {
                return (!isRuleGroup(d) && d.fidelity) ? (Math.round(d.fidelity * 100)).toFixed(0) : '';
            })
                .style('fill', function (d) { return d.color; });
            // Join
            updateGroup.transition().duration(duration)
                .attr('transform', function (d) { return "translate(" + dx + ", " + d.height / 2 + ")"; })
                .select('path.mo-fidelity')
                // update pos
                .attrTween('d', function (d) {
                var angle = Number(d3.select(this).attr('angle'));
                return arcTween(angle, (!isRuleGroup(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0, arc);
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
            var _a = this.params, duration = _a.duration, fontSize = _a.fontSize, widthFactor = _a.widthFactor, color = _a.color, elemHeight = _a.elemHeight, displayEvidence = _a.displayEvidence;
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
                    .update({ widthFactor: widthFactor, height: (elemHeight && elemHeight < height) ? elemHeight : height, color: color })
                    .data(support)
                    .render(d3.select(nodes[i]));
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
        HeaderPainter.prototype.render = function (selector) {
            var _a = this.params, duration = _a.duration, headerSize = _a.headerSize, rotate = _a.rotate, margin = _a.margin, maxHeight = _a.maxHeight, onClick = _a.onClick;
            var maxCount = d3.max(this.features, function (f) { return f.count; });
            var multiplier = maxHeight / (maxCount || 5);
            /* TEXT GROUP */
            var textG = selector.selectAll('g.header').data(this.features);
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
            var axis = selector.selectAll('g.header-axis').data(expandedFeatures);
            // Enter + Merge
            var axisUpdate = axis.enter()
                .append('g').attr('class', 'header-axis')
                .merge(axis)
                .attr('transform', function (d) { return "translate(" + d.x + ", -5)"; });
            axisUpdate.each(function (d, i, nodes) {
                if (d.expanded) {
                    var featureAxis = null;
                    if (d.range && d.cutPoints) {
                        var ticks = __spread([d.range[0]], (d.cutPoints), [d.range[1]]);
                        var scale = d3.scaleLinear().domain(d.range).range([margin.left, d.width - margin.right]);
                        featureAxis = d3.axisTop(scale).tickValues(ticks).tickSize(2);
                    }
                    if (d.categories) {
                        var scale = d3.scalePoint().domain(d.categories).range([margin.left, d.width - margin.right]);
                        featureAxis = d3.axisTop(scale).tickValues(d.categories).tickSize(2);
                    }
                    if (featureAxis)
                        d3.select(nodes[i]).call(featureAxis)
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
            if (isRuleGroup(rules[i]))
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
            var conditions = r.conditions, _support = r._support, rest = __rest(r, ["conditions", "_support"]);
            var conditionXs = [];
            // if (i !== rules.length - 1) 
            var conditionsFiltered = conditions.filter(function (c) { return c.feature >= 0; });
            conditionXs = conditionsFiltered.map(function (c) { return (__assign({}, c, { ruleIdx: r.idx, desc: model.categoryMathDesc(c.feature, c.category), title: model.categoryDescription(c.feature, c.category), x: 0, width: 0, height: 0, interval: model.categoryInterval(c.feature, c.category), expanded: false, range: model.meta.ranges[c.feature], 
                // histRange: model.categoryHistRange(c.feature, c.category),
                isCategorical: model.meta.isCategorical[c.feature] })); });
            var _supportNew = _support ? _support : model.meta.labelNames.map(function () { return 0; });
            return __assign({}, rest, { conditions: conditionXs, height: 0, x: 0, y: 0, width: 0, expanded: false, _support: _supportNew });
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
            if (isRuleGroup(rule)) {
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
            var _a = this.params, model = _a.model, minSupport = _a.minSupport, minFidelity = _a.minFidelity, support = _a.support;
            if (this.model !== model || this.minSupport !== minSupport
                || this.support !== support || this.minFidelity !== minFidelity) {
                // console.log(minFidelity);  //tslint:disable-line
                // console.log(this.rules); //tslint:disable-line
                // console.log('Updating Rules'); // tslint:disable-line
                var rules = model.getRules();
                var nFeatures = model.nFeatures;
                // Filter rules by grouping
                var supportSum_1 = sum(rules.map(function (r) { return r.totalSupport || 0; }));
                var groupedRules = groupRulesBy(rules, function (rule) {
                    return (rule.totalSupport === undefined ? true : (rule.totalSupport >= (minSupport * supportSum_1)))
                        && (rule.fidelity === undefined ? true : rule.fidelity >= minFidelity);
                });
                // const groupedRules = groupBySupport(rules, minSupport * supportSum);
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
            this.minFidelity = minFidelity;
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
                return (expandedRules.has(i) ? expandHeight : (isRuleGroup(r) ? groupedHeight : elemHeight));
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
                r.width = isRuleGroup(r) ? width - 10 : width; // isRuleGroup(r) ? (width - 10) : width;
                r.x = isRuleGroup(r) ? 10 : 0;
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
        RuleMatrixPainter.prototype.render = function (selector) {
            var _a = this.params, x0 = _a.x0, y0 = _a.y0;
            this.selector = selector;
            this.updateRules().updatePresentation().updatePos();
            // Global Transform
            selector.attr('transform', "translate(" + x0 + ", " + y0 + ")");
            // selector.selectAll('rect.bg').data(['rect-bg']).enter()
            //   .append('rect').attr('class', 'bg');
            // Root Container
            selector.selectAll('g.container').data(['container']).enter()
                .append('g').attr('class', 'container');
            var container = selector.select('g.container');
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
            selector.selectAll('g.buttons').data(['buttons']).enter()
                .append('g').attr('class', 'buttons');
            var buttons = selector.select('g.buttons');
            this.renderButton(buttons);
            this.registerZoom(selector, container);
            // selector.select('rect.bg')
            //   .attr('width', this.getWidth() + 400)
            //   .attr('height', this.getHeight() + 400)
            //   .attr('fill', 'white')
            //   .attr('fill-opacity', 1e-6);
            return this;
        };
        RuleMatrixPainter.prototype.renderRows = function (root) {
            var _this = this;
            var _a = this.params, duration = _a.duration, flowWidth = _a.flowWidth, color = _a.color;
            var rules = this.rules;
            var collapseYs = new Map();
            rules.forEach(function (r) { return isRuleGroup(r) && r.rules.forEach(function (_r) { return collapseYs.set("r-" + _r.idx, r.y); }); });
            // const flatRules = flattenRules(rules);
            root.attr('transform', "translate(" + (flowWidth * 2 + 10) + ",0)");
            // Joined
            var rule = root
                .selectAll('g.matrix-rule')
                .data(this.rules, function (r, i) {
                return (r ? "r-" + r.idx : this.getAttribute('data-id')) || String(i);
            });
            // Enter
            var ruleEnter = rule.enter().append('g').attr('data-id', function (d) { return "r-" + d.idx; })
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
                return "translate(0," + (collapseYs.get(nodes[i].id) || 0) + ")";
            }).transition().delay(300)
                .attr('display', 'none');
            var painter = this.rowPainter;
            ruleUpdate.each(function (d, i, nodes) {
                // if (i === this.rules.length - 1) return;
                painter.data(d)
                    .update({
                    labelColor: color,
                    // feature2Idx: this.feature2Idx, 
                    onClick: function (f) { return _this.clickCondition(i, f); },
                    onClickButton: function () { return _this.clickExpand(i); },
                })
                    .render(d3.select(nodes[i]));
            });
            return this;
        };
        RuleMatrixPainter.prototype.renderOutputs = function (root) {
            var _a = this.params, evidenceWidth = _a.evidenceWidth, duration = _a.duration, color = _a.color, flowWidth = _a.flowWidth, elemHeight = _a.elemHeight, displayEvidence = _a.displayEvidence, displayFidelity = _a.displayFidelity;
            var widthFactor = evidenceWidth / this.model.maxSupport;
            var width = this.getWidth();
            root.transition().duration(duration)
                .attr('transform', "translate(" + (width + flowWidth * 2 + 10) + ",0)");
            this.outputPainter.update({ widthFactor: widthFactor, duration: duration, color: color, elemHeight: elemHeight, displayEvidence: displayEvidence, displayFidelity: displayFidelity })
                .data(this.rules).render(root);
            return this;
        };
        RuleMatrixPainter.prototype.renderFlows = function (root) {
            var _a = this.params, flowWidth = _a.flowWidth, color = _a.color, displayFlow = _a.displayFlow;
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
            this.flowPainter.update({ dx: dx, dy: flowWidth, width: flowWidth, color: color })
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
                var pos = d3.mouse(this);
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
            var tooltipEnter = cursorFollow.selectAll('g.rm-tooltip')
                .data(['tooltip']).enter()
                .append('g').attr('class', 'rm-tooltip')
                .attr('transform', "translate(4,-6)");
            tooltipEnter.append('rect').attr('class', 'rm-tooltip');
            // .attr('stroke', '#444').attr('stroke-opacity', 0.4);
            tooltipEnter.append('text').attr('class', 'rm-tooltip')
                .attr('text-anchor', 'start').attr('dx', 5).attr('dy', -2);
            var tooltip = cursorFollow.select('g.rm-tooltip');
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
            var text = g.append('text')
                .attr('text-anchor', 'start').text('Collapse All')
                .attr('fill', '#444')
                .attr('y', 17).attr('dx', 5);
            var node = text.node();
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
                    container.attr('transform', d3.event.transform);
                }
            };
            // console.log(width); // tslint:disable-line
            // console.log(height); // tslint:disable-line
            var zoom = d3.zoom()
                .scaleExtent([0.5, 2])
                // .translateExtent([[-2000, -2000], [2000, 2000]])
                .on('zoom', zoomed);
            root.call(zoom);
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
            minFidelity: 0.1,
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
            var _b = this.props, minSupport = _b.minSupport, minFidelity = _b.minFidelity, support = _b.support, input = _b.input, color = _b.color, displayFlow = _b.displayFlow, displayEvidence = _b.displayEvidence, zoomable = _b.zoomable;
            // console.log('updating matrix'); // tslint:disable-line
            this.state.painter.update({
                // dataset,
                streams: streams,
                support: support,
                x0: x0, y0: y0,
                input: input,
                color: color,
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
                minFidelity: minFidelity,
                zoomable: zoomable,
            })
                .render(d3.select(this.ref));
        };
        RuleMatrix.prototype.render = function () {
            var _this = this;
            var _a = this.props, width = _a.width, height = _a.height, x0 = _a.x0, y0 = _a.y0;
            return (React.createElement("g", { ref: function (ref) { return ref && (_this.ref = ref); }, className: "rule-matrix" },
                React.createElement("rect", { className: "bg", width: width, height: height, fill: "white", fillOpacity: 1e-6, transform: "translate(" + -(x0 || 0) + ", " + -(y0 || 0) + ")" })));
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
            minFidelity: 0.1,
            intervalY: 10,
            intervalX: 0.2,
            width: 960,
            height: 800,
            x0: 20,
            y0: 160,
        };
        return RuleMatrix;
    }(React.PureComponent));

    var patternStrokeWidth = 3;
    var patternPadding = 5;
    /**
     * The filling patterns used in the visualization.
     * This will render a def tag, which should be in the beginning inside of the svg.
     * @export
     * @param {PatternsProps} props
     * @returns
     */
    function Patterns(props) {
        var color = props.color || defaultColor;
        var labels = props.labels;
        return (React.createElement("defs", null, labels.map(function (label, i) {
            var iColor = color(i);
            var name = "stripe-" + iColor.slice(1);
            return (React.createElement("pattern", { key: name, id: name, width: patternPadding, height: patternPadding, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-45)" },
                React.createElement("path", { d: "M 0 " + patternPadding / 2 + " H " + patternPadding, style: { strokeLinecap: 'square', strokeWidth: patternStrokeWidth + "px", stroke: iColor } })));
        })));
    }

    var Legend = /** @class */ (function (_super) {
        __extends(Legend, _super);
        function Legend(props) {
            return _super.call(this, props) || this;
        }
        Legend.prototype.update = function () {
            var _a = this.props, labels = _a.labels, labelSize = _a.labelSize, fontSize = _a.fontSize, color = _a.color, duration = _a.duration;
            var delta = labelSize + 80;
            var selector = d3.select(this.ref);
            var label = selector.selectAll('g.rm-label').data(labels);
            // ENTER
            var labelEnter = label.enter().append('g').attr('class', 'rm-label');
            labelEnter.append('rect')
                // .attr('x', (d: string, i: number) => delta * i)
                .attr('y', -(fontSize + labelSize) / 2.2)
                .attr('width', labelSize)
                .attr('height', labelSize);
            labelEnter.append('text').attr('text-anchor', 'start').attr('x', labelSize * 1.3).style('font-size', fontSize);
            var labelUpdate = labelEnter.merge(label)
                .attr('fill', function (d, i) { return color(i); });
            labelUpdate.transition()
                .duration(duration)
                .attr('transform', function (d, i) { return "translate(" + (i * delta + 50) + ", " + fontSize * 1.2 + ")"; });
            labelUpdate.select('text').text(function (d) { return d; });
            label.exit()
                .transition()
                .duration(duration)
                .style('fill-opacity', 1e-6)
                .remove();
            // Striped Prediction Legends
            var predict = selector.selectAll('g.rm-predict').data(labels);
            // ENTER
            var predictEnter = predict.enter().append('g').attr('class', 'rm-predict');
            predictEnter.append('rect')
                // .attr('x', (d: string, i: number) => delta * i)
                .attr('y', -(fontSize + labelSize) / 2.2)
                .attr('width', labelSize)
                .attr('height', labelSize);
            var predictUpdate = predictEnter.merge(label)
                .attr('fill', function (d, i) { return "url(\"#stripe-" + color(i).slice(1) + "\")"; });
            predictUpdate.transition()
                .duration(duration)
                .attr('transform', function (d, i) {
                return "translate(" + (i * (labelSize * 1.5) + labels.length * delta + 50) + ", " + fontSize * 1.2 + ")";
            });
            var predictText = selector.selectAll('text.rm-predict')
                .data(['Wrong Predictions']);
            predictText.enter()
                .append('text').merge(predictText)
                .attr('text-anchor', 'start').attr('x', labels.length * labelSize * 1.5 + labels.length * delta + 50)
                .attr('y', fontSize * 1.2)
                .style('font-size', fontSize).text(function (d) { return d; });
            predict.exit()
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
            return (React.createElement("g", { ref: function (ref) { return _this.ref = ref; }, className: "rm-labels", transform: this.props.transform },
                React.createElement("text", { textAnchor: "start", x: "0", y: "17", fontSize: "14" }, "Labels:")));
        };
        Legend.defaultProps = {
            labelSize: 12,
            fontSize: 14,
            color: labelColor,
            duration: 400,
            transform: '',
        };
        return Legend;
    }(React.PureComponent));

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var _global = createCommonjsModule(function (module) {
    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math
      ? window : typeof self != 'undefined' && self.Math == Math ? self
      // eslint-disable-next-line no-new-func
      : Function('return this')();
    if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
    });

    var _core = createCommonjsModule(function (module) {
    var core = module.exports = { version: '2.5.7' };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
    });
    var _core_1 = _core.version;

    var _aFunction = function (it) {
      if (typeof it != 'function') throw TypeError(it + ' is not a function!');
      return it;
    };

    // optional / simple context binding

    var _ctx = function (fn, that, length) {
      _aFunction(fn);
      if (that === undefined) return fn;
      switch (length) {
        case 1: return function (a) {
          return fn.call(that, a);
        };
        case 2: return function (a, b) {
          return fn.call(that, a, b);
        };
        case 3: return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
      }
      return function (/* ...args */) {
        return fn.apply(that, arguments);
      };
    };

    var _isObject = function (it) {
      return typeof it === 'object' ? it !== null : typeof it === 'function';
    };

    var _anObject = function (it) {
      if (!_isObject(it)) throw TypeError(it + ' is not an object!');
      return it;
    };

    var _fails = function (exec) {
      try {
        return !!exec();
      } catch (e) {
        return true;
      }
    };

    // Thank's IE8 for his funny defineProperty
    var _descriptors = !_fails(function () {
      return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
    });

    var document$1 = _global.document;
    // typeof document.createElement is 'object' in old IE
    var is = _isObject(document$1) && _isObject(document$1.createElement);
    var _domCreate = function (it) {
      return is ? document$1.createElement(it) : {};
    };

    var _ie8DomDefine = !_descriptors && !_fails(function () {
      return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
    });

    // 7.1.1 ToPrimitive(input [, PreferredType])

    // instead of the ES6 spec version, we didn't implement @@toPrimitive case
    // and the second argument - flag - preferred type is a string
    var _toPrimitive = function (it, S) {
      if (!_isObject(it)) return it;
      var fn, val;
      if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
      if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
      if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
      throw TypeError("Can't convert object to primitive value");
    };

    var dP = Object.defineProperty;

    var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
      _anObject(O);
      P = _toPrimitive(P, true);
      _anObject(Attributes);
      if (_ie8DomDefine) try {
        return dP(O, P, Attributes);
      } catch (e) { /* empty */ }
      if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
      if ('value' in Attributes) O[P] = Attributes.value;
      return O;
    };

    var _objectDp = {
    	f: f
    };

    var _propertyDesc = function (bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };

    var _hide = _descriptors ? function (object, key, value) {
      return _objectDp.f(object, key, _propertyDesc(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };

    var hasOwnProperty = {}.hasOwnProperty;
    var _has = function (it, key) {
      return hasOwnProperty.call(it, key);
    };

    var PROTOTYPE = 'prototype';

    var $export = function (type, name, source) {
      var IS_FORCED = type & $export.F;
      var IS_GLOBAL = type & $export.G;
      var IS_STATIC = type & $export.S;
      var IS_PROTO = type & $export.P;
      var IS_BIND = type & $export.B;
      var IS_WRAP = type & $export.W;
      var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
      var expProto = exports[PROTOTYPE];
      var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
      var key, own, out;
      if (IS_GLOBAL) source = name;
      for (key in source) {
        // contains in native
        own = !IS_FORCED && target && target[key] !== undefined;
        if (own && _has(exports, key)) continue;
        // export native or passed
        out = own ? target[key] : source[key];
        // prevent global pollution for namespaces
        exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
        // bind timers to global for call from export context
        : IS_BIND && own ? _ctx(out, _global)
        // wrap global constructors for prevent change them in library
        : IS_WRAP && target[key] == out ? (function (C) {
          var F = function (a, b, c) {
            if (this instanceof C) {
              switch (arguments.length) {
                case 0: return new C();
                case 1: return new C(a);
                case 2: return new C(a, b);
              } return new C(a, b, c);
            } return C.apply(this, arguments);
          };
          F[PROTOTYPE] = C[PROTOTYPE];
          return F;
        // make static versions for prototype methods
        })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
        // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
        if (IS_PROTO) {
          (exports.virtual || (exports.virtual = {}))[key] = out;
          // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
          if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
        }
      }
    };
    // type bitmap
    $export.F = 1;   // forced
    $export.G = 2;   // global
    $export.S = 4;   // static
    $export.P = 8;   // proto
    $export.B = 16;  // bind
    $export.W = 32;  // wrap
    $export.U = 64;  // safe
    $export.R = 128; // real proto method for `library`
    var _export = $export;

    var toString$1 = {}.toString;

    var _cof = function (it) {
      return toString$1.call(it).slice(8, -1);
    };

    // fallback for non-array-like ES3 and non-enumerable old V8 strings

    // eslint-disable-next-line no-prototype-builtins
    var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
      return _cof(it) == 'String' ? it.split('') : Object(it);
    };

    // 7.2.1 RequireObjectCoercible(argument)
    var _defined = function (it) {
      if (it == undefined) throw TypeError("Can't call method on  " + it);
      return it;
    };

    // to indexed object, toObject with fallback for non-array-like ES3 strings


    var _toIobject = function (it) {
      return _iobject(_defined(it));
    };

    // 7.1.4 ToInteger
    var ceil = Math.ceil;
    var floor = Math.floor;
    var _toInteger = function (it) {
      return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
    };

    // 7.1.15 ToLength

    var min = Math.min;
    var _toLength = function (it) {
      return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
    };

    var max = Math.max;
    var min$1 = Math.min;
    var _toAbsoluteIndex = function (index, length) {
      index = _toInteger(index);
      return index < 0 ? max(index + length, 0) : min$1(index, length);
    };

    // false -> Array#indexOf
    // true  -> Array#includes



    var _arrayIncludes = function (IS_INCLUDES) {
      return function ($this, el, fromIndex) {
        var O = _toIobject($this);
        var length = _toLength(O.length);
        var index = _toAbsoluteIndex(fromIndex, length);
        var value;
        // Array#includes uses SameValueZero equality algorithm
        // eslint-disable-next-line no-self-compare
        if (IS_INCLUDES && el != el) while (length > index) {
          value = O[index++];
          // eslint-disable-next-line no-self-compare
          if (value != value) return true;
        // Array#indexOf ignores holes, Array#includes - not
        } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
          if (O[index] === el) return IS_INCLUDES || index || 0;
        } return !IS_INCLUDES && -1;
      };
    };

    var _library = true;

    var _shared = createCommonjsModule(function (module) {
    var SHARED = '__core-js_shared__';
    var store = _global[SHARED] || (_global[SHARED] = {});

    (module.exports = function (key, value) {
      return store[key] || (store[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: _core.version,
      mode: _library ? 'pure' : 'global',
      copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
    });
    });

    var id = 0;
    var px = Math.random();
    var _uid = function (key) {
      return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
    };

    var shared = _shared('keys');

    var _sharedKey = function (key) {
      return shared[key] || (shared[key] = _uid(key));
    };

    var arrayIndexOf = _arrayIncludes(false);
    var IE_PROTO = _sharedKey('IE_PROTO');

    var _objectKeysInternal = function (object, names) {
      var O = _toIobject(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
      // Don't enum bug & hidden keys
      while (names.length > i) if (_has(O, key = names[i++])) {
        ~arrayIndexOf(result, key) || result.push(key);
      }
      return result;
    };

    // IE 8- don't enum bug keys
    var _enumBugKeys = (
      'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
    ).split(',');

    // 19.1.2.14 / 15.2.3.14 Object.keys(O)



    var _objectKeys = Object.keys || function keys(O) {
      return _objectKeysInternal(O, _enumBugKeys);
    };

    var f$1 = Object.getOwnPropertySymbols;

    var _objectGops = {
    	f: f$1
    };

    var f$2 = {}.propertyIsEnumerable;

    var _objectPie = {
    	f: f$2
    };

    // 7.1.13 ToObject(argument)

    var _toObject = function (it) {
      return Object(_defined(it));
    };

    // 19.1.2.1 Object.assign(target, source, ...)





    var $assign = Object.assign;

    // should work with symbols and should have deterministic property order (V8 bug)
    var _objectAssign = !$assign || _fails(function () {
      var A = {};
      var B = {};
      // eslint-disable-next-line no-undef
      var S = Symbol();
      var K = 'abcdefghijklmnopqrst';
      A[S] = 7;
      K.split('').forEach(function (k) { B[k] = k; });
      return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
    }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
      var T = _toObject(target);
      var aLen = arguments.length;
      var index = 1;
      var getSymbols = _objectGops.f;
      var isEnum = _objectPie.f;
      while (aLen > index) {
        var S = _iobject(arguments[index++]);
        var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
        var length = keys.length;
        var j = 0;
        var key;
        while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
      } return T;
    } : $assign;

    // 19.1.3.1 Object.assign(target, source)


    _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

    var assign = _core.Object.assign;

    var assign$1 = createCommonjsModule(function (module) {
    module.exports = { "default": assign, __esModule: true };
    });

    unwrapExports(assign$1);

    var _extends = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _assign2 = _interopRequireDefault(assign$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = _assign2.default || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };
    });

    var _extends$1 = unwrapExports(_extends);

    var classCallCheck = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    exports.default = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };
    });

    var _classCallCheck = unwrapExports(classCallCheck);

    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    _export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

    var $Object = _core.Object;
    var defineProperty = function defineProperty(it, key, desc) {
      return $Object.defineProperty(it, key, desc);
    };

    var defineProperty$1 = createCommonjsModule(function (module) {
    module.exports = { "default": defineProperty, __esModule: true };
    });

    unwrapExports(defineProperty$1);

    var createClass = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _defineProperty2 = _interopRequireDefault(defineProperty$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          (0, _defineProperty2.default)(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    });

    var _createClass = unwrapExports(createClass);

    // true  -> String#at
    // false -> String#codePointAt
    var _stringAt = function (TO_STRING) {
      return function (that, pos) {
        var s = String(_defined(that));
        var i = _toInteger(pos);
        var l = s.length;
        var a, b;
        if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
        a = s.charCodeAt(i);
        return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
          ? TO_STRING ? s.charAt(i) : a
          : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
      };
    };

    var _redefine = _hide;

    var _iterators = {};

    var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
      _anObject(O);
      var keys = _objectKeys(Properties);
      var length = keys.length;
      var i = 0;
      var P;
      while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
      return O;
    };

    var document$2 = _global.document;
    var _html = document$2 && document$2.documentElement;

    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



    var IE_PROTO$1 = _sharedKey('IE_PROTO');
    var Empty = function () { /* empty */ };
    var PROTOTYPE$1 = 'prototype';

    // Create object with fake `null` prototype: use iframe Object with cleared prototype
    var createDict = function () {
      // Thrash, waste and sodomy: IE GC bug
      var iframe = _domCreate('iframe');
      var i = _enumBugKeys.length;
      var lt = '<';
      var gt = '>';
      var iframeDocument;
      iframe.style.display = 'none';
      _html.appendChild(iframe);
      iframe.src = 'javascript:'; // eslint-disable-line no-script-url
      // createDict = iframe.contentWindow.Object;
      // html.removeChild(iframe);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
      iframeDocument.close();
      createDict = iframeDocument.F;
      while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
      return createDict();
    };

    var _objectCreate = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        Empty[PROTOTYPE$1] = _anObject(O);
        result = new Empty();
        Empty[PROTOTYPE$1] = null;
        // add "__proto__" for Object.getPrototypeOf polyfill
        result[IE_PROTO$1] = O;
      } else result = createDict();
      return Properties === undefined ? result : _objectDps(result, Properties);
    };

    var _wks = createCommonjsModule(function (module) {
    var store = _shared('wks');

    var Symbol = _global.Symbol;
    var USE_SYMBOL = typeof Symbol == 'function';

    var $exports = module.exports = function (name) {
      return store[name] || (store[name] =
        USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
    };

    $exports.store = store;
    });

    var def = _objectDp.f;

    var TAG = _wks('toStringTag');

    var _setToStringTag = function (it, tag, stat) {
      if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
    };

    var IteratorPrototype = {};

    // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
    _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

    var _iterCreate = function (Constructor, NAME, next) {
      Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
      _setToStringTag(Constructor, NAME + ' Iterator');
    };

    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


    var IE_PROTO$2 = _sharedKey('IE_PROTO');
    var ObjectProto = Object.prototype;

    var _objectGpo = Object.getPrototypeOf || function (O) {
      O = _toObject(O);
      if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
      if (typeof O.constructor == 'function' && O instanceof O.constructor) {
        return O.constructor.prototype;
      } return O instanceof Object ? ObjectProto : null;
    };

    var ITERATOR = _wks('iterator');
    var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
    var FF_ITERATOR = '@@iterator';
    var KEYS = 'keys';
    var VALUES = 'values';

    var returnThis = function () { return this; };

    var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
      _iterCreate(Constructor, NAME, next);
      var getMethod = function (kind) {
        if (!BUGGY && kind in proto) return proto[kind];
        switch (kind) {
          case KEYS: return function keys() { return new Constructor(this, kind); };
          case VALUES: return function values() { return new Constructor(this, kind); };
        } return function entries() { return new Constructor(this, kind); };
      };
      var TAG = NAME + ' Iterator';
      var DEF_VALUES = DEFAULT == VALUES;
      var VALUES_BUG = false;
      var proto = Base.prototype;
      var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
      var $default = $native || getMethod(DEFAULT);
      var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
      var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
      var methods, key, IteratorPrototype;
      // Fix native
      if ($anyNative) {
        IteratorPrototype = _objectGpo($anyNative.call(new Base()));
        if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
          // Set @@toStringTag to native iterators
          _setToStringTag(IteratorPrototype, TAG, true);
          // fix for some old engines
          if (!_library && typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
        }
      }
      // fix Array#{values, @@iterator}.name in V8 / FF
      if (DEF_VALUES && $native && $native.name !== VALUES) {
        VALUES_BUG = true;
        $default = function values() { return $native.call(this); };
      }
      // Define iterator
      if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
        _hide(proto, ITERATOR, $default);
      }
      // Plug for library
      _iterators[NAME] = $default;
      _iterators[TAG] = returnThis;
      if (DEFAULT) {
        methods = {
          values: DEF_VALUES ? $default : getMethod(VALUES),
          keys: IS_SET ? $default : getMethod(KEYS),
          entries: $entries
        };
        if (FORCED) for (key in methods) {
          if (!(key in proto)) _redefine(proto, key, methods[key]);
        } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
      }
      return methods;
    };

    var $at = _stringAt(true);

    // 21.1.3.27 String.prototype[@@iterator]()
    _iterDefine(String, 'String', function (iterated) {
      this._t = String(iterated); // target
      this._i = 0;                // next index
    // 21.1.5.2.1 %StringIteratorPrototype%.next()
    }, function () {
      var O = this._t;
      var index = this._i;
      var point;
      if (index >= O.length) return { value: undefined, done: true };
      point = $at(O, index);
      this._i += point.length;
      return { value: point, done: false };
    });

    var _iterStep = function (done, value) {
      return { value: value, done: !!done };
    };

    // 22.1.3.4 Array.prototype.entries()
    // 22.1.3.13 Array.prototype.keys()
    // 22.1.3.29 Array.prototype.values()
    // 22.1.3.30 Array.prototype[@@iterator]()
    var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
      this._t = _toIobject(iterated); // target
      this._i = 0;                   // next index
      this._k = kind;                // kind
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    }, function () {
      var O = this._t;
      var kind = this._k;
      var index = this._i++;
      if (!O || index >= O.length) {
        this._t = undefined;
        return _iterStep(1);
      }
      if (kind == 'keys') return _iterStep(0, index);
      if (kind == 'values') return _iterStep(0, O[index]);
      return _iterStep(0, [index, O[index]]);
    }, 'values');

    // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
    _iterators.Arguments = _iterators.Array;

    var TO_STRING_TAG = _wks('toStringTag');

    var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
      'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
      'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
      'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
      'TextTrackList,TouchList').split(',');

    for (var i = 0; i < DOMIterables.length; i++) {
      var NAME = DOMIterables[i];
      var Collection = _global[NAME];
      var proto = Collection && Collection.prototype;
      if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
      _iterators[NAME] = _iterators.Array;
    }

    var f$3 = _wks;

    var _wksExt = {
    	f: f$3
    };

    var iterator = _wksExt.f('iterator');

    var iterator$1 = createCommonjsModule(function (module) {
    module.exports = { "default": iterator, __esModule: true };
    });

    unwrapExports(iterator$1);

    var _meta = createCommonjsModule(function (module) {
    var META = _uid('meta');


    var setDesc = _objectDp.f;
    var id = 0;
    var isExtensible = Object.isExtensible || function () {
      return true;
    };
    var FREEZE = !_fails(function () {
      return isExtensible(Object.preventExtensions({}));
    });
    var setMeta = function (it) {
      setDesc(it, META, { value: {
        i: 'O' + ++id, // object ID
        w: {}          // weak collections IDs
      } });
    };
    var fastKey = function (it, create) {
      // return primitive with prefix
      if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
      if (!_has(it, META)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return 'F';
        // not necessary to add metadata
        if (!create) return 'E';
        // add missing metadata
        setMeta(it);
      // return object ID
      } return it[META].i;
    };
    var getWeak = function (it, create) {
      if (!_has(it, META)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return true;
        // not necessary to add metadata
        if (!create) return false;
        // add missing metadata
        setMeta(it);
      // return hash weak collections IDs
      } return it[META].w;
    };
    // add metadata on freeze-family methods calling
    var onFreeze = function (it) {
      if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
      return it;
    };
    var meta = module.exports = {
      KEY: META,
      NEED: false,
      fastKey: fastKey,
      getWeak: getWeak,
      onFreeze: onFreeze
    };
    });
    var _meta_1 = _meta.KEY;
    var _meta_2 = _meta.NEED;
    var _meta_3 = _meta.fastKey;
    var _meta_4 = _meta.getWeak;
    var _meta_5 = _meta.onFreeze;

    var defineProperty$3 = _objectDp.f;
    var _wksDefine = function (name) {
      var $Symbol = _core.Symbol || (_core.Symbol = _library ? {} : _global.Symbol || {});
      if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty$3($Symbol, name, { value: _wksExt.f(name) });
    };

    // all enumerable object keys, includes symbols



    var _enumKeys = function (it) {
      var result = _objectKeys(it);
      var getSymbols = _objectGops.f;
      if (getSymbols) {
        var symbols = getSymbols(it);
        var isEnum = _objectPie.f;
        var i = 0;
        var key;
        while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
      } return result;
    };

    // 7.2.2 IsArray(argument)

    var _isArray = Array.isArray || function isArray(arg) {
      return _cof(arg) == 'Array';
    };

    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

    var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

    var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return _objectKeysInternal(O, hiddenKeys);
    };

    var _objectGopn = {
    	f: f$4
    };

    // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

    var gOPN = _objectGopn.f;
    var toString$2 = {}.toString;

    var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
      ? Object.getOwnPropertyNames(window) : [];

    var getWindowNames = function (it) {
      try {
        return gOPN(it);
      } catch (e) {
        return windowNames.slice();
      }
    };

    var f$5 = function getOwnPropertyNames(it) {
      return windowNames && toString$2.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
    };

    var _objectGopnExt = {
    	f: f$5
    };

    var gOPD = Object.getOwnPropertyDescriptor;

    var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
      O = _toIobject(O);
      P = _toPrimitive(P, true);
      if (_ie8DomDefine) try {
        return gOPD(O, P);
      } catch (e) { /* empty */ }
      if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
    };

    var _objectGopd = {
    	f: f$6
    };

    // ECMAScript 6 symbols shim





    var META = _meta.KEY;



















    var gOPD$1 = _objectGopd.f;
    var dP$1 = _objectDp.f;
    var gOPN$1 = _objectGopnExt.f;
    var $Symbol = _global.Symbol;
    var $JSON = _global.JSON;
    var _stringify = $JSON && $JSON.stringify;
    var PROTOTYPE$2 = 'prototype';
    var HIDDEN = _wks('_hidden');
    var TO_PRIMITIVE = _wks('toPrimitive');
    var isEnum = {}.propertyIsEnumerable;
    var SymbolRegistry = _shared('symbol-registry');
    var AllSymbols = _shared('symbols');
    var OPSymbols = _shared('op-symbols');
    var ObjectProto$1 = Object[PROTOTYPE$2];
    var USE_NATIVE = typeof $Symbol == 'function';
    var QObject = _global.QObject;
    // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
    var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

    // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
    var setSymbolDesc = _descriptors && _fails(function () {
      return _objectCreate(dP$1({}, 'a', {
        get: function () { return dP$1(this, 'a', { value: 7 }).a; }
      })).a != 7;
    }) ? function (it, key, D) {
      var protoDesc = gOPD$1(ObjectProto$1, key);
      if (protoDesc) delete ObjectProto$1[key];
      dP$1(it, key, D);
      if (protoDesc && it !== ObjectProto$1) dP$1(ObjectProto$1, key, protoDesc);
    } : dP$1;

    var wrap = function (tag) {
      var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
      sym._k = tag;
      return sym;
    };

    var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
      return typeof it == 'symbol';
    } : function (it) {
      return it instanceof $Symbol;
    };

    var $defineProperty = function defineProperty(it, key, D) {
      if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
      _anObject(it);
      key = _toPrimitive(key, true);
      _anObject(D);
      if (_has(AllSymbols, key)) {
        if (!D.enumerable) {
          if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
          it[HIDDEN][key] = true;
        } else {
          if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
          D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
        } return setSymbolDesc(it, key, D);
      } return dP$1(it, key, D);
    };
    var $defineProperties = function defineProperties(it, P) {
      _anObject(it);
      var keys = _enumKeys(P = _toIobject(P));
      var i = 0;
      var l = keys.length;
      var key;
      while (l > i) $defineProperty(it, key = keys[i++], P[key]);
      return it;
    };
    var $create = function create(it, P) {
      return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
    };
    var $propertyIsEnumerable = function propertyIsEnumerable(key) {
      var E = isEnum.call(this, key = _toPrimitive(key, true));
      if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
      return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
    };
    var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
      it = _toIobject(it);
      key = _toPrimitive(key, true);
      if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
      var D = gOPD$1(it, key);
      if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
      return D;
    };
    var $getOwnPropertyNames = function getOwnPropertyNames(it) {
      var names = gOPN$1(_toIobject(it));
      var result = [];
      var i = 0;
      var key;
      while (names.length > i) {
        if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
      } return result;
    };
    var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
      var IS_OP = it === ObjectProto$1;
      var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
      var result = [];
      var i = 0;
      var key;
      while (names.length > i) {
        if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
      } return result;
    };

    // 19.4.1.1 Symbol([description])
    if (!USE_NATIVE) {
      $Symbol = function Symbol() {
        if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
        var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
        var $set = function (value) {
          if (this === ObjectProto$1) $set.call(OPSymbols, value);
          if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
          setSymbolDesc(this, tag, _propertyDesc(1, value));
        };
        if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
        return wrap(tag);
      };
      _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
        return this._k;
      });

      _objectGopd.f = $getOwnPropertyDescriptor;
      _objectDp.f = $defineProperty;
      _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
      _objectPie.f = $propertyIsEnumerable;
      _objectGops.f = $getOwnPropertySymbols;

      if (_descriptors && !_library) {
        _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
      }

      _wksExt.f = function (name) {
        return wrap(_wks(name));
      };
    }

    _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

    for (var es6Symbols = (
      // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
      'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
    ).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

    for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

    _export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
      // 19.4.2.1 Symbol.for(key)
      'for': function (key) {
        return _has(SymbolRegistry, key += '')
          ? SymbolRegistry[key]
          : SymbolRegistry[key] = $Symbol(key);
      },
      // 19.4.2.5 Symbol.keyFor(sym)
      keyFor: function keyFor(sym) {
        if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
        for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
      },
      useSetter: function () { setter = true; },
      useSimple: function () { setter = false; }
    });

    _export(_export.S + _export.F * !USE_NATIVE, 'Object', {
      // 19.1.2.2 Object.create(O [, Properties])
      create: $create,
      // 19.1.2.4 Object.defineProperty(O, P, Attributes)
      defineProperty: $defineProperty,
      // 19.1.2.3 Object.defineProperties(O, Properties)
      defineProperties: $defineProperties,
      // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
      // 19.1.2.7 Object.getOwnPropertyNames(O)
      getOwnPropertyNames: $getOwnPropertyNames,
      // 19.1.2.8 Object.getOwnPropertySymbols(O)
      getOwnPropertySymbols: $getOwnPropertySymbols
    });

    // 24.3.2 JSON.stringify(value [, replacer [, space]])
    $JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
      var S = $Symbol();
      // MS Edge converts symbol values to JSON as {}
      // WebKit converts symbol values to JSON as null
      // V8 throws on boxed symbols
      return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
    })), 'JSON', {
      stringify: function stringify(it) {
        var args = [it];
        var i = 1;
        var replacer, $replacer;
        while (arguments.length > i) args.push(arguments[i++]);
        $replacer = replacer = args[1];
        if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
        if (!_isArray(replacer)) replacer = function (key, value) {
          if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
          if (!isSymbol(value)) return value;
        };
        args[1] = replacer;
        return _stringify.apply($JSON, args);
      }
    });

    // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
    $Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
    // 19.4.3.5 Symbol.prototype[@@toStringTag]
    _setToStringTag($Symbol, 'Symbol');
    // 20.2.1.9 Math[@@toStringTag]
    _setToStringTag(Math, 'Math', true);
    // 24.3.3 JSON[@@toStringTag]
    _setToStringTag(_global.JSON, 'JSON', true);

    _wksDefine('asyncIterator');

    _wksDefine('observable');

    var symbol = _core.Symbol;

    var symbol$1 = createCommonjsModule(function (module) {
    module.exports = { "default": symbol, __esModule: true };
    });

    unwrapExports(symbol$1);

    var _typeof_1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _iterator2 = _interopRequireDefault(iterator$1);



    var _symbol2 = _interopRequireDefault(symbol$1);

    var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
      return typeof obj === "undefined" ? "undefined" : _typeof(obj);
    } : function (obj) {
      return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
    };
    });

    var _typeof = unwrapExports(_typeof_1);

    var possibleConstructorReturn = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _typeof3 = _interopRequireDefault(_typeof_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
    };
    });

    var _possibleConstructorReturn = unwrapExports(possibleConstructorReturn);

    // Works with __proto__ only. Old v8 can't work with null proto objects.
    /* eslint-disable no-proto */


    var check = function (O, proto) {
      _anObject(O);
      if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
    };
    var _setProto = {
      set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
        function (test, buggy, set) {
          try {
            set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
            set(test, []);
            buggy = !(test instanceof Array);
          } catch (e) { buggy = true; }
          return function setPrototypeOf(O, proto) {
            check(O, proto);
            if (buggy) O.__proto__ = proto;
            else set(O, proto);
            return O;
          };
        }({}, false) : undefined),
      check: check
    };

    // 19.1.3.19 Object.setPrototypeOf(O, proto)

    _export(_export.S, 'Object', { setPrototypeOf: _setProto.set });

    var setPrototypeOf = _core.Object.setPrototypeOf;

    var setPrototypeOf$1 = createCommonjsModule(function (module) {
    module.exports = { "default": setPrototypeOf, __esModule: true };
    });

    unwrapExports(setPrototypeOf$1);

    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    _export(_export.S, 'Object', { create: _objectCreate });

    var $Object$1 = _core.Object;
    var create = function create(P, D) {
      return $Object$1.create(P, D);
    };

    var create$1 = createCommonjsModule(function (module) {
    module.exports = { "default": create, __esModule: true };
    });

    unwrapExports(create$1);

    var inherits = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _setPrototypeOf2 = _interopRequireDefault(setPrototypeOf$1);



    var _create2 = _interopRequireDefault(create$1);



    var _typeof3 = _interopRequireDefault(_typeof_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
      }

      subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
    };
    });

    var _inherits = unwrapExports(inherits);

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
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
    			if (hasOwnProperty$1.call(from, key)) {
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
     */

    var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

    var ReactPropTypesSecret_1 = ReactPropTypesSecret;

    function emptyFunction() {}

    var factoryWithThrowingShims = function() {
      function shim(props, propName, componentName, location, propFullName, secret) {
        if (secret === ReactPropTypesSecret_1) {
          // It is still safe when called from React.
          return;
        }
        var err = new Error(
          'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
          'Use PropTypes.checkPropTypes() to call them. ' +
          'Read more at http://fb.me/use-check-prop-types'
        );
        err.name = 'Invariant Violation';
        throw err;
      }  shim.isRequired = shim;
      function getShim() {
        return shim;
      }  // Important!
      // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
      var ReactPropTypes = {
        array: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,

        any: shim,
        arrayOf: getShim,
        element: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim
      };

      ReactPropTypes.checkPropTypes = emptyFunction;
      ReactPropTypes.PropTypes = ReactPropTypes;

      return ReactPropTypes;
    };

    var propTypes = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    {
      // By explicitly using `prop-types` you are opting into new production behavior.
      // http://fb.me/prop-types-in-prod
      module.exports = factoryWithThrowingShims();
    }
    });

    /**
     * Copyright 2014-2015, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the BSD-style license found in the
     * LICENSE file in the root directory of this source tree. An additional grant
     * of patent rights can be found in the PATENTS file in the same directory.
     */

    var warning = function() {};

    var warning_1 = warning;

    var Track = function Track(props) {
      var className = props.className,
          included = props.included,
          vertical = props.vertical,
          offset = props.offset,
          length = props.length,
          style = props.style;


      var positonStyle = vertical ? {
        bottom: offset + '%',
        height: length + '%'
      } : {
        left: offset + '%',
        width: length + '%'
      };

      var elStyle = _extends$1({}, style, positonStyle);
      return included ? React__default.createElement('div', { className: className, style: elStyle }) : null;
    };

    var objectWithoutProperties = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    exports.default = function (obj, keys) {
      var target = {};

      for (var i in obj) {
        if (keys.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
        target[i] = obj[i];
      }

      return target;
    };
    });

    var _objectWithoutProperties = unwrapExports(objectWithoutProperties);

    var defineProperty$4 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _defineProperty2 = _interopRequireDefault(defineProperty$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function (obj, key, value) {
      if (key in obj) {
        (0, _defineProperty2.default)(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    };
    });

    var _defineProperty = unwrapExports(defineProperty$4);

    // most Object methods by ES6 should accept primitives



    var _objectSap = function (KEY, exec) {
      var fn = (_core.Object || {})[KEY] || Object[KEY];
      var exp = {};
      exp[KEY] = exec(fn);
      _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
    };

    // 19.1.2.9 Object.getPrototypeOf(O)



    _objectSap('getPrototypeOf', function () {
      return function getPrototypeOf(it) {
        return _objectGpo(_toObject(it));
      };
    });

    var getPrototypeOf = _core.Object.getPrototypeOf;

    var getPrototypeOf$1 = createCommonjsModule(function (module) {
    module.exports = { "default": getPrototypeOf, __esModule: true };
    });

    unwrapExports(getPrototypeOf$1);

    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)

    var $getOwnPropertyDescriptor$1 = _objectGopd.f;

    _objectSap('getOwnPropertyDescriptor', function () {
      return function getOwnPropertyDescriptor(it, key) {
        return $getOwnPropertyDescriptor$1(_toIobject(it), key);
      };
    });

    var $Object$2 = _core.Object;
    var getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
      return $Object$2.getOwnPropertyDescriptor(it, key);
    };

    var getOwnPropertyDescriptor$1 = createCommonjsModule(function (module) {
    module.exports = { "default": getOwnPropertyDescriptor, __esModule: true };
    });

    unwrapExports(getOwnPropertyDescriptor$1);

    var get = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _getPrototypeOf2 = _interopRequireDefault(getPrototypeOf$1);



    var _getOwnPropertyDescriptor2 = _interopRequireDefault(getOwnPropertyDescriptor$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

      if (desc === undefined) {
        var parent = (0, _getPrototypeOf2.default)(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };
    });

    var _get = unwrapExports(get);

    var EventBaseObject_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    /**
     * @ignore
     * base event object for custom and dom event.
     * @author yiminghe@gmail.com
     */

    function returnFalse() {
      return false;
    }

    function returnTrue() {
      return true;
    }

    function EventBaseObject() {
      this.timeStamp = Date.now();
      this.target = undefined;
      this.currentTarget = undefined;
    }

    EventBaseObject.prototype = {
      isEventObject: 1,

      constructor: EventBaseObject,

      isDefaultPrevented: returnFalse,

      isPropagationStopped: returnFalse,

      isImmediatePropagationStopped: returnFalse,

      preventDefault: function preventDefault() {
        this.isDefaultPrevented = returnTrue;
      },
      stopPropagation: function stopPropagation() {
        this.isPropagationStopped = returnTrue;
      },
      stopImmediatePropagation: function stopImmediatePropagation() {
        this.isImmediatePropagationStopped = returnTrue;
        // fixed 1.2
        // call stopPropagation implicitly
        this.stopPropagation();
      },
      halt: function halt(immediate) {
        if (immediate) {
          this.stopImmediatePropagation();
        } else {
          this.stopPropagation();
        }
        this.preventDefault();
      }
    };

    exports["default"] = EventBaseObject;
    module.exports = exports['default'];
    });

    unwrapExports(EventBaseObject_1);

    var EventObject = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });



    var _EventBaseObject2 = _interopRequireDefault(EventBaseObject_1);



    var _objectAssign2 = _interopRequireDefault(objectAssign);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

    /**
     * @ignore
     * event object for dom
     * @author yiminghe@gmail.com
     */

    var TRUE = true;
    var FALSE = false;
    var commonProps = ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'currentTarget', 'eventPhase', 'metaKey', 'shiftKey', 'target', 'timeStamp', 'view', 'type'];

    function isNullOrUndefined(w) {
      return w === null || w === undefined;
    }

    var eventNormalizers = [{
      reg: /^key/,
      props: ['char', 'charCode', 'key', 'keyCode', 'which'],
      fix: function fix(event, nativeEvent) {
        if (isNullOrUndefined(event.which)) {
          event.which = !isNullOrUndefined(nativeEvent.charCode) ? nativeEvent.charCode : nativeEvent.keyCode;
        }

        // add metaKey to non-Mac browsers (use ctrl for PC 's and Meta for Macs)
        if (event.metaKey === undefined) {
          event.metaKey = event.ctrlKey;
        }
      }
    }, {
      reg: /^touch/,
      props: ['touches', 'changedTouches', 'targetTouches']
    }, {
      reg: /^hashchange$/,
      props: ['newURL', 'oldURL']
    }, {
      reg: /^gesturechange$/i,
      props: ['rotation', 'scale']
    }, {
      reg: /^(mousewheel|DOMMouseScroll)$/,
      props: [],
      fix: function fix(event, nativeEvent) {
        var deltaX = void 0;
        var deltaY = void 0;
        var delta = void 0;
        var wheelDelta = nativeEvent.wheelDelta;
        var axis = nativeEvent.axis;
        var wheelDeltaY = nativeEvent.wheelDeltaY;
        var wheelDeltaX = nativeEvent.wheelDeltaX;
        var detail = nativeEvent.detail;

        // ie/webkit
        if (wheelDelta) {
          delta = wheelDelta / 120;
        }

        // gecko
        if (detail) {
          // press control e.detail == 1 else e.detail == 3
          delta = 0 - (detail % 3 === 0 ? detail / 3 : detail);
        }

        // Gecko
        if (axis !== undefined) {
          if (axis === event.HORIZONTAL_AXIS) {
            deltaY = 0;
            deltaX = 0 - delta;
          } else if (axis === event.VERTICAL_AXIS) {
            deltaX = 0;
            deltaY = delta;
          }
        }

        // Webkit
        if (wheelDeltaY !== undefined) {
          deltaY = wheelDeltaY / 120;
        }
        if (wheelDeltaX !== undefined) {
          deltaX = -1 * wheelDeltaX / 120;
        }

        // 默认 deltaY (ie)
        if (!deltaX && !deltaY) {
          deltaY = delta;
        }

        if (deltaX !== undefined) {
          /**
           * deltaX of mousewheel event
           * @property deltaX
           * @member Event.DomEvent.Object
           */
          event.deltaX = deltaX;
        }

        if (deltaY !== undefined) {
          /**
           * deltaY of mousewheel event
           * @property deltaY
           * @member Event.DomEvent.Object
           */
          event.deltaY = deltaY;
        }

        if (delta !== undefined) {
          /**
           * delta of mousewheel event
           * @property delta
           * @member Event.DomEvent.Object
           */
          event.delta = delta;
        }
      }
    }, {
      reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i,
      props: ['buttons', 'clientX', 'clientY', 'button', 'offsetX', 'relatedTarget', 'which', 'fromElement', 'toElement', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'],
      fix: function fix(event, nativeEvent) {
        var eventDoc = void 0;
        var doc = void 0;
        var body = void 0;
        var target = event.target;
        var button = nativeEvent.button;

        // Calculate pageX/Y if missing and clientX/Y available
        if (target && isNullOrUndefined(event.pageX) && !isNullOrUndefined(nativeEvent.clientX)) {
          eventDoc = target.ownerDocument || document;
          doc = eventDoc.documentElement;
          body = eventDoc.body;
          event.pageX = nativeEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
          event.pageY = nativeEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }

        // which for click: 1 === left; 2 === middle; 3 === right
        // do not use button
        if (!event.which && button !== undefined) {
          if (button & 1) {
            event.which = 1;
          } else if (button & 2) {
            event.which = 3;
          } else if (button & 4) {
            event.which = 2;
          } else {
            event.which = 0;
          }
        }

        // add relatedTarget, if necessary
        if (!event.relatedTarget && event.fromElement) {
          event.relatedTarget = event.fromElement === target ? event.toElement : event.fromElement;
        }

        return event;
      }
    }];

    function retTrue() {
      return TRUE;
    }

    function retFalse() {
      return FALSE;
    }

    function DomEventObject(nativeEvent) {
      var type = nativeEvent.type;

      var isNative = typeof nativeEvent.stopPropagation === 'function' || typeof nativeEvent.cancelBubble === 'boolean';

      _EventBaseObject2["default"].call(this);

      this.nativeEvent = nativeEvent;

      // in case dom event has been mark as default prevented by lower dom node
      var isDefaultPrevented = retFalse;
      if ('defaultPrevented' in nativeEvent) {
        isDefaultPrevented = nativeEvent.defaultPrevented ? retTrue : retFalse;
      } else if ('getPreventDefault' in nativeEvent) {
        // https://bugzilla.mozilla.org/show_bug.cgi?id=691151
        isDefaultPrevented = nativeEvent.getPreventDefault() ? retTrue : retFalse;
      } else if ('returnValue' in nativeEvent) {
        isDefaultPrevented = nativeEvent.returnValue === FALSE ? retTrue : retFalse;
      }

      this.isDefaultPrevented = isDefaultPrevented;

      var fixFns = [];
      var fixFn = void 0;
      var l = void 0;
      var prop = void 0;
      var props = commonProps.concat();

      eventNormalizers.forEach(function (normalizer) {
        if (type.match(normalizer.reg)) {
          props = props.concat(normalizer.props);
          if (normalizer.fix) {
            fixFns.push(normalizer.fix);
          }
        }
      });

      l = props.length;

      // clone properties of the original event object
      while (l) {
        prop = props[--l];
        this[prop] = nativeEvent[prop];
      }

      // fix target property, if necessary
      if (!this.target && isNative) {
        this.target = nativeEvent.srcElement || document; // srcElement might not be defined either
      }

      // check if target is a text node (safari)
      if (this.target && this.target.nodeType === 3) {
        this.target = this.target.parentNode;
      }

      l = fixFns.length;

      while (l) {
        fixFn = fixFns[--l];
        fixFn(this, nativeEvent);
      }

      this.timeStamp = nativeEvent.timeStamp || Date.now();
    }

    var EventBaseObjectProto = _EventBaseObject2["default"].prototype;

    (0, _objectAssign2["default"])(DomEventObject.prototype, EventBaseObjectProto, {
      constructor: DomEventObject,

      preventDefault: function preventDefault() {
        var e = this.nativeEvent;

        // if preventDefault exists run it on the original event
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          // otherwise set the returnValue property of the original event to FALSE (IE)
          e.returnValue = FALSE;
        }

        EventBaseObjectProto.preventDefault.call(this);
      },
      stopPropagation: function stopPropagation() {
        var e = this.nativeEvent;

        // if stopPropagation exists run it on the original event
        if (e.stopPropagation) {
          e.stopPropagation();
        } else {
          // otherwise set the cancelBubble property of the original event to TRUE (IE)
          e.cancelBubble = TRUE;
        }

        EventBaseObjectProto.stopPropagation.call(this);
      }
    });

    exports["default"] = DomEventObject;
    module.exports = exports['default'];
    });

    unwrapExports(EventObject);

    var lib = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = addEventListener;



    var _EventObject2 = _interopRequireDefault(EventObject);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

    function addEventListener(target, eventType, callback) {
      function wrapCallback(e) {
        var ne = new _EventObject2["default"](e);
        callback.call(target, ne);
      }

      if (target.addEventListener) {
        target.addEventListener(eventType, wrapCallback, false);
        return {
          remove: function remove() {
            target.removeEventListener(eventType, wrapCallback, false);
          }
        };
      } else if (target.attachEvent) {
        target.attachEvent('on' + eventType, wrapCallback);
        return {
          remove: function remove() {
            target.detachEvent('on' + eventType, wrapCallback);
          }
        };
      }
    }
    module.exports = exports['default'];
    });

    var addDOMEventListener = unwrapExports(lib);

    function addEventListenerWrap(target, eventType, cb) {
      /* eslint camelcase: 2 */
      var callback = ReactDOM__default.unstable_batchedUpdates ? function run(e) {
        ReactDOM__default.unstable_batchedUpdates(cb, e);
      } : cb;
      return addDOMEventListener(target, eventType, callback);
    }

    var classnames = createCommonjsModule(function (module) {
    /*!
      Copyright (c) 2017 Jed Watson.
      Licensed under the MIT License (MIT), see
      http://jedwatson.github.io/classnames
    */
    /* global define */

    (function () {

    	var hasOwn = {}.hasOwnProperty;

    	function classNames () {
    		var classes = [];

    		for (var i = 0; i < arguments.length; i++) {
    			var arg = arguments[i];
    			if (!arg) continue;

    			var argType = typeof arg;

    			if (argType === 'string' || argType === 'number') {
    				classes.push(arg);
    			} else if (Array.isArray(arg) && arg.length) {
    				var inner = classNames.apply(null, arg);
    				if (inner) {
    					classes.push(inner);
    				}
    			} else if (argType === 'object') {
    				for (var key in arg) {
    					if (hasOwn.call(arg, key) && arg[key]) {
    						classes.push(key);
    					}
    				}
    			}
    		}

    		return classes.join(' ');
    	}

    	if (module.exports) {
    		classNames.default = classNames;
    		module.exports = classNames;
    	} else {
    		window.classNames = classNames;
    	}
    }());
    });

    var calcPoints = function calcPoints(vertical, marks, dots, step, min, max) {
      warning_1(dots ? step > 0 : true, '`Slider[step]` should be a positive number in order to make Slider[dots] work.');
      var points = Object.keys(marks).map(parseFloat);
      if (dots) {
        for (var i = min; i <= max; i += step) {
          if (points.indexOf(i) === -1) {
            points.push(i);
          }
        }
      }
      return points;
    };

    var Steps = function Steps(_ref) {
      var prefixCls = _ref.prefixCls,
          vertical = _ref.vertical,
          marks = _ref.marks,
          dots = _ref.dots,
          step = _ref.step,
          included = _ref.included,
          lowerBound = _ref.lowerBound,
          upperBound = _ref.upperBound,
          max = _ref.max,
          min = _ref.min,
          dotStyle = _ref.dotStyle,
          activeDotStyle = _ref.activeDotStyle;

      var range = max - min;
      var elements = calcPoints(vertical, marks, dots, step, min, max).map(function (point) {
        var _classNames;

        var offset = Math.abs(point - min) / range * 100 + '%';

        var isActived = !included && point === upperBound || included && point <= upperBound && point >= lowerBound;
        var style = vertical ? _extends$1({ bottom: offset }, dotStyle) : _extends$1({ left: offset }, dotStyle);
        if (isActived) {
          style = _extends$1({}, style, activeDotStyle);
        }

        var pointClassName = classnames((_classNames = {}, _defineProperty(_classNames, prefixCls + '-dot', true), _defineProperty(_classNames, prefixCls + '-dot-active', isActived), _classNames));

        return React__default.createElement('span', { className: pointClassName, style: style, key: point });
      });

      return React__default.createElement(
        'div',
        { className: prefixCls + '-step' },
        elements
      );
    };

    Steps.propTypes = {
      prefixCls: propTypes.string,
      activeDotStyle: propTypes.object,
      dotStyle: propTypes.object,
      min: propTypes.number,
      max: propTypes.number,
      upperBound: propTypes.number,
      lowerBound: propTypes.number,
      included: propTypes.bool,
      dots: propTypes.bool,
      step: propTypes.number,
      marks: propTypes.object,
      vertical: propTypes.bool
    };

    var Marks = function Marks(_ref) {
      var className = _ref.className,
          vertical = _ref.vertical,
          marks = _ref.marks,
          included = _ref.included,
          upperBound = _ref.upperBound,
          lowerBound = _ref.lowerBound,
          max = _ref.max,
          min = _ref.min,
          onClickLabel = _ref.onClickLabel;

      var marksKeys = Object.keys(marks);
      var marksCount = marksKeys.length;
      var unit = marksCount > 1 ? 100 / (marksCount - 1) : 100;
      var markWidth = unit * 0.9;

      var range = max - min;
      var elements = marksKeys.map(parseFloat).sort(function (a, b) {
        return a - b;
      }).map(function (point) {
        var _classNames;

        var markPoint = marks[point];
        var markPointIsObject = typeof markPoint === 'object' && !React__default.isValidElement(markPoint);
        var markLabel = markPointIsObject ? markPoint.label : markPoint;
        if (!markLabel && markLabel !== 0) {
          return null;
        }

        var isActive = !included && point === upperBound || included && point <= upperBound && point >= lowerBound;
        var markClassName = classnames((_classNames = {}, _defineProperty(_classNames, className + '-text', true), _defineProperty(_classNames, className + '-text-active', isActive), _classNames));

        var bottomStyle = {
          marginBottom: '-50%',
          bottom: (point - min) / range * 100 + '%'
        };

        var leftStyle = {
          width: markWidth + '%',
          marginLeft: -markWidth / 2 + '%',
          left: (point - min) / range * 100 + '%'
        };

        var style = vertical ? bottomStyle : leftStyle;
        var markStyle = markPointIsObject ? _extends$1({}, style, markPoint.style) : style;
        return React__default.createElement(
          'span',
          {
            className: markClassName,
            style: markStyle,
            key: point,
            onMouseDown: function onMouseDown(e) {
              return onClickLabel(e, point);
            },
            onTouchStart: function onTouchStart(e) {
              return onClickLabel(e, point);
            }
          },
          markLabel
        );
      });

      return React__default.createElement(
        'div',
        { className: className },
        elements
      );
    };

    Marks.propTypes = {
      className: propTypes.string,
      vertical: propTypes.bool,
      marks: propTypes.object,
      included: propTypes.bool,
      upperBound: propTypes.number,
      lowerBound: propTypes.number,
      max: propTypes.number,
      min: propTypes.number,
      onClickLabel: propTypes.func
    };

    var Handle = function (_React$Component) {
      _inherits(Handle, _React$Component);

      function Handle() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Handle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Handle.__proto__ || Object.getPrototypeOf(Handle)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
          clickFocused: false
        }, _this.setHandleRef = function (node) {
          _this.handle = node;
        }, _this.handleMouseUp = function () {
          if (document.activeElement === _this.handle) {
            _this.setClickFocus(true);
          }
        }, _this.handleBlur = function () {
          _this.setClickFocus(false);
        }, _this.handleKeyDown = function () {
          _this.setClickFocus(false);
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(Handle, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          // mouseup won't trigger if mouse moved out of handle,
          // so we listen on document here.
          this.onMouseUpListener = addEventListenerWrap(document, 'mouseup', this.handleMouseUp);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          if (this.onMouseUpListener) {
            this.onMouseUpListener.remove();
          }
        }
      }, {
        key: 'setClickFocus',
        value: function setClickFocus(focused) {
          this.setState({ clickFocused: focused });
        }
      }, {
        key: 'clickFocus',
        value: function clickFocus() {
          this.setClickFocus(true);
          this.focus();
        }
      }, {
        key: 'focus',
        value: function focus() {
          this.handle.focus();
        }
      }, {
        key: 'blur',
        value: function blur() {
          this.handle.blur();
        }
      }, {
        key: 'render',
        value: function render() {
          var _props = this.props,
              prefixCls = _props.prefixCls,
              vertical = _props.vertical,
              offset = _props.offset,
              style = _props.style,
              disabled = _props.disabled,
              min = _props.min,
              max = _props.max,
              value = _props.value,
              tabIndex = _props.tabIndex,
              restProps = _objectWithoutProperties(_props, ['prefixCls', 'vertical', 'offset', 'style', 'disabled', 'min', 'max', 'value', 'tabIndex']);

          var className = classnames(this.props.className, _defineProperty({}, prefixCls + '-handle-click-focused', this.state.clickFocused));

          var postionStyle = vertical ? { bottom: offset + '%' } : { left: offset + '%' };
          var elStyle = _extends$1({}, style, postionStyle);

          return React__default.createElement('div', _extends$1({
            ref: this.setHandleRef,
            tabIndex: disabled ? null : tabIndex || 0
          }, restProps, {
            className: className,
            style: elStyle,
            onBlur: this.handleBlur,
            onKeyDown: this.handleKeyDown

            // aria attribute
            , role: 'slider',
            'aria-valuemin': min,
            'aria-valuemax': max,
            'aria-valuenow': value,
            'aria-disabled': !!disabled
          }));
        }
      }]);

      return Handle;
    }(React__default.Component);


    Handle.propTypes = {
      prefixCls: propTypes.string,
      className: propTypes.string,
      vertical: propTypes.bool,
      offset: propTypes.number,
      style: propTypes.object,
      disabled: propTypes.bool,
      min: propTypes.number,
      max: propTypes.number,
      value: propTypes.number,
      tabIndex: propTypes.number
    };

    // call something on iterator step with safe closing on error

    var _iterCall = function (iterator, fn, value, entries) {
      try {
        return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
      // 7.4.6 IteratorClose(iterator, completion)
      } catch (e) {
        var ret = iterator['return'];
        if (ret !== undefined) _anObject(ret.call(iterator));
        throw e;
      }
    };

    // check on default Array iterator

    var ITERATOR$1 = _wks('iterator');
    var ArrayProto = Array.prototype;

    var _isArrayIter = function (it) {
      return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
    };

    var _createProperty = function (object, index, value) {
      if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
      else object[index] = value;
    };

    // getting tag from 19.1.3.6 Object.prototype.toString()

    var TAG$1 = _wks('toStringTag');
    // ES3 wrong here
    var ARG = _cof(function () { return arguments; }()) == 'Arguments';

    // fallback for IE11 Script Access Denied error
    var tryGet = function (it, key) {
      try {
        return it[key];
      } catch (e) { /* empty */ }
    };

    var _classof = function (it) {
      var O, T, B;
      return it === undefined ? 'Undefined' : it === null ? 'Null'
        // @@toStringTag case
        : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
        // builtinTag case
        : ARG ? _cof(O)
        // ES3 arguments fallback
        : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
    };

    var ITERATOR$2 = _wks('iterator');

    var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
      if (it != undefined) return it[ITERATOR$2]
        || it['@@iterator']
        || _iterators[_classof(it)];
    };

    var ITERATOR$3 = _wks('iterator');
    var SAFE_CLOSING = false;

    try {
      var riter = [7][ITERATOR$3]();
      riter['return'] = function () { SAFE_CLOSING = true; };
    } catch (e) { /* empty */ }

    var _iterDetect = function (exec, skipClosing) {
      if (!skipClosing && !SAFE_CLOSING) return false;
      var safe = false;
      try {
        var arr = [7];
        var iter = arr[ITERATOR$3]();
        iter.next = function () { return { done: safe = true }; };
        arr[ITERATOR$3] = function () { return iter; };
        exec(arr);
      } catch (e) { /* empty */ }
      return safe;
    };

    _export(_export.S + _export.F * !_iterDetect(function (iter) { }), 'Array', {
      // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
      from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
        var O = _toObject(arrayLike);
        var C = typeof this == 'function' ? this : Array;
        var aLen = arguments.length;
        var mapfn = aLen > 1 ? arguments[1] : undefined;
        var mapping = mapfn !== undefined;
        var index = 0;
        var iterFn = core_getIteratorMethod(O);
        var length, result, step, iterator;
        if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
        // if object isn't iterable or it's array with default iterator - use simple case
        if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
          for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
            _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
          }
        } else {
          length = _toLength(O.length);
          for (result = new C(length); length > index; index++) {
            _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
          }
        }
        result.length = index;
        return result;
      }
    });

    var from_1 = _core.Array.from;

    var from_1$1 = createCommonjsModule(function (module) {
    module.exports = { "default": from_1, __esModule: true };
    });

    unwrapExports(from_1$1);

    var toConsumableArray = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;



    var _from2 = _interopRequireDefault(from_1$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
          arr2[i] = arr[i];
        }

        return arr2;
      } else {
        return (0, _from2.default)(arr);
      }
    };
    });

    var _toConsumableArray = unwrapExports(toConsumableArray);

    /**
     * @ignore
     * some key-codes definition and utils from closure-library
     * @author yiminghe@gmail.com
     */

    var KeyCode = {
      /**
       * MAC_ENTER
       */
      MAC_ENTER: 3,
      /**
       * BACKSPACE
       */
      BACKSPACE: 8,
      /**
       * TAB
       */
      TAB: 9,
      /**
       * NUMLOCK on FF/Safari Mac
       */
      NUM_CENTER: 12, // NUMLOCK on FF/Safari Mac
      /**
       * ENTER
       */
      ENTER: 13,
      /**
       * SHIFT
       */
      SHIFT: 16,
      /**
       * CTRL
       */
      CTRL: 17,
      /**
       * ALT
       */
      ALT: 18,
      /**
       * PAUSE
       */
      PAUSE: 19,
      /**
       * CAPS_LOCK
       */
      CAPS_LOCK: 20,
      /**
       * ESC
       */
      ESC: 27,
      /**
       * SPACE
       */
      SPACE: 32,
      /**
       * PAGE_UP
       */
      PAGE_UP: 33, // also NUM_NORTH_EAST
      /**
       * PAGE_DOWN
       */
      PAGE_DOWN: 34, // also NUM_SOUTH_EAST
      /**
       * END
       */
      END: 35, // also NUM_SOUTH_WEST
      /**
       * HOME
       */
      HOME: 36, // also NUM_NORTH_WEST
      /**
       * LEFT
       */
      LEFT: 37, // also NUM_WEST
      /**
       * UP
       */
      UP: 38, // also NUM_NORTH
      /**
       * RIGHT
       */
      RIGHT: 39, // also NUM_EAST
      /**
       * DOWN
       */
      DOWN: 40, // also NUM_SOUTH
      /**
       * PRINT_SCREEN
       */
      PRINT_SCREEN: 44,
      /**
       * INSERT
       */
      INSERT: 45, // also NUM_INSERT
      /**
       * DELETE
       */
      DELETE: 46, // also NUM_DELETE
      /**
       * ZERO
       */
      ZERO: 48,
      /**
       * ONE
       */
      ONE: 49,
      /**
       * TWO
       */
      TWO: 50,
      /**
       * THREE
       */
      THREE: 51,
      /**
       * FOUR
       */
      FOUR: 52,
      /**
       * FIVE
       */
      FIVE: 53,
      /**
       * SIX
       */
      SIX: 54,
      /**
       * SEVEN
       */
      SEVEN: 55,
      /**
       * EIGHT
       */
      EIGHT: 56,
      /**
       * NINE
       */
      NINE: 57,
      /**
       * QUESTION_MARK
       */
      QUESTION_MARK: 63, // needs localization
      /**
       * A
       */
      A: 65,
      /**
       * B
       */
      B: 66,
      /**
       * C
       */
      C: 67,
      /**
       * D
       */
      D: 68,
      /**
       * E
       */
      E: 69,
      /**
       * F
       */
      F: 70,
      /**
       * G
       */
      G: 71,
      /**
       * H
       */
      H: 72,
      /**
       * I
       */
      I: 73,
      /**
       * J
       */
      J: 74,
      /**
       * K
       */
      K: 75,
      /**
       * L
       */
      L: 76,
      /**
       * M
       */
      M: 77,
      /**
       * N
       */
      N: 78,
      /**
       * O
       */
      O: 79,
      /**
       * P
       */
      P: 80,
      /**
       * Q
       */
      Q: 81,
      /**
       * R
       */
      R: 82,
      /**
       * S
       */
      S: 83,
      /**
       * T
       */
      T: 84,
      /**
       * U
       */
      U: 85,
      /**
       * V
       */
      V: 86,
      /**
       * W
       */
      W: 87,
      /**
       * X
       */
      X: 88,
      /**
       * Y
       */
      Y: 89,
      /**
       * Z
       */
      Z: 90,
      /**
       * META
       */
      META: 91, // WIN_KEY_LEFT
      /**
       * WIN_KEY_RIGHT
       */
      WIN_KEY_RIGHT: 92,
      /**
       * CONTEXT_MENU
       */
      CONTEXT_MENU: 93,
      /**
       * NUM_ZERO
       */
      NUM_ZERO: 96,
      /**
       * NUM_ONE
       */
      NUM_ONE: 97,
      /**
       * NUM_TWO
       */
      NUM_TWO: 98,
      /**
       * NUM_THREE
       */
      NUM_THREE: 99,
      /**
       * NUM_FOUR
       */
      NUM_FOUR: 100,
      /**
       * NUM_FIVE
       */
      NUM_FIVE: 101,
      /**
       * NUM_SIX
       */
      NUM_SIX: 102,
      /**
       * NUM_SEVEN
       */
      NUM_SEVEN: 103,
      /**
       * NUM_EIGHT
       */
      NUM_EIGHT: 104,
      /**
       * NUM_NINE
       */
      NUM_NINE: 105,
      /**
       * NUM_MULTIPLY
       */
      NUM_MULTIPLY: 106,
      /**
       * NUM_PLUS
       */
      NUM_PLUS: 107,
      /**
       * NUM_MINUS
       */
      NUM_MINUS: 109,
      /**
       * NUM_PERIOD
       */
      NUM_PERIOD: 110,
      /**
       * NUM_DIVISION
       */
      NUM_DIVISION: 111,
      /**
       * F1
       */
      F1: 112,
      /**
       * F2
       */
      F2: 113,
      /**
       * F3
       */
      F3: 114,
      /**
       * F4
       */
      F4: 115,
      /**
       * F5
       */
      F5: 116,
      /**
       * F6
       */
      F6: 117,
      /**
       * F7
       */
      F7: 118,
      /**
       * F8
       */
      F8: 119,
      /**
       * F9
       */
      F9: 120,
      /**
       * F10
       */
      F10: 121,
      /**
       * F11
       */
      F11: 122,
      /**
       * F12
       */
      F12: 123,
      /**
       * NUMLOCK
       */
      NUMLOCK: 144,
      /**
       * SEMICOLON
       */
      SEMICOLON: 186, // needs localization
      /**
       * DASH
       */
      DASH: 189, // needs localization
      /**
       * EQUALS
       */
      EQUALS: 187, // needs localization
      /**
       * COMMA
       */
      COMMA: 188, // needs localization
      /**
       * PERIOD
       */
      PERIOD: 190, // needs localization
      /**
       * SLASH
       */
      SLASH: 191, // needs localization
      /**
       * APOSTROPHE
       */
      APOSTROPHE: 192, // needs localization
      /**
       * SINGLE_QUOTE
       */
      SINGLE_QUOTE: 222, // needs localization
      /**
       * OPEN_SQUARE_BRACKET
       */
      OPEN_SQUARE_BRACKET: 219, // needs localization
      /**
       * BACKSLASH
       */
      BACKSLASH: 220, // needs localization
      /**
       * CLOSE_SQUARE_BRACKET
       */
      CLOSE_SQUARE_BRACKET: 221, // needs localization
      /**
       * WIN_KEY
       */
      WIN_KEY: 224,
      /**
       * MAC_FF_META
       */
      MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
      /**
       * WIN_IME
       */
      WIN_IME: 229
    };

    /*
     whether text and modified key is entered at the same time.
     */
    KeyCode.isTextModifyingKeyEvent = function isTextModifyingKeyEvent(e) {
      var keyCode = e.keyCode;
      if (e.altKey && !e.ctrlKey || e.metaKey ||
      // Function keys don't generate text
      keyCode >= KeyCode.F1 && keyCode <= KeyCode.F12) {
        return false;
      }

      // The following keys are quite harmless, even in combination with
      // CTRL, ALT or SHIFT.
      switch (keyCode) {
        case KeyCode.ALT:
        case KeyCode.CAPS_LOCK:
        case KeyCode.CONTEXT_MENU:
        case KeyCode.CTRL:
        case KeyCode.DOWN:
        case KeyCode.END:
        case KeyCode.ESC:
        case KeyCode.HOME:
        case KeyCode.INSERT:
        case KeyCode.LEFT:
        case KeyCode.MAC_FF_META:
        case KeyCode.META:
        case KeyCode.NUMLOCK:
        case KeyCode.NUM_CENTER:
        case KeyCode.PAGE_DOWN:
        case KeyCode.PAGE_UP:
        case KeyCode.PAUSE:
        case KeyCode.PRINT_SCREEN:
        case KeyCode.RIGHT:
        case KeyCode.SHIFT:
        case KeyCode.UP:
        case KeyCode.WIN_KEY:
        case KeyCode.WIN_KEY_RIGHT:
          return false;
        default:
          return true;
      }
    };

    /*
     whether character is entered.
     */
    KeyCode.isCharacterKey = function isCharacterKey(keyCode) {
      if (keyCode >= KeyCode.ZERO && keyCode <= KeyCode.NINE) {
        return true;
      }

      if (keyCode >= KeyCode.NUM_ZERO && keyCode <= KeyCode.NUM_MULTIPLY) {
        return true;
      }

      if (keyCode >= KeyCode.A && keyCode <= KeyCode.Z) {
        return true;
      }

      // Safari sends zero key code for non-latin characters.
      if (window.navigation.userAgent.indexOf('WebKit') !== -1 && keyCode === 0) {
        return true;
      }

      switch (keyCode) {
        case KeyCode.SPACE:
        case KeyCode.QUESTION_MARK:
        case KeyCode.NUM_PLUS:
        case KeyCode.NUM_MINUS:
        case KeyCode.NUM_PERIOD:
        case KeyCode.NUM_DIVISION:
        case KeyCode.SEMICOLON:
        case KeyCode.DASH:
        case KeyCode.EQUALS:
        case KeyCode.COMMA:
        case KeyCode.PERIOD:
        case KeyCode.SLASH:
        case KeyCode.APOSTROPHE:
        case KeyCode.SINGLE_QUOTE:
        case KeyCode.OPEN_SQUARE_BRACKET:
        case KeyCode.BACKSLASH:
        case KeyCode.CLOSE_SQUARE_BRACKET:
          return true;
        default:
          return false;
      }
    };

    function isEventFromHandle(e, handles) {
      return Object.keys(handles).some(function (key) {
        return e.target === ReactDOM.findDOMNode(handles[key]);
      });
    }

    function isValueOutOfRange(value, _ref) {
      var min = _ref.min,
          max = _ref.max;

      return value < min || value > max;
    }

    function isNotTouchEvent(e) {
      return e.touches.length > 1 || e.type.toLowerCase() === 'touchend' && e.touches.length > 0;
    }

    function getClosestPoint(val, _ref2) {
      var marks = _ref2.marks,
          step = _ref2.step,
          min = _ref2.min;

      var points = Object.keys(marks).map(parseFloat);
      if (step !== null) {
        var closestStep = Math.round((val - min) / step) * step + min;
        points.push(closestStep);
      }
      var diffs = points.map(function (point) {
        return Math.abs(val - point);
      });
      return points[diffs.indexOf(Math.min.apply(Math, _toConsumableArray(diffs)))];
    }

    function getPrecision(step) {
      var stepString = step.toString();
      var precision = 0;
      if (stepString.indexOf('.') >= 0) {
        precision = stepString.length - stepString.indexOf('.') - 1;
      }
      return precision;
    }

    function getMousePosition(vertical, e) {
      return vertical ? e.clientY : e.pageX;
    }

    function getTouchPosition(vertical, e) {
      return vertical ? e.touches[0].clientY : e.touches[0].pageX;
    }

    function getHandleCenterPosition(vertical, handle) {
      var coords = handle.getBoundingClientRect();
      return vertical ? coords.top + coords.height * 0.5 : coords.left + coords.width * 0.5;
    }

    function ensureValueInRange(val, _ref3) {
      var max = _ref3.max,
          min = _ref3.min;

      if (val <= min) {
        return min;
      }
      if (val >= max) {
        return max;
      }
      return val;
    }

    function ensureValuePrecision(val, props) {
      var step = props.step;

      var closestPoint = getClosestPoint(val, props);
      return step === null ? closestPoint : parseFloat(closestPoint.toFixed(getPrecision(step)));
    }

    function pauseEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    function getKeyboardValueMutator(e) {
      switch (e.keyCode) {
        case KeyCode.UP:
        case KeyCode.RIGHT:
          return function (value, props) {
            return value + props.step;
          };

        case KeyCode.DOWN:
        case KeyCode.LEFT:
          return function (value, props) {
            return value - props.step;
          };

        case KeyCode.END:
          return function (value, props) {
            return props.max;
          };
        case KeyCode.HOME:
          return function (value, props) {
            return props.min;
          };
        case KeyCode.PAGE_UP:
          return function (value, props) {
            return value + props.step * 2;
          };
        case KeyCode.PAGE_DOWN:
          return function (value, props) {
            return value - props.step * 2;
          };

        default:
          return undefined;
      }
    }

    function noop() {}

    function createSlider(Component) {
      var _class, _temp;

      return _temp = _class = function (_Component) {
        _inherits(ComponentEnhancer, _Component);

        function ComponentEnhancer(props) {
          _classCallCheck(this, ComponentEnhancer);

          var _this = _possibleConstructorReturn(this, (ComponentEnhancer.__proto__ || Object.getPrototypeOf(ComponentEnhancer)).call(this, props));

          _this.onMouseDown = function (e) {
            if (e.button !== 0) {
              return;
            }

            var isVertical = _this.props.vertical;
            var position = getMousePosition(isVertical, e);
            if (!isEventFromHandle(e, _this.handlesRefs)) {
              _this.dragOffset = 0;
            } else {
              var handlePosition = getHandleCenterPosition(isVertical, e.target);
              _this.dragOffset = position - handlePosition;
              position = handlePosition;
            }
            _this.removeDocumentEvents();
            _this.onStart(position);
            _this.addDocumentMouseEvents();
          };

          _this.onTouchStart = function (e) {
            if (isNotTouchEvent(e)) return;

            var isVertical = _this.props.vertical;
            var position = getTouchPosition(isVertical, e);
            if (!isEventFromHandle(e, _this.handlesRefs)) {
              _this.dragOffset = 0;
            } else {
              var handlePosition = getHandleCenterPosition(isVertical, e.target);
              _this.dragOffset = position - handlePosition;
              position = handlePosition;
            }
            _this.onStart(position);
            _this.addDocumentTouchEvents();
            pauseEvent(e);
          };

          _this.onFocus = function (e) {
            var _this$props = _this.props,
                onFocus = _this$props.onFocus,
                vertical = _this$props.vertical;

            if (isEventFromHandle(e, _this.handlesRefs)) {
              var handlePosition = getHandleCenterPosition(vertical, e.target);
              _this.dragOffset = 0;
              _this.onStart(handlePosition);
              pauseEvent(e);
              if (onFocus) {
                onFocus(e);
              }
            }
          };

          _this.onBlur = function (e) {
            var onBlur = _this.props.onBlur;

            _this.onEnd(e);
            if (onBlur) {
              onBlur(e);
            }
          };

          _this.onMouseUp = function () {
            if (_this.handlesRefs[_this.prevMovedHandleIndex]) {
              _this.handlesRefs[_this.prevMovedHandleIndex].clickFocus();
            }
          };

          _this.onMouseMove = function (e) {
            if (!_this.sliderRef) {
              _this.onEnd();
              return;
            }
            var position = getMousePosition(_this.props.vertical, e);
            _this.onMove(e, position - _this.dragOffset);
          };

          _this.onTouchMove = function (e) {
            if (isNotTouchEvent(e) || !_this.sliderRef) {
              _this.onEnd();
              return;
            }

            var position = getTouchPosition(_this.props.vertical, e);
            _this.onMove(e, position - _this.dragOffset);
          };

          _this.onKeyDown = function (e) {
            if (_this.sliderRef && isEventFromHandle(e, _this.handlesRefs)) {
              _this.onKeyboard(e);
            }
          };

          _this.onClickMarkLabel = function (e, value) {
            e.stopPropagation();
            _this.onChange({ value: value });
          };

          _this.saveSlider = function (slider) {
            _this.sliderRef = slider;
          };
          _this.handlesRefs = {};
          return _this;
        }

        _createClass(ComponentEnhancer, [{
          key: 'componentDidMount',
          value: function componentDidMount() {
            // Snapshot testing cannot handle refs, so be sure to null-check this.
            this.document = this.sliderRef && this.sliderRef.ownerDocument;
          }
        }, {
          key: 'componentWillUnmount',
          value: function componentWillUnmount() {
            if (_get(ComponentEnhancer.prototype.__proto__ || Object.getPrototypeOf(ComponentEnhancer.prototype), 'componentWillUnmount', this)) _get(ComponentEnhancer.prototype.__proto__ || Object.getPrototypeOf(ComponentEnhancer.prototype), 'componentWillUnmount', this).call(this);
            this.removeDocumentEvents();
          }
        }, {
          key: 'getSliderStart',
          value: function getSliderStart() {
            var slider = this.sliderRef;
            var rect = slider.getBoundingClientRect();

            return this.props.vertical ? rect.top : rect.left;
          }
        }, {
          key: 'getSliderLength',
          value: function getSliderLength() {
            var slider = this.sliderRef;
            if (!slider) {
              return 0;
            }

            var coords = slider.getBoundingClientRect();
            return this.props.vertical ? coords.height : coords.width;
          }
        }, {
          key: 'addDocumentTouchEvents',
          value: function addDocumentTouchEvents() {
            // just work for Chrome iOS Safari and Android Browser
            this.onTouchMoveListener = addEventListenerWrap(this.document, 'touchmove', this.onTouchMove);
            this.onTouchUpListener = addEventListenerWrap(this.document, 'touchend', this.onEnd);
          }
        }, {
          key: 'addDocumentMouseEvents',
          value: function addDocumentMouseEvents() {
            this.onMouseMoveListener = addEventListenerWrap(this.document, 'mousemove', this.onMouseMove);
            this.onMouseUpListener = addEventListenerWrap(this.document, 'mouseup', this.onEnd);
          }
        }, {
          key: 'removeDocumentEvents',
          value: function removeDocumentEvents() {
            /* eslint-disable no-unused-expressions */
            this.onTouchMoveListener && this.onTouchMoveListener.remove();
            this.onTouchUpListener && this.onTouchUpListener.remove();

            this.onMouseMoveListener && this.onMouseMoveListener.remove();
            this.onMouseUpListener && this.onMouseUpListener.remove();
            /* eslint-enable no-unused-expressions */
          }
        }, {
          key: 'focus',
          value: function focus() {
            if (!this.props.disabled) {
              this.handlesRefs[0].focus();
            }
          }
        }, {
          key: 'blur',
          value: function blur() {
            var _this2 = this;

            if (!this.props.disabled) {
              Object.keys(this.handlesRefs).forEach(function (key) {
                if (_this2.handlesRefs[key] && _this2.handlesRefs[key].blur) {
                  _this2.handlesRefs[key].blur();
                }
              });
            }
          }
        }, {
          key: 'calcValue',
          value: function calcValue(offset) {
            var _props = this.props,
                vertical = _props.vertical,
                min = _props.min,
                max = _props.max;

            var ratio = Math.abs(Math.max(offset, 0) / this.getSliderLength());
            var value = vertical ? (1 - ratio) * (max - min) + min : ratio * (max - min) + min;
            return value;
          }
        }, {
          key: 'calcValueByPos',
          value: function calcValueByPos(position) {
            var pixelOffset = position - this.getSliderStart();
            var nextValue = this.trimAlignValue(this.calcValue(pixelOffset));
            return nextValue;
          }
        }, {
          key: 'calcOffset',
          value: function calcOffset(value) {
            var _props2 = this.props,
                min = _props2.min,
                max = _props2.max;

            var ratio = (value - min) / (max - min);
            return ratio * 100;
          }
        }, {
          key: 'saveHandle',
          value: function saveHandle(index, handle) {
            this.handlesRefs[index] = handle;
          }
        }, {
          key: 'render',
          value: function render() {
            var _classNames;

            var _props3 = this.props,
                prefixCls = _props3.prefixCls,
                className = _props3.className,
                marks = _props3.marks,
                dots = _props3.dots,
                step = _props3.step,
                included = _props3.included,
                disabled = _props3.disabled,
                vertical = _props3.vertical,
                min = _props3.min,
                max = _props3.max,
                children = _props3.children,
                maximumTrackStyle = _props3.maximumTrackStyle,
                style = _props3.style,
                railStyle = _props3.railStyle,
                dotStyle = _props3.dotStyle,
                activeDotStyle = _props3.activeDotStyle;

            var _get$call = _get(ComponentEnhancer.prototype.__proto__ || Object.getPrototypeOf(ComponentEnhancer.prototype), 'render', this).call(this),
                tracks = _get$call.tracks,
                handles = _get$call.handles;

            var sliderClassName = classnames(prefixCls, (_classNames = {}, _defineProperty(_classNames, prefixCls + '-with-marks', Object.keys(marks).length), _defineProperty(_classNames, prefixCls + '-disabled', disabled), _defineProperty(_classNames, prefixCls + '-vertical', vertical), _defineProperty(_classNames, className, className), _classNames));
            return React__default.createElement(
              'div',
              {
                ref: this.saveSlider,
                className: sliderClassName,
                onTouchStart: disabled ? noop : this.onTouchStart,
                onMouseDown: disabled ? noop : this.onMouseDown,
                onMouseUp: disabled ? noop : this.onMouseUp,
                onKeyDown: disabled ? noop : this.onKeyDown,
                onFocus: disabled ? noop : this.onFocus,
                onBlur: disabled ? noop : this.onBlur,
                style: style
              },
              React__default.createElement('div', {
                className: prefixCls + '-rail',
                style: _extends$1({}, maximumTrackStyle, railStyle)
              }),
              tracks,
              React__default.createElement(Steps, {
                prefixCls: prefixCls,
                vertical: vertical,
                marks: marks,
                dots: dots,
                step: step,
                included: included,
                lowerBound: this.getLowerBound(),
                upperBound: this.getUpperBound(),
                max: max,
                min: min,
                dotStyle: dotStyle,
                activeDotStyle: activeDotStyle
              }),
              handles,
              React__default.createElement(Marks, {
                className: prefixCls + '-mark',
                onClickLabel: disabled ? noop : this.onClickMarkLabel,
                vertical: vertical,
                marks: marks,
                included: included,
                lowerBound: this.getLowerBound(),
                upperBound: this.getUpperBound(),
                max: max,
                min: min
              }),
              children
            );
          }
        }]);

        return ComponentEnhancer;
      }(Component), _class.displayName = 'ComponentEnhancer(' + Component.displayName + ')', _class.propTypes = _extends$1({}, Component.propTypes, {
        min: propTypes.number,
        max: propTypes.number,
        step: propTypes.number,
        marks: propTypes.object,
        included: propTypes.bool,
        className: propTypes.string,
        prefixCls: propTypes.string,
        disabled: propTypes.bool,
        children: propTypes.any,
        onBeforeChange: propTypes.func,
        onChange: propTypes.func,
        onAfterChange: propTypes.func,
        handle: propTypes.func,
        dots: propTypes.bool,
        vertical: propTypes.bool,
        style: propTypes.object,
        minimumTrackStyle: propTypes.object, // just for compatibility, will be deperecate
        maximumTrackStyle: propTypes.object, // just for compatibility, will be deperecate
        handleStyle: propTypes.oneOfType([propTypes.object, propTypes.arrayOf(propTypes.object)]),
        trackStyle: propTypes.oneOfType([propTypes.object, propTypes.arrayOf(propTypes.object)]),
        railStyle: propTypes.object,
        dotStyle: propTypes.object,
        activeDotStyle: propTypes.object,
        autoFocus: propTypes.bool,
        onFocus: propTypes.func,
        onBlur: propTypes.func
      }), _class.defaultProps = _extends$1({}, Component.defaultProps, {
        prefixCls: 'rc-slider',
        className: '',
        min: 0,
        max: 100,
        step: 1,
        marks: {},
        handle: function handle(_ref) {
          var index = _ref.index,
              restProps = _objectWithoutProperties(_ref, ['index']);

          delete restProps.dragging;
          return React__default.createElement(Handle, _extends$1({}, restProps, { key: index }));
        },

        onBeforeChange: noop,
        onChange: noop,
        onAfterChange: noop,
        included: true,
        disabled: false,
        dots: false,
        vertical: false,
        trackStyle: [{}],
        handleStyle: [{}],
        railStyle: {},
        dotStyle: {},
        activeDotStyle: {}
      }), _temp;
    }

    var Slider = function (_React$Component) {
      _inherits(Slider, _React$Component);

      function Slider(props) {
        _classCallCheck(this, Slider);

        var _this = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, props));

        _this.onEnd = function () {
          _this.setState({ dragging: false });
          _this.removeDocumentEvents();
          _this.props.onAfterChange(_this.getValue());
        };

        var defaultValue = props.defaultValue !== undefined ? props.defaultValue : props.min;
        var value = props.value !== undefined ? props.value : defaultValue;

        _this.state = {
          value: _this.trimAlignValue(value),
          dragging: false
        };
        return _this;
      }

      _createClass(Slider, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _props = this.props,
              autoFocus = _props.autoFocus,
              disabled = _props.disabled;

          if (autoFocus && !disabled) {
            this.focus();
          }
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (!('value' in nextProps || 'min' in nextProps || 'max' in nextProps)) return;

          var prevValue = this.state.value;
          var value = nextProps.value !== undefined ? nextProps.value : prevValue;
          var nextValue = this.trimAlignValue(value, nextProps);
          if (nextValue === prevValue) return;

          this.setState({ value: nextValue });
          if (isValueOutOfRange(value, nextProps)) {
            this.props.onChange(nextValue);
          }
        }
      }, {
        key: 'onChange',
        value: function onChange(state) {
          var props = this.props;
          var isNotControlled = !('value' in props);
          if (isNotControlled) {
            this.setState(state);
          }

          var changedValue = state.value;
          props.onChange(changedValue);
        }
      }, {
        key: 'onStart',
        value: function onStart(position) {
          this.setState({ dragging: true });
          var props = this.props;
          var prevValue = this.getValue();
          props.onBeforeChange(prevValue);

          var value = this.calcValueByPos(position);
          this.startValue = value;
          this.startPosition = position;

          if (value === prevValue) return;

          this.prevMovedHandleIndex = 0;

          this.onChange({ value: value });
        }
      }, {
        key: 'onMove',
        value: function onMove(e, position) {
          pauseEvent(e);
          var oldValue = this.state.value;

          var value = this.calcValueByPos(position);
          if (value === oldValue) return;

          this.onChange({ value: value });
        }
      }, {
        key: 'onKeyboard',
        value: function onKeyboard(e) {
          var valueMutator = getKeyboardValueMutator(e);

          if (valueMutator) {
            pauseEvent(e);
            var state = this.state;
            var oldValue = state.value;
            var mutatedValue = valueMutator(oldValue, this.props);
            var value = this.trimAlignValue(mutatedValue);
            if (value === oldValue) return;

            this.onChange({ value: value });
          }
        }
      }, {
        key: 'getValue',
        value: function getValue() {
          return this.state.value;
        }
      }, {
        key: 'getLowerBound',
        value: function getLowerBound() {
          return this.props.min;
        }
      }, {
        key: 'getUpperBound',
        value: function getUpperBound() {
          return this.state.value;
        }
      }, {
        key: 'trimAlignValue',
        value: function trimAlignValue(v) {
          var nextProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var mergedProps = _extends$1({}, this.props, nextProps);
          var val = ensureValueInRange(v, mergedProps);
          return ensureValuePrecision(val, mergedProps);
        }
      }, {
        key: 'render',
        value: function render() {
          var _this2 = this;

          var _props2 = this.props,
              prefixCls = _props2.prefixCls,
              vertical = _props2.vertical,
              included = _props2.included,
              disabled = _props2.disabled,
              minimumTrackStyle = _props2.minimumTrackStyle,
              trackStyle = _props2.trackStyle,
              handleStyle = _props2.handleStyle,
              tabIndex = _props2.tabIndex,
              min = _props2.min,
              max = _props2.max,
              handleGenerator = _props2.handle;
          var _state = this.state,
              value = _state.value,
              dragging = _state.dragging;

          var offset = this.calcOffset(value);
          var handle = handleGenerator({
            className: prefixCls + '-handle',
            prefixCls: prefixCls,
            vertical: vertical,
            offset: offset,
            value: value,
            dragging: dragging,
            disabled: disabled,
            min: min,
            max: max,
            index: 0,
            tabIndex: tabIndex,
            style: handleStyle[0] || handleStyle,
            ref: function ref(h) {
              return _this2.saveHandle(0, h);
            }
          });

          var _trackStyle = trackStyle[0] || trackStyle;
          var track = React__default.createElement(Track, {
            className: prefixCls + '-track',
            vertical: vertical,
            included: included,
            offset: 0,
            length: offset,
            style: _extends$1({}, minimumTrackStyle, _trackStyle)
          });

          return { tracks: track, handles: handle };
        }
      }]);

      return Slider;
    }(React__default.Component);

    Slider.propTypes = {
      defaultValue: propTypes.number,
      value: propTypes.number,
      disabled: propTypes.bool,
      autoFocus: propTypes.bool,
      tabIndex: propTypes.number
    };


    var Slider$1 = createSlider(Slider);

    //

    var shallowequal = function shallowEqual(objA, objB, compare, compareContext) {
      var ret = compare ? compare.call(compareContext, objA, objB) : void 0;

      if (ret !== void 0) {
        return !!ret;
      }

      if (objA === objB) {
        return true;
      }

      if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
        return false;
      }

      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) {
        return false;
      }

      var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

      // Test for A's keys different from B.
      for (var idx = 0; idx < keysA.length; idx++) {
        var key = keysA[idx];

        if (!bHasOwnProperty(key)) {
          return false;
        }

        var valueA = objA[key];
        var valueB = objB[key];

        ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;

        if (ret === false || (ret === void 0 && valueA !== valueB)) {
          return false;
        }
      }

      return true;
    };

    var Range = function (_React$Component) {
      _inherits(Range, _React$Component);

      function Range(props) {
        _classCallCheck(this, Range);

        var _this = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, props));

        _this.onEnd = function () {
          _this.setState({
            handle: null
          }, _this.blur);
          _this.removeDocumentEvents();
          _this.props.onAfterChange(_this.getValue());
        };

        var count = props.count,
            min = props.min,
            max = props.max;

        var initialValue = Array.apply(undefined, _toConsumableArray(Array(count + 1))).map(function () {
          return min;
        });
        var defaultValue = 'defaultValue' in props ? props.defaultValue : initialValue;
        var value = props.value !== undefined ? props.value : defaultValue;
        var bounds = value.map(function (v, i) {
          return _this.trimAlignValue(v, i);
        });
        var recent = bounds[0] === max ? 0 : bounds.length - 1;

        _this.state = {
          handle: null,
          recent: recent,
          bounds: bounds
        };
        return _this;
      }

      _createClass(Range, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var _this2 = this;

          if (!('value' in nextProps || 'min' in nextProps || 'max' in nextProps)) return;
          if (this.props.min === nextProps.min && this.props.max === nextProps.max && shallowequal(this.props.value, nextProps.value)) {
            return;
          }

          var bounds = this.state.bounds;

          var value = nextProps.value || bounds;
          var nextBounds = value.map(function (v, i) {
            return _this2.trimAlignValue(v, i, nextProps);
          });
          if (nextBounds.length === bounds.length && nextBounds.every(function (v, i) {
            return v === bounds[i];
          })) return;

          this.setState({ bounds: nextBounds });

          if (bounds.some(function (v) {
            return isValueOutOfRange(v, nextProps);
          })) {
            var newValues = value.map(function (v) {
              return ensureValueInRange(v, nextProps);
            });
            this.props.onChange(newValues);
          }
        }
      }, {
        key: 'onChange',
        value: function onChange(state) {
          var props = this.props;
          var isNotControlled = !('value' in props);
          if (isNotControlled) {
            this.setState(state);
          } else if (state.handle !== undefined) {
            this.setState({ handle: state.handle });
          }

          var data = _extends$1({}, this.state, state);
          var changedValue = data.bounds;
          props.onChange(changedValue);
        }
      }, {
        key: 'onStart',
        value: function onStart(position) {
          var props = this.props;
          var state = this.state;
          var bounds = this.getValue();
          props.onBeforeChange(bounds);

          var value = this.calcValueByPos(position);
          this.startValue = value;
          this.startPosition = position;

          var closestBound = this.getClosestBound(value);
          this.prevMovedHandleIndex = this.getBoundNeedMoving(value, closestBound);

          this.setState({
            handle: this.prevMovedHandleIndex,
            recent: this.prevMovedHandleIndex
          });

          var prevValue = bounds[this.prevMovedHandleIndex];
          if (value === prevValue) return;

          var nextBounds = [].concat(_toConsumableArray(state.bounds));
          nextBounds[this.prevMovedHandleIndex] = value;
          this.onChange({ bounds: nextBounds });
        }
      }, {
        key: 'onMove',
        value: function onMove(e, position) {
          pauseEvent(e);
          var state = this.state;

          var value = this.calcValueByPos(position);
          var oldValue = state.bounds[state.handle];
          if (value === oldValue) return;

          this.moveTo(value);
        }
      }, {
        key: 'onKeyboard',
        value: function onKeyboard(e) {
          var valueMutator = getKeyboardValueMutator(e);

          if (valueMutator) {
            pauseEvent(e);
            var state = this.state,
                props = this.props;
            var bounds = state.bounds,
                handle = state.handle;

            var oldValue = bounds[handle];
            var mutatedValue = valueMutator(oldValue, props);
            var value = this.trimAlignValue(mutatedValue);
            if (value === oldValue) return;
            var isFromKeyboardEvent = true;
            this.moveTo(value, isFromKeyboardEvent);
          }
        }
      }, {
        key: 'getValue',
        value: function getValue() {
          return this.state.bounds;
        }
      }, {
        key: 'getClosestBound',
        value: function getClosestBound(value) {
          var bounds = this.state.bounds;

          var closestBound = 0;
          for (var i = 1; i < bounds.length - 1; ++i) {
            if (value > bounds[i]) {
              closestBound = i;
            }
          }
          if (Math.abs(bounds[closestBound + 1] - value) < Math.abs(bounds[closestBound] - value)) {
            closestBound += 1;
          }
          return closestBound;
        }
      }, {
        key: 'getBoundNeedMoving',
        value: function getBoundNeedMoving(value, closestBound) {
          var _state = this.state,
              bounds = _state.bounds,
              recent = _state.recent;

          var boundNeedMoving = closestBound;
          var isAtTheSamePoint = bounds[closestBound + 1] === bounds[closestBound];

          if (isAtTheSamePoint && bounds[recent] === bounds[closestBound]) {
            boundNeedMoving = recent;
          }

          if (isAtTheSamePoint && value !== bounds[closestBound + 1]) {
            boundNeedMoving = value < bounds[closestBound + 1] ? closestBound : closestBound + 1;
          }
          return boundNeedMoving;
        }
      }, {
        key: 'getLowerBound',
        value: function getLowerBound() {
          return this.state.bounds[0];
        }
      }, {
        key: 'getUpperBound',
        value: function getUpperBound() {
          var bounds = this.state.bounds;

          return bounds[bounds.length - 1];
        }

        /**
         * Returns an array of possible slider points, taking into account both
         * `marks` and `step`. The result is cached.
         */

      }, {
        key: 'getPoints',
        value: function getPoints() {
          var _props = this.props,
              marks = _props.marks,
              step = _props.step,
              min = _props.min,
              max = _props.max;

          var cache = this._getPointsCache;
          if (!cache || cache.marks !== marks || cache.step !== step) {
            var pointsObject = _extends$1({}, marks);
            if (step !== null) {
              for (var point = min; point <= max; point += step) {
                pointsObject[point] = point;
              }
            }
            var points = Object.keys(pointsObject).map(parseFloat);
            points.sort(function (a, b) {
              return a - b;
            });
            this._getPointsCache = { marks: marks, step: step, points: points };
          }
          return this._getPointsCache.points;
        }
      }, {
        key: 'moveTo',
        value: function moveTo(value, isFromKeyboardEvent) {
          var _this3 = this;

          var state = this.state,
              props = this.props;

          var nextBounds = [].concat(_toConsumableArray(state.bounds));
          nextBounds[state.handle] = value;
          var nextHandle = state.handle;
          if (props.pushable !== false) {
            this.pushSurroundingHandles(nextBounds, nextHandle);
          } else if (props.allowCross) {
            nextBounds.sort(function (a, b) {
              return a - b;
            });
            nextHandle = nextBounds.indexOf(value);
          }
          this.onChange({
            handle: nextHandle,
            bounds: nextBounds
          });
          if (isFromKeyboardEvent) {
            // known problem: because setState is async,
            // so trigger focus will invoke handler's onEnd and another handler's onStart too early,
            // cause onBeforeChange and onAfterChange receive wrong value.
            // here use setState callback to hack，but not elegant
            this.setState({}, function () {
              _this3.handlesRefs[nextHandle].focus();
            });
          }
        }
      }, {
        key: 'pushSurroundingHandles',
        value: function pushSurroundingHandles(bounds, handle) {
          var value = bounds[handle];
          var threshold = this.props.pushable;

          threshold = Number(threshold);

          var direction = 0;
          if (bounds[handle + 1] - value < threshold) {
            direction = +1; // push to right
          }
          if (value - bounds[handle - 1] < threshold) {
            direction = -1; // push to left
          }

          if (direction === 0) {
            return;
          }

          var nextHandle = handle + direction;
          var diffToNext = direction * (bounds[nextHandle] - value);
          if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
            // revert to original value if pushing is impossible
            bounds[handle] = bounds[nextHandle] - direction * threshold;
          }
        }
      }, {
        key: 'pushHandle',
        value: function pushHandle(bounds, handle, direction, amount) {
          var originalValue = bounds[handle];
          var currentValue = bounds[handle];
          while (direction * (currentValue - originalValue) < amount) {
            if (!this.pushHandleOnePoint(bounds, handle, direction)) {
              // can't push handle enough to create the needed `amount` gap, so we
              // revert its position to the original value
              bounds[handle] = originalValue;
              return false;
            }
            currentValue = bounds[handle];
          }
          // the handle was pushed enough to create the needed `amount` gap
          return true;
        }
      }, {
        key: 'pushHandleOnePoint',
        value: function pushHandleOnePoint(bounds, handle, direction) {
          var points = this.getPoints();
          var pointIndex = points.indexOf(bounds[handle]);
          var nextPointIndex = pointIndex + direction;
          if (nextPointIndex >= points.length || nextPointIndex < 0) {
            // reached the minimum or maximum available point, can't push anymore
            return false;
          }
          var nextHandle = handle + direction;
          var nextValue = points[nextPointIndex];
          var threshold = this.props.pushable;

          var diffToNext = direction * (bounds[nextHandle] - nextValue);
          if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
            // couldn't push next handle, so we won't push this one either
            return false;
          }
          // push the handle
          bounds[handle] = nextValue;
          return true;
        }
      }, {
        key: 'trimAlignValue',
        value: function trimAlignValue(v, handle) {
          var nextProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          var mergedProps = _extends$1({}, this.props, nextProps);
          var valInRange = ensureValueInRange(v, mergedProps);
          var valNotConflict = this.ensureValueNotConflict(handle, valInRange, mergedProps);
          return ensureValuePrecision(valNotConflict, mergedProps);
        }
      }, {
        key: 'ensureValueNotConflict',
        value: function ensureValueNotConflict(handle, val, _ref) {
          var allowCross = _ref.allowCross,
              thershold = _ref.pushable;

          var state = this.state || {};
          var bounds = state.bounds;

          handle = handle === undefined ? state.handle : handle;
          thershold = Number(thershold);
          /* eslint-disable eqeqeq */
          if (!allowCross && handle != null && bounds !== undefined) {
            if (handle > 0 && val <= bounds[handle - 1] + thershold) {
              return bounds[handle - 1] + thershold;
            }
            if (handle < bounds.length - 1 && val >= bounds[handle + 1] - thershold) {
              return bounds[handle + 1] - thershold;
            }
          }
          /* eslint-enable eqeqeq */
          return val;
        }
      }, {
        key: 'render',
        value: function render() {
          var _this4 = this;

          var _state2 = this.state,
              handle = _state2.handle,
              bounds = _state2.bounds;
          var _props2 = this.props,
              prefixCls = _props2.prefixCls,
              vertical = _props2.vertical,
              included = _props2.included,
              disabled = _props2.disabled,
              min = _props2.min,
              max = _props2.max,
              handleGenerator = _props2.handle,
              trackStyle = _props2.trackStyle,
              handleStyle = _props2.handleStyle,
              tabIndex = _props2.tabIndex;


          var offsets = bounds.map(function (v) {
            return _this4.calcOffset(v);
          });

          var handleClassName = prefixCls + '-handle';
          var handles = bounds.map(function (v, i) {
            var _classNames;

            return handleGenerator({
              className: classnames((_classNames = {}, _defineProperty(_classNames, handleClassName, true), _defineProperty(_classNames, handleClassName + '-' + (i + 1), true), _classNames)),
              prefixCls: prefixCls,
              vertical: vertical,
              offset: offsets[i],
              value: v,
              dragging: handle === i,
              index: i,
              tabIndex: tabIndex[i] || 0,
              min: min,
              max: max,
              disabled: disabled,
              style: handleStyle[i],
              ref: function ref(h) {
                return _this4.saveHandle(i, h);
              }
            });
          });

          var tracks = bounds.slice(0, -1).map(function (_, index) {
            var _classNames2;

            var i = index + 1;
            var trackClassName = classnames((_classNames2 = {}, _defineProperty(_classNames2, prefixCls + '-track', true), _defineProperty(_classNames2, prefixCls + '-track-' + i, true), _classNames2));
            return React__default.createElement(Track, {
              className: trackClassName,
              vertical: vertical,
              included: included,
              offset: offsets[i - 1],
              length: offsets[i] - offsets[i - 1],
              style: trackStyle[index],
              key: i
            });
          });

          return { tracks: tracks, handles: handles };
        }
      }]);

      return Range;
    }(React__default.Component);

    Range.displayName = 'Range';
    Range.propTypes = {
      defaultValue: propTypes.arrayOf(propTypes.number),
      value: propTypes.arrayOf(propTypes.number),
      count: propTypes.number,
      pushable: propTypes.oneOfType([propTypes.bool, propTypes.number]),
      allowCross: propTypes.bool,
      disabled: propTypes.bool,
      tabIndex: propTypes.arrayOf(propTypes.number)
    };
    Range.defaultProps = {
      count: 1,
      allowCross: true,
      pushable: false,
      tabIndex: []
    };


    var Range$1 = createSlider(Range);

    function contains(root, n) {
      var node = n;
      while (node) {
        if (node === root) {
          return true;
        }
        node = node.parentNode;
      }

      return false;
    }

    var ContainerRender = function (_React$Component) {
      _inherits(ContainerRender, _React$Component);

      function ContainerRender() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ContainerRender);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ContainerRender.__proto__ || Object.getPrototypeOf(ContainerRender)).call.apply(_ref, [this].concat(args))), _this), _this.removeContainer = function () {
          if (_this.container) {
            ReactDOM__default.unmountComponentAtNode(_this.container);
            _this.container.parentNode.removeChild(_this.container);
            _this.container = null;
          }
        }, _this.renderComponent = function (props, ready) {
          var _this$props = _this.props,
              visible = _this$props.visible,
              getComponent = _this$props.getComponent,
              forceRender = _this$props.forceRender,
              getContainer = _this$props.getContainer,
              parent = _this$props.parent;

          if (visible || parent._component || forceRender) {
            if (!_this.container) {
              _this.container = getContainer();
            }
            ReactDOM__default.unstable_renderSubtreeIntoContainer(parent, getComponent(props), _this.container, function callback() {
              if (ready) {
                ready.call(this);
              }
            });
          }
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(ContainerRender, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          if (this.props.autoMount) {
            this.renderComponent();
          }
        }
      }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
          if (this.props.autoMount) {
            this.renderComponent();
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          if (this.props.autoDestroy) {
            this.removeContainer();
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return this.props.children({
            renderComponent: this.renderComponent,
            removeContainer: this.removeContainer
          });
        }
      }]);

      return ContainerRender;
    }(React__default.Component);

    ContainerRender.propTypes = {
      autoMount: propTypes.bool,
      autoDestroy: propTypes.bool,
      visible: propTypes.bool,
      forceRender: propTypes.bool,
      parent: propTypes.any,
      getComponent: propTypes.func.isRequired,
      getContainer: propTypes.func.isRequired,
      children: propTypes.func.isRequired
    };
    ContainerRender.defaultProps = {
      autoMount: true,
      autoDestroy: true,
      forceRender: false
    };

    var Portal = function (_React$Component) {
      _inherits(Portal, _React$Component);

      function Portal() {
        _classCallCheck(this, Portal);

        return _possibleConstructorReturn(this, (Portal.__proto__ || Object.getPrototypeOf(Portal)).apply(this, arguments));
      }

      _createClass(Portal, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          this.createContainer();
        }
      }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
          var didUpdate = this.props.didUpdate;

          if (didUpdate) {
            didUpdate(prevProps);
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.removeContainer();
        }
      }, {
        key: 'createContainer',
        value: function createContainer() {
          this._container = this.props.getContainer();
          this.forceUpdate();
        }
      }, {
        key: 'removeContainer',
        value: function removeContainer() {
          if (this._container) {
            this._container.parentNode.removeChild(this._container);
          }
        }
      }, {
        key: 'render',
        value: function render() {
          if (this._container) {
            return ReactDOM__default.createPortal(this.props.children, this._container);
          }
          return null;
        }
      }]);

      return Portal;
    }(React__default.Component);

    Portal.propTypes = {
      getContainer: propTypes.func.isRequired,
      children: propTypes.node.isRequired,
      didUpdate: propTypes.func
    };

    function isPointsEq(a1, a2, isAlignPoint) {
      if (isAlignPoint) {
        return a1[0] === a2[0];
      }
      return a1[0] === a2[0] && a1[1] === a2[1];
    }

    function getAlignFromPlacement(builtinPlacements, placementStr, align) {
      var baseAlign = builtinPlacements[placementStr] || {};
      return _extends$1({}, baseAlign, align);
    }

    function getAlignPopupClassName(builtinPlacements, prefixCls, align, isAlignPoint) {
      var points = align.points;
      for (var placement in builtinPlacements) {
        if (builtinPlacements.hasOwnProperty(placement)) {
          if (isPointsEq(builtinPlacements[placement].points, points, isAlignPoint)) {
            return prefixCls + '-placement-' + placement;
          }
        }
      }
      return '';
    }

    function saveRef(name, component) {
      this[name] = component;
    }

    var vendorPrefix = void 0;

    var jsCssMap = {
      Webkit: '-webkit-',
      Moz: '-moz-',
      // IE did it wrong again ...
      ms: '-ms-',
      O: '-o-'
    };

    function getVendorPrefix() {
      if (vendorPrefix !== undefined) {
        return vendorPrefix;
      }
      vendorPrefix = '';
      var style = document.createElement('p').style;
      var testProp = 'Transform';
      for (var key in jsCssMap) {
        if (key + testProp in style) {
          vendorPrefix = key;
        }
      }
      return vendorPrefix;
    }

    function getTransitionName() {
      return getVendorPrefix() ? getVendorPrefix() + 'TransitionProperty' : 'transitionProperty';
    }

    function getTransformName() {
      return getVendorPrefix() ? getVendorPrefix() + 'Transform' : 'transform';
    }

    function setTransitionProperty(node, value) {
      var name = getTransitionName();
      if (name) {
        node.style[name] = value;
        if (name !== 'transitionProperty') {
          node.style.transitionProperty = value;
        }
      }
    }

    function setTransform(node, value) {
      var name = getTransformName();
      if (name) {
        node.style[name] = value;
        if (name !== 'transform') {
          node.style.transform = value;
        }
      }
    }

    function getTransitionProperty(node) {
      return node.style.transitionProperty || node.style[getTransitionName()];
    }

    function getTransformXY(node) {
      var style = window.getComputedStyle(node, null);
      var transform = style.getPropertyValue('transform') || style.getPropertyValue(getTransformName());
      if (transform && transform !== 'none') {
        var matrix = transform.replace(/[^0-9\-.,]/g, '').split(',');
        return { x: parseFloat(matrix[12] || matrix[4], 0), y: parseFloat(matrix[13] || matrix[5], 0) };
      }
      return {
        x: 0,
        y: 0
      };
    }

    var matrix2d = /matrix\((.*)\)/;
    var matrix3d = /matrix3d\((.*)\)/;

    function setTransformXY(node, xy) {
      var style = window.getComputedStyle(node, null);
      var transform = style.getPropertyValue('transform') || style.getPropertyValue(getTransformName());
      if (transform && transform !== 'none') {
        var arr = void 0;
        var match2d = transform.match(matrix2d);
        if (match2d) {
          match2d = match2d[1];
          arr = match2d.split(',').map(function (item) {
            return parseFloat(item, 10);
          });
          arr[4] = xy.x;
          arr[5] = xy.y;
          setTransform(node, 'matrix(' + arr.join(',') + ')');
        } else {
          var match3d = transform.match(matrix3d)[1];
          arr = match3d.split(',').map(function (item) {
            return parseFloat(item, 10);
          });
          arr[12] = xy.x;
          arr[13] = xy.y;
          setTransform(node, 'matrix3d(' + arr.join(',') + ')');
        }
      } else {
        setTransform(node, 'translateX(' + xy.x + 'px) translateY(' + xy.y + 'px) translateZ(0)');
      }
    }

    var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source;

    var getComputedStyleX = void 0;

    // https://stackoverflow.com/a/3485654/3040605
    function forceRelayout(elem) {
      var originalStyle = elem.style.display;
      elem.style.display = 'none';
      elem.offsetHeight; // eslint-disable-line
      elem.style.display = originalStyle;
    }

    function css(el, name, v) {
      var value = v;
      if ((typeof name === 'undefined' ? 'undefined' : _typeof$1(name)) === 'object') {
        for (var i in name) {
          if (name.hasOwnProperty(i)) {
            css(el, i, name[i]);
          }
        }
        return undefined;
      }
      if (typeof value !== 'undefined') {
        if (typeof value === 'number') {
          value = value + 'px';
        }
        el.style[name] = value;
        return undefined;
      }
      return getComputedStyleX(el, name);
    }

    function getClientPosition(elem) {
      var box = void 0;
      var x = void 0;
      var y = void 0;
      var doc = elem.ownerDocument;
      var body = doc.body;
      var docElem = doc && doc.documentElement;
      // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
      box = elem.getBoundingClientRect();

      // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
      // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
      // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

      x = box.left;
      y = box.top;

      // In IE, most of the time, 2 extra pixels are added to the top and left
      // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
      // IE6 standards mode, this border can be overridden by setting the
      // document element's border to zero -- thus, we cannot rely on the
      // offset always being 2 pixels.

      // In quirks mode, the offset can be determined by querying the body's
      // clientLeft/clientTop, but in standards mode, it is found by querying
      // the document element's clientLeft/clientTop.  Since we already called
      // getClientBoundingRect we have already forced a reflow, so it is not
      // too expensive just to query them all.

      // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
      // 窗口边框标准是设 documentElement ,quirks 时设置 body
      // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
      // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
      // 标准 ie 下 docElem.clientTop 就是 border-top
      // ie7 html 即窗口边框改变不了。永远为 2
      // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0

      x -= docElem.clientLeft || body.clientLeft || 0;
      y -= docElem.clientTop || body.clientTop || 0;

      return {
        left: x,
        top: y
      };
    }

    function getScroll(w, top) {
      var ret = w['page' + (top ? 'Y' : 'X') + 'Offset'];
      var method = 'scroll' + (top ? 'Top' : 'Left');
      if (typeof ret !== 'number') {
        var d = w.document;
        // ie6,7,8 standard mode
        ret = d.documentElement[method];
        if (typeof ret !== 'number') {
          // quirks mode
          ret = d.body[method];
        }
      }
      return ret;
    }

    function getScrollLeft(w) {
      return getScroll(w);
    }

    function getScrollTop(w) {
      return getScroll(w, true);
    }

    function getOffset(el) {
      var pos = getClientPosition(el);
      var doc = el.ownerDocument;
      var w = doc.defaultView || doc.parentWindow;
      pos.left += getScrollLeft(w);
      pos.top += getScrollTop(w);
      return pos;
    }

    /**
     * A crude way of determining if an object is a window
     * @member util
     */
    function isWindow(obj) {
      // must use == for ie8
      /* eslint eqeqeq:0 */
      return obj !== null && obj !== undefined && obj == obj.window;
    }

    function getDocument(node) {
      if (isWindow(node)) {
        return node.document;
      }
      if (node.nodeType === 9) {
        return node;
      }
      return node.ownerDocument;
    }

    function _getComputedStyle(elem, name, cs) {
      var computedStyle = cs;
      var val = '';
      var d = getDocument(elem);
      computedStyle = computedStyle || d.defaultView.getComputedStyle(elem, null);

      // https://github.com/kissyteam/kissy/issues/61
      if (computedStyle) {
        val = computedStyle.getPropertyValue(name) || computedStyle[name];
      }

      return val;
    }

    var _RE_NUM_NO_PX = new RegExp('^(' + RE_NUM + ')(?!px)[a-z%]+$', 'i');
    var RE_POS = /^(top|right|bottom|left)$/;
    var CURRENT_STYLE = 'currentStyle';
    var RUNTIME_STYLE = 'runtimeStyle';
    var LEFT = 'left';
    var PX = 'px';

    function _getComputedStyleIE(elem, name) {
      // currentStyle maybe null
      // http://msdn.microsoft.com/en-us/library/ms535231.aspx
      var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

      // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
      // 一开始就处理了! CUSTOM_STYLE.height,CUSTOM_STYLE.width ,cssHook 解决@2011-08-19
      // 在 ie 下不对，需要直接用 offset 方式
      // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

      // From the awesome hack by Dean Edwards
      // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
      // If we're not dealing with a regular pixel number
      // but a number that has a weird ending, we need to convert it to pixels
      // exclude left right for relativity
      if (_RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)) {
        // Remember the original values
        var style = elem.style;
        var left = style[LEFT];
        var rsLeft = elem[RUNTIME_STYLE][LEFT];

        // prevent flashing of content
        elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];

        // Put in the new values to get a computed value out
        style[LEFT] = name === 'fontSize' ? '1em' : ret || 0;
        ret = style.pixelLeft + PX;

        // Revert the changed values
        style[LEFT] = left;

        elem[RUNTIME_STYLE][LEFT] = rsLeft;
      }
      return ret === '' ? 'auto' : ret;
    }

    if (typeof window !== 'undefined') {
      getComputedStyleX = window.getComputedStyle ? _getComputedStyle : _getComputedStyleIE;
    }

    function getOffsetDirection(dir, option) {
      if (dir === 'left') {
        return option.useCssRight ? 'right' : dir;
      }
      return option.useCssBottom ? 'bottom' : dir;
    }

    function oppositeOffsetDirection(dir) {
      if (dir === 'left') {
        return 'right';
      } else if (dir === 'right') {
        return 'left';
      } else if (dir === 'top') {
        return 'bottom';
      } else if (dir === 'bottom') {
        return 'top';
      }
    }

    // 设置 elem 相对 elem.ownerDocument 的坐标
    function setLeftTop(elem, offset, option) {
      // set position first, in-case top/left are set even on static elem
      if (css(elem, 'position') === 'static') {
        elem.style.position = 'relative';
      }
      var presetH = -999;
      var presetV = -999;
      var horizontalProperty = getOffsetDirection('left', option);
      var verticalProperty = getOffsetDirection('top', option);
      var oppositeHorizontalProperty = oppositeOffsetDirection(horizontalProperty);
      var oppositeVerticalProperty = oppositeOffsetDirection(verticalProperty);

      if (horizontalProperty !== 'left') {
        presetH = 999;
      }

      if (verticalProperty !== 'top') {
        presetV = 999;
      }
      var originalTransition = '';
      var originalOffset = getOffset(elem);
      if ('left' in offset || 'top' in offset) {
        originalTransition = getTransitionProperty(elem) || '';
        setTransitionProperty(elem, 'none');
      }
      if ('left' in offset) {
        elem.style[oppositeHorizontalProperty] = '';
        elem.style[horizontalProperty] = presetH + 'px';
      }
      if ('top' in offset) {
        elem.style[oppositeVerticalProperty] = '';
        elem.style[verticalProperty] = presetV + 'px';
      }
      // force relayout
      forceRelayout(elem);
      var old = getOffset(elem);
      var originalStyle = {};
      for (var key in offset) {
        if (offset.hasOwnProperty(key)) {
          var dir = getOffsetDirection(key, option);
          var preset = key === 'left' ? presetH : presetV;
          var off = originalOffset[key] - old[key];
          if (dir === key) {
            originalStyle[dir] = preset + off;
          } else {
            originalStyle[dir] = preset - off;
          }
        }
      }
      css(elem, originalStyle);
      // force relayout
      forceRelayout(elem);
      if ('left' in offset || 'top' in offset) {
        setTransitionProperty(elem, originalTransition);
      }
      var ret = {};
      for (var _key in offset) {
        if (offset.hasOwnProperty(_key)) {
          var _dir = getOffsetDirection(_key, option);
          var _off = offset[_key] - originalOffset[_key];
          if (_key === _dir) {
            ret[_dir] = originalStyle[_dir] + _off;
          } else {
            ret[_dir] = originalStyle[_dir] - _off;
          }
        }
      }
      css(elem, ret);
    }

    function setTransform$1(elem, offset) {
      var originalOffset = getOffset(elem);
      var originalXY = getTransformXY(elem);
      var resultXY = { x: originalXY.x, y: originalXY.y };
      if ('left' in offset) {
        resultXY.x = originalXY.x + offset.left - originalOffset.left;
      }
      if ('top' in offset) {
        resultXY.y = originalXY.y + offset.top - originalOffset.top;
      }
      setTransformXY(elem, resultXY);
    }

    function setOffset(elem, offset, option) {
      if (option.ignoreShake) {
        var oriOffset = getOffset(elem);

        var oLeft = oriOffset.left.toFixed(0);
        var oTop = oriOffset.top.toFixed(0);
        var tLeft = offset.left.toFixed(0);
        var tTop = offset.top.toFixed(0);

        if (oLeft === tLeft && oTop === tTop) {
          return;
        }
      }

      if (option.useCssRight || option.useCssBottom) {
        setLeftTop(elem, offset, option);
      } else if (option.useCssTransform && getTransformName() in document.body.style) {
        setTransform$1(elem, offset, option);
      } else {
        setLeftTop(elem, offset, option);
      }
    }

    function each(arr, fn) {
      for (var i = 0; i < arr.length; i++) {
        fn(arr[i]);
      }
    }

    function isBorderBoxFn(elem) {
      return getComputedStyleX(elem, 'boxSizing') === 'border-box';
    }

    var BOX_MODELS = ['margin', 'border', 'padding'];
    var CONTENT_INDEX = -1;
    var PADDING_INDEX = 2;
    var BORDER_INDEX = 1;
    var MARGIN_INDEX = 0;

    function swap(elem, options, callback) {
      var old = {};
      var style = elem.style;
      var name = void 0;

      // Remember the old values, and insert the new ones
      for (name in options) {
        if (options.hasOwnProperty(name)) {
          old[name] = style[name];
          style[name] = options[name];
        }
      }

      callback.call(elem);

      // Revert the old values
      for (name in options) {
        if (options.hasOwnProperty(name)) {
          style[name] = old[name];
        }
      }
    }

    function getPBMWidth(elem, props, which) {
      var value = 0;
      var prop = void 0;
      var j = void 0;
      var i = void 0;
      for (j = 0; j < props.length; j++) {
        prop = props[j];
        if (prop) {
          for (i = 0; i < which.length; i++) {
            var cssProp = void 0;
            if (prop === 'border') {
              cssProp = '' + prop + which[i] + 'Width';
            } else {
              cssProp = prop + which[i];
            }
            value += parseFloat(getComputedStyleX(elem, cssProp)) || 0;
          }
        }
      }
      return value;
    }

    var domUtils = {};

    each(['Width', 'Height'], function (name) {
      domUtils['doc' + name] = function (refWin) {
        var d = refWin.document;
        return Math.max(
        // firefox chrome documentElement.scrollHeight< body.scrollHeight
        // ie standard mode : documentElement.scrollHeight> body.scrollHeight
        d.documentElement['scroll' + name],
        // quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
        d.body['scroll' + name], domUtils['viewport' + name](d));
      };

      domUtils['viewport' + name] = function (win) {
        // pc browser includes scrollbar in window.innerWidth
        var prop = 'client' + name;
        var doc = win.document;
        var body = doc.body;
        var documentElement = doc.documentElement;
        var documentElementProp = documentElement[prop];
        // 标准模式取 documentElement
        // backcompat 取 body
        return doc.compatMode === 'CSS1Compat' && documentElementProp || body && body[prop] || documentElementProp;
      };
    });

    /*
     得到元素的大小信息
     @param elem
     @param name
     @param {String} [extra]  'padding' : (css width) + padding
     'border' : (css width) + padding + border
     'margin' : (css width) + padding + border + margin
     */
    function getWH(elem, name, ex) {
      var extra = ex;
      if (isWindow(elem)) {
        return name === 'width' ? domUtils.viewportWidth(elem) : domUtils.viewportHeight(elem);
      } else if (elem.nodeType === 9) {
        return name === 'width' ? domUtils.docWidth(elem) : domUtils.docHeight(elem);
      }
      var which = name === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
      var borderBoxValue = name === 'width' ? elem.getBoundingClientRect().width : elem.getBoundingClientRect().height;
      var computedStyle = getComputedStyleX(elem);
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      var cssBoxValue = 0;
      if (borderBoxValue === null || borderBoxValue === undefined || borderBoxValue <= 0) {
        borderBoxValue = undefined;
        // Fall back to computed then un computed css if necessary
        cssBoxValue = getComputedStyleX(elem, name);
        if (cssBoxValue === null || cssBoxValue === undefined || Number(cssBoxValue) < 0) {
          cssBoxValue = elem.style[name] || 0;
        }
        // Normalize '', auto, and prepare for extra
        cssBoxValue = parseFloat(cssBoxValue) || 0;
      }
      if (extra === undefined) {
        extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
      }
      var borderBoxValueOrIsBorderBox = borderBoxValue !== undefined || isBorderBox;
      var val = borderBoxValue || cssBoxValue;
      if (extra === CONTENT_INDEX) {
        if (borderBoxValueOrIsBorderBox) {
          return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
        }
        return cssBoxValue;
      } else if (borderBoxValueOrIsBorderBox) {
        if (extra === BORDER_INDEX) {
          return val;
        }
        return val + (extra === PADDING_INDEX ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle));
      }
      return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
    }

    var cssShow = {
      position: 'absolute',
      visibility: 'hidden',
      display: 'block'
    };

    // fix #119 : https://github.com/kissyteam/kissy/issues/119
    function getWHIgnoreDisplay() {
      for (var _len = arguments.length, args = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var val = void 0;
      var elem = args[0];
      // in case elem is window
      // elem.offsetWidth === undefined
      if (elem.offsetWidth !== 0) {
        val = getWH.apply(undefined, args);
      } else {
        swap(elem, cssShow, function () {
          val = getWH.apply(undefined, args);
        });
      }
      return val;
    }

    each(['width', 'height'], function (name) {
      var first = name.charAt(0).toUpperCase() + name.slice(1);
      domUtils['outer' + first] = function (el, includeMargin) {
        return el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX);
      };
      var which = name === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];

      domUtils[name] = function (elem, v) {
        var val = v;
        if (val !== undefined) {
          if (elem) {
            var computedStyle = getComputedStyleX(elem);
            var isBorderBox = isBorderBoxFn(elem);
            if (isBorderBox) {
              val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
            }
            return css(elem, name, val);
          }
          return undefined;
        }
        return elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX);
      };
    });

    function mix(to, from) {
      for (var i in from) {
        if (from.hasOwnProperty(i)) {
          to[i] = from[i];
        }
      }
      return to;
    }

    var utils = {
      getWindow: function getWindow(node) {
        if (node && node.document && node.setTimeout) {
          return node;
        }
        var doc = node.ownerDocument || node;
        return doc.defaultView || doc.parentWindow;
      },

      getDocument: getDocument,
      offset: function offset(el, value, option) {
        if (typeof value !== 'undefined') {
          setOffset(el, value, option || {});
        } else {
          return getOffset(el);
        }
      },

      isWindow: isWindow,
      each: each,
      css: css,
      clone: function clone(obj) {
        var i = void 0;
        var ret = {};
        for (i in obj) {
          if (obj.hasOwnProperty(i)) {
            ret[i] = obj[i];
          }
        }
        var overflow = obj.overflow;
        if (overflow) {
          for (i in obj) {
            if (obj.hasOwnProperty(i)) {
              ret.overflow[i] = obj.overflow[i];
            }
          }
        }
        return ret;
      },

      mix: mix,
      getWindowScrollLeft: function getWindowScrollLeft(w) {
        return getScrollLeft(w);
      },
      getWindowScrollTop: function getWindowScrollTop(w) {
        return getScrollTop(w);
      },
      merge: function merge() {
        var ret = {};

        for (var _len2 = arguments.length, args = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
          args[_key3] = arguments[_key3];
        }

        for (var i = 0; i < args.length; i++) {
          utils.mix(ret, args[i]);
        }
        return ret;
      },

      viewportWidth: 0,
      viewportHeight: 0
    };

    mix(utils, domUtils);

    /**
     * 得到会导致元素显示不全的祖先元素
     */

    function getOffsetParent(element) {
      if (utils.isWindow(element) || element.nodeType === 9) {
        return null;
      }
      // ie 这个也不是完全可行
      /*
       <div style="width: 50px;height: 100px;overflow: hidden">
       <div style="width: 50px;height: 100px;position: relative;" id="d6">
       元素 6 高 100px 宽 50px<br/>
       </div>
       </div>
       */
      // element.offsetParent does the right thing in ie7 and below. Return parent with layout!
      //  In other browsers it only includes elements with position absolute, relative or
      // fixed, not elements with overflow set to auto or scroll.
      //        if (UA.ie && ieMode < 8) {
      //            return element.offsetParent;
      //        }
      // 统一的 offsetParent 方法
      var doc = utils.getDocument(element);
      var body = doc.body;
      var parent = void 0;
      var positionStyle = utils.css(element, 'position');
      var skipStatic = positionStyle === 'fixed' || positionStyle === 'absolute';

      if (!skipStatic) {
        return element.nodeName.toLowerCase() === 'html' ? null : element.parentNode;
      }

      for (parent = element.parentNode; parent && parent !== body; parent = parent.parentNode) {
        positionStyle = utils.css(parent, 'position');
        if (positionStyle !== 'static') {
          return parent;
        }
      }
      return null;
    }

    function isAncestorFixed(element) {
      if (utils.isWindow(element) || element.nodeType === 9) {
        return false;
      }

      var doc = utils.getDocument(element);
      var body = doc.body;
      var parent = null;
      for (parent = element.parentNode; parent && parent !== body; parent = parent.parentNode) {
        var positionStyle = utils.css(parent, 'position');
        if (positionStyle === 'fixed') {
          return true;
        }
      }
      return false;
    }

    /**
     * 获得元素的显示部分的区域
     */
    function getVisibleRectForElement(element) {
      var visibleRect = {
        left: 0,
        right: Infinity,
        top: 0,
        bottom: Infinity
      };
      var el = getOffsetParent(element);
      var doc = utils.getDocument(element);
      var win = doc.defaultView || doc.parentWindow;
      var body = doc.body;
      var documentElement = doc.documentElement;

      // Determine the size of the visible rect by climbing the dom accounting for
      // all scrollable containers.
      while (el) {
        // clientWidth is zero for inline block elements in ie.
        if ((navigator.userAgent.indexOf('MSIE') === -1 || el.clientWidth !== 0) &&
        // body may have overflow set on it, yet we still get the entire
        // viewport. In some browsers, el.offsetParent may be
        // document.documentElement, so check for that too.
        el !== body && el !== documentElement && utils.css(el, 'overflow') !== 'visible') {
          var pos = utils.offset(el);
          // add border
          pos.left += el.clientLeft;
          pos.top += el.clientTop;
          visibleRect.top = Math.max(visibleRect.top, pos.top);
          visibleRect.right = Math.min(visibleRect.right,
          // consider area without scrollBar
          pos.left + el.clientWidth);
          visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
          visibleRect.left = Math.max(visibleRect.left, pos.left);
        } else if (el === body || el === documentElement) {
          break;
        }
        el = getOffsetParent(el);
      }

      // Set element position to fixed
      // make sure absolute element itself don't affect it's visible area
      // https://github.com/ant-design/ant-design/issues/7601
      var originalPosition = null;
      if (!utils.isWindow(element) && element.nodeType !== 9) {
        originalPosition = element.style.position;
        var position = utils.css(element, 'position');
        if (position === 'absolute') {
          element.style.position = 'fixed';
        }
      }

      var scrollX = utils.getWindowScrollLeft(win);
      var scrollY = utils.getWindowScrollTop(win);
      var viewportWidth = utils.viewportWidth(win);
      var viewportHeight = utils.viewportHeight(win);
      var documentWidth = documentElement.scrollWidth;
      var documentHeight = documentElement.scrollHeight;

      // Reset element position after calculate the visible area
      if (element.style) {
        element.style.position = originalPosition;
      }

      if (isAncestorFixed(element)) {
        // Clip by viewport's size.
        visibleRect.left = Math.max(visibleRect.left, scrollX);
        visibleRect.top = Math.max(visibleRect.top, scrollY);
        visibleRect.right = Math.min(visibleRect.right, scrollX + viewportWidth);
        visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + viewportHeight);
      } else {
        // Clip by document's size.
        var maxVisibleWidth = Math.max(documentWidth, scrollX + viewportWidth);
        visibleRect.right = Math.min(visibleRect.right, maxVisibleWidth);

        var maxVisibleHeight = Math.max(documentHeight, scrollY + viewportHeight);
        visibleRect.bottom = Math.min(visibleRect.bottom, maxVisibleHeight);
      }

      return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null;
    }

    function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
      var pos = utils.clone(elFuturePos);
      var size = {
        width: elRegion.width,
        height: elRegion.height
      };

      if (overflow.adjustX && pos.left < visibleRect.left) {
        pos.left = visibleRect.left;
      }

      // Left edge inside and right edge outside viewport, try to resize it.
      if (overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right) {
        size.width -= pos.left + size.width - visibleRect.right;
      }

      // Right edge outside viewport, try to move it.
      if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
        // 保证左边界和可视区域左边界对齐
        pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
      }

      // Top edge outside viewport, try to move it.
      if (overflow.adjustY && pos.top < visibleRect.top) {
        pos.top = visibleRect.top;
      }

      // Top edge inside and bottom edge outside viewport, try to resize it.
      if (overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom) {
        size.height -= pos.top + size.height - visibleRect.bottom;
      }

      // Bottom edge outside viewport, try to move it.
      if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
        // 保证上边界和可视区域上边界对齐
        pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
      }

      return utils.mix(pos, size);
    }

    function getRegion(node) {
      var offset = void 0;
      var w = void 0;
      var h = void 0;
      if (!utils.isWindow(node) && node.nodeType !== 9) {
        offset = utils.offset(node);
        w = utils.outerWidth(node);
        h = utils.outerHeight(node);
      } else {
        var win = utils.getWindow(node);
        offset = {
          left: utils.getWindowScrollLeft(win),
          top: utils.getWindowScrollTop(win)
        };
        w = utils.viewportWidth(win);
        h = utils.viewportHeight(win);
      }
      offset.width = w;
      offset.height = h;
      return offset;
    }

    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     */

    function getAlignOffset(region, align) {
      var V = align.charAt(0);
      var H = align.charAt(1);
      var w = region.width;
      var h = region.height;

      var x = region.left;
      var y = region.top;

      if (V === 'c') {
        y += h / 2;
      } else if (V === 'b') {
        y += h;
      }

      if (H === 'c') {
        x += w / 2;
      } else if (H === 'r') {
        x += w;
      }

      return {
        left: x,
        top: y
      };
    }

    function getElFuturePos(elRegion, refNodeRegion, points, offset, targetOffset) {
      var p1 = getAlignOffset(refNodeRegion, points[1]);
      var p2 = getAlignOffset(elRegion, points[0]);
      var diff = [p2.left - p1.left, p2.top - p1.top];

      return {
        left: elRegion.left - diff[0] + offset[0] - targetOffset[0],
        top: elRegion.top - diff[1] + offset[1] - targetOffset[1]
      };
    }

    /**
     * align dom node flexibly
     * @author yiminghe@gmail.com
     */

    // http://yiminghe.iteye.com/blog/1124720

    function isFailX(elFuturePos, elRegion, visibleRect) {
      return elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right;
    }

    function isFailY(elFuturePos, elRegion, visibleRect) {
      return elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom;
    }

    function isCompleteFailX(elFuturePos, elRegion, visibleRect) {
      return elFuturePos.left > visibleRect.right || elFuturePos.left + elRegion.width < visibleRect.left;
    }

    function isCompleteFailY(elFuturePos, elRegion, visibleRect) {
      return elFuturePos.top > visibleRect.bottom || elFuturePos.top + elRegion.height < visibleRect.top;
    }

    function flip(points, reg, map) {
      var ret = [];
      utils.each(points, function (p) {
        ret.push(p.replace(reg, function (m) {
          return map[m];
        }));
      });
      return ret;
    }

    function flipOffset(offset, index) {
      offset[index] = -offset[index];
      return offset;
    }

    function convertOffset(str, offsetLen) {
      var n = void 0;
      if (/%$/.test(str)) {
        n = parseInt(str.substring(0, str.length - 1), 10) / 100 * offsetLen;
      } else {
        n = parseInt(str, 10);
      }
      return n || 0;
    }

    function normalizeOffset(offset, el) {
      offset[0] = convertOffset(offset[0], el.width);
      offset[1] = convertOffset(offset[1], el.height);
    }

    /**
     * @param el
     * @param tgtRegion 参照节点所占的区域: { left, top, width, height }
     * @param align
     */
    function doAlign(el, tgtRegion, align, isTgtRegionVisible) {
      var points = align.points;
      var offset = align.offset || [0, 0];
      var targetOffset = align.targetOffset || [0, 0];
      var overflow = align.overflow;
      var source = align.source || el;
      offset = [].concat(offset);
      targetOffset = [].concat(targetOffset);
      overflow = overflow || {};
      var newOverflowCfg = {};
      var fail = 0;
      // 当前节点可以被放置的显示区域
      var visibleRect = getVisibleRectForElement(source);
      // 当前节点所占的区域, left/top/width/height
      var elRegion = getRegion(source);
      // 将 offset 转换成数值，支持百分比
      normalizeOffset(offset, elRegion);
      normalizeOffset(targetOffset, tgtRegion);
      // 当前节点将要被放置的位置
      var elFuturePos = getElFuturePos(elRegion, tgtRegion, points, offset, targetOffset);
      // 当前节点将要所处的区域
      var newElRegion = utils.merge(elRegion, elFuturePos);

      // 如果可视区域不能完全放置当前节点时允许调整
      if (visibleRect && (overflow.adjustX || overflow.adjustY) && isTgtRegionVisible) {
        if (overflow.adjustX) {
          // 如果横向不能放下
          if (isFailX(elFuturePos, elRegion, visibleRect)) {
            // 对齐位置反下
            var newPoints = flip(points, /[lr]/ig, {
              l: 'r',
              r: 'l'
            });
            // 偏移量也反下
            var newOffset = flipOffset(offset, 0);
            var newTargetOffset = flipOffset(targetOffset, 0);
            var newElFuturePos = getElFuturePos(elRegion, tgtRegion, newPoints, newOffset, newTargetOffset);

            if (!isCompleteFailX(newElFuturePos, elRegion, visibleRect)) {
              fail = 1;
              points = newPoints;
              offset = newOffset;
              targetOffset = newTargetOffset;
            }
          }
        }

        if (overflow.adjustY) {
          // 如果纵向不能放下
          if (isFailY(elFuturePos, elRegion, visibleRect)) {
            // 对齐位置反下
            var _newPoints = flip(points, /[tb]/ig, {
              t: 'b',
              b: 't'
            });
            // 偏移量也反下
            var _newOffset = flipOffset(offset, 1);
            var _newTargetOffset = flipOffset(targetOffset, 1);
            var _newElFuturePos = getElFuturePos(elRegion, tgtRegion, _newPoints, _newOffset, _newTargetOffset);

            if (!isCompleteFailY(_newElFuturePos, elRegion, visibleRect)) {
              fail = 1;
              points = _newPoints;
              offset = _newOffset;
              targetOffset = _newTargetOffset;
            }
          }
        }

        // 如果失败，重新计算当前节点将要被放置的位置
        if (fail) {
          elFuturePos = getElFuturePos(elRegion, tgtRegion, points, offset, targetOffset);
          utils.mix(newElRegion, elFuturePos);
        }
        var isStillFailX = isFailX(elFuturePos, elRegion, visibleRect);
        var isStillFailY = isFailY(elFuturePos, elRegion, visibleRect);
        // 检查反下后的位置是否可以放下了，如果仍然放不下：
        // 1. 复原修改过的定位参数
        if (isStillFailX || isStillFailY) {
          points = align.points;
          offset = align.offset || [0, 0];
          targetOffset = align.targetOffset || [0, 0];
        }
        // 2. 只有指定了可以调整当前方向才调整
        newOverflowCfg.adjustX = overflow.adjustX && isStillFailX;
        newOverflowCfg.adjustY = overflow.adjustY && isStillFailY;

        // 确实要调整，甚至可能会调整高度宽度
        if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
          newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
        }
      }

      // need judge to in case set fixed with in css on height auto element
      if (newElRegion.width !== elRegion.width) {
        utils.css(source, 'width', utils.width(source) + newElRegion.width - elRegion.width);
      }

      if (newElRegion.height !== elRegion.height) {
        utils.css(source, 'height', utils.height(source) + newElRegion.height - elRegion.height);
      }

      // https://github.com/kissyteam/kissy/issues/190
      // 相对于屏幕位置没变，而 left/top 变了
      // 例如 <div 'relative'><el absolute></div>
      utils.offset(source, {
        left: newElRegion.left,
        top: newElRegion.top
      }, {
        useCssRight: align.useCssRight,
        useCssBottom: align.useCssBottom,
        useCssTransform: align.useCssTransform,
        ignoreShake: align.ignoreShake
      });

      return {
        points: points,
        offset: offset,
        targetOffset: targetOffset,
        overflow: newOverflowCfg
      };
    }
    /**
     *  2012-04-26 yiminghe@gmail.com
     *   - 优化智能对齐算法
     *   - 慎用 resizeXX
     *
     *  2011-07-13 yiminghe@gmail.com note:
     *   - 增加智能对齐，以及大小调整选项
     **/

    function isOutOfVisibleRect(target) {
      var visibleRect = getVisibleRectForElement(target);
      var targetRegion = getRegion(target);

      return !visibleRect || targetRegion.left + targetRegion.width <= visibleRect.left || targetRegion.top + targetRegion.height <= visibleRect.top || targetRegion.left >= visibleRect.right || targetRegion.top >= visibleRect.bottom;
    }

    function alignElement(el, refNode, align) {
      var target = align.target || refNode;
      var refNodeRegion = getRegion(target);

      var isTargetNotOutOfVisible = !isOutOfVisibleRect(target);

      return doAlign(el, refNodeRegion, align, isTargetNotOutOfVisible);
    }

    alignElement.__getOffsetParent = getOffsetParent;

    alignElement.__getVisibleRectForElement = getVisibleRectForElement;

    var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    /**
     * `tgtPoint`: { pageX, pageY } or { clientX, clientY }.
     * If client position provided, will internal convert to page position.
     */

    function alignPoint(el, tgtPoint, align) {
      var pageX = void 0;
      var pageY = void 0;

      var doc = utils.getDocument(el);
      var win = doc.defaultView || doc.parentWindow;

      var scrollX = utils.getWindowScrollLeft(win);
      var scrollY = utils.getWindowScrollTop(win);
      var viewportWidth = utils.viewportWidth(win);
      var viewportHeight = utils.viewportHeight(win);

      if ('pageX' in tgtPoint) {
        pageX = tgtPoint.pageX;
      } else {
        pageX = scrollX + tgtPoint.clientX;
      }

      if ('pageY' in tgtPoint) {
        pageY = tgtPoint.pageY;
      } else {
        pageY = scrollY + tgtPoint.clientY;
      }

      var tgtRegion = {
        left: pageX,
        top: pageY,
        width: 0,
        height: 0
      };

      var pointInView = pageX >= 0 && pageX <= scrollX + viewportWidth && pageY >= 0 && pageY <= scrollY + viewportHeight;

      // Provide default target point
      var points = [align.points[0], 'cc'];

      return doAlign(el, tgtRegion, _extends$2({}, align, { points: points }), pointInView);
    }

    function buffer(fn, ms) {
      var timer = void 0;

      function clear() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }

      function bufferFn() {
        clear();
        timer = setTimeout(fn, ms);
      }

      bufferFn.clear = clear;

      return bufferFn;
    }

    function isSamePoint(prev, next) {
      if (prev === next) return true;
      if (!prev || !next) return false;

      if ('pageX' in next && 'pageY' in next) {
        return prev.pageX === next.pageX && prev.pageY === next.pageY;
      }

      if ('clientX' in next && 'clientY' in next) {
        return prev.clientX === next.clientX && prev.clientY === next.clientY;
      }

      return false;
    }

    function isWindow$1(obj) {
      return obj && typeof obj === 'object' && obj.window === obj;
    }

    function getElement(func) {
      if (typeof func !== 'function' || !func) return null;
      return func();
    }

    function getPoint(point) {
      if (typeof point !== 'object' || !point) return null;
      return point;
    }

    var Align = function (_Component) {
      _inherits(Align, _Component);

      function Align() {
        var _temp, _this, _ret;

        _classCallCheck(this, Align);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.forceAlign = function () {
          var _this$props = _this.props,
              disabled = _this$props.disabled,
              target = _this$props.target,
              align = _this$props.align,
              onAlign = _this$props.onAlign;

          if (!disabled && target) {
            var source = ReactDOM__default.findDOMNode(_this);

            var result = void 0;
            var element = getElement(target);
            var point = getPoint(target);

            if (element) {
              result = alignElement(source, element, align);
            } else if (point) {
              result = alignPoint(source, point, align);
            }

            if (onAlign) {
              onAlign(source, result);
            }
          }
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      Align.prototype.componentDidMount = function componentDidMount() {
        var props = this.props;
        // if parent ref not attached .... use document.getElementById
        this.forceAlign();
        if (!props.disabled && props.monitorWindowResize) {
          this.startMonitorWindowResize();
        }
      };

      Align.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
        var reAlign = false;
        var props = this.props;

        if (!props.disabled) {
          var source = ReactDOM__default.findDOMNode(this);
          var sourceRect = source ? source.getBoundingClientRect() : null;

          if (prevProps.disabled) {
            reAlign = true;
          } else {
            var lastElement = getElement(prevProps.target);
            var currentElement = getElement(props.target);
            var lastPoint = getPoint(prevProps.target);
            var currentPoint = getPoint(props.target);

            if (isWindow$1(lastElement) && isWindow$1(currentElement)) {
              // Skip if is window
              reAlign = false;
            } else if (lastElement !== currentElement || // Element change
            lastElement && !currentElement && currentPoint || // Change from element to point
            lastPoint && currentPoint && currentElement || // Change from point to element
            currentPoint && !isSamePoint(lastPoint, currentPoint)) {
              reAlign = true;
            }

            // If source element size changed
            var preRect = this.sourceRect || {};
            if (!reAlign && source && (preRect.width !== sourceRect.width || preRect.height !== sourceRect.height)) {
              reAlign = true;
            }
          }

          this.sourceRect = sourceRect;
        }

        if (reAlign) {
          this.forceAlign();
        }

        if (props.monitorWindowResize && !props.disabled) {
          this.startMonitorWindowResize();
        } else {
          this.stopMonitorWindowResize();
        }
      };

      Align.prototype.componentWillUnmount = function componentWillUnmount() {
        this.stopMonitorWindowResize();
      };

      Align.prototype.startMonitorWindowResize = function startMonitorWindowResize() {
        if (!this.resizeHandler) {
          this.bufferMonitor = buffer(this.forceAlign, this.props.monitorBufferTime);
          this.resizeHandler = addEventListenerWrap(window, 'resize', this.bufferMonitor);
        }
      };

      Align.prototype.stopMonitorWindowResize = function stopMonitorWindowResize() {
        if (this.resizeHandler) {
          this.bufferMonitor.clear();
          this.resizeHandler.remove();
          this.resizeHandler = null;
        }
      };

      Align.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props,
            childrenProps = _props.childrenProps,
            children = _props.children;

        var child = React__default.Children.only(children);
        if (childrenProps) {
          var newProps = {};
          var propList = Object.keys(childrenProps);
          propList.forEach(function (prop) {
            newProps[prop] = _this2.props[childrenProps[prop]];
          });

          return React__default.cloneElement(child, newProps);
        }
        return child;
      };

      return Align;
    }(React.Component);

    Align.propTypes = {
      childrenProps: propTypes.object,
      align: propTypes.object.isRequired,
      target: propTypes.oneOfType([propTypes.func, propTypes.shape({
        clientX: propTypes.number,
        clientY: propTypes.number,
        pageX: propTypes.number,
        pageY: propTypes.number
      })]),
      onAlign: propTypes.func,
      monitorBufferTime: propTypes.number,
      monitorWindowResize: propTypes.bool,
      disabled: propTypes.bool,
      children: propTypes.any
    };
    Align.defaultProps = {
      target: function target() {
        return window;
      },
      monitorBufferTime: 50,
      monitorWindowResize: false,
      disabled: false
    };

    // export this package's api

    function toArrayChildren(children) {
      var ret = [];
      React__default.Children.forEach(children, function (child) {
        ret.push(child);
      });
      return ret;
    }

    function findChildInChildrenByKey(children, key) {
      var ret = null;
      if (children) {
        children.forEach(function (child) {
          if (ret) {
            return;
          }
          if (child && child.key === key) {
            ret = child;
          }
        });
      }
      return ret;
    }

    function findShownChildInChildrenByKey(children, key, showProp) {
      var ret = null;
      if (children) {
        children.forEach(function (child) {
          if (child && child.key === key && child.props[showProp]) {
            if (ret) {
              throw new Error('two child with same key for <rc-animate> children');
            }
            ret = child;
          }
        });
      }
      return ret;
    }

    function isSameChildren(c1, c2, showProp) {
      var same = c1.length === c2.length;
      if (same) {
        c1.forEach(function (child, index) {
          var child2 = c2[index];
          if (child && child2) {
            if (child && !child2 || !child && child2) {
              same = false;
            } else if (child.key !== child2.key) {
              same = false;
            } else if (showProp && child.props[showProp] !== child2.props[showProp]) {
              same = false;
            }
          }
        });
      }
      return same;
    }

    function mergeChildren(prev, next) {
      var ret = [];

      // For each key of `next`, the list of keys to insert before that key in
      // the combined list
      var nextChildrenPending = {};
      var pendingChildren = [];
      prev.forEach(function (child) {
        if (child && findChildInChildrenByKey(next, child.key)) {
          if (pendingChildren.length) {
            nextChildrenPending[child.key] = pendingChildren;
            pendingChildren = [];
          }
        } else {
          pendingChildren.push(child);
        }
      });

      next.forEach(function (child) {
        if (child && Object.prototype.hasOwnProperty.call(nextChildrenPending, child.key)) {
          ret = ret.concat(nextChildrenPending[child.key]);
        }
        ret.push(child);
      });

      ret = ret.concat(pendingChildren);

      return ret;
    }

    var EVENT_NAME_MAP = {
      transitionend: {
        transition: 'transitionend',
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'mozTransitionEnd',
        OTransition: 'oTransitionEnd',
        msTransition: 'MSTransitionEnd'
      },

      animationend: {
        animation: 'animationend',
        WebkitAnimation: 'webkitAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        OAnimation: 'oAnimationEnd',
        msAnimation: 'MSAnimationEnd'
      }
    };

    var endEvents = [];

    function detectEvents() {
      var testEl = document.createElement('div');
      var style = testEl.style;

      if (!('AnimationEvent' in window)) {
        delete EVENT_NAME_MAP.animationend.animation;
      }

      if (!('TransitionEvent' in window)) {
        delete EVENT_NAME_MAP.transitionend.transition;
      }

      for (var baseEventName in EVENT_NAME_MAP) {
        if (EVENT_NAME_MAP.hasOwnProperty(baseEventName)) {
          var baseEvents = EVENT_NAME_MAP[baseEventName];
          for (var styleName in baseEvents) {
            if (styleName in style) {
              endEvents.push(baseEvents[styleName]);
              break;
            }
          }
        }
      }
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      detectEvents();
    }

    function addEventListener(node, eventName, eventListener) {
      node.addEventListener(eventName, eventListener, false);
    }

    function removeEventListener(node, eventName, eventListener) {
      node.removeEventListener(eventName, eventListener, false);
    }

    var TransitionEvents = {
      addEndEventListener: function addEndEventListener(node, eventListener) {
        if (endEvents.length === 0) {
          window.setTimeout(eventListener, 0);
          return;
        }
        endEvents.forEach(function (endEvent) {
          addEventListener(node, endEvent, eventListener);
        });
      },


      endEvents: endEvents,

      removeEndEventListener: function removeEndEventListener(node, eventListener) {
        if (endEvents.length === 0) {
          return;
        }
        endEvents.forEach(function (endEvent) {
          removeEventListener(node, endEvent, eventListener);
        });
      }
    };

    var indexOf = [].indexOf;

    var indexof = function(arr, obj){
      if (indexOf) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };

    var componentIndexof = function(arr, obj){
      if (arr.indexOf) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };

    /**
     * Module dependencies.
     */

    try {
      var index = indexof;
    } catch (err) {
      var index = componentIndexof;
    }

    /**
     * Whitespace regexp.
     */

    var re = /\s+/;

    /**
     * toString reference.
     */

    var toString$3 = Object.prototype.toString;

    /**
     * Wrap `el` in a `ClassList`.
     *
     * @param {Element} el
     * @return {ClassList}
     * @api public
     */

    var componentClasses = function(el){
      return new ClassList(el);
    };

    /**
     * Initialize a new ClassList for `el`.
     *
     * @param {Element} el
     * @api private
     */

    function ClassList(el) {
      if (!el || !el.nodeType) {
        throw new Error('A DOM element reference is required');
      }
      this.el = el;
      this.list = el.classList;
    }

    /**
     * Add class `name` if not already present.
     *
     * @param {String} name
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.add = function(name){
      // classList
      if (this.list) {
        this.list.add(name);
        return this;
      }

      // fallback
      var arr = this.array();
      var i = index(arr, name);
      if (!~i) arr.push(name);
      this.el.className = arr.join(' ');
      return this;
    };

    /**
     * Remove class `name` when present, or
     * pass a regular expression to remove
     * any which match.
     *
     * @param {String|RegExp} name
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.remove = function(name){
      if ('[object RegExp]' == toString$3.call(name)) {
        return this.removeMatching(name);
      }

      // classList
      if (this.list) {
        this.list.remove(name);
        return this;
      }

      // fallback
      var arr = this.array();
      var i = index(arr, name);
      if (~i) arr.splice(i, 1);
      this.el.className = arr.join(' ');
      return this;
    };

    /**
     * Remove all classes matching `re`.
     *
     * @param {RegExp} re
     * @return {ClassList}
     * @api private
     */

    ClassList.prototype.removeMatching = function(re){
      var arr = this.array();
      for (var i = 0; i < arr.length; i++) {
        if (re.test(arr[i])) {
          this.remove(arr[i]);
        }
      }
      return this;
    };

    /**
     * Toggle class `name`, can force state via `force`.
     *
     * For browsers that support classList, but do not support `force` yet,
     * the mistake will be detected and corrected.
     *
     * @param {String} name
     * @param {Boolean} force
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.toggle = function(name, force){
      // classList
      if (this.list) {
        if ("undefined" !== typeof force) {
          if (force !== this.list.toggle(name, force)) {
            this.list.toggle(name); // toggle again to correct
          }
        } else {
          this.list.toggle(name);
        }
        return this;
      }

      // fallback
      if ("undefined" !== typeof force) {
        if (!force) {
          this.remove(name);
        } else {
          this.add(name);
        }
      } else {
        if (this.has(name)) {
          this.remove(name);
        } else {
          this.add(name);
        }
      }

      return this;
    };

    /**
     * Return an array of classes.
     *
     * @return {Array}
     * @api public
     */

    ClassList.prototype.array = function(){
      var className = this.el.getAttribute('class') || '';
      var str = className.replace(/^\s+|\s+$/g, '');
      var arr = str.split(re);
      if ('' === arr[0]) arr.shift();
      return arr;
    };

    /**
     * Check if class `name` is present.
     *
     * @param {String} name
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.has =
    ClassList.prototype.contains = function(name){
      return this.list
        ? this.list.contains(name)
        : !! ~index(this.array(), name);
    };

    var isCssAnimationSupported = TransitionEvents.endEvents.length !== 0;
    var capitalPrefixes = ['Webkit', 'Moz', 'O',
    // ms is special .... !
    'ms'];
    var prefixes = ['-webkit-', '-moz-', '-o-', 'ms-', ''];

    function getStyleProperty(node, name) {
      // old ff need null, https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
      var style = window.getComputedStyle(node, null);
      var ret = '';
      for (var i = 0; i < prefixes.length; i++) {
        ret = style.getPropertyValue(prefixes[i] + name);
        if (ret) {
          break;
        }
      }
      return ret;
    }

    function fixBrowserByTimeout(node) {
      if (isCssAnimationSupported) {
        var transitionDelay = parseFloat(getStyleProperty(node, 'transition-delay')) || 0;
        var transitionDuration = parseFloat(getStyleProperty(node, 'transition-duration')) || 0;
        var animationDelay = parseFloat(getStyleProperty(node, 'animation-delay')) || 0;
        var animationDuration = parseFloat(getStyleProperty(node, 'animation-duration')) || 0;
        var time = Math.max(transitionDuration + transitionDelay, animationDuration + animationDelay);
        // sometimes, browser bug
        node.rcEndAnimTimeout = setTimeout(function () {
          node.rcEndAnimTimeout = null;
          if (node.rcEndListener) {
            node.rcEndListener();
          }
        }, time * 1000 + 200);
      }
    }

    function clearBrowserBugTimeout(node) {
      if (node.rcEndAnimTimeout) {
        clearTimeout(node.rcEndAnimTimeout);
        node.rcEndAnimTimeout = null;
      }
    }

    var cssAnimation = function cssAnimation(node, transitionName, endCallback) {
      var nameIsObj = (typeof transitionName === 'undefined' ? 'undefined' : _typeof(transitionName)) === 'object';
      var className = nameIsObj ? transitionName.name : transitionName;
      var activeClassName = nameIsObj ? transitionName.active : transitionName + '-active';
      var end = endCallback;
      var start = void 0;
      var active = void 0;
      var nodeClasses = componentClasses(node);

      if (endCallback && Object.prototype.toString.call(endCallback) === '[object Object]') {
        end = endCallback.end;
        start = endCallback.start;
        active = endCallback.active;
      }

      if (node.rcEndListener) {
        node.rcEndListener();
      }

      node.rcEndListener = function (e) {
        if (e && e.target !== node) {
          return;
        }

        if (node.rcAnimTimeout) {
          clearTimeout(node.rcAnimTimeout);
          node.rcAnimTimeout = null;
        }

        clearBrowserBugTimeout(node);

        nodeClasses.remove(className);
        nodeClasses.remove(activeClassName);

        TransitionEvents.removeEndEventListener(node, node.rcEndListener);
        node.rcEndListener = null;

        // Usually this optional end is used for informing an owner of
        // a leave animation and telling it to remove the child.
        if (end) {
          end();
        }
      };

      TransitionEvents.addEndEventListener(node, node.rcEndListener);

      if (start) {
        start();
      }
      nodeClasses.add(className);

      node.rcAnimTimeout = setTimeout(function () {
        node.rcAnimTimeout = null;
        nodeClasses.add(activeClassName);
        if (active) {
          setTimeout(active, 0);
        }
        fixBrowserByTimeout(node);
        // 30ms for firefox
      }, 30);

      return {
        stop: function stop() {
          if (node.rcEndListener) {
            node.rcEndListener();
          }
        }
      };
    };

    cssAnimation.style = function (node, style, callback) {
      if (node.rcEndListener) {
        node.rcEndListener();
      }

      node.rcEndListener = function (e) {
        if (e && e.target !== node) {
          return;
        }

        if (node.rcAnimTimeout) {
          clearTimeout(node.rcAnimTimeout);
          node.rcAnimTimeout = null;
        }

        clearBrowserBugTimeout(node);

        TransitionEvents.removeEndEventListener(node, node.rcEndListener);
        node.rcEndListener = null;

        // Usually this optional callback is used for informing an owner of
        // a leave animation and telling it to remove the child.
        if (callback) {
          callback();
        }
      };

      TransitionEvents.addEndEventListener(node, node.rcEndListener);

      node.rcAnimTimeout = setTimeout(function () {
        for (var s in style) {
          if (style.hasOwnProperty(s)) {
            node.style[s] = style[s];
          }
        }
        node.rcAnimTimeout = null;
        fixBrowserByTimeout(node);
      }, 0);
    };

    cssAnimation.setTransition = function (node, p, value) {
      var property = p;
      var v = value;
      if (value === undefined) {
        v = property;
        property = '';
      }
      property = property || '';
      capitalPrefixes.forEach(function (prefix) {
        node.style[prefix + 'Transition' + property] = v;
      });
    };

    cssAnimation.isCssAnimationSupported = isCssAnimationSupported;

    var util = {
      isAppearSupported: function isAppearSupported(props) {
        return props.transitionName && props.transitionAppear || props.animation.appear;
      },
      isEnterSupported: function isEnterSupported(props) {
        return props.transitionName && props.transitionEnter || props.animation.enter;
      },
      isLeaveSupported: function isLeaveSupported(props) {
        return props.transitionName && props.transitionLeave || props.animation.leave;
      },
      allowAppearCallback: function allowAppearCallback(props) {
        return props.transitionAppear || props.animation.appear;
      },
      allowEnterCallback: function allowEnterCallback(props) {
        return props.transitionEnter || props.animation.enter;
      },
      allowLeaveCallback: function allowLeaveCallback(props) {
        return props.transitionLeave || props.animation.leave;
      }
    };

    var transitionMap = {
      enter: 'transitionEnter',
      appear: 'transitionAppear',
      leave: 'transitionLeave'
    };

    var AnimateChild = function (_React$Component) {
      _inherits(AnimateChild, _React$Component);

      function AnimateChild() {
        _classCallCheck(this, AnimateChild);

        return _possibleConstructorReturn(this, (AnimateChild.__proto__ || Object.getPrototypeOf(AnimateChild)).apply(this, arguments));
      }

      _createClass(AnimateChild, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.stop();
        }
      }, {
        key: 'componentWillEnter',
        value: function componentWillEnter(done) {
          if (util.isEnterSupported(this.props)) {
            this.transition('enter', done);
          } else {
            done();
          }
        }
      }, {
        key: 'componentWillAppear',
        value: function componentWillAppear(done) {
          if (util.isAppearSupported(this.props)) {
            this.transition('appear', done);
          } else {
            done();
          }
        }
      }, {
        key: 'componentWillLeave',
        value: function componentWillLeave(done) {
          if (util.isLeaveSupported(this.props)) {
            this.transition('leave', done);
          } else {
            // always sync, do not interupt with react component life cycle
            // update hidden -> animate hidden ->
            // didUpdate -> animate leave -> unmount (if animate is none)
            done();
          }
        }
      }, {
        key: 'transition',
        value: function transition(animationType, finishCallback) {
          var _this2 = this;

          var node = ReactDOM__default.findDOMNode(this);
          var props = this.props;
          var transitionName = props.transitionName;
          var nameIsObj = typeof transitionName === 'object';
          this.stop();
          var end = function end() {
            _this2.stopper = null;
            finishCallback();
          };
          if ((isCssAnimationSupported || !props.animation[animationType]) && transitionName && props[transitionMap[animationType]]) {
            var name = nameIsObj ? transitionName[animationType] : transitionName + '-' + animationType;
            var activeName = name + '-active';
            if (nameIsObj && transitionName[animationType + 'Active']) {
              activeName = transitionName[animationType + 'Active'];
            }
            this.stopper = cssAnimation(node, {
              name: name,
              active: activeName
            }, end);
          } else {
            this.stopper = props.animation[animationType](node, end);
          }
        }
      }, {
        key: 'stop',
        value: function stop() {
          var stopper = this.stopper;
          if (stopper) {
            this.stopper = null;
            stopper.stop();
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return this.props.children;
        }
      }]);

      return AnimateChild;
    }(React__default.Component);

    AnimateChild.propTypes = {
      children: propTypes.any
    };

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    function componentWillMount() {
      // Call this.constructor.gDSFP to support sub-classes.
      var state = this.constructor.getDerivedStateFromProps(this.props, this.state);
      if (state !== null && state !== undefined) {
        this.setState(state);
      }
    }

    function componentWillReceiveProps(nextProps) {
      // Call this.constructor.gDSFP to support sub-classes.
      // Use the setState() updater to ensure state isn't stale in certain edge cases.
      function updater(prevState) {
        var state = this.constructor.getDerivedStateFromProps(nextProps, prevState);
        return state !== null && state !== undefined ? state : null;
      }
      // Binding "this" is important for shallow renderer support.
      this.setState(updater.bind(this));
    }

    function componentWillUpdate(nextProps, nextState) {
      try {
        var prevProps = this.props;
        var prevState = this.state;
        this.props = nextProps;
        this.state = nextState;
        this.__reactInternalSnapshotFlag = true;
        this.__reactInternalSnapshot = this.getSnapshotBeforeUpdate(
          prevProps,
          prevState
        );
      } finally {
        this.props = prevProps;
        this.state = prevState;
      }
    }

    // React may warn about cWM/cWRP/cWU methods being deprecated.
    // Add a flag to suppress these warnings for this special case.
    componentWillMount.__suppressDeprecationWarning = true;
    componentWillReceiveProps.__suppressDeprecationWarning = true;
    componentWillUpdate.__suppressDeprecationWarning = true;

    function polyfill(Component) {
      var prototype = Component.prototype;

      if (!prototype || !prototype.isReactComponent) {
        throw new Error('Can only polyfill class components');
      }

      if (
        typeof Component.getDerivedStateFromProps !== 'function' &&
        typeof prototype.getSnapshotBeforeUpdate !== 'function'
      ) {
        return Component;
      }

      // If new component APIs are defined, "unsafe" lifecycles won't be called.
      // Error if any of these lifecycles are present,
      // Because they would work differently between older and newer (16.3+) versions of React.
      var foundWillMountName = null;
      var foundWillReceivePropsName = null;
      var foundWillUpdateName = null;
      if (typeof prototype.componentWillMount === 'function') {
        foundWillMountName = 'componentWillMount';
      } else if (typeof prototype.UNSAFE_componentWillMount === 'function') {
        foundWillMountName = 'UNSAFE_componentWillMount';
      }
      if (typeof prototype.componentWillReceiveProps === 'function') {
        foundWillReceivePropsName = 'componentWillReceiveProps';
      } else if (typeof prototype.UNSAFE_componentWillReceiveProps === 'function') {
        foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
      }
      if (typeof prototype.componentWillUpdate === 'function') {
        foundWillUpdateName = 'componentWillUpdate';
      } else if (typeof prototype.UNSAFE_componentWillUpdate === 'function') {
        foundWillUpdateName = 'UNSAFE_componentWillUpdate';
      }
      if (
        foundWillMountName !== null ||
        foundWillReceivePropsName !== null ||
        foundWillUpdateName !== null
      ) {
        var componentName = Component.displayName || Component.name;
        var newApiName =
          typeof Component.getDerivedStateFromProps === 'function'
            ? 'getDerivedStateFromProps()'
            : 'getSnapshotBeforeUpdate()';

        throw Error(
          'Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' +
            componentName +
            ' uses ' +
            newApiName +
            ' but also contains the following legacy lifecycles:' +
            (foundWillMountName !== null ? '\n  ' + foundWillMountName : '') +
            (foundWillReceivePropsName !== null
              ? '\n  ' + foundWillReceivePropsName
              : '') +
            (foundWillUpdateName !== null ? '\n  ' + foundWillUpdateName : '') +
            '\n\nThe above lifecycles should be removed. Learn more about this warning here:\n' +
            'https://fb.me/react-async-component-lifecycle-hooks'
        );
      }

      // React <= 16.2 does not support static getDerivedStateFromProps.
      // As a workaround, use cWM and cWRP to invoke the new static lifecycle.
      // Newer versions of React will ignore these lifecycles if gDSFP exists.
      if (typeof Component.getDerivedStateFromProps === 'function') {
        prototype.componentWillMount = componentWillMount;
        prototype.componentWillReceiveProps = componentWillReceiveProps;
      }

      // React <= 16.2 does not support getSnapshotBeforeUpdate.
      // As a workaround, use cWU to invoke the new lifecycle.
      // Newer versions of React will ignore that lifecycle if gSBU exists.
      if (typeof prototype.getSnapshotBeforeUpdate === 'function') {
        if (typeof prototype.componentDidUpdate !== 'function') {
          throw new Error(
            'Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype'
          );
        }

        prototype.componentWillUpdate = componentWillUpdate;

        var componentDidUpdate = prototype.componentDidUpdate;

        prototype.componentDidUpdate = function componentDidUpdatePolyfill(
          prevProps,
          prevState,
          maybeSnapshot
        ) {
          // 16.3+ will not execute our will-update method;
          // It will pass a snapshot value to did-update though.
          // Older versions will require our polyfilled will-update value.
          // We need to handle both cases, but can't just check for the presence of "maybeSnapshot",
          // Because for <= 15.x versions this might be a "prevContext" object.
          // We also can't just check "__reactInternalSnapshot",
          // Because get-snapshot might return a falsy value.
          // So check for the explicit __reactInternalSnapshotFlag flag to determine behavior.
          var snapshot = this.__reactInternalSnapshotFlag
            ? this.__reactInternalSnapshot
            : maybeSnapshot;

          componentDidUpdate.call(this, prevProps, prevState, snapshot);
        };
      }

      return Component;
    }

    var performanceNow = createCommonjsModule(function (module) {
    // Generated by CoffeeScript 1.12.2
    (function() {
      var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

      if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
        module.exports = function() {
          return performance.now();
        };
      } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
        module.exports = function() {
          return (getNanoSeconds() - nodeLoadTime) / 1e6;
        };
        hrtime = process.hrtime;
        getNanoSeconds = function() {
          var hr;
          hr = hrtime();
          return hr[0] * 1e9 + hr[1];
        };
        moduleLoadTime = getNanoSeconds();
        upTime = process.uptime() * 1e9;
        nodeLoadTime = moduleLoadTime - upTime;
      } else if (Date.now) {
        module.exports = function() {
          return Date.now() - loadTime;
        };
        loadTime = Date.now();
      } else {
        module.exports = function() {
          return new Date().getTime() - loadTime;
        };
        loadTime = new Date().getTime();
      }

    }).call(commonjsGlobal);


    });

    var root = typeof window === 'undefined' ? commonjsGlobal : window
      , vendors = ['moz', 'webkit']
      , suffix = 'AnimationFrame'
      , raf = root['request' + suffix]
      , caf = root['cancel' + suffix] || root['cancelRequest' + suffix];

    for(var i$1 = 0; !raf && i$1 < vendors.length; i$1++) {
      raf = root[vendors[i$1] + 'Request' + suffix];
      caf = root[vendors[i$1] + 'Cancel' + suffix]
          || root[vendors[i$1] + 'CancelRequest' + suffix];
    }

    // Some versions of FF have rAF but not cAF
    if(!raf || !caf) {
      var last = 0
        , id$1 = 0
        , queue = []
        , frameDuration = 1000 / 60;

      raf = function(callback) {
        if(queue.length === 0) {
          var _now = performanceNow()
            , next = Math.max(0, frameDuration - (_now - last));
          last = next + _now;
          setTimeout(function() {
            var cp = queue.slice(0);
            // Clear queue here to prevent
            // callbacks from appending listeners
            // to the current frame's queue
            queue.length = 0;
            for(var i = 0; i < cp.length; i++) {
              if(!cp[i].cancelled) {
                try{
                  cp[i].callback(last);
                } catch(e) {
                  setTimeout(function() { throw e }, 0);
                }
              }
            }
          }, Math.round(next));
        }
        queue.push({
          handle: ++id$1,
          callback: callback,
          cancelled: false
        });
        return id$1
      };

      caf = function(handle) {
        for(var i = 0; i < queue.length; i++) {
          if(queue[i].handle === handle) {
            queue[i].cancelled = true;
          }
        }
      };
    }

    var raf_1 = function(fn) {
      // Wrap in a new function to prevent
      // `cancel` potentially being assigned
      // to the native rAF function
      return raf.call(root, fn)
    };
    var cancel = function() {
      caf.apply(root, arguments);
    };
    var polyfill$1 = function(object) {
      if (!object) {
        object = root;
      }
      object.requestAnimationFrame = raf;
      object.cancelAnimationFrame = caf;
    };
    raf_1.cancel = cancel;
    raf_1.polyfill = polyfill$1;

    var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

    // ================= Transition =================
    // Event wrapper. Copy from react source code
    function makePrefixMap(styleProp, eventName) {
      var prefixes = {};

      prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
      prefixes['Webkit' + styleProp] = 'webkit' + eventName;
      prefixes['Moz' + styleProp] = 'moz' + eventName;
      prefixes['ms' + styleProp] = 'MS' + eventName;
      prefixes['O' + styleProp] = 'o' + eventName.toLowerCase();

      return prefixes;
    }

    function getVendorPrefixes(domSupport, win) {
      var prefixes = {
        animationend: makePrefixMap('Animation', 'AnimationEnd'),
        transitionend: makePrefixMap('Transition', 'TransitionEnd')
      };

      if (domSupport) {
        if (!('AnimationEvent' in win)) {
          delete prefixes.animationend.animation;
        }

        if (!('TransitionEvent' in win)) {
          delete prefixes.transitionend.transition;
        }
      }

      return prefixes;
    }

    var vendorPrefixes = getVendorPrefixes(canUseDOM, typeof window !== 'undefined' ? window : {});

    var style = {};

    if (canUseDOM) {
      style = document.createElement('div').style;
    }

    var prefixedEventNames = {};

    function getVendorPrefixedEventName(eventName) {
      if (prefixedEventNames[eventName]) {
        return prefixedEventNames[eventName];
      }

      var prefixMap = vendorPrefixes[eventName];

      if (prefixMap) {
        var stylePropList = Object.keys(prefixMap);
        var len = stylePropList.length;
        for (var i = 0; i < len; i += 1) {
          var styleProp = stylePropList[i];
          if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
            prefixedEventNames[eventName] = prefixMap[styleProp];
            return prefixedEventNames[eventName];
          }
        }
      }

      return '';
    }

    var animationEndName = getVendorPrefixedEventName('animationend');
    var transitionEndName = getVendorPrefixedEventName('transitionend');
    var supportTransition = !!(animationEndName && transitionEndName);

    function getTransitionName$1(transitionName, transitionType) {
      if (!transitionName) return null;

      if (typeof transitionName === 'object') {
        var type = transitionType.replace(/-\w/g, function (match) {
          return match[1].toUpperCase();
        });
        return transitionName[type];
      }

      return transitionName + '-' + transitionType;
    }

    var STATUS_NONE = 'none';
    var STATUS_APPEAR = 'appear';
    var STATUS_ENTER = 'enter';
    var STATUS_LEAVE = 'leave';

    /**
     * `transitionSupport` is used for none transition test case.
     * Default we use browser transition event support check.
     */
    function genCSSMotion(transitionSupport) {
      function isSupportTransition(props) {
        return !!(props.motionName && transitionSupport);
      }

      var CSSMotion = function (_React$Component) {
        _inherits(CSSMotion, _React$Component);

        function CSSMotion() {
          _classCallCheck(this, CSSMotion);

          var _this = _possibleConstructorReturn(this, (CSSMotion.__proto__ || Object.getPrototypeOf(CSSMotion)).call(this));

          _this.onDomUpdate = function () {
            var _this$state = _this.state,
                status = _this$state.status,
                newStatus = _this$state.newStatus;
            var _this$props = _this.props,
                onAppearStart = _this$props.onAppearStart,
                onEnterStart = _this$props.onEnterStart,
                onLeaveStart = _this$props.onLeaveStart,
                onAppearActive = _this$props.onAppearActive,
                onEnterActive = _this$props.onEnterActive,
                onLeaveActive = _this$props.onLeaveActive,
                motionAppear = _this$props.motionAppear,
                motionEnter = _this$props.motionEnter,
                motionLeave = _this$props.motionLeave;


            if (!isSupportTransition(_this.props)) {
              return;
            }

            // Event injection
            var $ele = ReactDOM__default.findDOMNode(_this);
            if (_this.$ele !== $ele) {
              _this.removeEventListener(_this.$ele);
              _this.addEventListener($ele);
              _this.$ele = $ele;
            }

            // Init status
            if (newStatus && status === STATUS_APPEAR && motionAppear) {
              _this.updateStatus(onAppearStart, null, null, function () {
                _this.updateActiveStatus(onAppearActive, STATUS_APPEAR);
              });
            } else if (newStatus && status === STATUS_ENTER && motionEnter) {
              _this.updateStatus(onEnterStart, null, null, function () {
                _this.updateActiveStatus(onEnterActive, STATUS_ENTER);
              });
            } else if (newStatus && status === STATUS_LEAVE && motionLeave) {
              _this.updateStatus(onLeaveStart, null, null, function () {
                _this.updateActiveStatus(onLeaveActive, STATUS_LEAVE);
              });
            }
          };

          _this.onMotionEnd = function (event) {
            var _this$state2 = _this.state,
                status = _this$state2.status,
                statusActive = _this$state2.statusActive;
            var _this$props2 = _this.props,
                onAppearEnd = _this$props2.onAppearEnd,
                onEnterEnd = _this$props2.onEnterEnd,
                onLeaveEnd = _this$props2.onLeaveEnd;

            if (status === STATUS_APPEAR && statusActive) {
              _this.updateStatus(onAppearEnd, { status: STATUS_NONE }, event);
            } else if (status === STATUS_ENTER && statusActive) {
              _this.updateStatus(onEnterEnd, { status: STATUS_NONE }, event);
            } else if (status === STATUS_LEAVE && statusActive) {
              _this.updateStatus(onLeaveEnd, { status: STATUS_NONE }, event);
            }
          };

          _this.addEventListener = function ($ele) {
            if (!$ele) return;

            $ele.addEventListener(transitionEndName, _this.onMotionEnd);
            $ele.addEventListener(animationEndName, _this.onMotionEnd);
          };

          _this.removeEventListener = function ($ele) {
            if (!$ele) return;

            $ele.removeEventListener(transitionEndName, _this.onMotionEnd);
            $ele.removeEventListener(animationEndName, _this.onMotionEnd);
          };

          _this.updateStatus = function (styleFunc, additionalState, event, callback) {
            var statusStyle = styleFunc ? styleFunc(ReactDOM__default.findDOMNode(_this), event) : null;

            if (statusStyle === false || _this._destroyed) return;

            var nextStep = void 0;
            if (callback) {
              nextStep = function nextStep() {
                _this.nextFrame(callback);
              };
            }

            _this.setState(_extends$1({
              statusStyle: typeof statusStyle === 'object' ? statusStyle : null,
              newStatus: false
            }, additionalState), nextStep); // Trigger before next frame & after `componentDidMount`
          };

          _this.updateActiveStatus = function (styleFunc, currentStatus) {
            // `setState` use `postMessage` to trigger at the end of frame.
            // Let's use requestAnimationFrame to update new state in next frame.
            _this.nextFrame(function () {
              var status = _this.state.status;

              if (status !== currentStatus) return;

              _this.updateStatus(styleFunc, { statusActive: true });
            });
          };

          _this.nextFrame = function (func) {
            _this.cancelNextFrame();
            _this.raf = raf_1(func);
          };

          _this.cancelNextFrame = function () {
            if (_this.raf) {
              raf_1.cancel(_this.raf);
              _this.raf = null;
            }
          };

          _this.state = {
            status: STATUS_NONE,
            statusActive: false,
            newStatus: false,
            statusStyle: null
          };
          _this.$ele = null;
          _this.raf = null;
          return _this;
        }

        _createClass(CSSMotion, [{
          key: 'componentDidMount',
          value: function componentDidMount() {
            this.onDomUpdate();
          }
        }, {
          key: 'componentDidUpdate',
          value: function componentDidUpdate() {
            this.onDomUpdate();
          }
        }, {
          key: 'componentWillUnmount',
          value: function componentWillUnmount() {
            this._destroyed = true;
            this.removeEventListener(this.$ele);
            this.cancelNextFrame();
          }
        }, {
          key: 'render',
          value: function render() {
            var _classNames;

            var _state = this.state,
                status = _state.status,
                statusActive = _state.statusActive,
                statusStyle = _state.statusStyle;
            var _props = this.props,
                children = _props.children,
                motionName = _props.motionName,
                visible = _props.visible,
                removeOnLeave = _props.removeOnLeave;


            if (!children) return null;

            if (status === STATUS_NONE || !isSupportTransition(this.props)) {
              return visible || !removeOnLeave ? children({}) : null;
            }

            return children({
              className: classnames((_classNames = {}, _defineProperty(_classNames, getTransitionName$1(motionName, status), status !== STATUS_NONE), _defineProperty(_classNames, getTransitionName$1(motionName, status + '-active'), status !== STATUS_NONE && statusActive), _defineProperty(_classNames, motionName, typeof motionName === 'string'), _classNames)),
              style: statusStyle
            });
          }
        }], [{
          key: 'getDerivedStateFromProps',
          value: function getDerivedStateFromProps(props, _ref) {
            var prevProps = _ref.prevProps;

            if (!isSupportTransition(props)) return {};

            var visible = props.visible,
                motionAppear = props.motionAppear,
                motionEnter = props.motionEnter,
                motionLeave = props.motionLeave,
                motionLeaveImmediately = props.motionLeaveImmediately;

            var newState = {
              prevProps: props
            };

            // Appear
            if (!prevProps && visible && motionAppear) {
              newState.status = STATUS_APPEAR;
              newState.statusActive = false;
              newState.newStatus = true;
            }

            // Enter
            if (prevProps && !prevProps.visible && visible && motionEnter) {
              newState.status = STATUS_ENTER;
              newState.statusActive = false;
              newState.newStatus = true;
            }

            // Leave
            if (prevProps && prevProps.visible && !visible && motionLeave || !prevProps && motionLeaveImmediately && !visible && motionLeave) {
              newState.status = STATUS_LEAVE;
              newState.statusActive = false;
              newState.newStatus = true;
            }

            return newState;
          }
        }]);

        return CSSMotion;
      }(React__default.Component);

      CSSMotion.propTypes = {
        visible: propTypes.bool,
        children: propTypes.func,
        motionName: propTypes.oneOfType([propTypes.string, propTypes.object]),
        motionAppear: propTypes.bool,
        motionEnter: propTypes.bool,
        motionLeave: propTypes.bool,
        motionLeaveImmediately: propTypes.bool, // Trigger leave motion immediately
        removeOnLeave: propTypes.bool,
        onAppearStart: propTypes.func,
        onAppearActive: propTypes.func,
        onAppearEnd: propTypes.func,
        onEnterStart: propTypes.func,
        onEnterActive: propTypes.func,
        onEnterEnd: propTypes.func,
        onLeaveStart: propTypes.func,
        onLeaveActive: propTypes.func,
        onLeaveEnd: propTypes.func
      };
      CSSMotion.defaultProps = {
        visible: true,
        motionEnter: true,
        motionAppear: true,
        motionLeave: true,
        removeOnLeave: true
      };


      polyfill(CSSMotion);

      return CSSMotion;
    }

    var CSSMotion = genCSSMotion(supportTransition);

    var defaultKey = 'rc_animate_' + Date.now();

    function getChildrenFromProps(props) {
      var children = props.children;
      if (React__default.isValidElement(children)) {
        if (!children.key) {
          return React__default.cloneElement(children, {
            key: defaultKey
          });
        }
      }
      return children;
    }

    function noop$1() {}

    var Animate = function (_React$Component) {
      _inherits(Animate, _React$Component);

      function Animate(props) {
        _classCallCheck(this, Animate);

        var _this = _possibleConstructorReturn(this, (Animate.__proto__ || Object.getPrototypeOf(Animate)).call(this, props));

        _initialiseProps.call(_this);

        _this.currentlyAnimatingKeys = {};
        _this.keysToEnter = [];
        _this.keysToLeave = [];

        _this.state = {
          children: toArrayChildren(getChildrenFromProps(props))
        };

        _this.childrenRefs = {};
        return _this;
      } // eslint-disable-line

      _createClass(Animate, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this2 = this;

          var showProp = this.props.showProp;
          var children = this.state.children;
          if (showProp) {
            children = children.filter(function (child) {
              return !!child.props[showProp];
            });
          }
          children.forEach(function (child) {
            if (child) {
              _this2.performAppear(child.key);
            }
          });
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var _this3 = this;

          this.nextProps = nextProps;
          var nextChildren = toArrayChildren(getChildrenFromProps(nextProps));
          var props = this.props;
          // exclusive needs immediate response
          if (props.exclusive) {
            Object.keys(this.currentlyAnimatingKeys).forEach(function (key) {
              _this3.stop(key);
            });
          }
          var showProp = props.showProp;
          var currentlyAnimatingKeys = this.currentlyAnimatingKeys;
          // last props children if exclusive
          var currentChildren = props.exclusive ? toArrayChildren(getChildrenFromProps(props)) : this.state.children;
          // in case destroy in showProp mode
          var newChildren = [];
          if (showProp) {
            currentChildren.forEach(function (currentChild) {
              var nextChild = currentChild && findChildInChildrenByKey(nextChildren, currentChild.key);
              var newChild = void 0;
              if ((!nextChild || !nextChild.props[showProp]) && currentChild.props[showProp]) {
                newChild = React__default.cloneElement(nextChild || currentChild, _defineProperty({}, showProp, true));
              } else {
                newChild = nextChild;
              }
              if (newChild) {
                newChildren.push(newChild);
              }
            });
            nextChildren.forEach(function (nextChild) {
              if (!nextChild || !findChildInChildrenByKey(currentChildren, nextChild.key)) {
                newChildren.push(nextChild);
              }
            });
          } else {
            newChildren = mergeChildren(currentChildren, nextChildren);
          }

          // need render to avoid update
          this.setState({
            children: newChildren
          });

          nextChildren.forEach(function (child) {
            var key = child && child.key;
            if (child && currentlyAnimatingKeys[key]) {
              return;
            }
            var hasPrev = child && findChildInChildrenByKey(currentChildren, key);
            if (showProp) {
              var showInNext = child.props[showProp];
              if (hasPrev) {
                var showInNow = findShownChildInChildrenByKey(currentChildren, key, showProp);
                if (!showInNow && showInNext) {
                  _this3.keysToEnter.push(key);
                }
              } else if (showInNext) {
                _this3.keysToEnter.push(key);
              }
            } else if (!hasPrev) {
              _this3.keysToEnter.push(key);
            }
          });

          currentChildren.forEach(function (child) {
            var key = child && child.key;
            if (child && currentlyAnimatingKeys[key]) {
              return;
            }
            var hasNext = child && findChildInChildrenByKey(nextChildren, key);
            if (showProp) {
              var showInNow = child.props[showProp];
              if (hasNext) {
                var showInNext = findShownChildInChildrenByKey(nextChildren, key, showProp);
                if (!showInNext && showInNow) {
                  _this3.keysToLeave.push(key);
                }
              } else if (showInNow) {
                _this3.keysToLeave.push(key);
              }
            } else if (!hasNext) {
              _this3.keysToLeave.push(key);
            }
          });
        }
      }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
          var keysToEnter = this.keysToEnter;
          this.keysToEnter = [];
          keysToEnter.forEach(this.performEnter);
          var keysToLeave = this.keysToLeave;
          this.keysToLeave = [];
          keysToLeave.forEach(this.performLeave);
        }
      }, {
        key: 'isValidChildByKey',
        value: function isValidChildByKey(currentChildren, key) {
          var showProp = this.props.showProp;
          if (showProp) {
            return findShownChildInChildrenByKey(currentChildren, key, showProp);
          }
          return findChildInChildrenByKey(currentChildren, key);
        }
      }, {
        key: 'stop',
        value: function stop(key) {
          delete this.currentlyAnimatingKeys[key];
          var component = this.childrenRefs[key];
          if (component) {
            component.stop();
          }
        }
      }, {
        key: 'render',
        value: function render() {
          var _this4 = this;

          var props = this.props;
          this.nextProps = props;
          var stateChildren = this.state.children;
          var children = null;
          if (stateChildren) {
            children = stateChildren.map(function (child) {
              if (child === null || child === undefined) {
                return child;
              }
              if (!child.key) {
                throw new Error('must set key for <rc-animate> children');
              }
              return React__default.createElement(
                AnimateChild,
                {
                  key: child.key,
                  ref: function ref(node) {
                    _this4.childrenRefs[child.key] = node;
                  },
                  animation: props.animation,
                  transitionName: props.transitionName,
                  transitionEnter: props.transitionEnter,
                  transitionAppear: props.transitionAppear,
                  transitionLeave: props.transitionLeave
                },
                child
              );
            });
          }
          var Component = props.component;
          if (Component) {
            var passedProps = props;
            if (typeof Component === 'string') {
              passedProps = _extends$1({
                className: props.className,
                style: props.style
              }, props.componentProps);
            }
            return React__default.createElement(
              Component,
              passedProps,
              children
            );
          }
          return children[0] || null;
        }
      }]);

      return Animate;
    }(React__default.Component);

    Animate.isAnimate = true;
    Animate.CSSMotion = CSSMotion;
    Animate.propTypes = {
      component: propTypes.any,
      componentProps: propTypes.object,
      animation: propTypes.object,
      transitionName: propTypes.oneOfType([propTypes.string, propTypes.object]),
      transitionEnter: propTypes.bool,
      transitionAppear: propTypes.bool,
      exclusive: propTypes.bool,
      transitionLeave: propTypes.bool,
      onEnd: propTypes.func,
      onEnter: propTypes.func,
      onLeave: propTypes.func,
      onAppear: propTypes.func,
      showProp: propTypes.string,
      children: propTypes.node
    };
    Animate.defaultProps = {
      animation: {},
      component: 'span',
      componentProps: {},
      transitionEnter: true,
      transitionLeave: true,
      transitionAppear: false,
      onEnd: noop$1,
      onEnter: noop$1,
      onLeave: noop$1,
      onAppear: noop$1
    };

    var _initialiseProps = function _initialiseProps() {
      var _this5 = this;

      this.performEnter = function (key) {
        // may already remove by exclusive
        if (_this5.childrenRefs[key]) {
          _this5.currentlyAnimatingKeys[key] = true;
          _this5.childrenRefs[key].componentWillEnter(_this5.handleDoneAdding.bind(_this5, key, 'enter'));
        }
      };

      this.performAppear = function (key) {
        if (_this5.childrenRefs[key]) {
          _this5.currentlyAnimatingKeys[key] = true;
          _this5.childrenRefs[key].componentWillAppear(_this5.handleDoneAdding.bind(_this5, key, 'appear'));
        }
      };

      this.handleDoneAdding = function (key, type) {
        var props = _this5.props;
        delete _this5.currentlyAnimatingKeys[key];
        // if update on exclusive mode, skip check
        if (props.exclusive && props !== _this5.nextProps) {
          return;
        }
        var currentChildren = toArrayChildren(getChildrenFromProps(props));
        if (!_this5.isValidChildByKey(currentChildren, key)) {
          // exclusive will not need this
          _this5.performLeave(key);
        } else if (type === 'appear') {
          if (util.allowAppearCallback(props)) {
            props.onAppear(key);
            props.onEnd(key, true);
          }
        } else if (util.allowEnterCallback(props)) {
          props.onEnter(key);
          props.onEnd(key, true);
        }
      };

      this.performLeave = function (key) {
        // may already remove by exclusive
        if (_this5.childrenRefs[key]) {
          _this5.currentlyAnimatingKeys[key] = true;
          _this5.childrenRefs[key].componentWillLeave(_this5.handleDoneLeaving.bind(_this5, key));
        }
      };

      this.handleDoneLeaving = function (key) {
        var props = _this5.props;
        delete _this5.currentlyAnimatingKeys[key];
        // if update on exclusive mode, skip check
        if (props.exclusive && props !== _this5.nextProps) {
          return;
        }
        var currentChildren = toArrayChildren(getChildrenFromProps(props));
        // in case state change is too fast
        if (_this5.isValidChildByKey(currentChildren, key)) {
          _this5.performEnter(key);
        } else {
          var end = function end() {
            if (util.allowLeaveCallback(props)) {
              props.onLeave(key);
              props.onEnd(key, false);
            }
          };
          if (!isSameChildren(_this5.state.children, currentChildren, props.showProp)) {
            _this5.setState({
              children: currentChildren
            }, end);
          } else {
            end();
          }
        }
      };
    };

    var LazyRenderBox = function (_Component) {
      _inherits(LazyRenderBox, _Component);

      function LazyRenderBox() {
        _classCallCheck(this, LazyRenderBox);

        return _possibleConstructorReturn(this, _Component.apply(this, arguments));
      }

      LazyRenderBox.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
        return nextProps.hiddenClassName || nextProps.visible;
      };

      LazyRenderBox.prototype.render = function render() {
        var _props = this.props,
            hiddenClassName = _props.hiddenClassName,
            visible = _props.visible,
            props = _objectWithoutProperties(_props, ['hiddenClassName', 'visible']);

        if (hiddenClassName || React__default.Children.count(props.children) > 1) {
          if (!visible && hiddenClassName) {
            props.className += ' ' + hiddenClassName;
          }
          return React__default.createElement('div', props);
        }

        return React__default.Children.only(props.children);
      };

      return LazyRenderBox;
    }(React.Component);

    LazyRenderBox.propTypes = {
      children: propTypes.any,
      className: propTypes.string,
      visible: propTypes.bool,
      hiddenClassName: propTypes.string
    };

    var PopupInner = function (_Component) {
      _inherits(PopupInner, _Component);

      function PopupInner() {
        _classCallCheck(this, PopupInner);

        return _possibleConstructorReturn(this, _Component.apply(this, arguments));
      }

      PopupInner.prototype.render = function render() {
        var props = this.props;
        var className = props.className;
        if (!props.visible) {
          className += ' ' + props.hiddenClassName;
        }
        return React__default.createElement(
          'div',
          {
            className: className,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
            onMouseDown: props.onMouseDown,
            onTouchStart: props.onTouchStart,
            style: props.style
          },
          React__default.createElement(
            LazyRenderBox,
            { className: props.prefixCls + '-content', visible: props.visible },
            props.children
          )
        );
      };

      return PopupInner;
    }(React.Component);

    PopupInner.propTypes = {
      hiddenClassName: propTypes.string,
      className: propTypes.string,
      prefixCls: propTypes.string,
      onMouseEnter: propTypes.func,
      onMouseLeave: propTypes.func,
      onMouseDown: propTypes.func,
      onTouchStart: propTypes.func,
      children: propTypes.any
    };

    var Popup = function (_Component) {
      _inherits(Popup, _Component);

      function Popup(props) {
        _classCallCheck(this, Popup);

        var _this = _possibleConstructorReturn(this, _Component.call(this, props));

        _initialiseProps$1.call(_this);

        _this.state = {
          // Used for stretch
          stretchChecked: false,
          targetWidth: undefined,
          targetHeight: undefined
        };

        _this.savePopupRef = saveRef.bind(_this, 'popupInstance');
        _this.saveAlignRef = saveRef.bind(_this, 'alignInstance');
        return _this;
      }

      Popup.prototype.componentDidMount = function componentDidMount() {
        this.rootNode = this.getPopupDomNode();
        this.setStretchSize();
      };

      Popup.prototype.componentDidUpdate = function componentDidUpdate() {
        this.setStretchSize();
      };

      // Record size if stretch needed


      Popup.prototype.getPopupDomNode = function getPopupDomNode() {
        return ReactDOM__default.findDOMNode(this.popupInstance);
      };

      // `target` on `rc-align` can accept as a function to get the bind element or a point.
      // ref: https://www.npmjs.com/package/rc-align


      Popup.prototype.getMaskTransitionName = function getMaskTransitionName() {
        var props = this.props;
        var transitionName = props.maskTransitionName;
        var animation = props.maskAnimation;
        if (!transitionName && animation) {
          transitionName = props.prefixCls + '-' + animation;
        }
        return transitionName;
      };

      Popup.prototype.getTransitionName = function getTransitionName() {
        var props = this.props;
        var transitionName = props.transitionName;
        if (!transitionName && props.animation) {
          transitionName = props.prefixCls + '-' + props.animation;
        }
        return transitionName;
      };

      Popup.prototype.getClassName = function getClassName(currentAlignClassName) {
        return this.props.prefixCls + ' ' + this.props.className + ' ' + currentAlignClassName;
      };

      Popup.prototype.getPopupElement = function getPopupElement() {
        var _this2 = this;

        var savePopupRef = this.savePopupRef;
        var _state = this.state,
            stretchChecked = _state.stretchChecked,
            targetHeight = _state.targetHeight,
            targetWidth = _state.targetWidth;
        var _props = this.props,
            align = _props.align,
            visible = _props.visible,
            prefixCls = _props.prefixCls,
            style = _props.style,
            getClassNameFromAlign = _props.getClassNameFromAlign,
            destroyPopupOnHide = _props.destroyPopupOnHide,
            stretch = _props.stretch,
            children = _props.children,
            onMouseEnter = _props.onMouseEnter,
            onMouseLeave = _props.onMouseLeave,
            onMouseDown = _props.onMouseDown,
            onTouchStart = _props.onTouchStart;

        var className = this.getClassName(this.currentAlignClassName || getClassNameFromAlign(align));
        var hiddenClassName = prefixCls + '-hidden';

        if (!visible) {
          this.currentAlignClassName = null;
        }

        var sizeStyle = {};
        if (stretch) {
          // Stretch with target
          if (stretch.indexOf('height') !== -1) {
            sizeStyle.height = targetHeight;
          } else if (stretch.indexOf('minHeight') !== -1) {
            sizeStyle.minHeight = targetHeight;
          }
          if (stretch.indexOf('width') !== -1) {
            sizeStyle.width = targetWidth;
          } else if (stretch.indexOf('minWidth') !== -1) {
            sizeStyle.minWidth = targetWidth;
          }

          // Delay force align to makes ui smooth
          if (!stretchChecked) {
            sizeStyle.visibility = 'hidden';
            setTimeout(function () {
              if (_this2.alignInstance) {
                _this2.alignInstance.forceAlign();
              }
            }, 0);
          }
        }

        var newStyle = _extends$1({}, sizeStyle, style, this.getZIndexStyle());

        var popupInnerProps = {
          className: className,
          prefixCls: prefixCls,
          ref: savePopupRef,
          onMouseEnter: onMouseEnter,
          onMouseLeave: onMouseLeave,
          onMouseDown: onMouseDown,
          onTouchStart: onTouchStart,
          style: newStyle
        };
        if (destroyPopupOnHide) {
          return React__default.createElement(
            Animate,
            {
              component: '',
              exclusive: true,
              transitionAppear: true,
              transitionName: this.getTransitionName()
            },
            visible ? React__default.createElement(
              Align,
              {
                target: this.getAlignTarget(),
                key: 'popup',
                ref: this.saveAlignRef,
                monitorWindowResize: true,
                align: align,
                onAlign: this.onAlign
              },
              React__default.createElement(
                PopupInner,
                _extends$1({
                  visible: true
                }, popupInnerProps),
                children
              )
            ) : null
          );
        }

        return React__default.createElement(
          Animate,
          {
            component: '',
            exclusive: true,
            transitionAppear: true,
            transitionName: this.getTransitionName(),
            showProp: 'xVisible'
          },
          React__default.createElement(
            Align,
            {
              target: this.getAlignTarget(),
              key: 'popup',
              ref: this.saveAlignRef,
              monitorWindowResize: true,
              xVisible: visible,
              childrenProps: { visible: 'xVisible' },
              disabled: !visible,
              align: align,
              onAlign: this.onAlign
            },
            React__default.createElement(
              PopupInner,
              _extends$1({
                hiddenClassName: hiddenClassName
              }, popupInnerProps),
              children
            )
          )
        );
      };

      Popup.prototype.getZIndexStyle = function getZIndexStyle() {
        var style = {};
        var props = this.props;
        if (props.zIndex !== undefined) {
          style.zIndex = props.zIndex;
        }
        return style;
      };

      Popup.prototype.getMaskElement = function getMaskElement() {
        var props = this.props;
        var maskElement = void 0;
        if (props.mask) {
          var maskTransition = this.getMaskTransitionName();
          maskElement = React__default.createElement(LazyRenderBox, {
            style: this.getZIndexStyle(),
            key: 'mask',
            className: props.prefixCls + '-mask',
            hiddenClassName: props.prefixCls + '-mask-hidden',
            visible: props.visible
          });
          if (maskTransition) {
            maskElement = React__default.createElement(
              Animate,
              {
                key: 'mask',
                showProp: 'visible',
                transitionAppear: true,
                component: '',
                transitionName: maskTransition
              },
              maskElement
            );
          }
        }
        return maskElement;
      };

      Popup.prototype.render = function render() {
        return React__default.createElement(
          'div',
          null,
          this.getMaskElement(),
          this.getPopupElement()
        );
      };

      return Popup;
    }(React.Component);

    Popup.propTypes = {
      visible: propTypes.bool,
      style: propTypes.object,
      getClassNameFromAlign: propTypes.func,
      onAlign: propTypes.func,
      getRootDomNode: propTypes.func,
      align: propTypes.any,
      destroyPopupOnHide: propTypes.bool,
      className: propTypes.string,
      prefixCls: propTypes.string,
      onMouseEnter: propTypes.func,
      onMouseLeave: propTypes.func,
      onMouseDown: propTypes.func,
      onTouchStart: propTypes.func,
      stretch: propTypes.string,
      children: propTypes.node,
      point: propTypes.shape({
        pageX: propTypes.number,
        pageY: propTypes.number
      })
    };

    var _initialiseProps$1 = function _initialiseProps() {
      var _this3 = this;

      this.onAlign = function (popupDomNode, align) {
        var props = _this3.props;
        var currentAlignClassName = props.getClassNameFromAlign(align);
        // FIX: https://github.com/react-component/trigger/issues/56
        // FIX: https://github.com/react-component/tooltip/issues/79
        if (_this3.currentAlignClassName !== currentAlignClassName) {
          _this3.currentAlignClassName = currentAlignClassName;
          popupDomNode.className = _this3.getClassName(currentAlignClassName);
        }
        props.onAlign(popupDomNode, align);
      };

      this.setStretchSize = function () {
        var _props2 = _this3.props,
            stretch = _props2.stretch,
            getRootDomNode = _props2.getRootDomNode,
            visible = _props2.visible;
        var _state2 = _this3.state,
            stretchChecked = _state2.stretchChecked,
            targetHeight = _state2.targetHeight,
            targetWidth = _state2.targetWidth;


        if (!stretch || !visible) {
          if (stretchChecked) {
            _this3.setState({ stretchChecked: false });
          }
          return;
        }

        var $ele = getRootDomNode();
        if (!$ele) return;

        var height = $ele.offsetHeight;
        var width = $ele.offsetWidth;

        if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
          _this3.setState({
            stretchChecked: true,
            targetHeight: height,
            targetWidth: width
          });
        }
      };

      this.getTargetElement = function () {
        return _this3.props.getRootDomNode();
      };

      this.getAlignTarget = function () {
        var point = _this3.props.point;

        if (point) {
          return point;
        }
        return _this3.getTargetElement;
      };
    };

    function noop$2() {}

    function returnEmptyString() {
      return '';
    }

    function returnDocument() {
      return window.document;
    }

    var ALL_HANDLERS = ['onClick', 'onMouseDown', 'onTouchStart', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur', 'onContextMenu'];

    var IS_REACT_16 = !!ReactDOM.createPortal;

    var contextTypes = {
      rcTrigger: propTypes.shape({
        onPopupMouseDown: propTypes.func
      })
    };

    var Trigger = function (_React$Component) {
      _inherits(Trigger, _React$Component);

      function Trigger(props) {
        _classCallCheck(this, Trigger);

        var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

        _initialiseProps$2.call(_this);

        var popupVisible = void 0;
        if ('popupVisible' in props) {
          popupVisible = !!props.popupVisible;
        } else {
          popupVisible = !!props.defaultPopupVisible;
        }

        _this.prevPopupVisible = popupVisible;

        _this.state = {
          popupVisible: popupVisible
        };
        return _this;
      }

      Trigger.prototype.getChildContext = function getChildContext() {
        return {
          rcTrigger: {
            onPopupMouseDown: this.onPopupMouseDown
          }
        };
      };

      Trigger.prototype.componentWillMount = function componentWillMount() {
        var _this2 = this;

        ALL_HANDLERS.forEach(function (h) {
          _this2['fire' + h] = function (e) {
            _this2.fireEvents(h, e);
          };
        });
      };

      Trigger.prototype.componentDidMount = function componentDidMount() {
        this.componentDidUpdate({}, {
          popupVisible: this.state.popupVisible
        });
      };

      Trigger.prototype.componentWillReceiveProps = function componentWillReceiveProps(_ref) {
        var popupVisible = _ref.popupVisible;

        if (popupVisible !== undefined) {
          this.setState({
            popupVisible: popupVisible
          });
        }
      };

      Trigger.prototype.componentDidUpdate = function componentDidUpdate(_, prevState) {
        var props = this.props;
        var state = this.state;
        var triggerAfterPopupVisibleChange = function triggerAfterPopupVisibleChange() {
          if (prevState.popupVisible !== state.popupVisible) {
            props.afterPopupVisibleChange(state.popupVisible);
          }
        };
        if (!IS_REACT_16) {
          this.renderComponent(null, triggerAfterPopupVisibleChange);
        }

        this.prevPopupVisible = prevState.popupVisible;

        // We must listen to `mousedown` or `touchstart`, edge case:
        // https://github.com/ant-design/ant-design/issues/5804
        // https://github.com/react-component/calendar/issues/250
        // https://github.com/react-component/trigger/issues/50
        if (state.popupVisible) {
          var currentDocument = void 0;
          if (!this.clickOutsideHandler && (this.isClickToHide() || this.isContextMenuToShow())) {
            currentDocument = props.getDocument();
            this.clickOutsideHandler = addEventListenerWrap(currentDocument, 'mousedown', this.onDocumentClick);
          }
          // always hide on mobile
          if (!this.touchOutsideHandler) {
            currentDocument = currentDocument || props.getDocument();
            this.touchOutsideHandler = addEventListenerWrap(currentDocument, 'touchstart', this.onDocumentClick);
          }
          // close popup when trigger type contains 'onContextMenu' and document is scrolling.
          if (!this.contextMenuOutsideHandler1 && this.isContextMenuToShow()) {
            currentDocument = currentDocument || props.getDocument();
            this.contextMenuOutsideHandler1 = addEventListenerWrap(currentDocument, 'scroll', this.onContextMenuClose);
          }
          // close popup when trigger type contains 'onContextMenu' and window is blur.
          if (!this.contextMenuOutsideHandler2 && this.isContextMenuToShow()) {
            this.contextMenuOutsideHandler2 = addEventListenerWrap(window, 'blur', this.onContextMenuClose);
          }
          return;
        }

        this.clearOutsideHandler();
      };

      Trigger.prototype.componentWillUnmount = function componentWillUnmount() {
        this.clearDelayTimer();
        this.clearOutsideHandler();
        clearTimeout(this.mouseDownTimeout);
      };

      Trigger.prototype.getPopupDomNode = function getPopupDomNode() {
        // for test
        if (this._component && this._component.getPopupDomNode) {
          return this._component.getPopupDomNode();
        }
        return null;
      };

      Trigger.prototype.getPopupAlign = function getPopupAlign() {
        var props = this.props;
        var popupPlacement = props.popupPlacement,
            popupAlign = props.popupAlign,
            builtinPlacements = props.builtinPlacements;

        if (popupPlacement && builtinPlacements) {
          return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
        }
        return popupAlign;
      };

      /**
       * @param popupVisible    Show or not the popup element
       * @param event           SyntheticEvent, used for `pointAlign`
       */
      Trigger.prototype.setPopupVisible = function setPopupVisible(popupVisible, event) {
        var alignPoint = this.props.alignPoint;


        this.clearDelayTimer();

        if (this.state.popupVisible !== popupVisible) {
          if (!('popupVisible' in this.props)) {
            this.setState({ popupVisible: popupVisible });
          }
          this.props.onPopupVisibleChange(popupVisible);
        }

        // Always record the point position since mouseEnterDelay will delay the show
        if (alignPoint && event) {
          this.setPoint(event);
        }
      };

      Trigger.prototype.delaySetPopupVisible = function delaySetPopupVisible(visible, delayS, event) {
        var _this3 = this;

        var delay = delayS * 1000;
        this.clearDelayTimer();
        if (delay) {
          var point = event ? { pageX: event.pageX, pageY: event.pageY } : null;
          this.delayTimer = setTimeout(function () {
            _this3.setPopupVisible(visible, point);
            _this3.clearDelayTimer();
          }, delay);
        } else {
          this.setPopupVisible(visible, event);
        }
      };

      Trigger.prototype.clearDelayTimer = function clearDelayTimer() {
        if (this.delayTimer) {
          clearTimeout(this.delayTimer);
          this.delayTimer = null;
        }
      };

      Trigger.prototype.clearOutsideHandler = function clearOutsideHandler() {
        if (this.clickOutsideHandler) {
          this.clickOutsideHandler.remove();
          this.clickOutsideHandler = null;
        }

        if (this.contextMenuOutsideHandler1) {
          this.contextMenuOutsideHandler1.remove();
          this.contextMenuOutsideHandler1 = null;
        }

        if (this.contextMenuOutsideHandler2) {
          this.contextMenuOutsideHandler2.remove();
          this.contextMenuOutsideHandler2 = null;
        }

        if (this.touchOutsideHandler) {
          this.touchOutsideHandler.remove();
          this.touchOutsideHandler = null;
        }
      };

      Trigger.prototype.createTwoChains = function createTwoChains(event) {
        var childPros = this.props.children.props;
        var props = this.props;
        if (childPros[event] && props[event]) {
          return this['fire' + event];
        }
        return childPros[event] || props[event];
      };

      Trigger.prototype.isClickToShow = function isClickToShow() {
        var _props = this.props,
            action = _props.action,
            showAction = _props.showAction;

        return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1;
      };

      Trigger.prototype.isContextMenuToShow = function isContextMenuToShow() {
        var _props2 = this.props,
            action = _props2.action,
            showAction = _props2.showAction;

        return action.indexOf('contextMenu') !== -1 || showAction.indexOf('contextMenu') !== -1;
      };

      Trigger.prototype.isClickToHide = function isClickToHide() {
        var _props3 = this.props,
            action = _props3.action,
            hideAction = _props3.hideAction;

        return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1;
      };

      Trigger.prototype.isMouseEnterToShow = function isMouseEnterToShow() {
        var _props4 = this.props,
            action = _props4.action,
            showAction = _props4.showAction;

        return action.indexOf('hover') !== -1 || showAction.indexOf('mouseEnter') !== -1;
      };

      Trigger.prototype.isMouseLeaveToHide = function isMouseLeaveToHide() {
        var _props5 = this.props,
            action = _props5.action,
            hideAction = _props5.hideAction;

        return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseLeave') !== -1;
      };

      Trigger.prototype.isFocusToShow = function isFocusToShow() {
        var _props6 = this.props,
            action = _props6.action,
            showAction = _props6.showAction;

        return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1;
      };

      Trigger.prototype.isBlurToHide = function isBlurToHide() {
        var _props7 = this.props,
            action = _props7.action,
            hideAction = _props7.hideAction;

        return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1;
      };

      Trigger.prototype.forcePopupAlign = function forcePopupAlign() {
        if (this.state.popupVisible && this._component && this._component.alignInstance) {
          this._component.alignInstance.forceAlign();
        }
      };

      Trigger.prototype.fireEvents = function fireEvents(type, e) {
        var childCallback = this.props.children.props[type];
        if (childCallback) {
          childCallback(e);
        }
        var callback = this.props[type];
        if (callback) {
          callback(e);
        }
      };

      Trigger.prototype.close = function close() {
        this.setPopupVisible(false);
      };

      Trigger.prototype.render = function render() {
        var _this4 = this;

        var popupVisible = this.state.popupVisible;
        var _props8 = this.props,
            children = _props8.children,
            forceRender = _props8.forceRender,
            alignPoint = _props8.alignPoint,
            className = _props8.className;

        var child = React__default.Children.only(children);
        var newChildProps = { key: 'trigger' };

        if (this.isContextMenuToShow()) {
          newChildProps.onContextMenu = this.onContextMenu;
        } else {
          newChildProps.onContextMenu = this.createTwoChains('onContextMenu');
        }

        if (this.isClickToHide() || this.isClickToShow()) {
          newChildProps.onClick = this.onClick;
          newChildProps.onMouseDown = this.onMouseDown;
          newChildProps.onTouchStart = this.onTouchStart;
        } else {
          newChildProps.onClick = this.createTwoChains('onClick');
          newChildProps.onMouseDown = this.createTwoChains('onMouseDown');
          newChildProps.onTouchStart = this.createTwoChains('onTouchStart');
        }
        if (this.isMouseEnterToShow()) {
          newChildProps.onMouseEnter = this.onMouseEnter;
          if (alignPoint) {
            newChildProps.onMouseMove = this.onMouseMove;
          }
        } else {
          newChildProps.onMouseEnter = this.createTwoChains('onMouseEnter');
        }
        if (this.isMouseLeaveToHide()) {
          newChildProps.onMouseLeave = this.onMouseLeave;
        } else {
          newChildProps.onMouseLeave = this.createTwoChains('onMouseLeave');
        }
        if (this.isFocusToShow() || this.isBlurToHide()) {
          newChildProps.onFocus = this.onFocus;
          newChildProps.onBlur = this.onBlur;
        } else {
          newChildProps.onFocus = this.createTwoChains('onFocus');
          newChildProps.onBlur = this.createTwoChains('onBlur');
        }

        var childrenClassName = classnames(child && child.props && child.props.className, className);
        if (childrenClassName) {
          newChildProps.className = childrenClassName;
        }
        var trigger = React__default.cloneElement(child, newChildProps);

        if (!IS_REACT_16) {
          return React__default.createElement(
            ContainerRender,
            {
              parent: this,
              visible: popupVisible,
              autoMount: false,
              forceRender: forceRender,
              getComponent: this.getComponent,
              getContainer: this.getContainer
            },
            function (_ref2) {
              var renderComponent = _ref2.renderComponent;

              _this4.renderComponent = renderComponent;
              return trigger;
            }
          );
        }

        var portal = void 0;
        // prevent unmounting after it's rendered
        if (popupVisible || this._component || forceRender) {
          portal = React__default.createElement(
            Portal,
            {
              key: 'portal',
              getContainer: this.getContainer,
              didUpdate: this.handlePortalUpdate
            },
            this.getComponent()
          );
        }

        return [trigger, portal];
      };

      return Trigger;
    }(React__default.Component);

    Trigger.propTypes = {
      children: propTypes.any,
      action: propTypes.oneOfType([propTypes.string, propTypes.arrayOf(propTypes.string)]),
      showAction: propTypes.any,
      hideAction: propTypes.any,
      getPopupClassNameFromAlign: propTypes.any,
      onPopupVisibleChange: propTypes.func,
      afterPopupVisibleChange: propTypes.func,
      popup: propTypes.oneOfType([propTypes.node, propTypes.func]).isRequired,
      popupStyle: propTypes.object,
      prefixCls: propTypes.string,
      popupClassName: propTypes.string,
      className: propTypes.string,
      popupPlacement: propTypes.string,
      builtinPlacements: propTypes.object,
      popupTransitionName: propTypes.oneOfType([propTypes.string, propTypes.object]),
      popupAnimation: propTypes.any,
      mouseEnterDelay: propTypes.number,
      mouseLeaveDelay: propTypes.number,
      zIndex: propTypes.number,
      focusDelay: propTypes.number,
      blurDelay: propTypes.number,
      getPopupContainer: propTypes.func,
      getDocument: propTypes.func,
      forceRender: propTypes.bool,
      destroyPopupOnHide: propTypes.bool,
      mask: propTypes.bool,
      maskClosable: propTypes.bool,
      onPopupAlign: propTypes.func,
      popupAlign: propTypes.object,
      popupVisible: propTypes.bool,
      defaultPopupVisible: propTypes.bool,
      maskTransitionName: propTypes.oneOfType([propTypes.string, propTypes.object]),
      maskAnimation: propTypes.string,
      stretch: propTypes.string,
      alignPoint: propTypes.bool // Maybe we can support user pass position in the future
    };
    Trigger.contextTypes = contextTypes;
    Trigger.childContextTypes = contextTypes;
    Trigger.defaultProps = {
      prefixCls: 'rc-trigger-popup',
      getPopupClassNameFromAlign: returnEmptyString,
      getDocument: returnDocument,
      onPopupVisibleChange: noop$2,
      afterPopupVisibleChange: noop$2,
      onPopupAlign: noop$2,
      popupClassName: '',
      mouseEnterDelay: 0,
      mouseLeaveDelay: 0.1,
      focusDelay: 0,
      blurDelay: 0.15,
      popupStyle: {},
      destroyPopupOnHide: false,
      popupAlign: {},
      defaultPopupVisible: false,
      mask: false,
      maskClosable: true,
      action: [],
      showAction: [],
      hideAction: []
    };

    var _initialiseProps$2 = function _initialiseProps() {
      var _this5 = this;

      this.onMouseEnter = function (e) {
        var mouseEnterDelay = _this5.props.mouseEnterDelay;

        _this5.fireEvents('onMouseEnter', e);
        _this5.delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
      };

      this.onMouseMove = function (e) {
        _this5.fireEvents('onMouseMove', e);
        _this5.setPoint(e);
      };

      this.onMouseLeave = function (e) {
        _this5.fireEvents('onMouseLeave', e);
        _this5.delaySetPopupVisible(false, _this5.props.mouseLeaveDelay);
      };

      this.onPopupMouseEnter = function () {
        _this5.clearDelayTimer();
      };

      this.onPopupMouseLeave = function (e) {
        // https://github.com/react-component/trigger/pull/13
        // react bug?
        if (e.relatedTarget && !e.relatedTarget.setTimeout && _this5._component && _this5._component.getPopupDomNode && contains(_this5._component.getPopupDomNode(), e.relatedTarget)) {
          return;
        }
        _this5.delaySetPopupVisible(false, _this5.props.mouseLeaveDelay);
      };

      this.onFocus = function (e) {
        _this5.fireEvents('onFocus', e);
        // incase focusin and focusout
        _this5.clearDelayTimer();
        if (_this5.isFocusToShow()) {
          _this5.focusTime = Date.now();
          _this5.delaySetPopupVisible(true, _this5.props.focusDelay);
        }
      };

      this.onMouseDown = function (e) {
        _this5.fireEvents('onMouseDown', e);
        _this5.preClickTime = Date.now();
      };

      this.onTouchStart = function (e) {
        _this5.fireEvents('onTouchStart', e);
        _this5.preTouchTime = Date.now();
      };

      this.onBlur = function (e) {
        _this5.fireEvents('onBlur', e);
        _this5.clearDelayTimer();
        if (_this5.isBlurToHide()) {
          _this5.delaySetPopupVisible(false, _this5.props.blurDelay);
        }
      };

      this.onContextMenu = function (e) {
        e.preventDefault();
        _this5.fireEvents('onContextMenu', e);
        _this5.setPopupVisible(true, e);
      };

      this.onContextMenuClose = function () {
        if (_this5.isContextMenuToShow()) {
          _this5.close();
        }
      };

      this.onClick = function (event) {
        _this5.fireEvents('onClick', event);
        // focus will trigger click
        if (_this5.focusTime) {
          var preTime = void 0;
          if (_this5.preClickTime && _this5.preTouchTime) {
            preTime = Math.min(_this5.preClickTime, _this5.preTouchTime);
          } else if (_this5.preClickTime) {
            preTime = _this5.preClickTime;
          } else if (_this5.preTouchTime) {
            preTime = _this5.preTouchTime;
          }
          if (Math.abs(preTime - _this5.focusTime) < 20) {
            return;
          }
          _this5.focusTime = 0;
        }
        _this5.preClickTime = 0;
        _this5.preTouchTime = 0;
        if (event && event.preventDefault) {
          event.preventDefault();
        }
        var nextVisible = !_this5.state.popupVisible;
        if (_this5.isClickToHide() && !nextVisible || nextVisible && _this5.isClickToShow()) {
          _this5.setPopupVisible(!_this5.state.popupVisible, event);
        }
      };

      this.onPopupMouseDown = function () {
        var _context$rcTrigger = _this5.context.rcTrigger,
            rcTrigger = _context$rcTrigger === undefined ? {} : _context$rcTrigger;

        _this5.hasPopupMouseDown = true;

        clearTimeout(_this5.mouseDownTimeout);
        _this5.mouseDownTimeout = setTimeout(function () {
          _this5.hasPopupMouseDown = false;
        }, 0);

        if (rcTrigger.onPopupMouseDown) {
          rcTrigger.onPopupMouseDown.apply(rcTrigger, arguments);
        }
      };

      this.onDocumentClick = function (event) {
        if (_this5.props.mask && !_this5.props.maskClosable) {
          return;
        }

        var target = event.target;
        var root = ReactDOM.findDOMNode(_this5);
        if (!contains(root, target) && !_this5.hasPopupMouseDown) {
          _this5.close();
        }
      };

      this.getRootDomNode = function () {
        return ReactDOM.findDOMNode(_this5);
      };

      this.getPopupClassNameFromAlign = function (align) {
        var className = [];
        var _props9 = _this5.props,
            popupPlacement = _props9.popupPlacement,
            builtinPlacements = _props9.builtinPlacements,
            prefixCls = _props9.prefixCls,
            alignPoint = _props9.alignPoint,
            getPopupClassNameFromAlign = _props9.getPopupClassNameFromAlign;

        if (popupPlacement && builtinPlacements) {
          className.push(getAlignPopupClassName(builtinPlacements, prefixCls, align, alignPoint));
        }
        if (getPopupClassNameFromAlign) {
          className.push(getPopupClassNameFromAlign(align));
        }
        return className.join(' ');
      };

      this.getComponent = function () {
        var _props10 = _this5.props,
            prefixCls = _props10.prefixCls,
            destroyPopupOnHide = _props10.destroyPopupOnHide,
            popupClassName = _props10.popupClassName,
            action = _props10.action,
            onPopupAlign = _props10.onPopupAlign,
            popupAnimation = _props10.popupAnimation,
            popupTransitionName = _props10.popupTransitionName,
            popupStyle = _props10.popupStyle,
            mask = _props10.mask,
            maskAnimation = _props10.maskAnimation,
            maskTransitionName = _props10.maskTransitionName,
            zIndex = _props10.zIndex,
            popup = _props10.popup,
            stretch = _props10.stretch,
            alignPoint = _props10.alignPoint;
        var _state = _this5.state,
            popupVisible = _state.popupVisible,
            point = _state.point;


        var align = _this5.getPopupAlign();

        var mouseProps = {};
        if (_this5.isMouseEnterToShow()) {
          mouseProps.onMouseEnter = _this5.onPopupMouseEnter;
        }
        if (_this5.isMouseLeaveToHide()) {
          mouseProps.onMouseLeave = _this5.onPopupMouseLeave;
        }

        mouseProps.onMouseDown = _this5.onPopupMouseDown;
        mouseProps.onTouchStart = _this5.onPopupMouseDown;

        return React__default.createElement(
          Popup,
          _extends$1({
            prefixCls: prefixCls,
            destroyPopupOnHide: destroyPopupOnHide,
            visible: popupVisible,
            point: alignPoint && point,
            className: popupClassName,
            action: action,
            align: align,
            onAlign: onPopupAlign,
            animation: popupAnimation,
            getClassNameFromAlign: _this5.getPopupClassNameFromAlign
          }, mouseProps, {
            stretch: stretch,
            getRootDomNode: _this5.getRootDomNode,
            style: popupStyle,
            mask: mask,
            zIndex: zIndex,
            transitionName: popupTransitionName,
            maskAnimation: maskAnimation,
            maskTransitionName: maskTransitionName,
            ref: _this5.savePopup
          }),
          typeof popup === 'function' ? popup() : popup
        );
      };

      this.getContainer = function () {
        var props = _this5.props;

        var popupContainer = document.createElement('div');
        // Make sure default popup container will never cause scrollbar appearing
        // https://github.com/react-component/trigger/issues/41
        popupContainer.style.position = 'absolute';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        var mountNode = props.getPopupContainer ? props.getPopupContainer(ReactDOM.findDOMNode(_this5)) : props.getDocument().body;
        mountNode.appendChild(popupContainer);
        return popupContainer;
      };

      this.setPoint = function (point) {
        var alignPoint = _this5.props.alignPoint;

        if (!alignPoint || !point) return;

        _this5.setState({
          point: {
            pageX: point.pageX,
            pageY: point.pageY
          }
        });
      };

      this.handlePortalUpdate = function () {
        if (_this5.prevPopupVisible !== _this5.state.popupVisible) {
          _this5.props.afterPopupVisibleChange(_this5.state.popupVisible);
        }
      };

      this.savePopup = function (node) {
        _this5._component = node;
      };
    };

    var autoAdjustOverflow = {
      adjustX: 1,
      adjustY: 1
    };

    var targetOffset = [0, 0];

    var placements = {
      left: {
        points: ['cr', 'cl'],
        overflow: autoAdjustOverflow,
        offset: [-4, 0],
        targetOffset: targetOffset
      },
      right: {
        points: ['cl', 'cr'],
        overflow: autoAdjustOverflow,
        offset: [4, 0],
        targetOffset: targetOffset
      },
      top: {
        points: ['bc', 'tc'],
        overflow: autoAdjustOverflow,
        offset: [0, -4],
        targetOffset: targetOffset
      },
      bottom: {
        points: ['tc', 'bc'],
        overflow: autoAdjustOverflow,
        offset: [0, 4],
        targetOffset: targetOffset
      },
      topLeft: {
        points: ['bl', 'tl'],
        overflow: autoAdjustOverflow,
        offset: [0, -4],
        targetOffset: targetOffset
      },
      leftTop: {
        points: ['tr', 'tl'],
        overflow: autoAdjustOverflow,
        offset: [-4, 0],
        targetOffset: targetOffset
      },
      topRight: {
        points: ['br', 'tr'],
        overflow: autoAdjustOverflow,
        offset: [0, -4],
        targetOffset: targetOffset
      },
      rightTop: {
        points: ['tl', 'tr'],
        overflow: autoAdjustOverflow,
        offset: [4, 0],
        targetOffset: targetOffset
      },
      bottomRight: {
        points: ['tr', 'br'],
        overflow: autoAdjustOverflow,
        offset: [0, 4],
        targetOffset: targetOffset
      },
      rightBottom: {
        points: ['bl', 'br'],
        overflow: autoAdjustOverflow,
        offset: [4, 0],
        targetOffset: targetOffset
      },
      bottomLeft: {
        points: ['tl', 'bl'],
        overflow: autoAdjustOverflow,
        offset: [0, 4],
        targetOffset: targetOffset
      },
      leftBottom: {
        points: ['br', 'bl'],
        overflow: autoAdjustOverflow,
        offset: [-4, 0],
        targetOffset: targetOffset
      }
    };

    var Content = function (_React$Component) {
      _inherits(Content, _React$Component);

      function Content() {
        _classCallCheck(this, Content);

        return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
      }

      Content.prototype.componentDidUpdate = function componentDidUpdate() {
        var trigger = this.props.trigger;

        if (trigger) {
          trigger.forcePopupAlign();
        }
      };

      Content.prototype.render = function render() {
        var _props = this.props,
            overlay = _props.overlay,
            prefixCls = _props.prefixCls,
            id = _props.id;

        return React__default.createElement(
          'div',
          { className: prefixCls + '-inner', id: id, role: 'tooltip' },
          typeof overlay === 'function' ? overlay() : overlay
        );
      };

      return Content;
    }(React__default.Component);

    Content.propTypes = {
      prefixCls: propTypes.string,
      overlay: propTypes.oneOfType([propTypes.node, propTypes.func]).isRequired,
      id: propTypes.string,
      trigger: propTypes.any
    };

    var Tooltip = function (_Component) {
      _inherits(Tooltip, _Component);

      function Tooltip() {
        var _temp, _this, _ret;

        _classCallCheck(this, Tooltip);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.getPopupElement = function () {
          var _this$props = _this.props,
              arrowContent = _this$props.arrowContent,
              overlay = _this$props.overlay,
              prefixCls = _this$props.prefixCls,
              id = _this$props.id;

          return [React__default.createElement(
            'div',
            { className: prefixCls + '-arrow', key: 'arrow' },
            arrowContent
          ), React__default.createElement(Content, {
            key: 'content',
            trigger: _this.trigger,
            prefixCls: prefixCls,
            id: id,
            overlay: overlay
          })];
        }, _this.saveTrigger = function (node) {
          _this.trigger = node;
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      Tooltip.prototype.getPopupDomNode = function getPopupDomNode() {
        return this.trigger.getPopupDomNode();
      };

      Tooltip.prototype.render = function render() {
        var _props = this.props,
            overlayClassName = _props.overlayClassName,
            trigger = _props.trigger,
            mouseEnterDelay = _props.mouseEnterDelay,
            mouseLeaveDelay = _props.mouseLeaveDelay,
            overlayStyle = _props.overlayStyle,
            prefixCls = _props.prefixCls,
            children = _props.children,
            onVisibleChange = _props.onVisibleChange,
            afterVisibleChange = _props.afterVisibleChange,
            transitionName = _props.transitionName,
            animation = _props.animation,
            placement = _props.placement,
            align = _props.align,
            destroyTooltipOnHide = _props.destroyTooltipOnHide,
            defaultVisible = _props.defaultVisible,
            getTooltipContainer = _props.getTooltipContainer,
            restProps = _objectWithoutProperties(_props, ['overlayClassName', 'trigger', 'mouseEnterDelay', 'mouseLeaveDelay', 'overlayStyle', 'prefixCls', 'children', 'onVisibleChange', 'afterVisibleChange', 'transitionName', 'animation', 'placement', 'align', 'destroyTooltipOnHide', 'defaultVisible', 'getTooltipContainer']);

        var extraProps = _extends$1({}, restProps);
        if ('visible' in this.props) {
          extraProps.popupVisible = this.props.visible;
        }
        return React__default.createElement(
          Trigger,
          _extends$1({
            popupClassName: overlayClassName,
            ref: this.saveTrigger,
            prefixCls: prefixCls,
            popup: this.getPopupElement,
            action: trigger,
            builtinPlacements: placements,
            popupPlacement: placement,
            popupAlign: align,
            getPopupContainer: getTooltipContainer,
            onPopupVisibleChange: onVisibleChange,
            afterPopupVisibleChange: afterVisibleChange,
            popupTransitionName: transitionName,
            popupAnimation: animation,
            defaultPopupVisible: defaultVisible,
            destroyPopupOnHide: destroyTooltipOnHide,
            mouseLeaveDelay: mouseLeaveDelay,
            popupStyle: overlayStyle,
            mouseEnterDelay: mouseEnterDelay
          }, extraProps),
          children
        );
      };

      return Tooltip;
    }(React.Component);

    Tooltip.propTypes = {
      trigger: propTypes.any,
      children: propTypes.any,
      defaultVisible: propTypes.bool,
      visible: propTypes.bool,
      placement: propTypes.string,
      transitionName: propTypes.oneOfType([propTypes.string, propTypes.object]),
      animation: propTypes.any,
      onVisibleChange: propTypes.func,
      afterVisibleChange: propTypes.func,
      overlay: propTypes.oneOfType([propTypes.node, propTypes.func]).isRequired,
      overlayStyle: propTypes.object,
      overlayClassName: propTypes.string,
      prefixCls: propTypes.string,
      mouseEnterDelay: propTypes.number,
      mouseLeaveDelay: propTypes.number,
      getTooltipContainer: propTypes.func,
      destroyTooltipOnHide: propTypes.bool,
      align: propTypes.object,
      arrowContent: propTypes.any,
      id: propTypes.string
    };
    Tooltip.defaultProps = {
      prefixCls: 'rc-tooltip',
      mouseEnterDelay: 0,
      destroyTooltipOnHide: false,
      mouseLeaveDelay: 0.1,
      align: {},
      placement: 'right',
      trigger: ['hover'],
      arrowContent: null
    };

    function createSliderWithTooltip(Component) {
      var _class, _temp;

      return _temp = _class = function (_React$Component) {
        _inherits(ComponentWrapper, _React$Component);

        function ComponentWrapper(props) {
          _classCallCheck(this, ComponentWrapper);

          var _this = _possibleConstructorReturn(this, (ComponentWrapper.__proto__ || Object.getPrototypeOf(ComponentWrapper)).call(this, props));

          _this.handleTooltipVisibleChange = function (index, visible) {
            _this.setState(function (prevState) {
              return {
                visibles: _extends$1({}, prevState.visibles, _defineProperty({}, index, visible))
              };
            });
          };

          _this.handleWithTooltip = function (_ref) {
            var value = _ref.value,
                dragging = _ref.dragging,
                index = _ref.index,
                disabled = _ref.disabled,
                restProps = _objectWithoutProperties(_ref, ['value', 'dragging', 'index', 'disabled']);

            var _this$props = _this.props,
                tipFormatter = _this$props.tipFormatter,
                tipProps = _this$props.tipProps,
                handleStyle = _this$props.handleStyle;

            var _tipProps$prefixCls = tipProps.prefixCls,
                prefixCls = _tipProps$prefixCls === undefined ? 'rc-slider-tooltip' : _tipProps$prefixCls,
                _tipProps$overlay = tipProps.overlay,
                overlay = _tipProps$overlay === undefined ? tipFormatter(value) : _tipProps$overlay,
                _tipProps$placement = tipProps.placement,
                placement = _tipProps$placement === undefined ? 'top' : _tipProps$placement,
                _tipProps$visible = tipProps.visible,
                visible = _tipProps$visible === undefined ? false : _tipProps$visible,
                restTooltipProps = _objectWithoutProperties(tipProps, ['prefixCls', 'overlay', 'placement', 'visible']);

            var handleStyleWithIndex = void 0;
            if (Array.isArray(handleStyle)) {
              handleStyleWithIndex = handleStyle[index] || handleStyle[0];
            } else {
              handleStyleWithIndex = handleStyle;
            }

            return React__default.createElement(
              Tooltip,
              _extends$1({}, restTooltipProps, {
                prefixCls: prefixCls,
                overlay: overlay,
                placement: placement,
                visible: !disabled && (_this.state.visibles[index] || dragging) || visible,
                key: index
              }),
              React__default.createElement(Handle, _extends$1({}, restProps, {
                style: _extends$1({}, handleStyleWithIndex),
                value: value,
                onMouseEnter: function onMouseEnter() {
                  return _this.handleTooltipVisibleChange(index, true);
                },
                onMouseLeave: function onMouseLeave() {
                  return _this.handleTooltipVisibleChange(index, false);
                }
              }))
            );
          };

          _this.state = { visibles: {} };
          return _this;
        }

        _createClass(ComponentWrapper, [{
          key: 'render',
          value: function render() {
            return React__default.createElement(Component, _extends$1({}, this.props, { handle: this.handleWithTooltip }));
          }
        }]);

        return ComponentWrapper;
      }(React__default.Component), _class.propTypes = {
        tipFormatter: propTypes.func,
        handleStyle: propTypes.oneOfType([propTypes.object, propTypes.arrayOf(propTypes.object)]),
        tipProps: propTypes.object
      }, _class.defaultProps = {
        tipFormatter: function tipFormatter(value) {
          return value;
        },

        handleStyle: [{}],
        tipProps: {}
      }, _temp;
    }

    Slider$1.Range = Range$1;
    Slider$1.Handle = Handle;
    Slider$1.createSliderWithTooltip = createSliderWithTooltip;

    var SliderWithTooltip = createSliderWithTooltip(Slider$1);
    var FloatSlider = /** @class */ (function (_super) {
        __extends(FloatSlider, _super);
        function FloatSlider(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                value: 0
            };
            _this.onInputChange = _this.onInputChange.bind(_this);
            _this.onSliderChange = _this.onSliderChange.bind(_this);
            _this.onSubmitChange = _this.onSubmitChange.bind(_this);
            return _this;
        }
        FloatSlider.prototype.onSubmitChange = function (value) {
            var _a = this.props, onChange = _a.onChange, delay = _a.delay;
            if (onChange) {
                setTimeout(function () { return onChange(value); }, delay);
            }
        };
        FloatSlider.prototype.onSliderChange = function (value) {
            this.setState({ value: value });
        };
        FloatSlider.prototype.onInputChange = function (e) {
            this.setState({ value: e.target.value });
            this.onSubmitChange(e.target.value);
        };
        FloatSlider.prototype.render = function () {
            var _a = this.props, min = _a.min, max = _a.max, step = _a.step, description = _a.description, showValue = _a.showValue, marks = _a.marks;
            var value = this.props.value === undefined ? this.state.value : this.props.value;
            return (React.createElement("div", { className: "rm-slider", style: { display: 'table', clear: 'both', width: 300, margin: '8px 16px' } },
                description && React.createElement("div", { style: { float: 'left', width: '30%' } }, description),
                React.createElement("div", { style: { width: '46%', float: 'left', marginTop: '8' } },
                    React.createElement(SliderWithTooltip, { min: min, max: max, step: step, marks: marks, value: value, onChange: this.onSliderChange, onAfterChange: this.onSubmitChange })),
                showValue && (React.createElement("div", { style: { width: '20%', float: 'right' } },
                    React.createElement("input", { type: "number", style: { width: 40, height: 20 }, step: step, value: value, onChange: this.onInputChange })))));
        };
        FloatSlider.defaultProps = {
            min: 0.0,
            max: 1.0,
            step: 0.01,
            showValue: true,
            delay: 300
        };
        return FloatSlider;
    }(React.Component));
    var Widgets = /** @class */ (function (_super) {
        __extends(Widgets, _super);
        function Widgets(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {};
            return _this;
        }
        Widgets.prototype.render = function () {
            var _a = this.props, onMinSupportChange = _a.onMinSupportChange, onMinFidelityChange = _a.onMinFidelityChange;
            var supportMarks = {};
            var marks = [0.0, 0.05, 0.1, 0.15, 0.2];
            marks.forEach(function (i) {
                supportMarks[i] = String(i);
            });
            var fidelityMarks = {};
            marks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
            marks.forEach(function (i) {
                fidelityMarks[i] = String(i);
            });
            return (React.createElement("div", { className: "rm-widgets" },
                React.createElement("div", { style: { float: 'left' } },
                    React.createElement(FloatSlider, { description: "Minimum Support", min: 0.0, max: 0.2, step: 0.01, marks: supportMarks, onChange: onMinSupportChange })),
                React.createElement("div", { style: { float: 'left' } },
                    React.createElement(FloatSlider, { description: "Minimum Fidelity", min: 0.0, max: 1.0, step: 0.01, marks: fidelityMarks, onChange: onMinFidelityChange }))));
        };
        return Widgets;
    }(React.Component));

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
            var _this = _super.call(this, props) || this;
            _this.onMinSupportChange = _this.onMinSupportChange.bind(_this);
            _this.onMinFidelityChange = _this.onMinFidelityChange.bind(_this);
            _this.state = {
                minSupport: 0.0,
                minFidelity: 0.0,
            };
            return _this;
        }
        RuleMatrixApp.prototype.onMinSupportChange = function (value) {
            this.setState({ minSupport: value });
        };
        RuleMatrixApp.prototype.onMinFidelityChange = function (value) {
            this.setState({ minFidelity: value });
        };
        RuleMatrixApp.prototype.render = function () {
            var _a = this.props, model = _a.model, streams = _a.streams, support = _a.support, input = _a.input, styles = _a.styles, id = _a.id, widgets = _a.widgets;
            var _b = this.state, minSupport = _b.minSupport, minFidelity = _b.minFidelity;
            var height = (styles && styles.height) ? styles.height : 960;
            var width = (styles && styles.width) ? styles.width : 800;
            var rmStyles = __assign({}, styles, { minSupport: minSupport, minFidelity: minFidelity });
            return (React.createElement("div", null,
                widgets &&
                    React.createElement(Widgets, { onMinSupportChange: this.onMinSupportChange, onMinFidelityChange: this.onMinFidelityChange }),
                React.createElement("svg", { id: id || 'main', height: height, width: width },
                    model &&
                        React.createElement(Patterns, { labels: model.meta.labelNames, color: styles && styles.color }),
                    model && streams && support &&
                        React.createElement(RuleMatrix, __assign({ model: model, streams: streams, support: support, input: input }, rmStyles)),
                    model &&
                        React.createElement(Legend, { labels: model.meta.labelNames, color: styles && styles.color, transform: "translate(150, 10)" }))));
        };
        return RuleMatrixApp;
    }(React.Component));

    exports.RuleMatrix = RuleMatrix;
    exports.RuleMatrixApp = RuleMatrixApp;
    exports.isSurrogate = isSurrogate;
    exports.createStreams = createStreams;
    exports.createConditionalStreams = createConditionalStreams;
    exports.isConditionalStreams = isConditionalStreams;
    exports.DataSet = DataSet;
    exports.Matrix = Matrix;
    exports.isSupportMat = isSupportMat;
    exports.updateRuleSupport = updateRuleSupport;
    exports.isRuleGroup = isRuleGroup;
    exports.isRuleModel = isRuleModel;
    exports.RuleList = RuleList;
    exports.groupRules = groupRules;
    exports.groupRulesBy = groupRulesBy;
    exports.groupBySupport = groupBySupport;
    exports.rankRuleFeatures = rankRuleFeatures;
    exports.rankModelFeatures = rankModelFeatures;
    exports.HistPainter = HistPainter;
    exports.StreamPainter = StreamPainter;
    exports.googleColor = googleColor;
    exports.defaultColor = defaultColor;
    exports.labelColor = labelColor;
    exports.sequentialColors = sequentialColors;
    exports.divergingColors = divergingColors;
    exports.defaultDuration = defaultDuration;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
/* https://github.com/rulematrix/rule-matrix-js */

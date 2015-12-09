var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^\d+$/;
var reIsPlainProp = /^\w*$/;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
var reEscapeChar = /\\(\\)?/g;
var arrayTag = '[object Array]';
var numberTag = '[object Number]';
var stringTag = '[object String]';
var funcTag = '[object Function]';

function shimKeys(object) {
    var props = keysIn(object),
        propsLength = props.length,
        length = propsLength && object.length;

    var allowIndexes = !!length && isLength(length) &&
        (isArray(object) || isArguments(object));

    var index = -1,
        result = [];

    while (++index < propsLength) {
        var key = props[index];
        if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
            result.push(key);
        }
    }
    return result;
}

function keysIn(object) {
    if (object === null) {
        return [];
    }
    if (!isObject(object)) {
        object = Object(object);
    }
    var length = object.length;
    length = (length && isLength(length) &&
        (isArray(object) || isArguments(object)) && length) || 0;

    var Ctor = object.constructor,
        index = -1,
        isProto = typeof Ctor === 'function' && Ctor.prototype === object,
        result = Array(length),
        skipIndexes = length > 0;

    while (++index < length) {
        result[index] = (index + '');
    }
    for (var key in object) {
        if (!(skipIndexes && isIndex(key, length)) && !(key === 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
            result.push(key);
        }
    }
    return result;
}

function isKey(value, object) {
    var type = typeof value;
    if ((type === 'string' && reIsPlainProp.test(value)) || type === 'number') {
        return true;
    }
    if (isArray(value)) {
        return false;
    }
    var result = !reIsDeepProp.test(value);
    return result || (object !== null && value in toObject(object));
}

function include(array, target) {
    if (!isArray(array)) {
        return false;
    }
    for (var i in array) {
        if (array[i] === target) {
            return true;
        }
        if (array[i] !== undefined && target !== undefined) {
            if (array[i].toString() === target.toString()) {
                return true;
            }
        }
    }
    return false;
}

function isLength(value) {
    return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
}
function isArray(value) {
    return isObjectLike(value) && isLength(value.length) && Object.prototype.toString.call(value) === arrayTag;
}
function isArrayLike(value) {
    return value !== null && isLength(getLength(value));
}
function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type === 'object' || type === 'function');
}
function isObjectLike(value) {
    return !!value && typeof value === 'object';
}
function isNumber(value) {
    return typeof value === 'number' || (isObjectLike(value) && value.toString() === numberTag);
}
function isNaN(value) {
    // An `NaN` primitive is the only value that is not equal to itself.
    // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
    return isNumber(value) && value !== +value;
}
function isFinite(value) {
    return typeof value === 'number';
}
function isString(value) {
    return typeof value === 'string' || (isObjectLike(value) && value.toString() === stringTag);
}
function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in older versions of Chrome and Safari which return 'function' for regexes
    // and Safari 8 equivalents which return 'object' for typed array constructors.
    return isObject(value) && value.toString() === funcTag;
}
function toObject(value) {
    return isObject(value) ? value : Object(value);
}
function isArguments(value) {
    return isObjectLike(value) && isArrayLike(value) &&
        value.hasOwnProperty('callee') && !Object.prototype.propertyIsEnumerable.call(value, 'callee');
}
function isIndex(value, length) {
    value = (typeof value === 'number' || reIsUint.test(value)) ? +value : -1;
    length = length === null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 === 0 && value < length;
}

function has(object, path) {
    if (object === null) {
        return false;
    }
    var result = hasOwnProperty.call(object, path);
    if (!result && !isKey(path)) {
        path = toPath(path);
        object = path.length === 1 ? object : baseGet(object, path.slice(0, -1));
        if (object === null) {
            return false;
        }
        path = last(path);
        result = hasOwnProperty.call(object, path);
    }
    return result || (isLength(object.length) && isIndex(path, object.length) &&
        (isArray(object) || isArguments(object)));
}
function toPath(value) {
    if (isArray(value)) {
        return value;
    }
    var result = [];
    value.toString().replace(rePropName, function (match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
}
function baseGet(object, path, pathKey) {
    if (object === null) {
        return;
    }
    if (pathKey !== undefined && pathKey in toObject(object)) {
        path = [pathKey];
    }
    var index = 0,
        length = path.length;

    while (object !== null && index < length) {
        object = object[path[index++]];
    }
    return (index && index === length) ? object : undefined;
}
function last(array) {
    var length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
}
function isEmpty(value) {
    if (value === null) {
        return true;
    }
    if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
        (isObjectLike(value) && isFunction(value.splice)))) {
        return !value.length;
    }
    return !shimKeys(value).length;
}

function baseProperty(key) {
    return function (object) {
        return object === null ? undefined : object[key];
    };
}
var getLength = baseProperty('length');

exports.keys = shimKeys;
exports.include = include;
exports.isObject = isObject;
exports.isArray = isArray;
exports.has = has;
exports.isKey = isKey;
exports.isEmpty = isEmpty;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isNaN = isNaN;
exports.isFinite = isFinite;
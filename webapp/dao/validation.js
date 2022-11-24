function DataValidationException(message) {
    const error = new Error(message);
    return error;
}

DataValidationException.prototype = Object.create(Error.prototype);

function stringValidator(element) {
    let value = element.S;
    if (value) {
        return value;
    }

    throw new DataValidationException('expected string, but received ' + JSON.stringify(element));
}

function getAttribute(item, name, typeValidator, missingHandler) {
    let element = item[name];
    if (element) {
        return typeValidator(element);
    }

    return missingHandler();
}

function optionalAttribute(item, name, typeValidator) {
    return getAttribute(item, name, typeValidator, () => undefined);
}

function requiredAttribute(item, name, typeValidator) {
    return getAttribute(item, name, typeValidator, () => {
        throw new DataValidationException('missing required element ' + name);
    });
}

function requiredString(item, name) {
    return requiredAttribute(item, name, stringValidator);
}

function optionalString(item, name) {
    return optionalAttribute(item, name, stringValidator);
}

module.exports = {
    DataValidationException: DataValidationException,
    stringValidator: stringValidator,
    getAttribute: getAttribute,
    optionalAttribute: optionalAttribute,
    optionalString: optionalString,
    requiredAttribute: requiredAttribute,
    requiredString: requiredString
}
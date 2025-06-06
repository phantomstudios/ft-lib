function sanitise(str) {
  return typeof str === "string" ? str.trim() : str;
}

function assignIfUndefined(subject, target) {
  for (const prop in subject) {
    if (!target[prop]) {
      target[prop] = subject[prop];
    } else {
      console.warn(`You can't set a custom property called ${prop}`);
    }
  }
}

const elementPropertiesToCollect = [
  "nodeName",
  "className",
  "id",
  "href",
  "text",
  "role",
];

// For a given container element, get the number of elements that match the
// original element (siblings); and the index of the original element (position).
const getSiblingsAndPosition = (el, originalEl, selector) => {
  const siblings = Array.from(el.querySelectorAll(selector));
  const position = siblings.findIndex((item) => item === originalEl);
  if (position === -1) {
    return;
  }
  return {
    siblings: siblings.length,
    position,
  };
};

// Get all (sanitised) properties of a given element.
const getAllElementProperties = (el) =>
  elementPropertiesToCollect.reduce((returnObject, property) => {
    if (el[property]) {
      returnObject[property] = sanitise(el[property]);
    } else if (el.getAttribute(property)) {
      returnObject[property] = sanitise(el.getAttribute(property));
    } else if (el.hasAttribute(property)) {
      returnObject[property] = el.hasAttribute(property);
    }
    return returnObject;
  }, {});

// Get some properties of a given element.
const getDomPathProps = (attrs, props) => {
  // Collect any attribute that matches given strings.
  attrs
    .filter((attribute) =>
      attribute.name.match(/^data-trackable|^data-o-|^aria-/i),
    )
    .forEach((attribute) => {
      props[attribute.name] = attribute.value;
    });

  return props;
};

// Get only the custom data-trackable-context-? properties of a given element
const getContextProps = (attrs, props, isOriginalEl) => {
  const customProps = {};

  // for the original element collect properties like className, nodeName
  if (isOriginalEl) {
    elementPropertiesToCollect.forEach((name) => {
      if (typeof props[name] !== "undefined" && name !== "id") {
        customProps[name] = props[name];
      }
    });
  }

  // Collect any attribute that matches given strings.
  attrs
    .filter((attribute) => attribute.name.match(/^data-trackable-context-/i))
    .forEach((attribute) => {
      customProps[attribute.name.replace("data-trackable-context-", "")] =
        attribute.value;
    });

  return customProps;
};

function getTrace(el) {
  const rootEl = document;
  const originalEl = el;
  const selector = originalEl.getAttribute("data-trackable")
    ? `[data-trackable="${originalEl.getAttribute("data-trackable")}"]`
    : originalEl.nodeName;
  const trace = [];
  const customContext = {};
  while (el && el !== rootEl) {
    const props = getAllElementProperties(el);
    const attrs = Array.from(el.attributes);
    let domPathProps = getDomPathProps(attrs, props);

    // If the element happens to have a data-trackable attribute, get the siblings
    // and position of the element (relative to the current element).
    if (domPathProps["data-trackable"]) {
      domPathProps = Object.assign(
        domPathProps,
        getSiblingsAndPosition(el, originalEl, selector),
      );
    }

    trace.push(domPathProps);

    const contextProps = getContextProps(attrs, props, el === originalEl);

    assignIfUndefined(contextProps, customContext);

    el = el.parentNode;
  }
  return { trace, customContext };
}

export default getTrace;

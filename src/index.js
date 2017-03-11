import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import {toCamelCase} from 'case-converter';

var components = {},
  mountedComponents = {};

export function registerComponent(name, component) {
  components[name] = component;
}

function mount(component, props, rootNode, config) {
  let element = React.createElement(
    component,
    parseProps(props, {camelCase: config.camelCase}),
    null
  );
  return ReactDOM.render(
    element, rootNode
  );
}

function parseProps(props, {camelCase = true}) {
  props = _.mapValues(props, (value, key, object) => {
    if (_.isObject(value) && _.isEqual(_.keys(value), ['$component']))
      return () => mountedComponents[value.$component];
    return value;
  });
  if (camelCase) props = toCamelCase(props);
  return props;
}

function getRootNode(scriptNode) {
  let rootNode = document.getElementById(scriptNode.id + '-root');
  if (rootNode) return rootNode;
  rootNode = document.createElement('div');
  rootNode.id = scriptNode.id + '-root';
  scriptNode.parentNode.insertBefore(rootNode, scriptNode);
  return rootNode;
}

export function mountAll(config = {}) {
  // Set defaults
  config = _.extend({
    camelCase: true
  }, config);

  // Get all scripts
  let scripts = document.querySelectorAll('script[data-component]');
  for (let i = 0; i < scripts.length; i++) {
    let script = scripts[i];
    // Ensure script has an id
    if (typeof script.id === 'undefined') continue;

    // Ensure component is not already mounted
    if (typeof mountedComponents[script.id] !== 'undefined') continue;

    // Create root for element
    let root = getRootNode(script);

    let props;
    try {
      props = JSON.parse(script.innerHTML.trim());
    } catch (err) {
      props = {};
    }

    // Mount component
    mountedComponents[script.id] = mount(
      components[script.dataset.component],
      props,
      root,
      config
    );
  }
}

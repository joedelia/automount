import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';
import {toCamelCase} from 'case-converter';

var components = {},
  mountedComponents = {},
  config = {
    camelCase: true,
    unmountRemovedComponents: true,
    defaultProps: {}
  };

export function _configure(newConfig) {
  _.extend(config, newConfig);
}

export function registerComponent(name, component) {
  if (typeof component === 'undefined' && typeof name === 'function') {
    component = name;
    name = component.name;
  }
  components[name] = component;
}

function mount(component, props, rootNode, config) {
  let element = React.createElement(
    component,
    parseProps(_.extend({}, props, config.defaultProps), {camelCase: config.camelCase}),
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

export function getMountedComponent(component) {
  return mountedComponents[component];
}

function inDocument(node) {
  return document.contains(node);
}

function unmountComponent(component) {
  ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(component).parentNode);
}

function isRemoved(component) {
  return !inDocument(ReactDOM.findDOMNode(component).parentNode);
}

function unmountRemovedComponents() {
  var previouslyMountedComponents = _.extend({}, mountedComponents);
  for (let componentId in previouslyMountedComponents) {
    if (!previouslyMountedComponents.hasOwnProperty(componentId)) continue;
    if (isRemoved(previouslyMountedComponents[componentId])) {
      unmountComponent(previouslyMountedComponents[componentId]);
      delete previouslyMountedComponents[componentId];
    }
  }
}

export function mountAll() {
  // Set defaults
  if (config.unmountRemovedComponents) unmountRemovedComponents();

  // Get all scripts
  let scripts = document.querySelectorAll('script[data-component]');
  for (let i = 0; i < scripts.length; i++) {
    let script = scripts[i];
    // Ensure script has an id
    if (typeof script.id === 'undefined') {
      console.error('Auntomount scripts need to have an id');
      continue;
    }

    // Ensure component is not already mounted
    if (typeof mountedComponents[script.id] !== 'undefined') continue;

    // Ensure component is registered
    if (typeof components[script.dataset.component] === 'undefined') {
      console.error(script.dataset.component, 'is not registered with automount');
      continue;
    }

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

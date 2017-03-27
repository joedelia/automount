# automount
Automount is a simple library to automatically render react components on a server-rendered HTML page,
making the use of components on dynamic pages a breeze.

## Installation
To install automount with npm, run the following command:

```
npm install --save automount
```

## Usage
To use automount, you'll need to register all the components you like to mount like this:

```js
// index.js
import {registerComponent, mountAll} from 'automount';

import ComponentName from './path/to/component';
registerComponent(ComponentName);

// Then, when page is loaded:
mountAll();
```

### Mounting the components
To mount the components on an HTML page, use the following format

```html
  ...
    <!-- This will mount "TodoApp" here -->
    <script type="application/json" id="todo-app" data-component="TodoApp">
      {
        "todos": [
          "Buy Milk",
          "Send birthday card",
          "..."
        ],
        "otherProps": "Go here"
      }
    </script>
  ...
```

### Accessing mounted components
To get a reference to a mounted component you can use `getMountedComponent`.

```js
  import {getMountedComponent} from 'automount';
  var mountedComponent = getMountedComponent(componentId);
  // componentId would be the id attribute of the script tag that mounted the component.
```

You can pass a prop to a component with a reference to another mounted component like this:
```html
  <!-- Say this is a Notifications component with a .addNotification method... -->
  <script id="notification-widget" data-component="Notifications"></script>

  <!-- And we have a form which wants to send a notification -->
  <script type="application/json" id="contact-form" data-component="ContactForm">
    {
      "getNotifications": {
        "$component": "notification-widget"
      },
      "otherProps": "Go here"
    }
  </script>
```

This will give `ContactForm` access to the `Notifications` component by calling
`this.props.getNotifications()`.

### Config
To update the configuration of automount, use `_configure`.
```js
  import {_configure} from 'automount';
  _configure({camelCase: false});
```
The options are:
- `camelCase` (defaults to `true`): This will reursively convert all prop keys to camel case.
- `unmountRemovedComponents` (defaults to `true`): This will automatically unmount components removed from
the document tree when `mountAll` is called. This is useful to automatically unmount components after an ajax request.
- `defaultProps` (defaults to `{}`): Default props to pass to all components.

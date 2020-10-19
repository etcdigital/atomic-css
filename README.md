<p align="center">
	<img alt="@atmc/core" src="./assets/logo.svg" width="100">
</p>	

# atmc

<a href="https://www.npmjs.com/package/@atmc/css"><img alt="npm" src="https://img.shields.io/npm/v/@atmc/css"></a>

> atmc is short for atomic

And that is the proposal of the package, minimize the addition of styles and eliminate unnecessary css.

@atmc provides a reusable html class name process, eliminating any duplication of styles and minimizing on demand. Styles are added automatically to the page without any additional effort.


## @atmc/core - the logic

The @atmc/core has everything to work in @atmc/css and @atmc/ssr, but not pre-configured.

## @atmc/css - the client only package

The @atmc/css add the styles generated directly to browser stylesheet.

A example:
```js

import { css } from '@atmc/css';

const marginStyle = css({ margin: '0 auto 10rem' });
// marginStyle = 'o2qkn2'

const MyReactComponent = () => {
  return <div className={marginStyle}>Margin style<div>
}
```

# @atmc/core

Atomic CSS-in-JS with a featherweight runtime.

## Usage

### Introduction through examples

The code snippets below are deliberately framework-agnostic. Please refer to the [project's repository](https://github.com/etcdigital/atmc) for information about integrations.

#### Basic concepts of atomicity

```js
import { css } from "@atmc/core";

// Style rules are auto-injected to a `<style>` element in the `<head>`
document.querySelector("#element-1").className = css({ color: "red" });
document.querySelector("#element-2").className = css({ color: "blue" });

// Class names of identical rules match, as guaranteed by a hash function
console.assert(css({ color: "red" }) === css({ color: "  red  " }));

// In this case, a space-separated string of unique class names is returned
document.querySelector("#element-3").className = css({
  color: "red", // Reuses previously injected style
  ":hover": {
    color: "blue" // Newly injected because of the enclosing pseudo selector
  }
});
```

#### Numbers assigned to non-unitless properties are postfixed with "px"

```js
document.querySelector("#element-4").className = css({
  padding: 8, // Translates to "8px"
  lineHeight: 1.5 // Translates to "1.5" without a unit
});
```

#### At-rules like media queries can be used and combined with pseudos

```js
document.querySelector("#element-5").className = css({
  "@media": {
    "(min-width: 600px)": {
      color: "rebeccapurple",
      ":hover": {
        background: "papayawhip"
      }
    },
    "(min-width: 1000px)": {
      color: "teal"
    }
  }
});
```

#### Fallback values are accepted when auto-prefixing isn't enough

```js
document.querySelector("#element-6").className = css({
  display: "flex",
  justifyContent: ["space-around", "space-evenly"] // Last takes precedence
});
```

#### Using keyframes to animate values of given properties over time

```js
// A unique name is attached to the generated `@keyframes` rule
const pulse = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
});

// The former rule only gets injected upon usage, as it's lazily initialized
const className = css({
  animation: `${pulse} 3s infinite alternate`
});
```

#### Advanced selectors may be used as an escape hatch from strict atomicity

```js
const className = css({
  display: "flex",
  selectors: {
    // Always start with "&", representing the parent rule
    // See: https://drafts.csswg.org/css-nesting/#nest-selector
    "& > * + *": {
      marginLeft: 16
    },

    // In a comma-separated list, each individual selector shall start with "&"
    "&:focus, &:active": {
      outline: "solid"
    }
  }
});
```

### Server-side rendering

While prerendering a page, browser object models are inaccessible and thus, styles cannot be injected dynamically. However, a `VirtualInjector` can collect the styles instead of applying them through injection, as seen in the [Next.js example](https://github.com/etcdigital/atmc/tree/master/packages/example-nextjs):

```js
import { setup } from "@atmc/core";
import {
  filterOutUnusedRules,
  getStyleTag,
  VirtualInjector
} from "@atmc/core/server";

// Options may be customized, as shown later
export const sharedOptions = {};
const injector = VirtualInjector();

// Shall be called before the underlying page is rendered
setup({ ...sharedOptions, injector });

// Obtain HTML code of the page
let html = renderToString(element);

// Statically insert collected styles as the last element of `<head>`
const styleTag = getStyleTag(filterOutUnusedRules(injector, page.html));
html = html.replace("</head>", styleTag + "</head>");
```

During runtime, the same options should be provided before hydration, as shown below:

```js
import { hydrate, setup } from "@atmc/core";

import { sharedOptions } from "./server";

// Make sure to rehydrate only in browser environments
if (typeof window !== "undefined") {
  setup(options);
  hydrate();
}
```

### Deno support

For convenient resolution of the library, an [import map](https://deno.land/manual/linking_to_external_code/import_maps/) should be used. Unlike with Node, development and production builds are separated into different bundles.

```jsonc
/* import_map.json */

{
  "imports": {
    "@atmc/core/dev": "https://cdn.pika.dev/@atmc/core@X.Y.Z/runtime-deno-dev",
    "@atmc/core": "https://cdn.pika.dev/@atmc/core@X.Y.Z/runtime-deno"
  }
}
```

```shell
deno run --importmap=import_map.json --unstable mod.ts
```

## Security

User-specified data shall be escaped manually using [`CSS.escape()`](https://developer.mozilla.org/docs/Web/API/CSS/escape) or an equivalent method.

## Customization

### Injector options

#### `nonce`

In order to prevent harmful code injection on the web, a [Content Security Policy (CSP)](https://developer.mozilla.org/docs/Web/HTTP/CSP) may be put in place. During server-side rendering, a cryptographic nonce (number used once) may be embedded when generating a page on demand:

```js
import { VirtualInjector } from "@atmc/core/server";

// Usage with webpack: https://webpack.js.org/guides/csp/
const injector = VirtualInjector({ nonce: __webpack_nonce__ });
```

The same `nonce` parameter should be supplied to the client-side injector:

```js
import { CSSOMInjector, DOMInjector, setup } from "@atmc/core";

const isDev = process.env.NODE_ENV !== "production";
setup({
  injector: isDev
    ? DOMInjector({ nonce: __webpack_nonce__ })
    : CSSOMInjector({ nonce: __webpack_nonce__ })
});
```

#### `target`

Changes the destination of the injected rules. By default, a `<style id="__@atmc/core">` element in the `<head>` during runtime, which gets created if unavailable.

### Instance options

#### `prefix`

A custom auto-prefixer method may be used as a replacement for the built-in [`tiny-css-prefixer`](https://github.com/kitten/tiny-css-prefixer):

```js
import { setup } from "@atmc/core";
import { prefix as stylisPrefix } from "stylis"; // v4

setup({
  // A custom solution which weighs more than the default
  prefix: (property, value) => {
    const declaration = `${property}:${value};`;
    return (
      // The trailing `;` is removed for cleaner results
      stylisPrefix(declaration, property.length).slice(0, -1)
    );
  }
});
```

### Instance creation

Separate instances of @atmc/core are necessary when managing styles of multiple browsing contexts (e.g. an `<iframe>` besides the main document). This option should be used along with a custom `target` for injection:

```js
import { createInstance, CSSOMInjector } from "@atmc/core";

const iframeDocument = document.getElementsByTagName("iframe")[0]
  .contentDocument;

export const instance = createInstance();
instance.setup({
  injector: CSSOMInjector({
    // Make sure this node exists or create it on the fly if necessary
    target: iframeDocument.getElementById("@atmc/core")
  })
});
```

## What's missing

### Global styles

Being unique by nature, non-scoped styles should not be decomposed into atomic rules. This library doesn't support injecting global styles, as they may cause unexpected side-effects. However, ordinary CSS can still be used for style sheet normalization and defining the values of CSS Custom Properties.

Contrary to @atmc/core-managed styles, CSS referenced from a `<link>` tag may persist in the cache during page changes. Global styles are suitable for application-wide styling (e.g. normalization/reset), while inlining the scoped rules generated by @atmc/core accounts for faster page transitions due to the varying nature of per-page styles.

By omitting global styling functionality on purpose, @atmc/core can maintain its low bundle footprint while also encouraging performance-focused development patterns.

### Theming

Many CSS-in-JS libraries tend to ship their own theming solutions. Contrary to others, @atmc/core doesn't embrace a single recommended method, leaving more choices for developers. Concepts below are encouraged:

- CSS Custom Properties (with [a polyfill for IE 11](https://github.com/nuxodin/ie11CustomProperties))
- A singleton or value providers (e.g. [React Context](https://hu.reactjs.org/docs/context.html))

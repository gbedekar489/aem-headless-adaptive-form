# Headless AEM Adaptive Form with Node.js

## Overview

This code sample demonstrates how an **Adobe Experience Manager (AEM) Adaptive Form** can be consumed and rendered in a custom Node.js application using a headless approach.

The Adaptive Form is authored and managed in AEM Forms and exposed as a JSON form definition. A lightweight Node.js/Express endpoint retrieves the form model, while client-side JavaScript dynamically renders the form using standard HTML controls.

The sample demonstrates the following architecture:

```text
AEM Adaptive Form
        |
        v
/adobe/forms/af/{FORM_ID}
        |
        v
Node.js / Express
        |
        v
Adaptive Form JSON
        |
        v
Custom JavaScript Renderer
        |
        v
HTML Form
```

The application does not hard-code the fields defined in the Adaptive Form. It traverses the form model and dynamically renders supported components.

Users can enter the URL of a published AEM Adaptive Form directly in the application and select **Load Form** to render it.

## Project Structure

```text
aem-headless-form-demo/
├── public/
│   ├── index.html
│   ├── adaptive-form.js
│   └── styles.css
├── routes/
│   └── adaptive-form.js
├── server.js
├── package.json
└── README.md
```

## JavaScript Components

### `server.js`

The main entry point for the Node.js application.

It:

- Creates and configures the Express application.
- Serves static files from the `public` directory.
- Registers the `/api/adaptive-form` API route.
- Starts the HTTP server.

### `routes/adaptive-form.js`

Provides the server-side integration with AEM Forms.

It:

- Receives the Adaptive Form URL from the client.
- Calls the AEM Forms endpoint to retrieve the form definition.
- Returns the Adaptive Form JSON to the browser.

The route acts as a lightweight proxy between the custom application and AEM Forms.

```text
Browser
   |
   | GET /api/adaptive-form
   v
Node.js
   |
   | GET /adobe/forms/af/{FORM_ID}
   v
AEM Forms
```

### `public/adaptive-form.js`

Provides the client-side Adaptive Form renderer.

It:

- Calls the Node.js `/api/adaptive-form` endpoint.
- Reads the `afModelDefinition` returned by AEM Forms.
- Traverses the form's `:items` and `:itemsOrder` structure.
- Recursively processes panels and their fields.
- Maps supported Adaptive Form field types to standard HTML controls.
- Uses properties from the AEM form model such as labels, field names, visibility, enabled state, and drop-down values.

The renderer does not contain knowledge of the fields in a specific form. A supported field added to the Adaptive Form in AEM can therefore be discovered and rendered without adding field-specific code.

## Supported Components

The sample currently demonstrates rendering of:

- Panels
- Text inputs
- Email inputs
- Telephone inputs
- Date inputs
- Drop-down lists

Additional Adaptive Form component types can be supported by extending the client-side `renderField()` function.

## Running the Sample

Install the dependencies:

```bash
npm install
```

Start the Node.js application:

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

Enter the URL of a **published AEM Adaptive Form** using the following format:

```text
https://<aem-publish-host>/adobe/forms/af/<FORM_ID>
```

Select **Load Form**.

The application retrieves the Adaptive Form definition from AEM and dynamically renders the supported fields.

## Example Adaptive Form URL

An Adaptive Form exposed through AEM Forms uses a URL similar to:

```text
https://publish-<program>-<environment>.adobeaemcloud.com/adobe/forms/af/<FORM_ID>
```

The `<FORM_ID>` identifies the Adaptive Form whose JSON definition should be retrieved.

## How It Works

When **Load Form** is selected:

1. The browser sends the Adaptive Form URL to the Node.js application.
2. The Node.js route retrieves the Adaptive Form JSON from AEM Forms.
3. The browser receives the `afModelDefinition`.
4. The client-side renderer traverses the form model.
5. Supported AEM Adaptive Form components are converted into standard HTML controls.

```text
Published Adaptive Form
        |
        v
Adaptive Form JSON
        |
        v
Node.js Proxy
        |
        v
Client-side Renderer
        |
        v
Custom Headless UI
```

## Extending the Renderer

Support for additional Adaptive Form field types can be added to:

```javascript
renderField()
```

For example:

```javascript
if (field.fieldType === "radio-group") {
  // Render radio buttons
}
```

This allows the headless application to determine how each AEM Forms component should be represented in the custom user interface.

## Scope

This sample intentionally focuses on **retrieving and rendering an Adaptive Form headlessly**.

It does not attempt to implement the complete AEM Adaptive Forms runtime, including all components, rules, validation, repeatable panels, submission actions, or other advanced capabilities.

It is intended as a lightweight reference implementation demonstrating the separation between:

- **Form authoring and management in AEM Forms**
- **Form presentation in a custom application**

## License

This project is provided as a sample for demonstration and educational purposes.

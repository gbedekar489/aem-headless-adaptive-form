async function loadAdaptiveForm() {
  const formUrl =
    document
      .getElementById("form-url")
      .value
      .trim();

  const loading =
    document.getElementById("loading");

  const error =
    document.getElementById("error");

  const formElement =
    document.getElementById(
      "adaptive-form"
    );

  if (!formUrl) {
    error.textContent =
      "Enter an AEM Adaptive Form URL.";

    return;
  }

  try {
    error.textContent = "";

    loading.style.display =
      "block";

    // Clear previously rendered form
    formElement.innerHTML = "";

    const response = await fetch(
      `/api/adaptive-form?url=${encodeURIComponent(formUrl)}`
    );

    const responseJson =
      await response.json();

    if (!response.ok) {
      throw new Error(
        responseJson.error ||
        `API returned ${response.status}`
      );
    }

    const formModel =
      responseJson.afModelDefinition;

    if (!formModel) {
      throw new Error(
        "afModelDefinition is missing"
      );
    }

    document.getElementById(
      "form-title"
    ).textContent =
      formModel.title ||
      "Adaptive Form";

    renderContainer(
      formModel,
      formElement
    );

    loading.style.display =
      "none";

  } catch (err) {
    console.error(
      "FORM LOAD ERROR:",
      err
    );

    loading.style.display =
      "none";

    error.textContent =
      `Unable to load the form: ${err.message}`;
  }
}


/*
 * Render a container.
 *
 * A container can be:
 * - the Adaptive Form itself
 * - a panel
 *
 * Both use:
 *
 * :items
 * :itemsOrder
 */
function renderContainer(
  container,
  parentElement
) {
  const items =
    container[":items"] || {};

  const itemOrder =
    container[":itemsOrder"] ||
    Object.keys(items);

  itemOrder.forEach(itemName => {
    const item =
      items[itemName];

    if (!item) {
      return;
    }

    if (item.visible === false) {
      return;
    }

    // Panel
    if (item.fieldType === "panel") {
      renderPanel(
        item,
        parentElement
      );

      return;
    }

    // Ignore AEM buttons in this tutorial.
    if (item.fieldType === "button") {
      return;
    }

    renderField(
      item,
      parentElement
    );
  });
}


/*
 * Render an AEM panel.
 */
function renderPanel(
  panel,
  parentElement
) {
  const section =
    document.createElement("section");

  section.className =
    "form-panel";

  if (panel.label?.value) {
    const heading =
      document.createElement("h2");

    heading.textContent =
      panel.label.value;

    section.appendChild(
      heading
    );
  }

  // Panels can contain fields
  // or other panels.
  renderContainer(
    panel,
    section
  );

  parentElement.appendChild(
    section
  );
}


/*
 * Render an individual Adaptive Form field.
 */
function renderField(
  field,
  parentElement
) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    "form-field";

  const label =
    document.createElement("label");

  label.textContent =
    field.label?.value ||
    field.name ||
    "Field";

  let control;


  // ------------------------------------------
  // Text input
  // ------------------------------------------

  if (
    field.fieldType === "text-input"
  ) {
    control =
      document.createElement("input");

    control.type = "text";
  }


  // ------------------------------------------
  // Email
  // ------------------------------------------

  else if (
    field.fieldType === "email"
  ) {
    control =
      document.createElement("input");

    control.type = "email";
  }


  // ------------------------------------------
  // Telephone
  // ------------------------------------------

  else if (
    field.fieldType === "tel"
  ) {
    control =
      document.createElement("input");

    control.type = "tel";
  }


  // ------------------------------------------
  // Date
  // ------------------------------------------

  else if (
    field.fieldType === "date-input"
  ) {
    control =
      document.createElement("input");

    control.type = "date";
  }


  // ------------------------------------------
  // Dropdown
  // ------------------------------------------

  else if (
    field.fieldType === "drop-down"
  ) {
    control =
      createDropdown(field);
  }


  // ------------------------------------------
  // Unsupported
  // ------------------------------------------

  else {
  console.warn(
    `Unsupported Adaptive Form field type: ${field.fieldType}`,
    field
  );

  const unsupported =
    document.createElement("div");

  unsupported.className =
    "unsupported-field";

  unsupported.textContent =
    `Unsupported field type: ${field.fieldType}`;

  parentElement.appendChild(
    unsupported
  );

  return;
}

  // ------------------------------------------
  // Common field properties
  // ------------------------------------------

  control.id =
    field.id ||
    field.name;

  control.name =
    field.name;

  control.disabled =
    field.enabled === false;

  control.readOnly =
    field.readOnly === true;

  label.htmlFor =
    control.id;


  // Add field to page
  wrapper.appendChild(
    label
  );

  wrapper.appendChild(
    control
  );

  parentElement.appendChild(
    wrapper
  );
}


/*
 * Create an HTML select from the
 * AEM enum / enumNames properties.
 */
function createDropdown(field) {
  const select =
    document.createElement("select");

  // Placeholder
  const placeholder =
    document.createElement("option");

  placeholder.value = "";

  placeholder.textContent =
    "Please select";

  placeholder.disabled = true;
  placeholder.selected = true;

  select.appendChild(
    placeholder
  );


  const values =
    field.enum || [];

  const labels =
    field.enumNames || [];


  values.forEach(
    (value, index) => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        value;

      option.textContent =
        labels[index] !== undefined
          ? labels[index]
          : value;

      select.appendChild(
        option
      );
    }
  );

  return select;
}


/*
 * Start once the page has loaded.
 */
document
  .getElementById("load-form-button")
  .addEventListener(
    "click",
    loadAdaptiveForm
  );
var deleteButtons = document.querySelectorAll(".deleteBut");
var selectElements = document.querySelectorAll("select[name^='serveline']");

function validate(element) {
  // console.log(element.value);
  if (
    (element.classList.contains("PRI") &&
      (element.value == "" || element.value == "NULL")) ||
    (element.classList.contains("YES") &&
      (element.value == "" || element.value == "NULL"))
  ) {
    return { bool: true, data: false };
  }
  if (element.classList.contains("date")) {
    var newDate =
      element.value === undefined
        ? new Date(element.innerText)
        : element.value == ""
        ? new Date()
        : new Date(element.value);
    if (newDate == "Invalid Date") {
      return { bool: false, err: "Inavlid Date" };
    } else {
      return { bool: true, data: newDate.toISOString().slice(0, 10) };
    }
  }
  if (
    element.classList.contains("NO") &&
    (element.value == "" || element.value == "NULL") &&
    !element.classList.contains("PRI")
  ) {
    return { bool: false, err: "Field cannot be NULL" };
  }

  return {
    bool: true,
    data: element.value === undefined ? element.innerText : element.value,
  };
}

// Add event listener to the parent div
const radioContainer = document.querySelector("div");
radioContainer.addEventListener("change", handleRadioChange);

// Event handler function for when the radio buttons are toggled
function handleRadioChange(event) {
  if (event.target.type === "radio" && event.target.name === "isNewItem") {
    if (event.target.id === "existing") {
      document.getElementById("existingSpan").style.display = "inline";
      document.getElementById("newSpan").style.display = "none";
    } else if (event.target.id === "new") {
      document.getElementById("existingSpan").style.display = "none";
      document.getElementById("newSpan").style.display = "inline";
    }
  }
}

document
  .getElementById("menusform")
  .addEventListener("submit", handleMenusSubmit);

function handleMenusSubmit(event) {
  event.preventDefault(); // Prevents the default form submission
  const statuses = event.target.querySelectorAll(".error");
  statuses.forEach(function (status) {
    status.remove();
  });
  const forminputs = document
    .getElementById("menusform")
    .getElementsByClassName("datainput");

  // Retrieve form data
  var reqObject = {};
  for (let i = 0; i < forminputs.length; i++) {
    validateData = validate(forminputs[i]);
    if (validateData.bool) {
      reqObject[forminputs[i].previousElementSibling.getAttribute("for")] =
        validateData.data;
    } else {
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("error", "status");
      errorDiv.setAttribute("role", "alert");

      errorDiv.innerHTML = "<h3>❌ Error: " + validateData.err + "</h3>";
      forminputs[i].parentNode.insertBefore(
        errorDiv,
        forminputs[i].nextSibling
      );
      return;
    }
  }
  fetch("/api/createmenu", {
    method: "POST",
    body: JSON.stringify(reqObject),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((error) => {
          throw new Error(error);
        });
      }
      fetch("/api/forms/menu_items", {
        method: "POST",
        body: JSON.stringify(reqObject),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("menusAdditional").innerHTML = html;
          document
            .getElementById("menu_itemsform")
            .addEventListener("submit", handleMenuItemsSubmit);
          deleteButtons = document.querySelectorAll(".deleteBut");
          deleteButtons.forEach(deleteButton);
          selectElements = document.querySelectorAll(".serveline");
          selectElements.forEach(changeServeLine);
        })
        .catch((error) => {
          const errorDiv = document.createElement("div");
          errorDiv.classList.add("error", "status");
          errorDiv.setAttribute("role", "alert");

          errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
          event.target.appendChild(errorDiv);
        });
    })
    .catch((error) => {
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("error", "status");
      errorDiv.setAttribute("role", "alert");

      errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
      event.target.appendChild(errorDiv);
    });
}

function handleMenuItemsSubmit(event) {
  event.preventDefault(); // Prevents the default form submission
  const statuses = event.target.querySelectorAll(".error");
  statuses.forEach(function (status) {
    status.remove();
  });
  const forminputs = document.getElementsByClassName("datainput");

  // Retrieve form data
  var reqObject = {};
  for (let i = 0; i < forminputs.length; i++) {
    validateData = validate(forminputs[i]);
    if (validateData.bool) {
      if (validateData.data) {
        reqObject[forminputs[i].previousElementSibling.getAttribute("for")] =
          validateData.data;
      }
    } else {
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("error", "status");
      errorDiv.setAttribute("role", "alert");

      errorDiv.innerHTML = "<h3>❌ Error: " + validateData.err + "</h3>";
      forminputs[i].parentNode.insertBefore(
        errorDiv,
        forminputs[i].nextSibling
      );
      return;
    }
  }
  fetch("/api/createmenu_item", {
    method: "POST",
    body: JSON.stringify(reqObject),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      fetch("/api/forms/menu_items", {
        method: "POST",
        body: JSON.stringify(reqObject),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("menusAdditional").innerHTML = html;
          document
            .getElementById("menu_itemsform")
            .addEventListener("submit", handleMenuItemsSubmit);
          deleteButtons = document.querySelectorAll(".deleteBut");
          deleteButtons.forEach(deleteButton(button));
          selectElements = document.querySelectorAll(".serveline");
          selectElements.forEach(changeServeLine);
        })
        .catch((error) => {
          const errorDiv = document.createElement("div");
          errorDiv.classList.add("error", "status");
          errorDiv.setAttribute("role", "alert");

          errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
          event.target.appendChild(errorDiv);
        });
    })
    .catch((error) => {
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("error", "status");
      errorDiv.setAttribute("role", "alert");

      errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
      event.target.appendChild(errorDiv);
    });
}

function changeServeLine(select) {
  select.addEventListener("change", (event) => {
    const dateInput = document.querySelector("input.date");
    const mealTypeInput = document.querySelector("select.meal-type_id");
    const changedValue = event.target.value;
    const selectName = event.target.getAttribute("name");
    console.log("Dropdown with name:", selectName, "changed to:", changedValue);
    fetch("/api/updatemenu_items", {
      method: "PATCH",
      body: JSON.stringify({
        line: changedValue,
        date: dateInput.value,
        "meal-type_id": mealTypeInput.value,
        item: selectName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((error) => {
            throw new Error(error);
          });
        }
        handleMenusSubmit(event);
      })
      .catch((error) => {
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("error", "status");
        errorDiv.setAttribute("role", "alert");

        errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
        event.target.appendChild(errorDiv);
      });
  });
}

function deleteButton(button) {
  button.addEventListener("click", (event) => {
    const dateInput = document.querySelector("input.date");
    const mealTypeInput = document.querySelector("select.meal-type_id");
    const clickedButtonName = event.target.getAttribute("name");
    fetch("/api/deletemenu_items", {
      method: "DELETE",
      body: JSON.stringify({
        date: dateInput.value,
        "meal-type_id": mealTypeInput.value,
        item: clickedButtonName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      handleMenusSubmit(event);
    });
  });
}
// Add click event listeners to the delete buttons

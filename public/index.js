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
  }).then((response) => {
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
      });
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
  }).then((response) => {
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
      });
  });
}
// document
//   .getElementById("menusform")
//   .addEventListener("submit", function (event) {
//     event.preventDefault(); // Prevents the default form submission
//     const statuses = event.target.querySelectorAll(".error");
//     statuses.forEach(function (status) {
//       status.remove();
//     });
//     const forminputs = document.getElementsByClassName("datainput");

//     // Retrieve form data
//     var reqObject = {};
//     for (let i = 0; i < forminputs.length; i++) {
//       validateData = validate(forminputs[i]);
//       if (validateData.bool) {
//         reqObject[forminputs[i].previousElementSibling.getAttribute("for")] =
//           validateData.data;
//       } else {
//         const errorDiv = document.createElement("div");
//         errorDiv.classList.add("error", "status");
//         errorDiv.setAttribute("role", "alert");

//         errorDiv.innerHTML = "<h3>❌ Error: " + validateData.err + "</h3>";
//         forminputs[i].parentNode.insertBefore(
//           errorDiv,
//           forminputs[i].nextSibling
//         );
//         return;
//       }
//     }
//     fetch("/api/createmenu", {
//       method: "POST",
//       body: JSON.stringify(reqObject),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           return response.text().then((error) => {
//             throw new Error(error);
//           });
//         }
//         fetch("/api/forms/menu_items")
//           .then((response) => response.text())
//           .then((html) => {
//             document.getElementById("menusAdditional").innerHTML = html;
//             fetch("/api/forms/food-items")
//               .then((response) => response.text())
//               .then((html) => {
//                 document.getElementById("menu_itemsAdditional").innerHTML =
//                   html;
//                 fetch("/api/json/menu_items")
//                   .then((response) => response.json())
//                   .then((data) => {
//                     var header = document.createElement("h2");
//                     header.innerText = "Current Menu";
//                     document
//                       .getElementById("food-itemsAdditional")
//                       .appendChild(header);

//                     var listhtml = document.createElement("ul");
//                     for (const item of data.tableData) {
//                       var listItem = document.createElement("li");
//                       var linePos = document.createElement("select");
//                       linePos.setAttribute(
//                         "name",
//                         data.fkTable["serve-line_id"].Field
//                       );
//                       linePos.classList.add(data.fkTable["serve-line_id"].Type);
//                       linePos.classList.add(data.fkTable["serve-line_id"].Null);
//                       linePos.classList.add(data.fkTable["serve-line_id"].Key);
//                       linePos.classList.add(data.atributeInfo["2"].Field);
//                       linePos.classList.add("FKinput");
//                       linePos.classList.add("datainput");
//                       linePos.disabled = true;
//                       for (const lineOpt of data.fkTable["serve-line_id"]
//                         .select) {
//                         var newOpt = document.createElement("option");
//                         newOpt.value = lineOpt.id;
//                         newOpt.textContent = lineOpt.id + " - " + lineOpt.name;
//                         if (lineOpt.id == item["serve-line_id"]) {
//                           newOpt.selected = true;
//                         }
//                         linePos.appendChild(newOpt);
//                       }
//                       listItem.appendChild(linePos);

//                       var foodItem = document.createElement("select");
//                       foodItem.setAttribute(
//                         "name",
//                         data.fkTable["food-item_id"].Field
//                       );
//                       foodItem.classList.add(data.fkTable["food-item_id"].Type);
//                       foodItem.classList.add(data.fkTable["food-item_id"].Null);
//                       foodItem.classList.add(data.fkTable["food-item_id"].Key);
//                       foodItem.classList.add(data.atributeInfo["2"].Field);
//                       foodItem.classList.add("FKinput");
//                       foodItem.classList.add("datainput");
//                       foodItem.disabled = true;
//                       for (const lineOpt of data.fkTable["food-item_id"]
//                         .select) {
//                         var newOpt = document.createElement("option");
//                         newOpt.value = lineOpt.id;
//                         newOpt.textContent = lineOpt.id + " - " + lineOpt.name;
//                         if (lineOpt.id == item["food-item_id"]) {
//                           newOpt.selected = true;
//                         }
//                         foodItem.appendChild(newOpt);
//                       }
//                       listItem.appendChild(foodItem);

//                       var editBut = document.createElement("button");
//                       editBut.innerText = "🖉";
//                       editBut.classList.add("editButton");
//                       listItem.appendChild(editBut);

//                       var deleteBut = document.createElement("button");
//                       deleteBut.innerHTML = "&#128465";
//                       deleteBut.classList.add("deleteButton");
//                       listItem.appendChild(deleteBut);

//                       listhtml.appendChild(listItem);
//                     }
//                     document
//                       .getElementById("food-itemsAdditional")
//                       .appendChild(listhtml);
//                   })
//                   .catch((error) => console.error(error));
//                 document
//                   .getElementById("food-itemsform")
//                   .addEventListener("submit", function (event) {
//                     event.preventDefault(); // Prevents the default form submission
//                     const statuses = event.target.querySelectorAll(".error");
//                     statuses.forEach(function (status) {
//                       status.remove();
//                     });
//                     const forminputs =
//                       document.getElementsByClassName("datainput");

//                     // Retrieve form data
//                     var reqObject = {};
//                     for (let i = 0; i < forminputs.length; i++) {
//                       if (forminputs[i].parentElement.id == "menu_itemsform") {
//                         continue;
//                       }
//                       validateData = validate(forminputs[i]);
//                       if (validateData.bool) {
//                         reqObject[
//                           forminputs[i].previousElementSibling.getAttribute(
//                             "for"
//                           )
//                         ] = validateData.data;
//                       } else {
//                         const errorDiv = document.createElement("div");
//                         errorDiv.classList.add("error", "status");
//                         errorDiv.setAttribute("role", "alert");

//                         errorDiv.innerHTML =
//                           "<h3>❌ Error: " + validateData.err + "</h3>";
//                         forminputs[i].parentNode.insertBefore(
//                           errorDiv,
//                           forminputs[i].nextSibling
//                         );
//                         return;
//                       }
//                     }
//                     fetch("/api/createfood-item", {
//                       method: "POST",
//                       body: JSON.stringify(reqObject),
//                       headers: {
//                         "Content-Type": "application/json",
//                       },
//                     })
//                       .then((response) => {
//                         if (!response.ok) {
//                           return response.text().then((error) => {
//                             throw new Error(error);
//                           });
//                         }
//                         event.target.reset();
//                         // TODO
//                         fetch("/api/forms/menu_items")
//                           .then((response) => response.text())
//                           .then((html) => {
//                             document.getElementById(
//                               "menu_itemsform"
//                             ).outerHTML = html;
//                             document
//                               .getElementById("menu_itemsform")
//                               .addEventListener("submit", function (event) {
//                                 event.preventDefault(); // Prevents the default form submission
//                                 const statuses =
//                                   event.target.querySelectorAll(".error");
//                                 statuses.forEach(function (status) {
//                                   status.remove();
//                                 });
//                                 const forminputs =
//                                   document.getElementsByClassName("datainput");

//                                 // Retrieve form data
//                                 var reqObject = {};
//                                 for (let i = 0; i < forminputs.length; i++) {
//                                   if (
//                                     forminputs[i].parentElement.id ==
//                                     "food-itemsform"
//                                   ) {
//                                     break;
//                                   }
//                                   validateData = validate(forminputs[i]);
//                                   if (validateData.bool) {
//                                     reqObject[
//                                       forminputs[
//                                         i
//                                       ].previousElementSibling.getAttribute(
//                                         "for"
//                                       )
//                                     ] = validateData.data;
//                                   } else {
//                                     const errorDiv =
//                                       document.createElement("div");
//                                     errorDiv.classList.add("error", "status");
//                                     errorDiv.setAttribute("role", "alert");

//                                     errorDiv.innerHTML =
//                                       "<h3>❌ Error: " +
//                                       validateData.err +
//                                       "</h3>";
//                                     forminputs[i].parentNode.insertBefore(
//                                       errorDiv,
//                                       forminputs[i].nextSibling
//                                     );
//                                     return;
//                                   }
//                                 }
//                                 fetch("/api/createmenu_item", {
//                                   method: "POST",
//                                   body: JSON.stringify(reqObject),
//                                   headers: {
//                                     "Content-Type": "application/json",
//                                   },
//                                 })
//                                   .then((response) => {
//                                     if (!response.ok) {
//                                       return response.text().then((error) => {
//                                         throw new Error(error);
//                                       });
//                                     }
//                                     event.target.reset();
//                                     document.getElementById(
//                                       "food-itemsAdditional"
//                                     ).innerHTML = "";
//                                     fetch("/api/json/menu_items")
//                                       .then((response) => response.json())
//                                       .then((data) => {
//                                         var header =
//                                           document.createElement("h2");
//                                         header.innerText = "Current Menu";
//                                         document
//                                           .getElementById(
//                                             "food-itemsAdditional"
//                                           )
//                                           .appendChild(header);

//                                         var listhtml =
//                                           document.createElement("ul");
//                                         for (const item of data.tableData) {
//                                           var listItem =
//                                             document.createElement("li");
//                                           var linePos =
//                                             document.createElement("select");
//                                           linePos.setAttribute(
//                                             "name",
//                                             data.fkTable["serve-line_id"].Field
//                                           );
//                                           linePos.classList.add(
//                                             data.fkTable["serve-line_id"].Type
//                                           );
//                                           linePos.classList.add(
//                                             data.fkTable["serve-line_id"].Null
//                                           );
//                                           linePos.classList.add(
//                                             data.fkTable["serve-line_id"].Key
//                                           );
//                                           linePos.classList.add(
//                                             data.atributeInfo["2"].Field
//                                           );
//                                           linePos.classList.add("FKinput");
//                                           linePos.classList.add("datainput");
//                                           linePos.disabled = true;
//                                           for (const lineOpt of data.fkTable[
//                                             "serve-line_id"
//                                           ].select) {
//                                             var newOpt =
//                                               document.createElement("option");
//                                             newOpt.value = lineOpt.id;
//                                             newOpt.textContent =
//                                               lineOpt.id + " - " + lineOpt.name;
//                                             if (
//                                               lineOpt.id ==
//                                               item["serve-line_id"]
//                                             ) {
//                                               newOpt.selected = true;
//                                             }
//                                             linePos.appendChild(newOpt);
//                                           }
//                                           listItem.appendChild(linePos);

//                                           var foodItem =
//                                             document.createElement("select");
//                                           foodItem.setAttribute(
//                                             "name",
//                                             data.fkTable["food-item_id"].Field
//                                           );
//                                           foodItem.classList.add(
//                                             data.fkTable["food-item_id"].Type
//                                           );
//                                           foodItem.classList.add(
//                                             data.fkTable["food-item_id"].Null
//                                           );
//                                           foodItem.classList.add(
//                                             data.fkTable["food-item_id"].Key
//                                           );
//                                           foodItem.classList.add(
//                                             data.atributeInfo["2"].Field
//                                           );
//                                           foodItem.classList.add("FKinput");
//                                           foodItem.classList.add("datainput");
//                                           foodItem.disabled = true;
//                                           for (const lineOpt of data.fkTable[
//                                             "food-item_id"
//                                           ].select) {
//                                             var newOpt =
//                                               document.createElement("option");
//                                             newOpt.value = lineOpt.id;
//                                             newOpt.textContent =
//                                               lineOpt.id + " - " + lineOpt.name;
//                                             if (
//                                               lineOpt.id == item["food-item_id"]
//                                             ) {
//                                               newOpt.selected = true;
//                                             }
//                                             foodItem.appendChild(newOpt);
//                                           }
//                                           listItem.appendChild(foodItem);

//                                           var editBut =
//                                             document.createElement("button");
//                                           editBut.innerText = "🖉";
//                                           editBut.classList.add("editButton");
//                                           listItem.appendChild(editBut);

//                                           var deleteBut =
//                                             document.createElement("button");
//                                           deleteBut.innerHTML = "&#128465";
//                                           deleteBut.classList.add(
//                                             "deleteButton"
//                                           );
//                                           listItem.appendChild(deleteBut);

//                                           listhtml.appendChild(listItem);
//                                         }
//                                         document
//                                           .getElementById(
//                                             "food-itemsAdditional"
//                                           )
//                                           .appendChild(listhtml);
//                                       })
//                                       .catch((error) => console.error(error));
//                                   })
//                                   .catch((error) => {
//                                     const errorDiv =
//                                       document.createElement("div");
//                                     errorDiv.classList.add("error", "status");
//                                     errorDiv.setAttribute("role", "alert");

//                                     errorDiv.innerHTML =
//                                       "<h3>❌ Error: " +
//                                       error.message +
//                                       "</h3>";
//                                     event.target.appendChild(errorDiv);
//                                   });
//                               });
//                           });
//                       })
//                       .catch((error) => {
//                         const errorDiv = document.createElement("div");
//                         errorDiv.classList.add("error", "status");
//                         errorDiv.setAttribute("role", "alert");

//                         errorDiv.innerHTML =
//                           "<h3>❌ Error: " + error.message + "</h3>";
//                         event.target.appendChild(errorDiv);
//                       });
//                   });
//               })
//               .catch((error) => console.error(error));
//             document
//               .getElementById("menu_itemsform")
//               .addEventListener("submit", function (event) {
//                 event.preventDefault(); // Prevents the default form submission
//                 const statuses = event.target.querySelectorAll(".error");
//                 statuses.forEach(function (status) {
//                   status.remove();
//                 });
//                 const forminputs = document.getElementsByClassName("datainput");

//                 // Retrieve form data
//                 var reqObject = {};
//                 for (let i = 0; i < forminputs.length; i++) {
//                   if (forminputs[i].parentElement.id == "food-itemsform") {
//                     break;
//                   }
//                   validateData = validate(forminputs[i]);
//                   if (validateData.bool) {
//                     reqObject[
//                       forminputs[i].previousElementSibling.getAttribute("for")
//                     ] = validateData.data;
//                   } else {
//                     const errorDiv = document.createElement("div");
//                     errorDiv.classList.add("error", "status");
//                     errorDiv.setAttribute("role", "alert");

//                     errorDiv.innerHTML =
//                       "<h3>❌ Error: " + validateData.err + "</h3>";
//                     forminputs[i].parentNode.insertBefore(
//                       errorDiv,
//                       forminputs[i].nextSibling
//                     );
//                     return;
//                   }
//                 }
//                 fetch("/api/createmenu_item", {
//                   method: "POST",
//                   body: JSON.stringify(reqObject),
//                   headers: {
//                     "Content-Type": "application/json",
//                   },
//                 })
//                   .then((response) => {
//                     if (!response.ok) {
//                       return response.text().then((error) => {
//                         throw new Error(error);
//                       });
//                     }
//                     event.target.reset();
//                     document.getElementById("food-itemsAdditional").innerHTML =
//                       "";
//                     fetch("/api/json/menu_items")
//                       .then((response) => response.json())
//                       .then((data) => {
//                         var header = document.createElement("h2");
//                         header.innerText = "Current Menu";
//                         document
//                           .getElementById("food-itemsAdditional")
//                           .appendChild(header);

//                         var listhtml = document.createElement("ul");
//                         for (const item of data.tableData) {
//                           var listItem = document.createElement("li");
//                           var linePos = document.createElement("select");
//                           linePos.setAttribute(
//                             "name",
//                             data.fkTable["serve-line_id"].Field
//                           );
//                           linePos.classList.add(
//                             data.fkTable["serve-line_id"].Type
//                           );
//                           linePos.classList.add(
//                             data.fkTable["serve-line_id"].Null
//                           );
//                           linePos.classList.add(
//                             data.fkTable["serve-line_id"].Key
//                           );
//                           linePos.classList.add(data.atributeInfo["2"].Field);
//                           linePos.classList.add("FKinput");
//                           linePos.classList.add("datainput");
//                           linePos.disabled = true;
//                           for (const lineOpt of data.fkTable["serve-line_id"]
//                             .select) {
//                             var newOpt = document.createElement("option");
//                             newOpt.value = lineOpt.id;
//                             newOpt.textContent =
//                               lineOpt.id + " - " + lineOpt.name;
//                             if (lineOpt.id == item["serve-line_id"]) {
//                               newOpt.selected = true;
//                             }
//                             linePos.appendChild(newOpt);
//                           }
//                           listItem.appendChild(linePos);

//                           var foodItem = document.createElement("select");
//                           foodItem.setAttribute(
//                             "name",
//                             data.fkTable["food-item_id"].Field
//                           );
//                           foodItem.classList.add(
//                             data.fkTable["food-item_id"].Type
//                           );
//                           foodItem.classList.add(
//                             data.fkTable["food-item_id"].Null
//                           );
//                           foodItem.classList.add(
//                             data.fkTable["food-item_id"].Key
//                           );
//                           foodItem.classList.add(data.atributeInfo["2"].Field);
//                           foodItem.classList.add("FKinput");
//                           foodItem.classList.add("datainput");
//                           foodItem.disabled = true;
//                           for (const lineOpt of data.fkTable["food-item_id"]
//                             .select) {
//                             var newOpt = document.createElement("option");
//                             newOpt.value = lineOpt.id;
//                             newOpt.textContent =
//                               lineOpt.id + " - " + lineOpt.name;
//                             if (lineOpt.id == item["food-item_id"]) {
//                               newOpt.selected = true;
//                             }
//                             foodItem.appendChild(newOpt);
//                           }
//                           listItem.appendChild(foodItem);

//                           var editBut = document.createElement("button");
//                           editBut.innerText = "🖉";
//                           editBut.classList.add("editButton");
//                           listItem.appendChild(editBut);

//                           var deleteBut = document.createElement("button");
//                           deleteBut.innerHTML = "&#128465";
//                           deleteBut.classList.add("deleteButton");
//                           listItem.appendChild(deleteBut);

//                           listhtml.appendChild(listItem);
//                         }
//                         document
//                           .getElementById("food-itemsAdditional")
//                           .appendChild(listhtml);
//                       })
//                       .catch((error) => console.error(error));
//                   })
//                   .catch((error) => {
//                     const errorDiv = document.createElement("div");
//                     errorDiv.classList.add("error", "status");
//                     errorDiv.setAttribute("role", "alert");

//                     errorDiv.innerHTML =
//                       "<h3>❌ Error: " + error.message + "</h3>";
//                     event.target.appendChild(errorDiv);
//                   });
//               });
//           })
//           .catch((error) => console.error(error));
//       })
//       .catch((error) => {
//         const errorDiv = document.createElement("div");
//         errorDiv.classList.add("error", "status");
//         errorDiv.setAttribute("role", "alert");

//         errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
//         event.target.appendChild(errorDiv);
//       });
//   });

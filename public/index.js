function validate(element) {
  // console.log(element.value);
  if (
    (element.classList.contains("PRI") &&
      (element.value == "" || element.value == "NULL")) ||
    (element.classList.contains("YES") &&
      (element.value == "" || element.value == "NULL"))
  ) {
    return { bool: true, data: "DEFAULT" };
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

document
  .getElementById("dataform")
  .addEventListener("submit", function (event) {
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
        reqObject[forminputs[i].getAttribute("name")] = validateData.data;
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
        console.log(response.text);
        //TODO: New form
      })
      .catch((error) => {
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("error", "status");
        errorDiv.setAttribute("role", "alert");

        errorDiv.innerHTML = "<h3>❌ Error: " + error.message + "</h3>";
        event.target.appendChild(errorDiv);
      });
  });

import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/rating/rating.js";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/tag/tag.js";
import "@shoelace-style/shoelace/dist/components/divider/divider.js";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/path/to/shoelace/dist");


window.loadData = (json, sortOption) => {
  let bills;
  try {
    bills = JSON.parse(json);
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return;
  }

  // Function to handle sorting when a button is clicked
function sortBy(option) {
  const json = document.getElementById("json-data").textContent; // Assuming JSON data is stored in an element with this ID
  window.loadData(json, option);
}


    // Helper function to highlight the active sort button
    function highlightSortButton(activeButtonId) {
      document.getElementById("sort-date-btn").removeAttribute("variant");
      document.getElementById("sort-category-btn").removeAttribute("variant");
      document.getElementById("sort-number-btn").removeAttribute("variant");
      document.getElementById(activeButtonId).setAttribute("variant", "primary");
    }

     // Highlight the appropriate button based on the sort option
  if (sortOption === "date") {
    highlightSortButton("sort-date-btn");
  } else if (sortOption === "category") {
    highlightSortButton("sort-category-btn");
  } else if (sortOption === "number") {
    highlightSortButton("sort-number-btn");
  }

  const yearFilterDropdown = document.getElementById("year-filter");
  const goodbadFilterDropdown = document.getElementById("goodbad-filter");
  const currentYear = new Date().getFullYear();

  // Extract unique years from bmh_date and populate the dropdown
  const years = Array.from(
    new Set(bills.map((bill) => new Date(bill.fieldData.bmh_date).getFullYear()))
  ).sort((a, b) => b - a);

  // Populate the dropdown with options
  if (yearFilterDropdown.options.length === 0) {
    const allYearsOption = new Option("All Years", "all");
    yearFilterDropdown.appendChild(allYearsOption);

    years.forEach((year) => {
      const option = new Option(year, year);
      yearFilterDropdown.appendChild(option);
    });

    yearFilterDropdown.value = currentYear;
  }

  // console.log("Parsed bills:", bills); // Debug log

  function filterBills(array, textFilter, yearFilter, goodbadFilter) {
    return array.filter((item) => {
      const matchesText =
        textFilter === "" ||
        item.fieldData.OurBillTitle.toLowerCase().includes(
          textFilter.toLowerCase()
        ) ||
        item.fieldData.emailDescription
          .toLowerCase()
          .includes(textFilter.toLowerCase()) ||
        item.fieldData.number.toLowerCase().includes(textFilter.toLowerCase());

      const billYear = new Date(item.fieldData.bmh_date).getFullYear();
      const matchesYear = yearFilter === "all" || billYear === parseInt(yearFilter);

      const matchesGoodbad = goodbadFilter === "all" || item.fieldData.goodbad === goodbadFilter;

      return matchesText && matchesYear && matchesGoodbad;
    });
  }

  function createDivider() {
    return document.createElement("sl-divider");
  }

  // Get the filter values
  const textFilter = document.getElementById("text-filter").value;
  const yearFilter = yearFilterDropdown.value;
  const goodbadFilter = goodbadFilterDropdown.value;

  // Apply the filters
  const filteredBills = filterBills(bills, textFilter, yearFilter, goodbadFilter);

  //  console.log("Filtered bills:", filteredBills); // Debug log

  // Sort bills based on selected option
  if (sortOption === "date") {
    filteredBills.sort(
      (a, b) => new Date(b.fieldData.bmh_date) - new Date(a.fieldData.bmh_date)
    );
  } else if (sortOption === "number") {
    filteredBills.sort((a, b) => {
      const regex = /([A-Za-z]+)(\d+)/;
      const [, aLetters, aNumbers] = a.fieldData.number.match(regex);
      const [, bLetters, bNumbers] = b.fieldData.number.match(regex);
      
      // First sort by letters, then by numbers
      if (aLetters === bLetters) {
        return parseInt(aNumbers) - parseInt(bNumbers);
      }
      return aLetters.localeCompare(bLetters);
    });
  } else {
    filteredBills.sort((a, b) =>
      a.fieldData.category.localeCompare(b.fieldData.category)
    );
  }

  const billList = document.getElementById("bill-list");
  billList.innerHTML = ""; // Clear the previous bills

  if (filteredBills.length === 0) {
    billList.innerHTML = "<p>No bills found</p>"; // Display a message if no bills are found
  }

  let currentCategory = "";

  filteredBills.forEach((bill) => {
    const billData = bill.fieldData;

    if (billData.category !== currentCategory && sortOption !== "date") {
      currentCategory = billData.category;

      const categoryHeader = document.createElement("div");
      categoryHeader.classList.add("category-header");
      categoryHeader.innerHTML = `${currentCategory}`;
      billList.appendChild(categoryHeader);
    }

    const card = document.createElement("sl-card");
    card.classList.add("card");

    const row1 = document.createElement("div");
    row1.className = "row1";
    // Determine the flag icon class
    let flagClass = "gray-flag"; // Default
    if (billData.flag) {
      if (billData.goodbad === "Good") {
        flagClass = "green-flag";
      } else if (billData.goodbad === "Bad") {
        flagClass = "red-flag";
      }
    }
    // Create the flag icon
    const flagIcon = document.createElement("span");
    flagIcon.className = `icon ${flagClass} fa-solid fa-flag flag-icon`;
    // Create the text node for billData.number
    const numberText = document.createTextNode(billData.number);
    // Append the icon and text to the div
    row1.appendChild(flagIcon);
    row1.appendChild(numberText);

    const row2 = document.createElement("div");
    row2.className = "row2";
    const OurBillTitle = document.createTextNode(billData.OurBillTitle);
    row2.appendChild(OurBillTitle);

    const row3 = document.createElement("div");
    row3.className = "row3";
    const headerMostRecent = document.createTextNode("Most Recent Action");
    row3.appendChild(headerMostRecent);

    const row4 = document.createElement("div");
    row4.className = "row4";
    const bmh = document.createTextNode(
      billData.bmh_action + " - " + billData.bmh_date
    );
    row4.appendChild(bmh);

    const row5 = document.createElement("div");
    const row5ButtonGroup = document.createElement("sl-button-group");
    row5ButtonGroup.className = "row5bg";
    const buttonBillText = document.createElement("sl-button");
    buttonBillText.setAttribute("variant", "primary");
    buttonBillText.setAttribute("outline", "");
    buttonBillText.setAttribute("size", "large");
    buttonBillText.setAttribute(
      "onclick",
      "runScriptBillText('" + billData._ID + "')"
    );
    buttonBillText.textContent = "Text";

    const buttonSHV = document.createElement("sl-button");
    buttonSHV.setAttribute("variant", "primary");
    buttonSHV.setAttribute("outline", "");
    buttonSHV.setAttribute("size", "large");
    buttonSHV.setAttribute("onclick", "runScriptSHV('" + billData._ID + "')");
    buttonSHV.textContent = "Sponsors/History/Votes";

    const buttonRollCall = document.createElement("sl-button");
    buttonRollCall.setAttribute("size", "large");
    buttonRollCall.setAttribute("variant", "primary");
    buttonRollCall.setAttribute("outline", "");
    buttonRollCall.setAttribute(
      "onclick",
      "runScriptWebsite('" + billData._ID + "')"
    );
    buttonRollCall.textContent = "Website";

    row5ButtonGroup.appendChild(buttonBillText);
    row5ButtonGroup.appendChild(buttonSHV);
    row5ButtonGroup.appendChild(buttonRollCall);
    row5.appendChild(row5ButtonGroup);

    const row6 = document.createElement("div");
    row6.className = "row3";
    const headerProgressSummary = document.createTextNode("Progress Summary");
    row6.appendChild(headerProgressSummary);

    const row7 = document.createElement("div");
    row7.className = "row4";
    const progress = document.createTextNode(billData.Progress);
    row7.appendChild(progress);

    const row8 = document.createElement("div");
    row8.className = "row8-container"; // Add a class for styling

    // Convert the HTML string to a DOM node
    const tagsWrapper = document.createElement("div");
    tagsWrapper.innerHTML = generateTags(
      billData.PassedHouse,
      billData.PassedSenate,
      billData.SignedbyGovernor
    );

    // Create the button
    const buttonRollCalls = document.createElement("sl-button");
    buttonRollCalls.setAttribute("size", "large");
    buttonRollCalls.setAttribute("variant", "primary");
    buttonRollCalls.setAttribute("outline", "");
    buttonRollCalls.setAttribute(
      "onclick",
      `runScriptRollCall('${billData._ID}')`
    );
    buttonRollCalls.textContent = "Roll Call";

    // Append the tags and button to row8
    row8.appendChild(tagsWrapper);
    row8.appendChild(buttonRollCalls);

 // Create row9 container
const row9 = document.createElement("div");
row9.className = "row9-container"; // Add a class for potential styling

// Create the bold "Email: " label
const emailLabel = document.createElement("strong");
emailLabel.textContent = "Email: ";

// Create the checkbox element
const checkbox = document.createElement("sl-checkbox");

// Set the 'checked' property based on the condition
checkbox.checked = billData.emailcheckbox === "1";

// Optionally, make it non-interactive if needed
checkbox.disabled = true;

// Create the email description text node
const emailDescription = document.createElement("span");
emailDescription.textContent = billData.emailDescription;

// Append elements to row9
row9.appendChild(emailLabel);
row9.appendChild(checkbox);
row9.appendChild(emailDescription);


 // Create row9 container
 const row10 = document.createElement("div");
 row10.className = "row10-container"; // Add a class for potential styling
 
 // Create the bold "Email: " label
 const notesLabel = document.createElement("strong");
 notesLabel.textContent = "Notes: ";
 
 // Create the email description text node
 const notes = document.createElement("span");
 notes.textContent = billData.BillMonitorNotes;
 
 // Append elements to row9
 row10.appendChild(notesLabel);
 row10.appendChild(notes);

 // Create row11 container
 const row11 = document.createElement("div");
 row11.className = "row11-container"; // Add a class for potential styling
 
 // Create the email description text node
 const lastReviewed = document.createElement("span");
 lastReviewed.textContent = 'Last Reviewed: ' + billData.LastReviewDate;
 
 // Append elements to row9
 row11.appendChild(lastReviewed);


    // Append the div to the container
    card.appendChild(row1);
    card.appendChild(row2);
    card.appendChild(row3);
    card.appendChild(row4);
    card.appendChild(createDivider());
    card.appendChild(row5);
    card.appendChild(createDivider());
    card.appendChild(row6);
    card.appendChild(row7);
    card.appendChild(createDivider());
    card.appendChild(row8);
    card.appendChild(createDivider());
    card.appendChild(row9);
    card.appendChild(createDivider());
    card.appendChild(row10);
    card.appendChild(createDivider());
    card.appendChild(row11);
    billList.appendChild(card);
  });

    // Event listener for the text filter
    document.getElementById("text-filter").addEventListener("input", () => {
      window.loadData(json, sortOption);
    });
  
    // Event listener for the year filter
    yearFilterDropdown.addEventListener("change", () => {
      window.loadData(json, sortOption);
    });

      // Event listener for the goodbad filter
  goodbadFilterDropdown.addEventListener("change", () => {
    window.loadData(json, sortOption);
  });

  runScriptBillText = function (param) {
    const build = {
      mode: "billText",
      id: param,
    };

    FileMaker.PerformScriptWithOption(
      "wv Bill Monitor iPhone trigger",
      JSON.stringify(build),
      0
    );
  };

  runScriptSHV = function (param) {
    const build = {
      mode: "billSHV",
      id: param,
    };

    FileMaker.PerformScriptWithOption(
      "wv Bill Monitor iPhone trigger",
      JSON.stringify(build),
      0
    );
  };

  runScriptRollCall = function (param) {
    const build = {
      mode: "billRollCall",
      id: param,
    };

    FileMaker.PerformScriptWithOption(
      "wv Bill Monitor iPhone trigger",
      JSON.stringify(build),
      0
    );
  };

  runScriptWebsite = function (param) {
    const build = {
      mode: "stateWebsite",
      id: param,
    };

    FileMaker.PerformScriptWithOption(
      "wv Bill Monitor iPhone trigger",
      JSON.stringify(build),
      0
    );
  };

  function generateTags(house, senate, signed) {
    let html = "";
    if (house) {
      html += `<sl-tag size="large" variant="success">House</sl-tag>\n`;
    } else {
      html += `<sl-tag size="large" variant="neutral">House</sl-tag>\n`;
    }
    if (senate) {
      html += `<sl-tag size="large" variant="success">Senate</sl-tag>\n`;
    } else {
      html += `<sl-tag size="large" variant="neutral">Senate</sl-tag>\n`;
    }
    if (signed) {
      html += `<sl-tag size="large" variant="success">Signed</sl-tag>\n`;
    } else {
      html += `<sl-tag size="large" variant="neutral">Signed</sl-tag>\n`;
    }
    return html.trim();
  }

  // Add event listener for text filter input
  document.getElementById("text-filter").addEventListener("input", () => {
    window.loadData(json); // Reload data with current text filter value
  });
};


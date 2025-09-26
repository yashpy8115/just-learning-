// Wait until the HTML is fully parsed so elements can be selected safely
document.addEventListener("DOMContentLoaded", () => {
  // Get references to DOM elements used in the app
  const expenseform = document.getElementById("expense-form"); // The form where a new expense is entered
  const ExpesneList = document.getElementById("expense-list"); // The <ul> that will display all expenses
  const ExpensenameInput = document.getElementById("expense-name"); // Text input for expense name
  const ExpenseAmtInput = document.getElementById("expense-amount"); // Number input for expense amount
  const totalAmountDisplay = document.getElementById("total-amount"); // The element that shows the total sum

  // Load existing expenses from localStorage (or start with an empty list)
  // Using persisted data lets the list survive page refreshes
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  // Compute the initial total from the current expenses array
  let totalAmount = calculateTotal();

  // Handle form submission to add a new expense
  expenseform.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload so we can handle everything with JS

    // Get and clean the user inputs
    // NOTE: .value is case-sensitive (lowercase v). Using .Value would break.
    const name = ExpensenameInput.value.trim();
    const amount = parseFloat(ExpenseAmtInput.value.trim());

    // Basic validation: require a non-empty name and a positive number amount
    if (name !== "" && !isNaN(amount) && amount > 0) {
      // Create a new expense object
      // id uses a timestamp to uniquely identify each item (useful for delete)
      const newExpense = {
        id: Date.now(),
        name: name,
        amount: amount,
      };

      // Add to in-memory list
      expenses.push(newExpense);

      // Persist to localStorage so data remains after reload
      saveExpensesTolocal();

      // Recalculate total and update UI
      updateTotal();

      // Re-render the visible list to include the new expense
      renderExpenses();

      // Clear inputs for the next entry
      ExpensenameInput.value = "";
      ExpenseAmtInput.value = "";
    }
  });

  // Save the current expenses array into localStorage as JSON
  function saveExpensesTolocal() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  // Calculate the total by summing all expense amounts
  // NOTE: We must add expense.amount (a number), not the object itself.
  function calculateTotal() {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  // Update the total display in the UI
  // NOTE: toFixed has capital F; tofixed would break.
  function updateTotal() {
    totalAmount = calculateTotal();
    totalAmountDisplay.textContent = totalAmount.toFixed(2); // Format to 2 decimals
  }

  // Render the current expenses array into the <ul>
  // 1) Clear previous list to avoid duplicates
  // 2) Create an <li> for each expense
  // 3) Insert name, amount, and a Delete button carrying the expense id
  // 4) Append each <li> to the list
  function renderExpenses() {
    ExpesneList.innerHTML = "";
    expenses.forEach((expense) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <span class="item-name">${expense.name}</span>
        <span class="item-amount">$${expense.amount.toFixed(2)}</span>
        <button class="action delete" data-id="${expense.id}">Delete</button>
      `;

      ExpesneList.appendChild(li);
    });

    // If no expenses, show a friendly empty state (optional)
    if (expenses.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No expenses yet. Add one above.";
      ExpesneList.appendChild(li);
    }
  }

  // Use event delegation on the list to handle delete button clicks
  // This avoids adding a separate listener to every button
  ExpesneList.addEventListener("click", (e) => {
    // Only react if a button was clicked
    if (e.target.tagName === "BUTTON") {
      // Read the expense id from the button's data attribute
      // NOTE: getAttribute has capital A; getattribute would break.
      const expenseID = parseInt(e.target.getAttribute("data-id"), 10);

      // Remove the matching expense by id
      expenses = expenses.filter((expense) => expense.id !== expenseID);

      // Persist, then refresh the UI
      saveExpensesTolocal();
      renderExpenses();
      updateTotal();
    }
  });

  // Initial paint: show any saved expenses and the correct total on page load
  renderExpenses();
  updateTotal();
});

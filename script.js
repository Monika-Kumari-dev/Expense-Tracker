const STORAGE_KEY = 'expense-tracker-v1';
const form = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expenseList');
const totalElement = document.getElementById('total');
const emptyState = document.getElementById('emptyState');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const formTitle = document.getElementById('formTitle');
const message = document.getElementById('message');
let editingId = null;
let expenses = loadExpenses();

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch {
    showMessage('Unable to save to local storage. Check your browser settings.', 'danger');
    return false;
  }
}
function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = `alert alert-${type} mt-3`;
}
function formatAmount(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}
function makeCell(text, className = '') {
  const td = document.createElement('td');
  td.textContent = text;
  td.className = className;
  return td;
}
function renderExpenses() {
  expenseList.replaceChildren();
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  for (const expense of sorted) {
    const tr = document.createElement('tr');
    tr.append(makeCell(expense.date), makeCell(expense.description), makeCell(expense.category), makeCell(formatAmount(expense.amount), 'text-end fw-semibold'));
    const actions = document.createElement('td');
    actions.className = 'text-end';
    const edit = document.createElement('button');
    edit.className = 'btn btn-sm btn-outline-primary me-2';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => editExpense(expense.id));
    const remove = document.createElement('button');
    remove.className = 'btn btn-sm btn-outline-danger';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => deleteExpense(expense.id));
    actions.append(edit, remove);
    tr.append(actions);
    expenseList.append(tr);
  }
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  totalElement.textContent = formatAmount(total);
  emptyState.classList.toggle('d-none', expenses.length > 0);
  document.getElementById('clearButton').disabled = expenses.length === 0;
}
function resetForm() {
  form.reset();
  dateInput.value = new Date().toLocaleDateString('en-CA');
  editingId = null;
  saveButton.textContent = 'Add Expense';
  formTitle.textContent = 'Add Expense';
  cancelButton.classList.add('d-none');
}
function editExpense(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;
  editingId = id;
  descriptionInput.value = expense.description;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;
  saveButton.textContent = 'Save Changes';
  formTitle.textContent = 'Edit Expense';
  cancelButton.classList.remove('d-none');
  descriptionInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  expenses = expenses.filter(item => item.id !== id);
  saveExpenses();
  if (editingId === id) resetForm();
  renderExpenses();
  showMessage('Expense deleted.');
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;
  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
    showMessage('Please enter a description, positive amount and date.', 'danger');
    return;
  }
  const expense = { id: editingId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), description, amount, category, date };
  if (editingId) {
    expenses = expenses.map(item => item.id === editingId ? expense : item);
  } else {
    expenses.push(expense);
  }
  const saved = saveExpenses();
  resetForm();
  renderExpenses();
  if (saved) showMessage('Expense saved successfully.');
});
cancelButton.addEventListener('click', () => { resetForm(); message.textContent = ''; message.className = 'mt-3'; });
document.getElementById('clearButton').addEventListener('click', () => {
  if (!expenses.length || !confirm('Delete all expenses? This cannot be undone.')) return;
  expenses = [];
  saveExpenses();
  resetForm();
  renderExpenses();
  showMessage('All expenses cleared.');
});
resetForm();
renderExpenses();

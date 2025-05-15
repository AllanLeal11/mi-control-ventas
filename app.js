
const PRICES = { Desayuno: 1500, Almuerzo: 2500, "Bidón 10L": 1200 };

const datePicker = document.getElementById("datePicker");
const saleForm = document.getElementById("saleForm");
const itemSelect = document.getElementById("itemSelect");
const qtyInput = document.getElementById("qtyInput");
const salesTbody = document.getElementById("salesTbody");
const dayTotal = document.getElementById("dayTotal");
const dateLabel = document.getElementById("dateLabel");
const formError = document.getElementById("formError");

function getDateKey() {
  return datePicker.value || new Date().toISOString().slice(0, 10);
}

function updateDateLabel() {
  const d = new Date(getDateKey());
  dateLabel.textContent = d.toLocaleDateString("es-CR");
}

function getSales() {
  return JSON.parse(localStorage.getItem(getDateKey()) || "[]");
}

function saveSales(sales) {
  localStorage.setItem(getDateKey(), JSON.stringify(sales));
}

function renderSales() {
  const sales = getSales();
  salesTbody.innerHTML = "";
  let total = 0;
  sales.forEach((s, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${s.item}</td><td>${s.qty}</td><td>₡${s.qty * PRICES[s.item]}</td><td><button onclick="deleteSale(${i})">🗑️</button></td>`;
    total += s.qty * PRICES[s.item];
    salesTbody.appendChild(row);
  });
  dayTotal.textContent = `₡${total}`;
}

function deleteSale(index) {
  const sales = getSales();
  sales.splice(index, 1);
  saveSales(sales);
  renderSales();
}

saleForm.onsubmit = (e) => {
  e.preventDefault();
  const qty = parseInt(qtyInput.value);
  if (!qty || qty <= 0) {
    formError.textContent = "Cantidad inválida.";
    return;
  }
  formError.textContent = "";
  const sales = getSales();
  sales.push({ item: itemSelect.value, qty });
  saveSales(sales);
  renderSales();
  qtyInput.value = "";
};

document.getElementById("backupBtn").onclick = () => {
  const sales = getSales();
  const blob = new Blob([JSON.stringify(sales)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `backup-${getDateKey()}.json`;
  a.click();
};

document.getElementById("exportPdf").onclick = () => {
  html2pdf().from(document.body).save(`ventas-${getDateKey()}.pdf`);
};

document.getElementById("exportCsv").onclick = () => {
  const rows = getSales().map(s => `${s.item},${s.qty},${s.qty * PRICES[s.item]}`);
  const csv = "Ítem,Cantidad,Total\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ventas-${getDateKey()}.csv`;
  a.click();
};

document.getElementById("toggleTheme").onclick = () => {
  const html = document.documentElement;
  const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
};

datePicker.onchange = () => {
  updateDateLabel();
  renderSales();
};

datePicker.value = getDateKey();
updateDateLabel();
renderSales();

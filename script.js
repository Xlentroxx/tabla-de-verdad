let formula = "";
let parentesisAbiertos = 0;

function agregarSimbolo(simbolo) {
  if (esAdicionValida(simbolo)) {
    formula += simbolo;
    if (simbolo === "(") parentesisAbiertos++;
    if (simbolo === ")") parentesisAbiertos--;
    actualizarFormula();
  }
}

function esAdicionValida(simbolo) {
  if (formula.length === 0) {
    return ["P", "Q", "R", "¬", "("].includes(simbolo);
  }

  const ultimoCaracter = formula[formula.length - 1];

  // No permitir agregar dos ¬ seguidos
  if (simbolo === "¬" && ultimoCaracter === "¬") {
    return false;
  }

  // No permitir ¬ después de una proposición
  if (simbolo === "¬" && ["P", "Q", "R"].includes(ultimoCaracter)) {
    return false;
  }

  // Permitir ¬ después de un operador (como ∧, ∨, →, ↔) o paréntesis
  if (simbolo === "¬" && ["∧", "∨", "→", "↔", "("].includes(ultimoCaracter)) {
    return true;
  }

  // No permitir que la fórmula termine con ¬, ni con operadores (¬, ∧, ∨, →, ↔)
  if (["¬", "∧", "∨", "→", "↔"].includes(simbolo) && ["¬", "∧", "∨", "→", "↔", "("].includes(ultimoCaracter)) {
    return false;
  }

  if (["P", "Q", "R"].includes(simbolo)) {
    return !["P", "Q", "R", ")"].includes(ultimoCaracter);
  }

  if (simbolo === "(") {
    return ["¬", "∧", "∨", "→", "↔", "("].includes(ultimoCaracter) || formula.length === 0;
  }

  if (simbolo === ")") {
    return ["P", "Q", "R"].includes(ultimoCaracter) && parentesisAbiertos > 0;
  }

  return true;
}

function actualizarFormula() {
  document.getElementById("formula").textContent = formula;
}

function limpiarFormula() {
  formula = "";
  parentesisAbiertos = 0;
  actualizarFormula();
  document.getElementById("tablaVerdad").innerHTML = "";
  document.getElementById("mensaje").textContent = "";
}

function generarTabla() {
  if (!esFormulaValida()) {
    return;
  }

  const variables = [...new Set(formula.match(/[PQR]/g))].sort();
  const filas = 1 << variables.length;

  let tabla = "<table><tr>";
  variables.forEach((v) => (tabla += `<th>${v}</th>`));
  tabla += `<th>${formula}</th></tr>`;

  for (let i = 0; i < filas; i++) {
    tabla += "<tr>";
    const asignacion = {};
    variables.forEach((v, j) => {
      const valor = (i & (1 << (variables.length - 1 - j))) !== 0;
      asignacion[v] = valor;
      tabla += `<td>${valor ? "V" : "F"}</td>`;
    });
    tabla += `<td>${evaluarFormula(asignacion) ? "V" : "F"}</td></tr>`;
  }

  tabla += "</table>";
  document.getElementById("tablaVerdad").innerHTML = tabla;
}

function esFormulaValida() {
  if (formula.length === 0) {
    alert("Por favor, ingrese una fórmula.");
    return false;
  }

  if (parentesisAbiertos !== 0) {
    document.getElementById("mensaje").textContent = "Error: Paréntesis no balanceados. Por favor, revise su fórmula.";
    return false;
  }

  const ultimoCaracter = formula[formula.length - 1];
  if (["∧", "∨", "→", "↔", "¬"].includes(ultimoCaracter)) {
    document.getElementById("mensaje").textContent = "Error: La fórmula no puede terminar con un operador o una negación.";
    return false;
  }

  document.getElementById("mensaje").textContent = "";
  return true;
}

function evaluarFormula(asignacion) {
  let resultado = formula;
  for (const [variable, valor] of Object.entries(asignacion)) {
    resultado = resultado.replace(new RegExp(variable, "g"), valor ? "true" : "false");
  }
  return evaluarExpresion(resultado);
}

function evaluarExpresion(expr) {
  // Evaluar los paréntesis
  while (expr.includes("(")) {
    expr = expr.replace(/\([^\(\)]+\)/g, (subExpr) => evaluarExpresion(subExpr.slice(1, -1)));
  }

  // Negación (¬)
  expr = expr.replace(/¬\s*(true|false)/g, (match, p1) => (p1 === "true" ? "false" : "true"));

  // Conjunción (∧)
  expr = expr.replace(/(true|false)\s*∧\s*(true|false)/g, (match, p1, p2) => (p1 === "true" && p2 === "true" ? "true" : "false"));

  // Disyunción (∨)
  expr = expr.replace(/(true|false)\s*∨\s*(true|false)/g, (match, p1, p2) => (p1 === "true" || p2 === "true" ? "true" : "false"));

  // Implicación (→)
  expr = expr.replace(/(true|false)\s*→\s*(true|false)/g, (match, p1, p2) => (p1 === "true" && p2 === "false" ? "false" : "true"));

  // Bicondicional (↔)
  expr = expr.replace(/(true|false)\s*↔\s*(true|false)/g, (match, p1, p2) => (p1 === p2 ? "true" : "false"));

  return expr === "true"; // Devuelve el resultado final evaluado
}

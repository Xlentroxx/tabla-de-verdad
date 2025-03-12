// Inicializa una variable para la fórmula y para el conteo de paréntesis abiertos

let formula = "";

let parentesisAbiertos = 0;



// Función para agregar un símbolo a la fórmula

function agregarSimbolo(simbolo) {

  // Verifica si se puede añadir el símbolo a la fórmula

  if (esAdicionValida(simbolo)) {

    formula += simbolo; // Añade el símbolo a la fórmula



    // Actualiza el conteo de paréntesis

    if (simbolo === "(") parentesisAbiertos++; // Si es un paréntesis de apertura, aumenta el contador

    if (simbolo === ")") parentesisAbiertos--; // Si es un paréntesis de cierre, disminuye el contador



    actualizarFormula(); // Actualiza la visualización de la fórmula

  }

}



// Función para verificar si es válida la adición de un símbolo

function esAdicionValida(simbolo) {

  // Si la fórmula está vacía, se permiten ciertos símbolos al principio

  if (formula.length === 0) {

    return ["P", "Q", "R", "¬", "("].includes(simbolo);

  }



  const ultimoCaracter = formula[formula.length - 1]; // Obtiene el último carácter de la fórmula



  // No permitir agregar dos negaciones seguidas

  if (simbolo === "¬" && ultimoCaracter === "¬") {

    return false;

  }



  // No permitir negación después de una proposición (P, Q, R)

  if (simbolo === "¬" && ["P", "Q", "R"].includes(ultimoCaracter)) {

    return false;

  }



  // Permitir negación después de un operador lógico o paréntesis

  if (simbolo === "¬" && ["∧", "∨", "→", "↔", "("].includes(ultimoCaracter)) {

    return true;

  }



  // No permitir que la fórmula termine con una negación ni con operadores

  if (["¬", "∧", "∨", "→", "↔"].includes(simbolo) && ["¬", "∧", "∨", "→", "↔", "("].includes(ultimoCaracter)) {

    return false;

  }



  // No permitir agregar proposiciones (P, Q, R) después de otras proposiciones o de un paréntesis de cierre

  if (["P", "Q", "R"].includes(simbolo)) {

    return !["P", "Q", "R", ")"].includes(ultimoCaracter);

  }



  // Permitir paréntesis de apertura en ciertas condiciones

  if (simbolo === "(") {

    return ["¬", "∧", "∨", "→", "↔", "("].includes(ultimoCaracter) || formula.length === 0;

  }



  // Permitir paréntesis de cierre solo después de una proposición y si hay paréntesis abiertos

  if (simbolo === ")") {

    return ["P", "Q", "R", ")"].includes(ultimoCaracter) && parentesisAbiertos > 0;

  }



  return true; // Si no se cumple ninguna condición anterior, se puede añadir el símbolo

}



// Función para actualizar la visualización de la fórmula

function actualizarFormula() {

  document.getElementById("formula").textContent = formula; // Muestra la fórmula en el elemento con ID "formula"

}



// Función para limpiar la fórmula

function limpiarFormula() {

  formula = ""; // Resetea la fórmula

  parentesisAbiertos = 0; // Resetea el contador de paréntesis

  actualizarFormula(); // Actualiza la visualización

  document.getElementById("tablaVerdad").innerHTML = ""; // Limpia la tabla de verdad

  document.getElementById("mensaje").textContent = ""; // Limpia el mensaje de error

}



// Función para generar la tabla de verdad

function generarTabla() {

  // Si la fórmula no es válida, no se genera la tabla

  if (!esFormulaValida()) {

    return;

  }



  // Obtiene las variables de la fórmula (P, Q, R)

  const variables = [...new Set(formula.match(/[PQR]/g))].sort();

  const filas = 1 << variables.length; // Número de filas en la tabla de verdad



  let tabla = "<table><tr>";

  // Añade los encabezados de las variables en la tabla

  variables.forEach((v) => (tabla += `<th>${v}</th>`));

  tabla += `<th>${formula}</th></tr>`; // Añade la columna de la fórmula



  // Para cada posible asignación de verdad (combinaciones de verdadero/falso)

  for (let i = 0; i < filas; i++) {

    tabla += "<tr>";

    const asignacion = {}; // Asignación de valores de verdad



    // Calcula el valor de verdad para cada variable

    variables.forEach((v, j) => {

      const valor = (i & (1 << (variables.length - 1 - j))) !== 0;

      asignacion[v] = valor;

      tabla += `<td>${valor ? "V" : "F"}</td>`; // Añade el valor (V o F) a la tabla

    });



    // Evalúa la fórmula con la asignación de valores y añade el resultado a la tabla

    tabla += `<td>${evaluarFormula(asignacion) ? "V" : "F"}</td></tr>`;

  }



  tabla += "</table>";

  document.getElementById("tablaVerdad").innerHTML = tabla; // Muestra la tabla de verdad

}



// Función para verificar si la fórmula es válida

function esFormulaValida() {

  // Si la fórmula está vacía, muestra un mensaje de error

  if (formula.length === 0) {

    alert("Por favor, ingrese una fórmula.");

    return false;

  }



  // Verifica si los paréntesis están balanceados

  if (parentesisAbiertos !== 0) {

    document.getElementById("mensaje").textContent = "Error: Paréntesis no balanceados. Por favor, revise su fórmula.";

    return false;

  }



  // Verifica si la fórmula termina en un operador o una negación

  const ultimoCaracter = formula[formula.length - 1];

  if (["∧", "∨", "→", "↔", "¬"].includes(ultimoCaracter)) {

    document.getElementById("mensaje").textContent = "Error: La fórmula no puede terminar con un operador o una negación.";

    return false;

  }



  document.getElementById("mensaje").textContent = ""; // Si la fórmula es válida, limpia el mensaje de error

  return true; // La fórmula es válida

}



// Función para evaluar la fórmula con una asignación de valores

function evaluarFormula(asignacion) {

  let resultado = formula;

  // Reemplaza las proposiciones (P, Q, R) con sus valores de verdad

  for (const [variable, valor] of Object.entries(asignacion)) {

    resultado = resultado.replace(new RegExp(variable, "g"), valor ? "true" : "false");

  }

  return evaluarExpresion(resultado); // Evalúa la expresión con los valores reemplazados

}



// Función para evaluar una expresión lógica

function evaluarExpresion(expr) {

  // Evaluar los paréntesis recursivamente

  while (expr.includes("(")) {

    expr = expr.replace(/\([^\(\)]+\)/g, (subExpr) => evaluarExpresion(subExpr.slice(1, -1)));

  }



  // Evaluar la negación (¬)

  expr = expr.replace(/¬\s*(true|false)/g, (match, p1) => (p1 === "true" ? "false" : "true"));



  // Evaluar la conjunción (∧)

  expr = expr.replace(/(true|false)\s*∧\s*(true|false)/g, (match, p1, p2) => (p1 === "true" && p2 === "true" ? "true" : "false"));



  // Evaluar la disyunción (∨)

  expr = expr.replace(/(true|false)\s*∨\s*(true|false)/g, (match, p1, p2) => (p1 === "true" || p2 === "true" ? "true" : "false"));



  // Evaluar la implicación (→)

  expr = expr.replace(/(true|false)\s*→\s*(true|false)/g, (match, p1, p2) => (p1 === "true" && p2 === "false" ? "false" : "true"));



  // Evaluar el bicondicional (↔)

  expr = expr.replace(/(true|false)\s*↔\s*(true|false)/g, (match, p1, p2) => (p1 === p2 ? "true" : "false"));



  return expr === "true"; // Devuelve el resultado final de la evaluación

    }

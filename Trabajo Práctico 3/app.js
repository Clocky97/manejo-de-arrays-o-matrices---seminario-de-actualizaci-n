#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dataFile = path.join(__dirname, 'personas.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function pregunta(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function loadPersonas() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    return [];
  }
}

function savePersonas(personas) {
  fs.writeFileSync(dataFile, JSON.stringify(personas, null, 2), 'utf8');
}

const personas = loadPersonas();

async function main() {
  console.log('=== Registro de personas (nombre / edad / nota) ===');
  console.log('Escribe "terminar" o "fin" cuando quieras terminar y mostrar resultados.\n');

  while (true) {
    const nombre = (await pregunta('Nombre: ')).trim();
    if (!nombre) {
      console.log('Nombre no puede estar vacío. Intenta de nuevo.');
      continue;
    }

    const normalizado = nombre.toLowerCase();
    if (normalizado === 'terminar' || normalizado === 'fin') {
      break;
    }

    const edadRaw = (await pregunta('Edad: ')).trim();
    const edad = parseInt(edadRaw, 10);
    if (Number.isNaN(edad) || edad < 0) {
      console.log('Edad inválida. Debe ser un número entero positivo. Vuelve a ingresar la persona.\n');
      continue;
    }

    const notaRaw = (await pregunta('Nota: ')).trim().replace(',', '.');
    const nota = parseFloat(notaRaw);
    if (Number.isNaN(nota) || nota < 0) {
      console.log('Nota inválida. Debe ser un número. Vuelve a ingresar la persona.\n');
      continue;
    }

    personas.push([nombre, edad, nota]);
    savePersonas(personas);
    console.log('Persona cargada y guardada.\n');
  }

  rl.close();

  if (personas.length === 0) {
    console.log('\nNo se ingresaron personas. Fin.');
    return;
  }

  console.log('\n===== Listado ingresado =====');
  personas.forEach(([nombre, edad, nota], idx) => {
    console.log(`${idx + 1}. ${nombre} | Edad: ${edad} | Nota: ${nota}`);
  });

  const ordenado = [...personas].sort((a, b) => b[2] - a[2]);
  console.log('\n===== Listado ordenado por nota =====');
  ordenado.forEach(([nombre, edad, nota], idx) => {
    console.log(`${idx + 1}. ${nombre} | Edad: ${edad} | Nota: ${nota}`);
  });

  const sumaNotas = personas.reduce((acc, [, , nota]) => acc + nota, 0);
  const promedio = sumaNotas / personas.length;
  console.log(`\nPromedio de notas general: ${promedio.toFixed(2)}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

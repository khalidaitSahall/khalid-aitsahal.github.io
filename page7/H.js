(() => {
  const display = document.getElementById('calc-display');
  const keys = document.getElementById('calc-keys');
  let current = '0';
  let stored = null;
  let pendingOperator = null;
  let replaceCurrent = false;

  const renderCalculator = () => { display.textContent = current; };
  const formatNumber = (number) => Number.isFinite(number) ? String(Number(number.toPrecision(11))) : 'خطأ';
  const calculate = (left, right, operator) => {
    if (operator === '+') return left + right;
    if (operator === '−') return left - right;
    if (operator === '×') return left * right;
    if (operator === '÷') return right === 0 ? NaN : left / right;
    return right;
  };

  keys.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.digit !== undefined) {
      if (replaceCurrent || current === 'خطأ') { current = button.dataset.digit; replaceCurrent = false; }
      else if (current === '0') current = button.dataset.digit;
      else if (current.replace('-', '').replace('.', '').length < 14) current += button.dataset.digit;
    } else if (button.dataset.operator) {
      if (pendingOperator && !replaceCurrent) {
        current = formatNumber(calculate(stored, Number(current), pendingOperator));
      }
      stored = Number(current);
      pendingOperator = button.dataset.operator;
      replaceCurrent = true;
    } else {
      switch (button.dataset.action) {
        case 'clear': current = '0'; stored = null; pendingOperator = null; replaceCurrent = false; break;
        case 'decimal':
          if (replaceCurrent || current === 'خطأ') { current = '0.'; replaceCurrent = false; }
          else if (!current.includes('.')) current += '.';
          break;
        case 'sign': if (current !== '0' && current !== 'خطأ') current = current.startsWith('-') ? current.slice(1) : `-${current}`; break;
        case 'percent': if (current !== 'خطأ') current = formatNumber(Number(current) / 100); break;
        case 'backspace':
          if (replaceCurrent || current === 'خطأ') { current = '0'; replaceCurrent = false; }
          else current = current.length > 1 ? current.slice(0, -1) : '0';
          break;
        case 'equals':
          if (pendingOperator && stored !== null) {
            current = formatNumber(calculate(stored, Number(current), pendingOperator));
            stored = null; pendingOperator = null; replaceCurrent = true;
          }
          break;
      }
    }
    renderCalculator();
  });

  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^[0-9]$/.test(event.key)) keys.querySelector(`[data-digit="${event.key}"]`)?.click();
    else if (event.key === '.') keys.querySelector('[data-action="decimal"]')?.click();
    else if (event.key === 'Enter' || event.key === '=') keys.querySelector('[data-action="equals"]')?.click();
    else if (event.key === 'Backspace') keys.querySelector('[data-action="backspace"]')?.click();
    else if (event.key === 'Escape') keys.querySelector('[data-action="clear"]')?.click();
    else if (event.key === '+') keys.querySelector('[data-operator="+"]')?.click();
    else if (event.key === '-') keys.querySelector('[data-operator="−"]')?.click();
    else if (event.key === '*') keys.querySelector('[data-operator="×"]')?.click();
    else if (event.key === '/') keys.querySelector('[data-operator="÷"]')?.click();
    else return;
    event.preventDefault();
  });

  const modeButtons = [...document.querySelectorAll('.mode-button')];
  const shapeSelect = document.getElementById('shape-select');
  const fieldsContainer = document.getElementById('dimension-fields');
  const stage = document.getElementById('shape-stage');
  const caption = document.getElementById('preview-caption');
  const firstLabel = document.getElementById('result-one-label');
  const secondLabel = document.getElementById('result-two-label');
  const firstResult = document.getElementById('result-one');
  const secondResult = document.getElementById('result-two');
  const formulaNote = document.getElementById('formula-note');
  const unitSelect = document.getElementById('unit-select');
  const pi = Math.PI;
  let dimension = '2d';

  const definitions = {
    '2d': {
      rectangle: { title: 'مستطيل', fields: [['length', 'الطول'], ['width', 'العرض']] },
      square: { title: 'مربع', fields: [['side', 'طول الضلع']] },
      circle: { title: 'دائرة', fields: [['radius', 'نصف القطر']] },
      triangle: { title: 'مثلث', fields: [['base', 'طول القاعدة'], ['height', 'الارتفاع'], ['sideA', 'الضلع الأول'], ['sideB', 'الضلع الثاني']] }
    },
    '3d': {
      cube: { title: 'مكعب', fields: [['side', 'طول الحرف']] },
      cuboid: { title: 'متوازي مستطيلات', fields: [['length', 'الطول'], ['width', 'العرض'], ['height', 'الارتفاع']] },
      cylinder: { title: 'أسطوانة', fields: [['radius', 'نصف القطر'], ['height', 'الارتفاع']] },
      sphere: { title: 'كرة', fields: [['radius', 'نصف القطر']] }
    }
  };

  function resetResults() {
    firstResult.textContent = '—';
    secondResult.textContent = '—';
    formulaNote.textContent = 'أدخل الأبعاد الموجبة ثم اضغط «احسب وارسم». ';
    caption.textContent = 'أدخل الأبعاد لرؤية الشكل.';
    stage.innerHTML = '';
  }

  function updateShapeOptions() {
    const shapes = definitions[dimension];
    shapeSelect.replaceChildren(...Object.entries(shapes).map(([value, shape]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = shape.title;
      return option;
    }));
    renderFields();
    resetResults();
  }

  function renderFields() {
    const shape = definitions[dimension][shapeSelect.value];
    fieldsContainer.replaceChildren(...shape.fields.map(([name, label]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'dimension-field';
      const labelText = document.createElement('span');
      labelText.textContent = label;
      const input = document.createElement('input');
      input.className = 'dimension-input';
      input.type = 'number';
      input.min = '0';
      input.step = 'any';
      input.inputMode = 'decimal';
      input.id = `dimension-${name}`;
      input.dataset.dimension = name;
      input.placeholder = 'مثال: 10';
      input.setAttribute('aria-label', label);
      wrapper.append(labelText, input);
      return wrapper;
    }));
    resetResults();
  }

  function readDimensions() {
    const values = {};
    for (const input of fieldsContainer.querySelectorAll('input')) {
      const value = Number(input.value);
      if (!input.value.trim() || !Number.isFinite(value) || value <= 0) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return null;
      }
      input.removeAttribute('aria-invalid');
      values[input.dataset.dimension] = value;
    }
    return values;
  }

  function nice(value) { return Number(value.toPrecision(5)).toLocaleString('en-US'); }
  function unitPower(power) { return power === 1 ? unitSelect.value : `${unitSelect.value}²`; }
  function volumeUnit() { return `${unitSelect.value}³`; }

  function buildSvg(shape, values) {
    const commonStart = '<svg viewBox="0 0 320 220" role="img" aria-label="رسم توضيحي للشكل الهندسي" xmlns="http://www.w3.org/2000/svg">';
    let drawing = '';
    const label = (x, y, text, anchor = 'middle') => `<text class="shape-label" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
    if (dimension === '2d') {
      if (shape === 'rectangle' || shape === 'square') {
        drawing = `<rect class="shape-fill" x="62" y="46" width="196" height="122" rx="3"/>${label(160, 192, `${nice(values.length ?? values.side)} ${unitSelect.value}`)}${shape === 'rectangle' ? label(279, 110, `${nice(values.width)} ${unitSelect.value}`, 'start') : ''}`;
      } else if (shape === 'circle') {
        drawing = `<circle class="shape-fill" cx="160" cy="108" r="68"/><path class="shape-line" d="M160 108 L228 108"/>${label(198, 98, `r = ${nice(values.radius)}`)}${label(160, 198, `${nice(values.radius)} ${unitSelect.value}`)}`;
      } else {
        drawing = `<path class="shape-fill" d="M160 38 L55 170 L265 170 Z"/><path class="shape-line" d="M160 38 L160 170"/>${label(160, 198, `${nice(values.base)} ${unitSelect.value}`)}${label(173, 112, `${nice(values.height)} ${unitSelect.value}`, 'start')}`;
      }
    } else if (shape === 'cube' || shape === 'cuboid') {
      const length = values.length ?? values.side;
      const width = values.width ?? values.side;
      const height = values.height ?? values.side;
      const scale = 95 / Math.max(length, width, height);
      const w = Math.max(50, length * scale);
      const d = Math.max(35, width * scale * .55);
      const h = Math.max(45, height * scale * .78);
      const x = 70, y = 93, dx = d * .72, dy = -d * .5;
      drawing = `<polygon class="shape-fill" points="${x},${y-h} ${x+dx},${y-h+dy} ${x+w+dx},${y-h+dy} ${x+w},${y-h}"/><polygon class="shape-fill" points="${x+w},${y-h} ${x+w+dx},${y-h+dy} ${x+w+dx},${y+dy} ${x+w},${y}"/><polygon class="shape-fill" points="${x},${y-h} ${x+w},${y-h} ${x+w},${y} ${x},${y}"/>${label(x+w/2, y+24, `${nice(length)} ${unitSelect.value}`)}${label(x+w+dx+8, y+dy+10, `${nice(width)}`, 'start')}${label(x-8, y-h/2, `${nice(height)}`, 'end')}`;
    } else if (shape === 'cylinder') {
      drawing = `<path class="shape-fill" d="M90 64 V156 C90 177 230 177 230 156 V64"/><ellipse class="shape-fill" cx="160" cy="64" rx="70" ry="25"/><path class="shape-line" d="M90 156 C90 135 230 135 230 156"/>${label(160, 201, `r = ${nice(values.radius)} ${unitSelect.value}`)}${label(242, 115, `h = ${nice(values.height)}`, 'start')}`;
    } else {
      drawing = `<circle class="shape-fill" cx="160" cy="108" r="72"/><path class="shape-line" d="M90 108 C110 70 210 70 230 108 C210 146 110 146 90 108"/><ellipse cx="137" cy="79" rx="17" ry="8" fill="rgba(255,255,255,.2)" transform="rotate(-35 137 79)"/>${label(160, 201, `r = ${nice(values.radius)} ${unitSelect.value}`)}`;
    }
    return `${commonStart}${drawing}</svg>`;
  }

  function calculateShape() {
    const values = readDimensions();
    if (!values) {
      formulaNote.textContent = 'يرجى إدخال قيمة موجبة وصحيحة لكل بُعد.';
      return;
    }
    const shape = shapeSelect.value;
    let first, second, firstName, secondName, formulas;
    if (dimension === '2d') {
      firstName = 'المحيط'; secondName = 'المساحة';
      if (shape === 'rectangle') {
        first = 2 * (values.length + values.width); second = values.length * values.width;
        formulas = `المحيط = 2 × (الطول + العرض) = ${nice(first)} ${unitPower(1)}؛ المساحة = الطول × العرض = ${nice(second)} ${unitPower(2)}.`;
      } else if (shape === 'square') {
        first = 4 * values.side; second = values.side ** 2;
        formulas = `المحيط = 4 × الضلع = ${nice(first)} ${unitPower(1)}؛ المساحة = الضلع² = ${nice(second)} ${unitPower(2)}.`;
      } else if (shape === 'circle') {
        first = 2 * pi * values.radius; second = pi * values.radius ** 2;
        formulas = `محيط الدائرة = 2πr = ${nice(first)} ${unitPower(1)}؛ المساحة = πr² = ${nice(second)} ${unitPower(2)}.`;
      } else {
        first = values.base + values.sideA + values.sideB; second = values.base * values.height / 2;
        formulas = `محيط المثلث = مجموع الأضلاع = ${nice(first)} ${unitPower(1)}؛ المساحة = القاعدة × الارتفاع ÷ 2 = ${nice(second)} ${unitPower(2)}.`;
      }
    } else {
      firstName = 'المساحة السطحية'; secondName = 'الحجم';
      if (shape === 'cube') {
        first = 6 * values.side ** 2; second = values.side ** 3;
        formulas = `المساحة السطحية = 6 × الضلع² = ${nice(first)} ${unitPower(2)}؛ الحجم = الضلع³ = ${nice(second)} ${volumeUnit()}.`;
      } else if (shape === 'cuboid') {
        first = 2 * (values.length * values.width + values.length * values.height + values.width * values.height);
        second = values.length * values.width * values.height;
        formulas = `المساحة السطحية = 2(ط×ع + ط×ا + ع×ا) = ${nice(first)} ${unitPower(2)}؛ الحجم = ط×ع×ا = ${nice(second)} ${volumeUnit()}.`;
      } else if (shape === 'cylinder') {
        first = 2 * pi * values.radius * (values.radius + values.height); second = pi * values.radius ** 2 * values.height;
        formulas = `المساحة السطحية = 2πr(r+h) = ${nice(first)} ${unitPower(2)}؛ الحجم = πr²h = ${nice(second)} ${volumeUnit()}.`;
      } else {
        first = 4 * pi * values.radius ** 2; second = 4 * pi * values.radius ** 3 / 3;
        formulas = `المساحة السطحية = 4πr² = ${nice(first)} ${unitPower(2)}؛ الحجم = ⁴⁄₃πr³ = ${nice(second)} ${volumeUnit()}.`;
      }
    }
    if (![first, second].every(Number.isFinite)) {
      formulaNote.textContent = 'الأبعاد كبيرة جداً للحساب. يرجى إدخال قيم أصغر.';
      return;
    }
    firstLabel.textContent = firstName;
    secondLabel.textContent = secondName;
    firstResult.textContent = `${nice(first)} ${dimension === '2d' ? unitSelect.value : unitPower(2)}`;
    secondResult.textContent = `${nice(second)} ${dimension === '2d' ? unitPower(2) : volumeUnit()}`;
    formulaNote.textContent = formulas;
    stage.innerHTML = buildSvg(shape, values);
    caption.textContent = `رسم توضيحي لـ${definitions[dimension][shape].title} وفق الأبعاد المدخلة.`;
  }

  modeButtons.forEach((button) => button.addEventListener('click', () => {
    dimension = button.dataset.dimension;
    modeButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateShapeOptions();
  }));
  shapeSelect.addEventListener('change', renderFields);
  document.getElementById('calculate-shape').addEventListener('click', calculateShape);
  fieldsContainer.addEventListener('keydown', (event) => { if (event.key === 'Enter') calculateShape(); });
  updateShapeOptions();
})();

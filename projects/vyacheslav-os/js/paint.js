
window.initPaintCanvas = function() {
    const c = document.getElementById('paint-canvas');
    const container = document.getElementById('paint-container') || (c ? c.parentElement : null);
    if (c) {
        if (!c.width || c.width === 0) {
            c.width = container ? Math.min(container.clientWidth - 20, 360) : 340;
            c.height = 340;
        }
        c.style.display = 'block';
        c.style.background = '#ffffff';
        c.style.borderRadius = '10px';
        c.style.margin = '10px auto';
        c.style.touchAction = 'none';
    }
};

// Pixel Paint Studio - Обновленный модуль загрузки фото
(function() {
  window.initPaintPhotoFix = function() {
    const fileInput = document.getElementById('paint-file-input') || createHiddenInput();

    // Замена обработчика кнопки "Фото"
    const photoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Фото'));
    if (photoBtn) {
      photoBtn.onclick = (e) => {
        e.preventDefault();
        fileInput.value = ''; // Сброс для повторного выбора
        fileInput.click();
      };
    }

    fileInput.onchange = handleImageUpload;
  };

  function createHiddenInput() {
    let input = document.getElementById('paint-file-input');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'paint-file-input';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
    }
    return input;
  }

  function handleImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Безопасное чтение через ObjectURL (работает со шторкой Android)
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      processImageToGrid(img, file.name);
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      // Запасной вариант через FileReader
      const reader = new FileReader();
      reader.onload = (re) => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => processImageToGrid(fallbackImg, file.name);
        fallbackImg.onerror = () => {
          if (window.notify) notify('❌ Ошибка при чтении файла!');
        };
        fallbackImg.src = re.target.result;
      };
      reader.readAsDataURL(file);
    };

    img.src = blobUrl;
  }

  function processImageToGrid(img, fileName) {
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    // Оптимальный размер сетки для сохранения читаемости деталей
    const MAX_DIM = 64; 
    let targetW, targetH;

    if (origW > origH) {
      targetW = Math.min(MAX_DIM, origW);
      targetH = Math.max(8, Math.round((origH / origW) * targetW));
    } else {
      targetH = Math.min(MAX_DIM, origH);
      targetW = Math.max(8, Math.round((origW / origH) * targetH));
    }

    // Сглаживание и усреднение пикселей через промежуточный Canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = targetW;
    offCanvas.height = targetH;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = 'high';
    offCtx.drawImage(img, 0, 0, targetW, targetH);

    const imgData = offCtx.getImageData(0, 0, targetW, targetH).data;

    // Передаем пиксели в глобальную матрицу холста
    if (typeof window.applyImportedPixels === 'function') {
      window.applyImportedPixels(imgData, targetW, targetH);
    } else if (window.paintState) {
      window.paintState.cols = targetW;
      window.paintState.rows = targetH;
      window.paintState.grid = [];

      for (let y = 0; y < targetH; y++) {
        const row = [];
        for (let x = 0; x < targetW; x++) {
          const idx = (y * targetW + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3] / 255;
          row.push(a < 0.1 ? null : `rgb(${r},${g},${b})`);
        }
        window.paintState.grid.push(row);
      }
      if (typeof window.renderPaintCanvas === 'function') window.renderPaintCanvas();
    }

    // Обновляем бейдж с разрешением
    const sizeBadge = document.querySelector('.icon-btn, button[class*="24x24"], div:has(> .size-badge)') || 
                      Array.from(document.querySelectorAll('*')).find(el => /^\d+x\d+$/.test(el.innerText?.trim()));
    if (sizeBadge) sizeBadge.innerText = `${targetW}x${targetH}`;

    if (window.notify) {
      notify(`📷 Оцифровано в ${targetW}x${targetH} (${origW}x${origH})!`);
    }
  }

  // Автозапуск при загрузке вкладки
  if (document.readyState === 'complete') window.initPaintPhotoFix();
  else window.addEventListener('load', window.initPaintPhotoFix);
})();

const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const downloadBtn = document.getElementById('downloadBtn');
const layoutSelect = document.getElementById('layout');
const pageSizeSelect = document.getElementById('pageSize');
const dropArea = document.getElementById('dropArea');
const darkToggle = document.getElementById('darkToggle');

let images = [];

darkToggle.onclick = () => {
  document.body.classList.toggle('dark');
};

dropArea.addEventListener('click', () => imageInput.click());

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.style.background = '#e0e0e0';
});

dropArea.addEventListener('dragleave', () => {
  dropArea.style.background = '#fafafa';
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.style.background = '#fafafa';
  handleFiles(e.dataTransfer.files);
});

imageInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  imagePreview.innerHTML = '';
  images = Array.from(files);

  images.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 300;
        ctx.drawImage(img, 0, 0, 300, 300);

        const container = document.createElement('div');
        container.className = 'preview-img';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerText = '×';
        removeBtn.onclick = () => {
          container.remove();
          images.splice(index, 1);
        };

        container.appendChild(canvas);
        container.appendChild(removeBtn);
        imagePreview.appendChild(container);
      };
    };
    reader.readAsDataURL(file);
  });
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSizeSelect.value
  });

  const layout = layoutSelect.value;
  const canvases = document.querySelectorAll('canvas');

  for (let i = 0; i < canvases.length; i++) {
    if (layout === 'grid' && i % 4 === 0 && i !== 0) {
      pdf.addPage();
    } else if (layout === 'single' && i !== 0) {
      pdf.addPage();
    }

    const canvas = canvases[i];
    const imgData = canvas.toDataURL('image/jpeg');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    if (layout === 'single') {
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
    } else {
      const x = (i % 2) * (width / 2);
      const y = (Math.floor(i % 4 / 2)) * (height / 2);
      pdf.addImage(imgData, 'JPEG', x, y, width / 2, height / 2);
    }
  }

  pdf.save('converted.pdf');
}

downloadBtn.addEventListener('click', generatePDF);

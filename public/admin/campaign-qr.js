/* Local QR generation; no link or tracking parameters are sent to a third party. */
(() => {
  const $ = id => document.getElementById(id);
  const form = $('campaign-form');
  let svg = '', filename = '';
  const downloads = [$('download-qr-png'), $('download-qr-svg')];
  function reset() {
    $('campaign-result').value = '';
    $('campaign-qr').hidden = true;
    $('copy-link').disabled = true;
    downloads.forEach(button => { button.disabled = true; });
    svg = ''; filename = '';
    $('campaign-status').textContent = '推广信息已修改，请重新生成链接和二维码。';
  }
  form.addEventListener('input', reset);
  form.addEventListener('change', reset);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    reset();
    const url = new URL($('campaign-path').value, 'https://nexbodyfit.com');
    for (const [id, key] of [['campaign-source','utm_source'], ['campaign-medium','utm_medium'], ['campaign-name','utm_campaign']]) {
      const value = $(id).value.trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(value)) {
        $('campaign-status').textContent = '来源、媒介和活动名称仅支持英文、数字、下划线或短横线。';
        return;
      }
      url.searchParams.set(key, value);
    }
    $('campaign-result').value = url.toString();
    $('copy-link').disabled = false;
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(url.toString(), 'Byte');
      qr.make();
      const count = qr.getModuleCount(), cells = count + 8;
      const scale = Math.ceil(1024 / cells), canvas = $('campaign-qr-canvas');
      canvas.width = canvas.height = cells * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas unavailable');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      const paths = [];
      for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
        if (!qr.isDark(row, col)) continue;
        ctx.fillRect((col + 4) * scale, (row + 4) * scale, scale, scale);
        paths.push(`M${col + 4} ${row + 4}h1v1h-1z`);
      }
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cells} ${cells}" width="${canvas.width}" height="${canvas.height}" shape-rendering="crispEdges"><rect width="${cells}" height="${cells}" fill="#fff"/><path d="${paths.join('')}" fill="#000"/></svg>`;
      filename = `NEXBODY-${url.searchParams.get('utm_source')}-${url.searchParams.get('utm_campaign')}-QR`;
      $('campaign-qr').hidden = false;
      downloads.forEach(button => { button.disabled = false; });
      $('campaign-status').textContent = '链接和二维码已生成。投放前请用手机扫码确认页面和推广参数。';
    } catch {
      $('campaign-status').textContent = '链接已生成，但二维码生成失败。请刷新页面后重试；也可先复制链接。';
    }
  });
  $('copy-link').addEventListener('click', async () => {
    const value = $('campaign-result').value;
    if (!value) return;
    try { await navigator.clipboard.writeText(value); $('campaign-status').textContent = '推广链接已复制。'; }
    catch { $('campaign-result').select(); $('campaign-status').textContent = '请手动复制已选中的链接。'; }
  });
  function download(blob, extension) {
    if (!blob || !svg) return;
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = filename + '.' + extension;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  $('download-qr-png').addEventListener('click', () => {
    if (!svg) return;
    const generatedSvg = svg, generatedFilename = filename;
    $('campaign-qr-canvas').toBlob(blob => {
      if (svg !== generatedSvg || filename !== generatedFilename) return;
      if (blob) download(blob, 'png');
      else $('campaign-status').textContent = 'PNG 导出失败，请下载 SVG 或重新生成。';
    }, 'image/png');
  });
  $('download-qr-svg').addEventListener('click', () => {
    if (svg) download(new Blob([svg], {type:'image/svg+xml;charset=utf-8'}), 'svg');
  });
})();

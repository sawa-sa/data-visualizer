// テキスト形式のCSVデータをオブジェクト形式に変換する関数
function parseCSV(text) {
  const rows = text.split('\n'); // 行ごとに分割
  const data = [];

  // ヘッダー行を除く（最初の行をスキップ）
  rows.slice(1).forEach(row => {
    const cols = row.split(',');

    // 少なくとも3列あり、数値が含まれている場合に処理
    if (cols.length >= 3) {
      const x = parseFloat(cols[0].trim());
      const y = parseFloat(cols[1].trim());
      const z = parseFloat(cols[2].trim());
      const size = cols.length >= 4 ? parseFloat(cols[3].trim()) : undefined;
      const colorCode = cols.length >= 5 ? cols[4].trim() : undefined;
      const color = colorCode && /^0x[0-9A-Fa-f]{6}$/i.test(colorCode) ? parseInt(colorCode, 16) : 0xffff00;

      // x, y, z のいずれかが無効な値であればスキップ
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        data.push({ x, y, z, size, color });
      }
    }
  });

  return data;
}

async function loadCSVData(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text; // パース処理を共通化
}


// データを0〜1の範囲に正規化する関数
function normalizeData(data) {
  const minMax = calculateMinMax(data);
  const flag = sessionStorage.getItem('flag'); // フラグを取得
  // 正規化
  return data.map(point => ({
    x: (minMax.max.x - minMax.min.x === 0) ? 0.5 : (point.x - minMax.min.x) / (minMax.max.x - minMax.min.x),
    y: (minMax.max.y - minMax.min.y === 0) ? 0.5 : (point.y - minMax.min.y) / (minMax.max.y - minMax.min.y),
    z: (minMax.max.z - minMax.min.z === 0) ? 0.5 : (point.z - minMax.min.z) / (minMax.max.z - minMax.min.z),
    size: (point.size !== undefined)
      ? (flag === '1')
        ? (minMax.max.size - minMax.min.size === 0) 
          ? 0.5 
          : (point.size - minMax.min.size) / (minMax.max.size - minMax.min.size) 
        : point.size
      : undefined,
    color: point.color
  }));
}

// データの最小値と最大値を計算する関数
function calculateMinMax(data) {
  let min = { x: Infinity, y: Infinity, z: Infinity, size: Infinity };
  let max = { x: -Infinity, y: -Infinity, z: -Infinity, size: -Infinity };

  data.forEach(point => {
    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);
    min.z = Math.min(min.z, point.z);
    if (point.size !== undefined) {
      min.size = Math.min(min.size, point.size);
    }

    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
    max.z = Math.max(max.z, point.z);
    if (point.size !== undefined) {
      max.size = Math.max(max.size, point.size);
    }
  });

  return { min, max };
}

export {parseCSV, normalizeData, calculateMinMax, loadCSVData };

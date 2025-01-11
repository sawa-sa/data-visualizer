import * as THREE from "three";

// CSV文字列をパースしてデータ配列を返す
function parseCSVData(text) {
  const rows = text.split("\n").slice(1); // ヘッダー除去

  const data = rows.map((row) => {
    const cols = row.split(",");
    if (cols.length >= 3) {
      const point = {
        x: parseFloat(cols[0]),
        y: parseFloat(cols[1]),
        z: parseFloat(cols[2])
      };
      if (cols.length >= 4) {
        point.size = parseFloat(cols[3]);
      }
      if (cols.length >= 5) {
        const colorCode = cols[4].trim();
        point.color = /^0x[0-9A-Fa-f]{6}$/i.test(colorCode)
          ? parseInt(colorCode, 16)
          : 0xffff00;
      } else {
        point.color = 0xffff00;
      }
      return point;
    }
    return null;
  }).filter(Boolean);

  return data;
}

async function loadCSVData(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseCSVData(text); // パース処理を共通化
}

// データを正規化する
function normalizeData(data) {
  const minMax = calculateMinMax(data);
  const flag = sessionStorage.getItem('flag'); // フラグを取得
  const chosenDataset = sessionStorage.getItem('chosenDataset'); // データセット取得
  return data.map((point) => {
    return {
      x: (minMax.max.x - minMax.min.x === 0)
        ? 0.5
        : (point.x - minMax.min.x) / (minMax.max.x - minMax.min.x),
      y: (minMax.max.y - minMax.min.y === 0)
        ? 0.5
        : (point.y - minMax.min.y) / (minMax.max.y - minMax.min.y),
      z: (minMax.max.z - minMax.min.z === 0)
        ? 0.5
        : (point.z - minMax.min.z) / (minMax.max.z - minMax.min.z),
      size: (point.size !== undefined)
        ? (flag === '1')
          ? (minMax.max.size - minMax.min.size === 0) 
            ? 0.5 
            : (point.size - minMax.min.size) / (minMax.max.size - minMax.min.size) 
          : point.size
        : undefined,
      color: point.color
    };
  });
}

// データの x, y, z, size の最小値・最大値を計算
function calculateMinMax(data) {
  let min = { x: Infinity, y: Infinity, z: Infinity, size: Infinity };
  let max = { x: -Infinity, y: -Infinity, z: -Infinity, size: -Infinity };

  data.forEach((point) => {
    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);
    min.z = Math.min(min.z, point.z);
    if (point.size !== undefined) {
      min.size = Math.min(min.size, point.size);
      max.size = Math.max(max.size, point.size);
    }
    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
    max.z = Math.max(max.z, point.z);
  });

  return { min, max };
}

export {
  parseCSVData,
  normalizeData,
  calculateMinMax,
  loadCSVData
};

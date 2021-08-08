import liquidityAskBid from './liquidity-ask-bid.json';
import volumeDay from './volume-day-weth-usdc.json';

export const constantMixPriceValue = ({ usd, ethPrice }) => {
  const USD = usd / 2;
  const ETH = USD / ethPrice;
  const L = Math.sqrt(USD * ETH);

  const chartData = [];

  for (let i = 0; i < 10000; i += 1) {
    const price = i;
    let x = L / Math.sqrt(price);
    x = x || 0;
    let y = L * Math.sqrt(price);
    y = y || 0;
    let value = (x * price) + y;
    value = value || 0;
    chartData.push({ price, value });
  }

  return chartData;
};

export const constantMixLiquidity = ({ usd, entryPrice, price }) => {
  const USD = usd;
  const ETH = USD / entryPrice;
  const L = Math.sqrt(USD * ETH);

  let x = L / Math.sqrt(price);
  x = x || 0;
  let y = L * Math.sqrt(price);
  y = y || 0;
  let value = (x * price) + y;
  value = value || 0;

  return {
    value, price, eth: x, usd: y,
  };
};

export const uniswapV3PriceValue = ({
  usd, ethPrice, rangeMin, rangeMax,
}) => {
  const USD = usd / 2;
  const ETH = USD / ethPrice;
  const L = Math.sqrt(USD * ETH);
  const L2 = USD * ETH;
  const T = L * Math.sqrt(rangeMin);
  const H = L / Math.sqrt(rangeMax);
  const maxETH = (L2 / H) - T;
  const maxUSD = (L2 / T) - H;

  const LPa = ethPrice > rangeMax
    ? 0
    : ((L / Math.sqrt(ethPrice) - H) * ethPrice);
  const LPb = ethPrice > rangeMax
    ? maxETH
    : (L * Math.sqrt(ethPrice) - T);
  const LP = LPa + LPb;
  const multiplier = ethPrice > rangeMin
    ? usd / LP
    : usd / (ethPrice * maxUSD);

  const chartData = [];

  for (let i = 0; i < 10000; i += 1) {
    const price = i;
    let x;
    let y;
    let value;

    if (price < rangeMin) {
      x = (maxUSD) * multiplier;
      y = 0;
      value = x * price;
    } else if ((price >= rangeMin) && (price <= rangeMax)) {
      x = (L / Math.sqrt(price) - H) * multiplier;
      y = (L * Math.sqrt(price) - T) * multiplier;
      value = (x * price) + y;
    } else if (price > rangeMax) {
      x = 0;
      y = maxETH * multiplier;
      value = y;
    }
    chartData.push({
      price, value, eth: x, usd: y,
    });
  }
  return chartData;
};

export const uniswapV3Liquidity = ({
  usd, ethPrice, rangeMin, rangeMax,
}) => {
  const USD = usd / 2;
  const ETH = USD / ethPrice;
  const L = Math.sqrt(USD * ETH);
  const L2 = USD * ETH;
  const T = L * Math.sqrt(rangeMin);
  const H = L / Math.sqrt(rangeMax);
  const maxETH = (L2 / H) - T;
  const maxUSD = (L2 / T) - H;

  const LPa = ethPrice > rangeMax
    ? 0
    : ((L / Math.sqrt(ethPrice) - H) * ethPrice);
  const LPb = ethPrice > rangeMax
    ? maxETH
    : (L * Math.sqrt(ethPrice) - T);
  const LP = LPa + LPb;
  const multiplier = ethPrice > rangeMin
    ? usd / LP
    : usd / (ethPrice * maxUSD);

  let x;
  let y;
  let value;

  if (ethPrice < rangeMin) {
    x = (maxUSD) * multiplier;
    y = 0;
    value = x * ethPrice;
  } else if ((ethPrice >= rangeMin) && (ethPrice <= rangeMax)) {
    x = (L / Math.sqrt(ethPrice) - H) * multiplier;
    y = (L * Math.sqrt(ethPrice) - T) * multiplier;
    value = (x * ethPrice) + y;
  } else if (ethPrice > rangeMax) {
    x = 0;
    y = maxETH * multiplier;
    value = y;
  }
  return {
    ethPrice, value, eth: x, usd: y,
  };
};

const asc = (arr) => arr.sort((a, b) => a - b);

const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
};

export const medianLiquidityAskBid = () => quantile(liquidityAskBid.map((l) => l.total), 0.50);
export const percentile25LiquidityAskBid = () => quantile(
  liquidityAskBid.map((l) => l.total), 0.25,
);
export const percentile75LiquidityAskBid = () => quantile(
  liquidityAskBid.map((l) => l.total), 0.75,
);

export const medianVolumeDay = () => quantile(volumeDay.map((l) => l.volume), 0.50);
export const percentile25VolumeDay = () => quantile(volumeDay.map((l) => l.volume), 0.25);
export const percentile75VolumeDay = () => quantile(volumeDay.map((l) => l.volume), 0.75);

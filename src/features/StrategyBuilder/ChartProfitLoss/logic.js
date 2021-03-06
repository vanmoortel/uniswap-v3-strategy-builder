import moment from 'moment';
import { CHART_PROFIT_LOSS } from '../../../utils/types';
import { constantMixLiquidity, uniswapV3PriceValue } from '../../../utils/logic';

// eslint-disable-next-line import/prefer-default-export
export const generateChartData = ({ positions, dateNow, ethPrice }) => {
  const dataChart = [];

  // Generate concentrated range for all position
  const v3List = positions.map((p) => uniswapV3PriceValue({
    usd: (p.liquidityETH * p.entryPrice) + p.liquidityUSD,
    ethPrice: p.entryPrice,
    rangeMin: p.rangeMin,
    rangeMax: p.rangeMax,
  }));

  // Generate liquidity share based on 1% around last price
  const liquidityShareList = positions.map((p, iP) => {
    const geometricMean = Math.sqrt(p.rangeMin * p.rangeMax).toFixed(0);
    let liquidityShare = 0;

    // Check that the range is not less than 2% around geometric mean
    if (geometricMean * 1.01 <= p.rangeMax || geometricMean * 0.99 >= p.rangeMin) {
      const usdMean = v3List[iP].filter((v3) => `${v3.price}` === geometricMean)[0].usd;
      const usdMeanMinusOne = v3List[iP].filter((v3) => `${v3.price}` === (geometricMean * 0.99).toFixed(0))[0].usd;
      const usdMeanPlusOne = v3List[iP].filter((v3) => `${v3.price}` === (geometricMean * 1.01).toFixed(0))[0].usd;
      liquidityShare = (Math.abs(usdMean - usdMeanMinusOne)
          + Math.abs(usdMean - usdMeanPlusOne))
          / p.liquidityOnePct;
    } else {
      // If range is to small divide everything by 10(not accurate but dont have time)
      const usdMean = v3List[iP].filter((v3) => `${v3.price}` === geometricMean)[0].usd;
      const usdMeanMinusOne = v3List[iP].filter((v3) => `${v3.price}` === Math.round(geometricMean * 0.999).toFixed(0))[0].usd;
      const usdMeanPlusOne = v3List[iP].filter((v3) => `${v3.price}` === Math.round(geometricMean * 1.001).toFixed(0))[0].usd;
      liquidityShare = (Math.abs(usdMean - usdMeanMinusOne)
          + Math.abs(usdMean - usdMeanPlusOne))
          / (p.liquidityOnePct * 10);
    }
    return liquidityShare;
  });

  // generate chart data [0$ - 5000$]
  for (let i = 0; i < 5000; i += 10) {
    // Get uniswap V3 liquidity p&l
    const uniV3Liquidity = positions.map((p, o) => {
      if (p.exitPrice && moment(p.exitDate, 'YYYY-MM-DD HH:mm').isBefore(moment(dateNow, 'YYYY-MM-DD HH:mm'))) {
        // Position exited so only get diff between entry and exit price
        const v3Now = v3List[o]
          .filter((e) => e.price === (p.exitPrice.toFixed() * 1))[0];
        const liquidityETH = v3Now ? v3Now.eth : 0;
        const liquidityUSD = v3Now ? v3Now.usd : 0;
        return ((liquidityETH * p.exitPrice) + liquidityUSD)
            - ((p.liquidityETH * p.entryPrice) + p.liquidityUSD);
      }

      return (v3List[o].filter((e) => e.price === i)[0]
          || { value: 0 }).value - ((p.liquidityETH * p.entryPrice) + p.liquidityUSD);
    }).reduce((ac, v) => ac + v);

    // Get uniswap v3 fee collected based on date header
    const uniV3Fee = positions.map((p, iP) => {
      // use date header or exit date if exist and before date header
      let dateToCompare = moment(dateNow, 'YYYY-MM-DD HH:mm');
      let priceETHFees = i;
      if (!p.exitDate) dateToCompare = moment(dateNow, 'YYYY-MM-DD HH:mm');
      else if (moment(p.exitDate, 'YYYY-MM-DD HH:mm').isBefore(moment(dateNow, 'YYYY-MM-DD HH:mm'))) {
        priceETHFees = p.exitPrice;
        dateToCompare = moment(p.exitDate, 'YYYY-MM-DD HH:mm');
      }
      if (moment(p.entryDate, 'YYYY-MM-DD HH:mm').isAfter(dateToCompare)) return 0;

      const fees = (p.volume * dateToCompare.diff(moment(p.entryDate, 'YYYY-MM-DD HH:mm'), 'days') * liquidityShareList[iP] * (p.feePercent / 100));

      return (((fees * (p.bidAskRatio / 100))
              / (Math.sqrt(p.rangeMin * p.rangeMax))) * (priceETHFees))
          + (fees * (1 - (p.bidAskRatio / 100)));
    }).reduce((ac, v) => ac + v);

    const holdETH = positions.map((p) => {
      const valueIn = (p.liquidityETH * p.entryPrice) + p.liquidityUSD;
      let valueOut = ((p.liquidityETH + (p.liquidityUSD / p.entryPrice)) * i);
      if (p.exitPrice && moment(p.exitDate, 'YYYY-MM-DD HH:mm').isBefore(moment(dateNow, 'YYYY-MM-DD HH:mm'))) {
        valueOut = ((p.liquidityETH + (p.liquidityUSD / p.entryPrice)) * p.exitPrice);
      }
      return valueOut - valueIn;
    }).reduce((ac, v) => ac + v);

    const constantMix = positions.map((p) => {
      const price = p.exitPrice && moment(p.exitDate, 'YYYY-MM-DD HH:mm').isBefore(moment(dateNow, 'YYYY-MM-DD HH:mm')) ? p.exitPrice : i;
      const entryValue = ((p.liquidityETH * p.entryPrice) + p.liquidityUSD);

      return (constantMixLiquidity({
        usd: entryValue / 2,
        entryPrice: p.entryPrice,
        price,
      })).value - entryValue;
    })
      .reduce((ac, v) => ac + v);

    dataChart.push({
      price: i,
      [CHART_PROFIT_LOSS.UNI_V3]: uniV3Liquidity + uniV3Fee,
      [CHART_PROFIT_LOSS.HOLD_ETH]: holdETH,
      [CHART_PROFIT_LOSS.CONSTANT_MIX]: constantMix,
    });
  }

  return dataChart;
};

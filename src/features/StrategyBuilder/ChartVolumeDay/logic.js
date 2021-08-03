import Moment from 'moment';
import volumeDay from '../../../utils/volume-day-weth-usdc.json';

// eslint-disable-next-line import/prefer-default-export
export const generateChartData = () => volumeDay.map((d) => ({
  ...d,
  date: Moment(d.date).unix(),
}));

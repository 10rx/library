import { tenrxRoundTo } from '../src/index.js';
import { Testlogger } from './includes/TexrxCommonInclude.js';

Testlogger.setSettings({
  type: 'pretty',
});

test('Math Test Successful', async () => {
  expect(tenrxRoundTo(0.01, 2)).toBe(0.01);
  expect(tenrxRoundTo(0.01, 3)).toBe(0.01);
  expect(tenrxRoundTo(0.01, 4)).toBe(0.01);
  expect(tenrxRoundTo(0.01, 5)).toBe(0.01);
  expect(tenrxRoundTo(0.01, 6)).toBe(0.01);
  expect(tenrxRoundTo(0.12389345, 2)).toBe(0.12);
  expect(tenrxRoundTo(0.12389345, 3)).toBe(0.124);
  expect(tenrxRoundTo(0.12389345, 4)).toBe(0.1239);
  expect(tenrxRoundTo(0.12389345, 5)).toBe(0.12389);
  expect(tenrxRoundTo(0.12389345, 6)).toBe(0.123893);
  expect(tenrxRoundTo(0.12389345, 7)).toBe(0.1238935);
  expect(tenrxRoundTo(0.12389345, 8)).toBe(0.12389345);
  expect(tenrxRoundTo(1.23456789, 2)).toBe(1.23);
  expect(tenrxRoundTo(1.23456789, 3)).toBe(1.235);
  expect(tenrxRoundTo(1.23456789, 4)).toBe(1.2346);
  expect(tenrxRoundTo(1.23456789, 5)).toBe(1.23457);
  expect(tenrxRoundTo(1.23456789, 6)).toBe(1.234568);
  expect(tenrxRoundTo(1.23456789, 7)).toBe(1.2345679);
  expect(tenrxRoundTo(1.23456789, 8)).toBe(1.23456789);
  expect(tenrxRoundTo(1.005, 2)).toBe(1.01);
  // TODO need to fix this rounding issue. Right now it is only round the first decimal after the precision given.
  // expect(tenrxRoundTo(1.0049, 2)).toBe(1.01);
});

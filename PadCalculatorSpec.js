/* eslint-env jasmine */

import { PiPad, LoadPromise, resistorInfo, GetNearestValues } from './PadCalculator.js'

describe('An attenuator calculator', () => {
  it('should calculate match attenuation', () => {
    expect(PiPad.attenuationRequired(50, 50)).toBe(0)
    expect(PiPad.attenuationRequired(45, 50)).toBeCloseTo(2.844, 3)
    expect(PiPad.attenuationRequired(25, 100)).toBeCloseTo(11.439, 3)
  })

  it('should calculate simple pi pads', () => {
    const pad3Db = PiPad.get(3, 50, 50)
    expect(pad3Db.shuntIn).toBeCloseTo(292.402, 3)
    expect(pad3Db.series).toBeCloseTo(17.615, 3)
    expect(pad3Db.shuntOut).toBeCloseTo(pad3Db.shuntIn, 3)
  })

  it('should assume 50 ohms', () => {
    const pad3Db = PiPad.get(3)
    expect(pad3Db.shuntIn).toBeCloseTo(292.402, 3)
    expect(pad3Db.series).toBeCloseTo(17.615, 3)
    expect(pad3Db.shuntOut).toBeCloseTo(pad3Db.shuntIn, 3)
  })

  it('should calculate unmatched pi pads', () => {
    const pad6Db = PiPad.get(6, 47, 55)
    expect(pad6Db.shuntIn).toBeCloseTo(108.431, 3)
    expect(pad6Db.series).toBeCloseTo(37.982, 3)
    expect(pad6Db.shuntOut).toBeCloseTo(246.827, 3)
  })

  it('should evaluate pi pads', () => {
    const samplePad = new PiPad(50, 200, 30, 50, 50)
    expect(samplePad.zIn).toBeCloseTo(40.698, 3)
    expect(samplePad.zOut).toBeCloseTo(26.471, 3)
    expect(samplePad.attenuationForward).toBeCloseTo(22.28, 2)
    expect(samplePad.attenuationReverse).toBeCloseTo(22.28, 2)
  })

  it('should return the inputs given outputs', () => {
    const samplePad = new PiPad(150.476, 37.352, 150.476)
    expect(samplePad.zIn).toBeCloseTo(50, 3)
    expect(samplePad.zOut).toBeCloseTo(50, 3)
    expect(samplePad.attenuationForward).toBeCloseTo(6, 3)
    expect(samplePad.attenuationReverse).toBeCloseTo(6, 3)
  })

  it('should return the inputs given outputs with mismatch', () => {
    const samplePad = new PiPad(86.517, 45.747, 2386.203)
    expect(samplePad.zIn).toBeCloseTo(50, 3)
    expect(samplePad.zOut).toBeCloseTo(75, 3)
    expect(samplePad.attenuationForward).toBeCloseTo(6, 3)
    expect(samplePad.attenuationReverse).toBeCloseTo(6, 3)
  })

  it('should calculate VSWR', () => {
    const samplePad = new PiPad(50, 200, 30, 50, 75)

    expect(samplePad.vswrIn).toBeCloseTo(1.226, 3)
    expect(samplePad.vswrOut).toBeCloseTo(2.833, 3)
  })

  it('should calculate return loss', () => {
    const samplePad = new PiPad(50, 200, 30, 50, 75)

    expect(samplePad.returnLossIn).toBeCloseTo(-19.875, 3)
    expect(samplePad.returnLossOut).toBeCloseTo(-6.407, 3)
  })

  it('should export real world resistor info', async () => {
    await LoadPromise
    expect(Object.keys(resistorInfo.Series).length).toBeGreaterThan(1)
  })

  it('should calculate nearest real world resistors', async () => {
    await LoadPromise
    const nearest = GetNearestValues('E192', 210.82)
    expect(Math.min(...nearest)).toBeGreaterThan(1)
  })

  it('It shouldn\'t hang in edge case resistors', async () => {
    await LoadPromise
    expect(GetNearestValues('E192', 0)[0]).toBe(0)
    expect(GetNearestValues('E192', -5)[0]).toBeNaN()
    expect(GetNearestValues('E192', NaN)[0]).toBeNaN()
    expect(GetNearestValues('E192', Infinity)[0]).toBe(Infinity)
  })

  it('should search for close real pads', async () => {
    await LoadPromise
    const samplePads = PiPad.getInSeries('E24', 3, 50, 50)
    expect(samplePads.length).toBeGreaterThan(0)
    expect(samplePads[0].vswrIn).not.toBe(undefined)
    expect(samplePads.every(p => p.returnLossIn > -100)).toBe(true)
  })
})

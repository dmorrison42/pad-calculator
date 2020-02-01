var resistorInfo = null
export { resistorInfo }

var resistorInfoPromise = new Promise((resolve, reject) => {
  var request = new window.XMLHttpRequest()
  request.onreadystatechange = function () {
    if (this.readyState === 4) {
      resolve(JSON.parse(this.responseText))
    }
  }
  request.open('GET', 'ResistorValues.json')
  request.send()
})

resistorInfoPromise.then(data => { resistorInfo = data })

const LoadPromise = resistorInfoPromise.then()
export { LoadPromise }

export class PiPad {
  constructor (shuntIn, series, shuntOut, circuitZIn, circuitZOut) {
    this.shuntIn = shuntIn
    this.series = series
    this.shuntOut = shuntOut
    this.circuitZIn = circuitZIn
    this.circuitZOut = circuitZOut

    if (circuitZIn == null && circuitZOut == null) {
      let x = 10000
      let y = 10000
      let result = {}
      for (let i = 1; i < 100; i++) {
        result = new PiPad(shuntIn, series, shuntOut, x, y)
        x = result.zIn
        y = result.zOut
      }
      this.circuitZIn = x
      this.circuitZOut = y
    }
  }

  get zIn () {
    return calculatePiImpedance(
      this.shuntIn, this.series, this.shuntOut, this.circuitZOut)
  }

  get zOut () {
    return calculatePiImpedance(
      this.shuntOut, this.series, this.shuntIn, this.circuitZIn)
  }

  get vswrIn () {
    return calculateVSWR(this.circuitZIn, this.zIn)
  }

  get vswrOut () {
    return calculateVSWR(this.circuitZOut, this.zOut)
  }

  get returnLossIn () {
    return calculateReturnLoss(this.circuitZIn, this.zIn)
  }

  get returnLossOut () {
    return calculateReturnLoss(this.circuitZOut, this.zOut)
  }

  get attenuationForward () {
    return calculatePiAttenuation(
      this.shuntIn, this.series, this.shuntOut, this.circuitZIn, this.circuitZOut)
  }

  get attenuationReverse () {
    return calculatePiAttenuation(
      this.shuntIn, this.series, this.shuntOut, this.circuitZIn, this.circuitZOut)
  }

  static get (attenuation, zIn, zOut) {
    zIn = zIn == null ? 50 : zIn
    zOut = zOut == null ? 50 : zOut

    const vOut = Math.sqrt((zOut / zIn) * (1 / Math.pow(10, attenuation / 10)))

    const shuntInN = (zOut * zIn) - (Math.pow(zIn, 2) * Math.pow(vOut, 2))
    const shuntInD = zOut + (zIn * Math.pow(vOut, 2)) - 2 * zIn * vOut
    const shuntIn = shuntInN / shuntInD

    const shuntOut = vOut / (1 / zIn - vOut / zOut - 1 / shuntIn)

    const series = (1 - vOut) * zIn * shuntIn / (shuntIn - zIn)

    return new PiPad(shuntIn, series, shuntOut, zIn, zOut)
  }

  static getInSeries (resistorSeries, attenuation, zIn, zOut) {
    // TODO: Do more searching around
    const nearest = (v) => GetNearestValues(resistorSeries, v)
    const ideal = this.get(attenuation, zIn, zOut)
    const shuntIn = nearest(ideal.shuntIn)
    const shuntOut = nearest(ideal.shuntOut)
    const series = nearest(ideal.series)

    const pads = []
    for (var i = 0; i < shuntIn.length; i++) {
      for (var j = 0; j < series.length; j++) {
        for (var k = 0; k < shuntOut.length; k++) {
          pads.push(new PiPad(shuntIn[i], series[j], shuntOut[k], zIn, zOut))
        }
      }
    }

    return filterPads(attenuation, pads)
  }

  static attenuationRequired (zIn, zOut) {
    const small = Math.min(zIn, zOut)
    const large = Math.max(zIn, zOut)
    const lin = Math.sqrt(large / small) + Math.sqrt(large / small - 1)
    return v2dB(lin)
  }
}

function filterPads (targetAttenuation, pads) {
  function betterThan (a, b) {
    if (a === b) {
      return false
    }
    if (a.vswrIn > b.vswrIn) {
      return false
    }
    if (a.vswrOut > b.vswrOut) {
      return false
    }
    const aDiff = Math.abs(a.attenuationForward - targetAttenuation)
    const bDiff = Math.abs(b.attenuationForward - targetAttenuation)
    if (aDiff > bDiff) {
      return false
    }
    return true
  }
  return pads
    .filter(a => !pads.some(b => betterThan(b, a)))
    .sort((a, b) => {
      const aDiff = Math.abs(a.attenuationForward - targetAttenuation)
      const bDiff = Math.abs(b.attenuationForward - targetAttenuation)
      return aDiff - bDiff
    })
}

function v2dB (x) {
  return 20 * Math.log10(x)
}

function power2dB (x) {
  return 10 * Math.log10(x)
}

function calculatePiImpedance (a, b, c, zC) {
  const n = a * (b * zC + b * c + c * zC)
  const d = c * zC + ((b + a) * (zC + c))
  return n / d
}

function calculatePiAttenuation (a, b, c, zA, zC) {
  const zACalculated = calculatePiImpedance(a, b, c, zC)
  const vIn = 2 - ((2 * zA) / (zA + zACalculated))
  const vOut = (vIn * c * zC) / (b * (zC + c) + c * zC)
  return power2dB((1 / zA) / (Math.pow(vOut, 2) / zC))
}

function calculateVSWR (z, calc) {
  const a = ((1 + (calc - z) / (calc + z)) / (1 - (calc - z) / (calc + z)))
  const b = ((1 - (calc - z) / (calc + z)) / (1 + (calc - z) / (calc + z)))
  return Math.max(a, b)
}

function calculateReturnLoss (z, calc) {
  return v2dB(Math.abs((calc - z) / (calc + z)))
}

export function GetNearestValues (series, exact) {
  if (isNaN(exact)) return [NaN]
  if (exact < 0) return [NaN]

  const values = resistorInfo.Series[series].Values
  let low = 0
  const mag = Math.log10(Math.max(...values))

  for (var i = Math.floor(Math.log10(exact) - mag); ; i++) {
    const mag = Math.pow(10, i)
    for (var j = -1; j < values.length; j++) {
      const value = mag * values[j]
      if (value <= exact) low = value
      if (value >= exact) {
        return [low, value]
      }
    }
  }
}

/* global Vue */
import { PiPad, resistorInfo } from './PadCalculator.js'

const places = 2

export const PadList = Vue.component('pad-list', {
  props: ['pad', 'keys', 'series', 'single'],
  methods: {
    cap (value, floor, ceiling) {
      if (value > ceiling) {
        return `>${ceiling.toFixed(places)}`
      }
      if (value < floor) {
        return `<${floor.toFixed(places)}`
      }
      return value.toFixed(places)
    },
    round (value) {
      return value.toFixed(places)
    },
    format (pad) {
      return {
        'Shunt In': this.round(pad.shuntIn),
        Series: this.round(pad.series),
        'Shunt Out': this.round(pad.shuntOut),
        'Forward Attenuation': this.round(pad.attenuationForward),
        'Reverse Attenuation': this.round(pad.attenuationReverse),
        Attenuation: this.round(pad.attenuationForward),
        'Z In': this.round(pad.zIn),
        'Z Out': this.round(pad.zOut),
        'Input Return Loss': this.cap(pad.returnLossIn, -50),
        'Output Return Loss': this.cap(pad.returnLossOut, -50),
        'Input VSWR': this.round(pad.vswrIn),
        'Output VSWR': this.round(pad.vswrOut)
      }
    },
    ranges (pad, key) {
      return this.tolerances.map((tolerance) => {
        const multipliers = [(100 - tolerance) / 100, (100 + tolerance) / 100]
        const allThePads = [pad]

        for (var i = 0; i < multipliers.length; i++) {
          for (var j = 0; j < multipliers.length; j++) {
            for (var k = 0; k < multipliers.length; k++) {
              allThePads.push(new PiPad(
                multipliers[i] * pad.shuntIn,
                multipliers[j] * pad.series,
                multipliers[k] * pad.shuntOut))
            }
          }
        }

        const allValues = allThePads
          .map(this.format)
          .map(v => v[key])
          .sort()

        const min = allValues[0]
        const max = allValues[allValues.length - 1]

        return `${tolerance}% ${min}-${max}`
      }).join('\n')
    }
  },
  computed: {
    calculatorPads () {
      return [...PiPad.getInSeries(
        this.series,
        // Pretty sure this is always the same when considering reflection
        this.pad.attenuationForward,
        this.pad.circuitZIn,
        this.pad.circuitZOut)]
    },
    tolerances () {
      return resistorInfo.Series[this.series].Tolerances
    }
  },
  template: `<table class="table table-hover table-bordered">
  <thead class="thead-light">
    <tr>
      <th v-for="key in keys" :key="key">{{key}}</th>
    </tr>
    <tr>
      <th v-for="key in keys" :key="key" title="ideal">{{format(pad)[key]}}</th>
    </tr>
  </thead>
  <tbody v-if="single !== true">
    <tr v-for="pad in calculatorPads">
      <td v-for="key in keys" :key="key" :title="ranges(pad, key)">{{format(pad)[key]}}</td>
    </tr>
  </tbody>
</table>`
})

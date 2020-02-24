/* global Vue */
import { PiPad } from './PadCalculator.js'

const places = 2

export const PadList = Vue.component('pad-list', {
  props: ['pad', 'keys', 'series'],
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
    }
  },
  computed: {
    calculatorPads () {
      return [this.pad, ...PiPad.getInSeries(
        this.series,
        // Pretty sure this is always the same when considering reflection
        this.pad.attenuationForward,
        this.pad.circuitZIn,
        this.pad.circuitZOut)]
    },
    formated (pad) {
      return this.calculatorPads.map(pad => ({
        'Shunt In': this.round(pad.shuntIn),
        Series: this.round(pad.series),
        'Shunt Out': this.round(pad.shuntOut),
        'Forward Attenuation': this.round(pad.attenuationForward),
        'Reverse Attenuation': this.round(pad.attenuationReverse),
        Attenuation: this.round(pad.attenuationForward),
        'Z In': this.round(pad.zIn),
        'Z Out': this.round(pad.zIn),
        'Input Return Loss': this.cap(pad.returnLossIn, -50),
        'Output Return Loss': this.cap(pad.returnLossOut, -50),
        'Input VSWR': this.round(pad.vswrIn),
        'Output VSWR': this.round(pad.vswrOut)
      }))
    }
  },
  template: `<table>
  <tr>
    <th v-for="key in keys" :key="key">{{key}}</th>
  </tr>
  <tr v-for="pad in formated">
    <td v-for="key in keys" :key="key" align="right">{{pad[key]}}</td>
  </tr>
</table>`
})

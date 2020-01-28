/* global Vue */

export const PadList = Vue.component('pad-list', {
  props: ['pads', 'keys'],
  methods: {
    round (x, precision) {
      if (precision == null) precision = 0
      return Math.round(x * 10 ** precision) / 10 ** precision
    }
  },
  computed: {
    formated (pad) {
      return this.pads.map(pad => ({
        'Shunt In': this.round(pad.shuntIn, 2),
        Series: this.round(pad.series, 2),
        'Shunt Out': this.round(pad.shuntOut, 2),
        'Forward Attenuation': this.round(pad.attenuationForward, 2),
        'Reverse Attenuation': this.round(pad.attenuationReverse, 2),
        Attenuation: this.round(pad.attenuationForward, 2),
        'Z In': this.round(pad.zIn, 2),
        'Z Out': this.round(pad.zIn, 2),
        'Input Return Loss': this.round(pad.returnLossIn, 2),
        'Output Return Loss': this.round(pad.returnLossOut, 2),
        'Input VSWR': this.round(pad.vswrIn, 2),
        'Output VSWR': this.round(pad.vswrOut, 2)
      }))
    }
  },
  template: `<table>
  <tr>
    <th v-for="key in keys" :key="key">{{key}}</th>
  </tr>
  <tr v-for="pad in formated">
    <td v-for="key in keys" :key="key">{{pad[key]}}</td>
  </tr>
</table>`
})

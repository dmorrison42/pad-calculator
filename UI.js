/* global Vue */
import { PiPad, resistorInfo, LoadPromise } from './PadCalculator.js'
import { PadList } from './PadList.js'

Vue.component('')

window.onload = async function () {
  await LoadPromise
  var app = new Vue({
    el: '#app',
    data: {
      mode: 'calculator',
      attenuation: 4.2,
      shuntIn: null,
      series: 'E24',
      shuntOut: null,
      circuitIn: 50,
      circuitOut: 50,
      reflection: 'returnLoss'
    },
    computed: {
      pad () {
        if (this.mode === 'calculator') {
          return PiPad.get(this.attenuation, this.circuitIn, this.circuitOut)
        }
        return new PiPad(this.shuntIn, this.series, this.shuntOut, this.circuitIn, this.circuitOut)
      },
      reflectionValues () {
        switch (this.reflection) {
          case 'impedance':
            return ['Z In', 'Z Out']
          case 'vswr':
            return ['Input VSWR', 'Output VSWR']
          case 'returnLoss':
            return ['Input Return Loss', 'Output Return Loss']
          default:
            return ['Z In', 'Z Out', 'Input Return Loss', 'Output Return Loss', 'Input VSWR', 'Output VSWR']
        }
      },
      simulatorValues () {
        return ['Attenuation', ...this.reflectionValues]
      },
      calculatorValues () {
        return ['Shunt In', 'Series', 'Shunt Out', 'Attenuation', ...this.reflectionValues]
      },
      seriesList () {
        return Object.keys((resistorInfo || {}).Series)
      }
    },
    methods: {
      round (x) {
        return Math.round(x * 100) / 100
      },
      tolerances (x) {
        return resistorInfo.Series[x].Tolerances
      }
    },
    components: { PadList }
  })
  window.app = app
}

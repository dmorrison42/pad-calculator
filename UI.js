/* global Vue */
import { PiPad } from './PadCalculator.js'
import { PadList } from './PadList.js'

Vue.component('')

window.onload = function () {
  var app = new Vue({
    el: '#app',
    data: {
      mode: 'calculator',
      attenuation: 4.2,
      shuntIn: null,
      series: null,
      shuntOut: null,
      circuitIn: 50,
      circuitOut: 50,
      reflection: 'returnLoss'
    },
    computed: {
      pad () {
        return new PiPad(this.shuntIn, this.series, this.shuntOut, this.circuitIn, this.circuitOut)
      },
      calculatorPads () {
        return [PiPad.get(this.attenuation, this.circuitIn, this.circuitOut)]
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
        return ['Forward Attenuation', 'Reverse Attenuation', ...this.reflectionValues]
      },
      calculatorValues () {
        return ['Shunt In', 'Series', 'Shunt Out', 'Forward Attenuation', 'Reverse Attenuation', ...this.reflectionValues]
      }
    },
    methods: {
      round (x) {
        return Math.round(x * 100) / 100
      }
    },
    components: { PadList }
  })
  window.app = app
}

!(function () {
    var resistorInfo = null;

    var resistorInfoPromise = new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4) {
                resolve(JSON.parse(this.responseText));
            }
        }
        request.open('GET', 'ResistorValues.json');
        request.send();
    });

    resistorInfoPromise.then(data => resistorInfo = data);

    class PiPad {
        constructor(shuntIn, series, shuntOut, circuitZIn, circuitZOut) {
            this.shuntIn = shuntIn;
            this.series = series;
            this.shuntOut = shuntOut;
            this.circuitZIn = circuitZIn;
            this.circuitZOut = circuitZOut;
        }

        get zIn() {
            return calculatePiImpedance(
                this.shuntIn, this.series, this.shuntOut, this.circuitZOut);
        }

        get zOut() {
            return calculatePiImpedance(
                this.shuntOut, this.series, this.shuntIn, this.circuitZIn);
        }

        get vswrIn() {
            return calculateVSWR(this.circuitZIn, this.zIn);
        }

        get vswrOut() {
            return calculateVSWR(this.circuitZOut, this.zOut);
        }

        get returnLossIn() {
            return calculateReturnLoss(this.circuitZIn, this.zIn);
        }

        get returnLossOut() {
            return calculateReturnLoss(this.circuitZOut, this.zOut);
        }

        get attenuationForward() {
            return calculatePiAttenuation(
                this.shuntIn, this.series, this.shuntOut, this.circuitZIn, this.circuitZOut);
        }

        get attenuationReverse() {
            return calculatePiAttenuation(
                this.shuntIn, this.series, this.shuntOut, this.circuitZIn, this.circuitZOut);
        }
    }

    function v2dB(x) {
        return 20 * Math.log10(x);
    }

    function power2dB(x) {
        return 10 * Math.log10(x);
    }

    function GetMinimumMatchAttenuation(zIn, zOut) {
        let small = Math.min(zIn, zOut);
        let large = Math.max(zIn, zOut);
        let lin = Math.sqrt(large / small) + Math.sqrt(large / small - 1);
        return v2dB(lin);
    }

    function GetPiPad(attenuation, zIn, zOut) {
        zIn = zIn == null ? 50 : zIn;
        zOut = zOut == null ? 50 : zOut;

        let vOut = Math.sqrt((zOut / zIn) * (1 / Math.pow(10, attenuation / 10)));

        let shuntInN = (zOut * zIn) - (Math.pow(zIn, 2) * Math.pow(vOut, 2));
        let shuntInD = zOut + (zIn * Math.pow(vOut, 2)) - 2 * zIn * vOut;
        let shuntIn = shuntInN / shuntInD;


        let shuntOut = vOut / (1 / zIn - vOut / zOut - 1 / shuntIn);

        let series = (1 - vOut) * zIn * shuntIn / (shuntIn - zIn);

        return new PiPad(shuntIn, series, shuntOut, zIn, zOut);
    }

    function calculatePiImpedance(a, b, c, zC) {
        let n = a * (b * zC + b * c + c * zC);
        let d = c * zC + ((b + a) * (zC + c));
        return n / d;
    }

    function calculatePiAttenuation(a, b, c, zA, zC) {
        let zACalculated = calculatePiImpedance(a, b, c, zC);
        let vIn = 2 - ((2 * zA) / (zA + zACalculated))
        let vOut = (vIn * c * zC) / (b * (zC + c) + c * zC)
        return power2dB((1 / zA) / (Math.pow(vOut, 2) / zC));
    }

    function calculateVSWR(z, calc) {
        let a = ((1 + (calc - z) / (calc + z)) / (1 - (calc - z) / (calc + z)));
        let b = ((1 - (calc - z) / (calc + z)) / (1 + (calc - z) / (calc + z)));
        return Math.max(a, b);
    }

    function calculateReturnLoss(z, calc) {
        return v2dB(Math.abs((calc - z) / (calc + z)));
    }

    function EvaluatePiPad(pad, zIn, zOut) {
        if (zIn == null && zOut == null) {
            let x = 10000;
            let y = 10000;
            let result = {};
            for (let i = 1; i < 100; i++) {
                result = EvaluatePiPad(pad, x, y);
                x = result.zIn;
                y = result.zOut;
            }
            return result;
        }

        return new PiPad(pad.shuntIn, pad.series, pad.shuntOut, zIn, zOut);
    }

    function GetNearestValues(series, exact) {
        let values = resistorInfo.Series[series].Values;
        let low = 0;

        for (var i = Math.floor(Math.log10(exact)) - 1; ; i++) {
            let mag = Math.pow(10, i);
            for (var j = -1; j < values.length; j++) {
                let value = mag * values[j];
                if (value <= exact) low = value;
                if (value >= exact) {
                    return [low, value];
                }
            }
        }
    }

    function GetPadsInSeries(resistorSeries, attenuation) {
        // TODO: Do more searching around
        let nearest = (v) => GetNearestValues(resistorSeries, v)
        let ideal = PadCalculator.GetPiPad(attenuation);
        let shuntIn = nearest(ideal.shuntIn);
        let shuntOut = nearest(ideal.shuntOut);
        let series = nearest(ideal.series);

        let pads = [];
        for (var i = 0; i < shuntIn.length; i++) {
            for (var j = 0; j < series.length; j++) {
                for (var k = 0; k < shuntOut.length; k++) {
                    pads.push({
                        shuntIn: shuntIn[i],
                        series: series[j],
                        shuntOut: shuntOut[k],
                    })
                }
            }
        }

        return pads;
    }

    window.PadCalculator = {
        LoadPromise: resistorInfoPromise.then(),
        GetMinimumMatchAttenuation,
        GetPiPad,
        EvaluatePiPad,
        GetPadsInSeries,
    }
}())
!(function () {
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

        return {
            shuntIn,
            series,
            shuntOut,
        };
    }

    function CalculatePiInputImpedance(a, b, c, zC) {
        let n = a * (b * zC + b * c + c * zC);
        let d = c * zC + ((b + a) * (zC + c));
        return n / d;
    }

    function CalculatePiAttenuation(a, b, c, zA, zC) {
        let zACalculated = CalculatePiInputImpedance(a, b, c, zC);
        let vIn = 2 - ((2 * zA) / (zA + zACalculated))
        let vOut = (vIn * c * zC) / (b * (zC + c) + c * zC)
        return power2dB((1 / zA) / (Math.pow(vOut, 2) / zC));
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

        let calcZIn = CalculatePiInputImpedance(pad.shuntIn, pad.series, pad.shuntOut, zOut);
        let calcZOut = CalculatePiInputImpedance(pad.shuntOut, pad.series, pad.shuntIn, zIn);
        let attenuationForward = CalculatePiAttenuation(pad.shuntIn, pad.series, pad.shuntOut, zIn, zOut)
        let attenuationReverse = CalculatePiAttenuation(pad.shuntOut, pad.series, pad.shuntIn, zOut, zIn)
        return {
            zIn: calcZIn,
            zOut: calcZOut,
            attenuationForward,
            attenuationReverse,
        }
    }

    window.PadCalculator = {
        GetMinimumMatchAttenuation,
        GetPiPad,
        EvaluatePiPad,
    }
}())
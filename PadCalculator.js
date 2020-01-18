!(function () {
    function Lin2dB(x) {
        return 20 * Math.log10(x);
    }

    function GetMinimumMatchAttenuation(zIn, zOut) {
        let small = Math.min(zIn, zOut);
        let large = Math.max(zIn, zOut);
        let lin = Math.sqrt(large / small) + Math.sqrt(large / small - 1);
        return Lin2dB(lin);
    }

    function GetPiPad(attenuation, zIn, zOut) {
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

    window.PadCalculator = {
        GetMinimumMatchAttenuation,
        GetPiPad,
    }
}())
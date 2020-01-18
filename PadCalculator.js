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
    window.PadCalculator = {
        GetMinimumMatchAttenuation,
    }
}())
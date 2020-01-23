describe('An attenuator calculator', () => {
    it('should calculate match attenuation', () => {
        expect(PadCalculator.GetMinimumMatchAttenuation(50, 50)).toBe(0);
        expect(PadCalculator.GetMinimumMatchAttenuation(45, 50)).toBeCloseTo(2.844, 3);
        expect(PadCalculator.GetMinimumMatchAttenuation(25, 100)).toBeCloseTo(11.439, 3);
    });

    it('should calculate simple pi pads', () => {
        let pad3Db = PadCalculator.GetPiPad(3, 50, 50)
        expect(pad3Db.shuntIn).toBeCloseTo(292.402, 3);
        expect(pad3Db.series).toBeCloseTo(17.615, 3);
        expect(pad3Db.shuntOut).toBeCloseTo(pad3Db.shuntIn, 3);
    });

    it('should assume 50 ohms', () => {
        let pad3Db = PadCalculator.GetPiPad(3)
        expect(pad3Db.shuntIn).toBeCloseTo(292.402, 3);
        expect(pad3Db.series).toBeCloseTo(17.615, 3);
        expect(pad3Db.shuntOut).toBeCloseTo(pad3Db.shuntIn, 3);
    })

    it('should calculate unmatched pi pads', () => {
        let pad6Db = PadCalculator.GetPiPad(6, 47, 55)
        expect(pad6Db.shuntIn).toBeCloseTo(108.431, 3);
        expect(pad6Db.series).toBeCloseTo(37.982, 3);
        expect(pad6Db.shuntOut).toBeCloseTo(246.827, 3);
    });

    it('should evaluate pi pads', () => {
        let samplePad = new PadCalculator.PiPad(50, 200, 30, 50, 50);
        expect(samplePad.zIn).toBeCloseTo(40.698, 3);
        expect(samplePad.zOut).toBeCloseTo(26.471, 3);
        expect(samplePad.attenuationForward).toBeCloseTo(22.28, 2);
        expect(samplePad.attenuationReverse).toBeCloseTo(22.28, 2);
    });

    it('should return the inputs given outputs', () => {
        let samplePad = new PadCalculator.PiPad(150.476, 37.352, 150.476);
        expect(samplePad.zIn).toBeCloseTo(50, 3);
        expect(samplePad.zOut).toBeCloseTo(50, 3);
        expect(samplePad.attenuationForward).toBeCloseTo(6, 3);
        expect(samplePad.attenuationReverse).toBeCloseTo(6, 3);
    });

    it('should return the inputs given outputs with mismatch', () => {
        let samplePad = new PadCalculator.PiPad(86.517, 45.747, 2386.203);
        expect(samplePad.zIn).toBeCloseTo(50, 3);
        expect(samplePad.zOut).toBeCloseTo(75, 3);
        expect(samplePad.attenuationForward).toBeCloseTo(6, 3);
        expect(samplePad.attenuationReverse).toBeCloseTo(6, 3);
    });

    it('should calculate VSWR', () => {
        let samplePad = new PadCalculator.PiPad(50, 200, 30, 50, 75);

        expect(samplePad.vswrIn).toBeCloseTo(1.226, 3);
        expect(samplePad.vswrOut).toBeCloseTo(2.833, 3);
    });

    it('should calculate return loss', () => {
        let samplePad = new PadCalculator.PiPad(50, 200, 30, 50, 75);

        expect(samplePad.returnLossIn).toBeCloseTo(-19.875, 3);
        expect(samplePad.returnLossOut).toBeCloseTo(-6.407, 3);
    });

    it('should search for close real pads', async () => {
        await PadCalculator.LoadPromise;
        let samplePads = PadCalculator.GetPadsInSeries('E24', 3);
        expect(samplePads.length).toBeGreaterThan(0);
    });
})
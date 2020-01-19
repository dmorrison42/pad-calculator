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
        let samplePad = PadCalculator.EvaluatePiPad({
            shuntIn: 50,
            series: 200,
            shuntOut: 30,
        }, 50, 50);
        expect(samplePad.zIn).toBeCloseTo(40.698, 3);
        expect(samplePad.zOut).toBeCloseTo(26.471, 3);
        expect(samplePad.attenuationForward).toBeCloseTo(22.28, 2);
        expect(samplePad.attenuationReverse).toBeCloseTo(22.28, 2);
    });
})
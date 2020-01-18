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
        expect(pad3Db.shuntOut).toBeCloseTo(pad3Db.shuntIn);
    });

    it('should assume 50 ohms', () => {
        let pad3Db = PadCalculator.GetPiPad(3)
        expect(pad3Db.shuntIn).toBeCloseTo(292.402, 3);
        expect(pad3Db.series).toBeCloseTo(17.615, 3);
        expect(pad3Db.shuntOut).toBeCloseTo(pad3Db.shuntIn);
    })
})
describe('An attenuator calculator', () => {
    it('should calculate match attenuation', () => {
        expect(PadCalculator.GetMinimumMatchAttenuation(50, 50)).toBe(0);
        expect(PadCalculator.GetMinimumMatchAttenuation(45, 50)).toBeCloseTo(2.844, 3);
        expect(PadCalculator.GetMinimumMatchAttenuation(25, 100)).toBeCloseTo(11.439, 3);
    });
})
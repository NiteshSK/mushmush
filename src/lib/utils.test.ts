import { generateSlug, getTrainingProgramPrice, isEarlyBirdOfferValid } from './utils';

describe('Utils', () => {
    describe('generateSlug', () => {
        it('should convert text to lowercase', () => {
            expect(generateSlug('Hello World')).toBe('hello-world');
        });

        it('should replace spaces with hyphens', () => {
            expect(generateSlug('hello world')).toBe('hello-world');
        });

        it('should remove special characters', () => {
            expect(generateSlug('hello!@# world$')).toBe('hello-world');
        });

        it('should handle multiple hyphens', () => {
            expect(generateSlug('hello--world')).toBe('hello-world');
        });

        it('should trim leading and trailing hyphens', () => {
            expect(generateSlug('-hello world-')).toBe('hello-world');
        });
    });

    describe('getTrainingProgramPrice', () => {
        const baseProgram = {
            hasEarlyBirdOffer: false,
            price: 100,
            originalPrice: 100,
        };

        it('should return regular price if no early bird offer', () => {
            expect(getTrainingProgramPrice(baseProgram)).toBe(100);
        });

        it('should return early bird price if valid', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                ...baseProgram,
                hasEarlyBirdOffer: true,
                earlyBirdPrice: 80,
                earlyBirdEndDate: futureDate,
            };

            expect(getTrainingProgramPrice(program)).toBe(80);
        });

        it('should return original price if early bird expired', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const program = {
                ...baseProgram,
                hasEarlyBirdOffer: true,
                earlyBirdPrice: 80,
                earlyBirdEndDate: pastDate,
            };

            expect(getTrainingProgramPrice(program)).toBe(100);
        });
    });

    describe('isEarlyBirdOfferValid', () => {
        const baseProgram = {
            hasEarlyBirdOffer: false,
            price: 100,
            originalPrice: 100,
        };

        it('should return false if no early bird offer', () => {
            expect(isEarlyBirdOfferValid(baseProgram)).toBe(false);
        });

        it('should return true if offer is valid', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                ...baseProgram,
                hasEarlyBirdOffer: true,
                earlyBirdPrice: 80,
                earlyBirdEndDate: futureDate,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(true);
        });

        it('should return false if offer expired', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const program = {
                ...baseProgram,
                hasEarlyBirdOffer: true,
                earlyBirdPrice: 80,
                earlyBirdEndDate: pastDate,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(false);
        });
    });
});

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

        it('should return 0 for null program', () => {
            expect(getTrainingProgramPrice(null)).toBe(0);
        });

        it('should return 0 for undefined program', () => {
            expect(getTrainingProgramPrice(undefined)).toBe(0);
        });

        it('should return originalPrice over price when both are set', () => {
            const program = {
                hasEarlyBirdOffer: false,
                price: 3000,
                originalPrice: 5000,
            };
            expect(getTrainingProgramPrice(program)).toBe(5000);
        });

        it('should return price when originalPrice is null', () => {
            const program = {
                hasEarlyBirdOffer: false,
                price: 3000,
                originalPrice: undefined,
            };
            expect(getTrainingProgramPrice(program)).toBe(3000);
        });

        it('should return originalPrice of 0 instead of falling back to price', () => {
            const program = {
                hasEarlyBirdOffer: false,
                price: 5000,
                originalPrice: 0,
            };
            expect(getTrainingProgramPrice(program)).toBe(0);
        });

        it('should accept earlyBirdPrice of 0 as valid', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                price: 5000,
                originalPrice: 5000,
                earlyBirdPrice: 0,
                earlyBirdEndDate: futureDate,
            };

            expect(getTrainingProgramPrice(program)).toBe(0);
        });

        it('should return originalPrice when early bird expired and price differs', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const program = {
                hasEarlyBirdOffer: true,
                price: 3000,
                originalPrice: 5000,
                earlyBirdPrice: 3999,
                earlyBirdEndDate: pastDate,
            };

            expect(getTrainingProgramPrice(program)).toBe(5000);
        });

        it('should return price when early bird fields are missing', () => {
            const program = {
                hasEarlyBirdOffer: true,
                price: 3000,
            };
            expect(getTrainingProgramPrice(program)).toBe(3000);
        });

        it('should handle earlyBirdEndDate as ISO string', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                price: 3000,
                originalPrice: 5000,
                earlyBirdPrice: 3999,
                earlyBirdEndDate: futureDate.toISOString(),
            };

            expect(getTrainingProgramPrice(program)).toBe(3999);
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

        it('should return false for null program', () => {
            expect(isEarlyBirdOfferValid(null)).toBe(false);
        });

        it('should return false for undefined program', () => {
            expect(isEarlyBirdOfferValid(undefined)).toBe(false);
        });

        it('should return false when earlyBirdPrice is null', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                originalPrice: 100,
                earlyBirdPrice: undefined as number | undefined,
                earlyBirdEndDate: futureDate,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(false);
        });

        it('should return false when originalPrice is null', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                originalPrice: undefined as number | undefined,
                earlyBirdPrice: 80,
                earlyBirdEndDate: futureDate,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(false);
        });

        it('should return false when earlyBirdEndDate is missing', () => {
            const program = {
                hasEarlyBirdOffer: true,
                originalPrice: 100,
                earlyBirdPrice: 80,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(false);
        });

        it('should treat earlyBirdPrice of 0 as valid', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                originalPrice: 100,
                earlyBirdPrice: 0,
                earlyBirdEndDate: futureDate,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(true);
        });

        it('should treat originalPrice of 0 as valid', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                originalPrice: 0,
                earlyBirdPrice: 0,
                earlyBirdEndDate: futureDate,
            };

            expect(isEarlyBirdOfferValid(program)).toBe(true);
        });

        it('should handle earlyBirdEndDate as ISO string', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const program = {
                hasEarlyBirdOffer: true,
                originalPrice: 100,
                earlyBirdPrice: 80,
                earlyBirdEndDate: futureDate.toISOString(),
            };

            expect(isEarlyBirdOfferValid(program)).toBe(true);
        });
    });
});

import {
    describe,
    it,
    expect
} from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { createCanvas } from 'canvas';
import { SimpleExtractor } from '../src/backends/simple';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toMatchImageSnapshot(): R;
        }
    }
}

expect.extend({ toMatchImageSnapshot });

describe('simple', () => {
    it('can get frames at random times', async() => {
        const extractor = await SimpleExtractor.create({
            inputFileOrUrl: 'https://storage.googleapis.com/lumen5-prod-images/countTo60.mp4',
        });
        const times_to_get = [
            1, // forward to 30
            0, // backwards to 15
            1.5, // forward to 45
            0.5, // backward to 15
        ];
        for (let i = 0; i < times_to_get.length; i++) {
            const imageData = await extractor.getImageDataAtTime(times_to_get[i]);
            if (!imageData) {
                continue;
            }
            const canvas = createCanvas(imageData.width, imageData.height);
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            expect(canvas.toBuffer('image/png')).toMatchImageSnapshot();
        }
    });

    it('can get the first 10 frames', async() => {
        const extractor = await SimpleExtractor.create({
            inputFileOrUrl: 'https://storage.googleapis.com/lumen5-prod-images/countTo60.mp4',
        });
        const FRAME_SYNC_DELTA = (1 / 30.0) / 2.0;

        // Act & assert
        // ensure we render the 2nd frame properly - if we read the next packet we'll draw 3 instead of 2
        for (let i = 0; i < 10; i++) {
            const time = i / 30.0 + FRAME_SYNC_DELTA;
            const imageData = await extractor.getImageDataAtTime(time);
            if (!imageData) {
                continue;
            }
            const canvas = createCanvas(imageData.width, imageData.height);
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            expect(canvas.toBuffer('image/png')).toMatchImageSnapshot();
        }
    });

    it('can get the last 10 frames', async() => {
        // This test is pretty slow because our countTo60 video only has 1 I-frame. We have to run through all packets
        // to get the last ones.
        const extractor = await SimpleExtractor.create({
            inputFileOrUrl: 'https://storage.googleapis.com/lumen5-prod-images/countTo60.mp4',
        });
        const FRAME_SYNC_DELTA = (1 / 30.0) / 2.0;

        // Act & assert
        // ensure we render the last few frames properly - we have to flush the decoder to get the last few frames
        for (let i = 50; i < 60; i++) {
            const time = i / 30.0 + FRAME_SYNC_DELTA;
            const imageData = await extractor.getImageDataAtTime(time);
            if (!imageData) {
                continue;
            }
            const canvas = createCanvas(imageData.width, imageData.height);
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            expect(canvas.toBuffer('image/png')).toMatchImageSnapshot();
        }
    });
});

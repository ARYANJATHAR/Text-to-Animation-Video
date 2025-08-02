import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(2);
Config.setFrameRange([0, 1800]); // 60 seconds at 30fps
Config.setCodec('h264');
Config.setImageSequence(false);

// Enable experimental features for better performance
Config.setChromiumOpenGlRenderer('egl');
Config.setChromiumHeadlessMode(true);

// Set default composition settings
Config.setEntryPoint('./src/remotion/index.ts');

export {};
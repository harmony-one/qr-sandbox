import {StableDiffusionClient} from "./StableDiffusionClient";
import {createQRCode, isQRCodeReadable} from "./utils";
import * as fs from "fs";
import * as path from "path";

function isDirectoryExists(path: string) {
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch (error) {
    // @ts-expect-error
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

const sdClient = new StableDiffusionClient();

const DIR = 'images'
export const runTest = async () => {
  if (!isDirectoryExists(DIR)) {
    fs.mkdirSync(DIR)
    console.log('### create dir images');
  }

  // close-up face, upper body
  const qrUrl = 'https://h.country';
  // const prompt = 'light, futobot, cyborg, (masterpiece),(best quality),(ultra-detailed), (full body:1.2), 1male, solo, hood up, upper body, mask, 1boy, male focus,white gloves, cloak, long sleeves, spaceship, lightning, hires';
  // const prompt = 'light, sitting girl, (masterpiece),(best quality),(ultra-detailed), (full body:1.2), cloak, lightning, hires';
  // const prompt = 'sitting girl, (masterpiece), (best quality), (ultra-detailed), (full body:1.2), cloak, lightning, hires';
  // const prompt = 'sitting girl, (masterpiece), (best quality), (ultra-detailed), lightning,lightning, hires';
  const prompt = '(pretty face: 1.2), happy girl, blue jeans, white t-shirt, blondie, (masterpiece), (best quality), (ultra-detailed), hires, simple background';
  // const prompt = 'sitting girl (full body: 1.2), (masterpiece), (best quality), (ultra-detailed), lightning, (hi-res)';
  // const prompt = 'sitting girl (full body: 1.2), (masterpiece, best quality, ultra-detailed), hires';

  const qrMargin = 0;
  const imgCount = 10;
  const guidanceStart = 19.5 // 0 - 100;
  const guidanceEnd = 60; // 0 - 100;
  const steps = 60;
  const width = 610;
  const height = 610;
  const directory = '' || Date.now().toString();

  const qrImgBuffer = await createQRCode({ url: qrUrl, margin: qrMargin, width: width });

  console.log('### start');

  const dirDest = path.join(DIR, directory);

  if (!isDirectoryExists(dirDest)) {
    fs.mkdirSync(dirDest, {recursive: true});
    console.log(`### create dir ${dirDest}`);
  }

  fs.writeFileSync(path.join(dirDest, 'qr.png'), qrImgBuffer)

  const config = {
    prompt,
    steps,
    width,
    height,
    qrMargin,
    guidanceStart: guidanceStart / 100,
    guidanceEnd: guidanceEnd / 100,
  }
  fs.writeFileSync(path.join(dirDest, 'config.json'), JSON.stringify(config, null, 4));

  for (let i = 0; i < imgCount; i++) {
    const timeStart = Date.now();
    const bufferImg = await sdClient.img2img({
      imgBase64: qrImgBuffer.toString('base64'),
      ...config
    })

    const time = Date.now() - timeStart;

    if (bufferImg) {
      const readable = isQRCodeReadable(bufferImg)
      console.log('### readable', readable);
      const filename = `qr_wh${width}_${height}_gStart_${guidanceStart}_gEnd_${guidanceEnd}_i${i}.png`;
      const filePath = path.join(dirDest, filename);
      fs.writeFileSync(filePath, bufferImg)
      console.log('### generate qr', {readable, guidanceStart, guidanceEnd, i, steps, timeS: time / 1000});
    }
  }
}

runTest();